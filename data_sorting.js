
monomerStatCount = [];

// Initialize variables that will be used to index the reference/complimentary groups. Each of them can only be either 0 or 1
func_ref = 0;
func_comp = 0;

function startDataSorting() {

    for (var i = 0 ; i < 2 ; i++) {

        /*  Stat Counter - The number of knowns are counted for each functional groups in addition to determining certain calculation conditions.
         *      mass, percent, and zprMethod properties are incremented depending on if their specific conditions are met
         *      tts_ref is the index for the reference comonomer for any functional group which fulfils the requirements of the tetris route
         *      tts_refFound is a simple flag for deciding calculation routes to indicate that the tetris route has a reference comonomer.
         */
        monomerStatCount[i] = {
            mass:         0,
            percent:      0,
            zprMethod:    0,
            tts_ref:      0,
            tts_refFound: false
        }

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            // Increment Mass Count if it is a positive number
            if (monomerStats[q].mass != 0) {
                monomerStatCount[i].mass += 1;
            }

            // Increment Percent Count if it is a positive number
            if (monomerStats[q].wpercent != 0 || monomerStats[q].mpercent != 0) {
                monomerStatCount[i].percent += 1;
            }

            // Zipper Route - Requires that the number of comonomers is greater than or equal to 2 and that every comonomer either has only mass or percent known
            if (funcStats[i].num >= 2) {
                switch (funcStats[i].percent_type) {
                    // Increment Zipper Method if Mass is known but Weight Percent is unknown, and vice-versa
                    case 'weight':
                        if ((monomerStats[q].mass != 0 && monomerStats[q].wpercent === 0) || (monomerStats[q].mass === 0 && monomerStats[q].wpercent != 0)) {
                            monomerStatCount[i].zprMethod += 1;
                        }
                        break;
    
                    // Increment Zipper Method if Mass is known but Mole Percent is unknown, and vice-versa
                    case 'mole':
                        if ((monomerStats[q].mass != 0 && monomerStats[q].mpercent === 0) || (monomerStats[q].mass === 0 && monomerStats[q].mpercent != 0)) {
                            monomerStatCount[i].zprMethod += 1;
                        }
                        break;
                }
            }

            // Tetris Route - Requires a reference comonomer with both mass and percent known
            if (monomerStatCount[i].tts_refFound === false && monomerStats[q].mass != 0 && (monomerStats[q].wpercent != 0 || monomerStats[q].mpercent != 0)) {
                monomerStatCount[i].tts_ref = q;
                monomerStatCount[i].tts_refFound = true;
            }

        };
        console.log("Stat Counts for Func Group (" + funcStats[i].name + ") are:\n\t");
        console.log(monomerStatCount[i]);
    } 

    /*  Reference Finder - Looks for an appropiate functional group with minimum requirements for reference group (at least (1) known mass, known values equivalent to n) 
        Conversely, an appropiate complimentary group only has to have n-1 known values.

        > n: Number of monomers for each functional group
    */

    const FUNC_A = 0;
    const FUNC_B = 1;

    funcStats[FUNC_A].isReference = false;
    funcStats[FUNC_B].isReference = false;

    for (var i = 0 ; i < 2 ; i++) {
        // Check that the functional group has at least 1 mass or more and that the total number of knowns for percent and mass are greater than or equal to the number of comonomers
        funcStats[i].isReference = monomerStatCount[i].mass >= 1 && ((monomerStatCount[i].mass + monomerStatCount[i].percent) >= funcStats[i].num);
        if (funcStats[i].isReference === true) {
            func_ref = i;
        }

        if (func_ref === FUNC_A) {
            func_comp = FUNC_B;
        } else if (func_ref === FUNC_B) {
            func_comp = FUNC_A;
        }
    }

    // If both functional groups are valid as reference groups for any reason(s), the one with more knowns and/or masses will be chosen as the reference group
    if (funcStats[FUNC_A].isReference === true && funcStats[FUNC_B].isReference === true) {
        // A greater offset signifies a functional group with more information given, which indicates a more suitable reference group
        funcA_known_offset = (monomerStatCount[FUNC_A].mass + monomerStatCount[FUNC_A].percent) - funcStats[FUNC_A].num;
        funcB_known_offset = (monomerStatCount[FUNC_B].mass + monomerStatCount[FUNC_B].percent) - funcStats[FUNC_B].num;

        // A greater offset signifies more mass values given, which indicates a more suitable reference group
        funcA_mass_offset = monomerStatCount[FUNC_A].mass - funcStats[FUNC_A].num;
        funcB_mass_offset = monomerStatCount[FUNC_B].mass - funcStats[FUNC_B].num;

        if (funcA_mass_offset > funcB_mass_offset || funcA_known_offset > funcB_known_offset) {
            // Functional group A has either more information given or more masses given, so it is the more suitable reference group
            funcStats[FUNC_A].isReference = true;
            funcStats[FUNC_B].isReference = false;

            func_ref = FUNC_A;
            func_comp = FUNC_B;
        } else if (funcB_mass_offset > funcA_mass_offset || funcB_known_offset > funcA_known_offset) {
            // Functional group B has either more information given or more masses given, so it is the more suitable reference group
            funcStats[FUNC_B].isReference = true;
            funcStats[FUNC_A].isReference = false;

            func_ref = FUNC_B;
            func_comp = FUNC_A;
        } else {
            // The offsets for functional groups A & B are equivalent, so the reference group defaults to A
            funcStats[FUNC_A].isReference = true;
            funcStats[FUNC_B].isReference = false;

            func_ref = FUNC_A;
            func_comp = FUNC_B;
        }
    
    }

    // Find calculation route for reference group
    ref_route = routeFinder(func_ref, "REFERENCE");
    // Perform reference calculations
    doReferenceCalculations(ref_route);
    console.log("Finished Calculations for Reference Group Yielded:");
    console.log(monomerStats);

    // Find calculation route for complimentary group
    comp_route = routeFinder(func_comp, "COMPLIMENTARY");
    // Perform complimentary calculations
    doComplimentaryCalculations(comp_route);
    console.log("Finished Calculations for Complimentary Group Yielded:");
    console.log(monomerStats);

    // Remove the previous results generated if they exist
    removeElement("final_results", "_results", false);

    displayFinalResults();
}

function routeFinder(i, funcType) {

    /*  Route Finder:
        (1) - Determine what is known values for monomers by boolean expressions
        (2) - Select an appropiate calculation route for reference and complimentary groups
    */

    // (1)
    let mass_present = monomerStatCount[i].mass >= 1;
    let percent_present = monomerStatCount[i].percent >= 1;

    let all_mass = monomerStatCount[i].mass === funcStats[i].num;
    let all_percent = monomerStatCount[i].percent === funcStats[i].num;
    let almost_all_mass = monomerStatCount[i].mass === funcStats[i].num - 1;
    let almost_all_percent = monomerStatCount[i].percent === funcStats[i].num - 1;

    let percent_and_mass = all_percent && mass_present;   // Checks if all weight percents are known and there is at least one mass

    let zpr_possible = monomerStatCount[i].zprMethod === funcStats[i].num && mass_present === true;
    let tetris_possible = monomerStatCount[i].tts_refFound === true && funcStats[i].unknown != null;

    // (2)
    switch(funcType) {
        case 'REFERENCE':
            /*
             *  All Mass Route - This is the simplest calculation route because it can perform each calculation to find weight percents, mole
             *  percents, and moles through fairly simple methods. Any already entered percent values (which would go beyond the minimum required
             *  user input) are ignored and recalculated. 
             */
            if (all_mass === true) {
                console.log("Your calculation route for reference group is: All Mass");
                return 'ALLMASSROUTE';
            }

            /*
             *  Zipper Route - The conditions of this calculation route require that the number of comonomers for a functional group are greater
             *  than or equal to 2 because the calculations require that comonomers either have mass or percent values given. It is a unique case
             *  because the percents are added up, and the difference between 100 and those summed up percents gives the "partial mass percent".
             *  The partial mass percent then allows for their particular percent values to be found by using the proportions between masses.
             */
            else if (zpr_possible === true) {
                switch (funcStats[func_ref].percent_type) {
                    case 'weight':
                        console.log("Your calculation route for reference group is: wt% Zipper");
                        return 'WTP_ZIPPERROUTE';
                    case 'mole':
                        console.log("Your calculation route for reference group is: ml% Zipper");
                        return 'MLP_ZIPPERROUTE';
                }
                
            }

            /*
             *  Tetris Route - A reference comonomer is required for the tetris route to be possible. As well, there must be an unknown comonomer
             *  
             */
            else if (tetris_possible === true) {
                switch (funcStats[func_ref].percent_type) {
                    case 'weight':
                        console.log("Your calculation route for reference group is: wt% Zipper");
                        return 'WTP_TETRISROUTE';
                    case 'mole':
                        console.log("Your calculation route for reference group is: ml% Zipper");
                        return 'MLP_TETRISROUTE';
                }

            }
            
            else if (percent_and_mass === true) {
                switch (funcStats[func_ref].percent_type) {
                    case 'weight':
                        console.log("Your calculation route for reference group is: All wt%");
                        return 'WTP_ALLPERCENT';
                    case 'mole':
                        console.log("Your calculation route for reference group is: All ml%");
                        return 'MLP_ALLPERCENT';
                }
            }
            
            else {
                console.log("No calculation route could be found for your reference group.\n\tIt may be missing key information (mass) and/or not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO NUMBER OF MONOMERS");
            }

            break;

        case 'COMPLIMENTARY':
            if ((all_percent || almost_all_percent) === true) {
                console.log("Your calculation route for complimentary group is: All Percent");
                return 'ALLPERCENTROUTE';
            }

            else if (almost_all_mass === true && percent_present === false) {
                console.log("Your calculation route for complimentary group is: Given Mass");
                return 'GIVENMASSROUTE';
            }

            else if (monomerStatCount[i].zprMethod === (funcStats[i].num - 1) && funcStats[i].percent_type === 'mole') {
                console.log("Your calculation route for complimentary group is: Mol Percent Zipper");
                return 'MLP_ZIPPERROUTE';
            }

            else if (monomerStatCount[i].zprMethod === (funcStats[i].num - 1) && funcStats[i].percent_type === 'weight') {
                console.log("Your calculation route for complimentary group is: Wt Percent Zipper");
                return 'WTP_ZIPPERROUTE';
            }

            else {
                console.log("No calculation route could be found for your complimentary group.\n\tIt may not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO (NUMBER OF MONOMERS - 1)");
            }

            break;
    }
}