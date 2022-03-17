
monomerStatCount = [];

func_ref = 0;
func_comp = 0;

function startDataSorting() {

    for (var i = 0 ; i < 2 ; i++) {

        /*  Stat Counter - If a value is not 0, the stat count increments by one to indicate the number of known values for mass and percent. 
            Molar mass is assumed to be known for all monomers, so it is not considered.
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

            // Set Tetris Method values if conditions are met
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

        funcA_known_offset = (monomerStatCount[FUNC_A].mass + monomerStatCount[FUNC_A].percent) - funcStats[FUNC_A].num;
        funcB_known_offset = (monomerStatCount[FUNC_B].mass + monomerStatCount[FUNC_B].percent) - funcStats[FUNC_B].num;

        funcA_mass_offset = monomerStatCount[FUNC_A].mass - funcStats[FUNC_A].num;
        funcB_mass_offset = monomerStatCount[FUNC_B].mass - funcStats[FUNC_B].num;

        if (funcA_mass_offset > funcB_mass_offset || funcA_known_offset > funcB_known_offset) {
            funcStats[FUNC_A].isReference === true

            func_ref = FUNC_A;
            func_comp = FUNC_B;
        } else {
            funcStats[FUNC_B].isReference === true

            func_ref = FUNC_B;
            func_comp = FUNC_A;
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
            if (all_mass === true) {
                console.log("Your calculation route for reference group is: All Mass");
                return 'ALLMASSROUTE';
            }

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