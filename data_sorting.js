
monomerStatCount = [];

// Initialize variables that will be used to index the reference/complimentary groups. Each of them can only be either 0 or 1
func_ref = 0;
func_comp = 0;

function startDataSorting() {

    for (var i = 0 ; i < 2 ; i++) {

        /*  Stat Counter - The number of knowns are counted for each functional groups in addition to determining certain calculation conditions.
         *      mass, percent, determined, and partial properties are incremented depending on if their specific conditions are met
         */
        monomerStatCount[i] = {
            mass:         0,    // Total number of masses given
            percent:      0,    // Total number of percents given
            determined:   0,    // Total number of comonomers with both mass and percent given
            partial:      0     // Total number of comonomers with only either mass or percent given
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

            // Increment Determined Count if both Mass and Percent are a positive number
            if (monomerStats[q].mass != 0 && (monomerStats[q].wpercent != 0 || monomerStats[q].mpercent != 0)) {
                monomerStatCount[i].determined += 1;
            }

            // Increment Partial Count if Mass is a positive number and Percent is not given, and vice-versa
            // (Counting partials is only necessary for groups with 2 or more comonomers)
            if (funcStats[i].num >= 2) {
                switch (funcStats[i].percent_type) {
                    // Increment Partial if Mass is known but Weight Percent is unknown, and vice-versa
                    case 'weight':
                        if ((monomerStats[q].mass != 0 && monomerStats[q].wpercent === 0) || (monomerStats[q].mass === 0 && monomerStats[q].wpercent != 0)) {
                            monomerStatCount[i].partial += 1;
                        }
                        break;
    
                    // Increment Partial if Mass is known but Mole Percent is unknown, and vice-versa
                    case 'mole':
                        if ((monomerStats[q].mass != 0 && monomerStats[q].mpercent === 0) || (monomerStats[q].mass === 0 && monomerStats[q].mpercent != 0)) {
                            monomerStatCount[i].partial += 1;
                        }
                        break;
                }
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

    // Loop through each functional group, examining their stat counts to set whether or not they are an appropiate reference group
    for (var i = 0 ; i < 2 ; i++) {
        // Check that the functional group has at least 1 mass or more and that the total number of knowns for percent and mass are greater than or equal to the number of comonomers
        funcStats[i].isReference = monomerStatCount[i].mass >= 1 && ((monomerStatCount[i].mass + monomerStatCount[i].percent) >= funcStats[i].num);

        if (funcStats[i].isReference === true) {
            // Set the reference group to the current iteration
            func_ref = i;
        }

        // Set the complimentary group based on the current reference group set
        if (func_ref === FUNC_A) {
            func_comp = FUNC_B;
        } else if (func_ref === FUNC_B) {
            func_comp = FUNC_A;
        }
    }

    // If both functional groups are valid as reference groups for any reason(s), the one with more knowns and/or masses will be chosen as the reference group
    if (funcStats[FUNC_A].isReference === true && funcStats[FUNC_B].isReference === true) {
        // A greater offset signifies a functional group with more information given, which indicates a more suitable reference group (assuming the user gives more info for the reference)
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
    let refCalcSuccessful = doReferenceCalculations(ref_route);
    console.log("Finished Calculations for Reference Group Yielded:");
    console.log(monomerStats);

    // Check that there were no issues with reference calculations, proceed to complimentary calcultions if so
    if (refCalcSuccessful) {
        console.log("Reference Calculations were successful!");

        // Find calculation route for complimentary group
        comp_route = routeFinder(func_comp, "COMPLIMENTARY");
        // Perform complimentary calculations
        let compCalcSuccessful = doComplimentaryCalculations(comp_route);
        console.log("Finished Calculations for Complimentary Group Yielded:");
        console.log(monomerStats);

        if (compCalcSuccessful) {
            console.log("Complimentary Calculations were successful! Display Final Results!");

            // Remove the previous results generated if they exist
            removeElement("final_results", "_results", false);

            displayFinalResults();
        } else {
            console.log("Complimentary Calculations failed...");
        }
    } else {
        console.log("Reference Calculations failed...");
    }
    
}

function routeFinder(i, funcType) {

    /*  Route Finder:
        (1) - Determine what are known values for monomers by boolean expressions based on stat counts
        (2) - Select an appropiate calculation route for reference and complimentary groups
    */

    // (1)
    let mass_present = monomerStatCount[i].mass >= 1;
    let percent_present = monomerStatCount[i].percent >= 1;
    let determined_present = monomerStatCount[i].determined >= 1;

    let all_mass = monomerStatCount[i].mass === funcStats[i].num;
    let all_percent = monomerStatCount[i].percent === funcStats[i].num;
    let almost_all_mass = monomerStatCount[i].mass === funcStats[i].num - 1;
    let almost_all_percent = monomerStatCount[i].percent === funcStats[i].num - 1;

    // The Tetris Route requires that there is a determined comonomer, 1 unknown comnomer, and that all remaining comonomers are partially known
    let tetris_possible = determined_present && funcStats[i].unknown != null && (monomerStatCount[i].partial === funcStats[i].num - 2);

    // Scenarios which have special conditions depending on whether the functional group is reference or complimentary
    let excess_info, zpr_possible;

    switch (funcType) {
        case 'REFERENCE':
            let ref_knowns = monomerStatCount[i].mass + monomerStatCount[i].percent;
            // Number of comonomers given for reference group
            let ref_n = funcStats[i].num;

            // Only n information needs to be given for calculations to be possible, anything more is unnecessary and must be accounted for user error
            excess_info = ref_knowns > ref_n;

            // The Reference Zipper Route requires that all comonomers be partially known with at least one mass given
            zpr_possible = monomerStatCount[i].partial === ref_n && mass_present;

            break;

        case 'COMPLIMENTARY':
            let comp_knowns = monomerStatCount[i].mass + monomerStatCount[i].percent;
            // Number of comonomers given for complimentary group
            let comp_n = funcStats[i].num;

            // Only n - 1 information needs to be given for calculations to be possible, anything more is unnecessary and must be accounted for user error
            excess_info = comp_knowns > comp_n - 1;

            // The Complimentary Zipper Route requires that nearly all comonomers be partially known with at least one mass given, and that there is an unknown comonomer present
            zpr_possible = monomerStatCount[i].partial === comp_n - 1 && mass_present && funcStats[i].unknown != null;;
            
            break;
    }
    
    // (2)
    switch(funcType) {
        /* ************************************************************************************************************************
         * NOTE: More detailed explanations of how each calculation route works can be found within the calculation route itself. *
         ************************************************************************************************************************ */
        case 'REFERENCE':
            /*
             *  All Mass Route - This is the simplest calculation route because it can perform each calculation to find weight percents, mole
             *  percents, and moles through fairly simple methods. Any already entered percent values (which would go beyond the minimum required
             *  user input) are ignored and recalculated. 
             */
            if (all_mass) {
                console.log("Your calculation route for reference group is: All Mass");
                return 'ALLMASSROUTE';
            }

            /*
             *  Zipper Route - The conditions of this calculation route require that the number of comonomers for a functional group are greater
             *  than or equal to 2 because the calculations require that comonomers either have mass or percent values given. It is a unique case
             *  because the percents are added up, and the difference between 100 and those summed up percents gives the "partial mass percent".
             *  The partial mass percent then allows for their particular percent values to be found by using the proportions between masses.
             */
            else if (zpr_possible) {
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
             *  Tetris Route - A reference comonomer is required for the tetris route to be possible. As well, there must be an unknown comonomer and
             *  every remaining comonomer must be partially known. The reference comonomer is used in order to obtain the ratio between mass/mole and
             *  weight/mole percents respectively, so that all remaining partially known comonomer can have their undetermined value calculated using
             *  the calculated ratio. In the end, the only remaining comonomer is the unknown, which can be found since all other values have already
             *  been determined.
             *  
             */
            else if (tetris_possible) {
                switch (funcStats[func_ref].percent_type) {
                    case 'weight':
                        console.log("Your calculation route for reference group is: wt% Tetris");
                        return 'WTP_TETRISROUTE';
                    case 'mole':
                        console.log("Your calculation route for reference group is: ml% Tetris");
                        return 'MLP_TETRISROUTE';
                }

            }
            
            /*
             *  Excess Info Route - The conditions of this route are designed so that calculations are performed using one's comonomer with both a mass
             *  and percent given as a 'reference comonomer', where the ratio between mass and percent can be used for other comonomers with only percent
             *  given. It is the most general calculation route for the reference group because its requirements are less strict than others and it can have 
             *  a wide range of possible inputs. However, it also has a greater chance of error, specifically with the ratios between mass and given percents.
             *  As such, this calculation route attempts to account for possible user error and should cancel calculations if ever there is a conflict between
             *  given and calculated values.
             */
            else if (excess_info) {
                switch (funcStats[func_ref].percent_type) {
                    case 'weight':
                        console.log("Your calculation route for reference group is: Excess wt%");
                        return 'XS_WTPROUTE';
                    case 'mole':
                        console.log("Your calculation route for reference group is: Excess ml%");
                        return 'XS_MLPROUTE';
                }
            }
            
            // No calculation route was able to be found for the reference group with the information given
            else {
                console.log("No calculation route could be found for your reference group.\n\tIt may be missing key information (mass) and/or not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO NUMBER OF MONOMERS");
            }

            break;

        case 'COMPLIMENTARY':
            /*
             *  All Percent Route - Complimentary calculations do not require mass to be given for calculations to be possible. In fact, it is preferred
             *  that only percents are given because their calculations are based around the the mole sum calculated from the reference groups mole sum multiplied
             *  by the molar equivalents of the complimentary group.  
             * 
             *  This route is also not separated into 'All Mole Percent' and 'All Weight Percent' because
             *  only minor branching is required within the route to accomodate both percents.
             */
            if (all_percent || almost_all_percent) {
                console.log("Your calculation route for complimentary group is: All Percent");
                return 'ALLPERCENTROUTE';
            }

            /*
             *  Given Mass Route - Mass being given for a complimentary group is unconventional, but it is still possible provided that the mole values of the
             *  given masses do not exceed the calculated mole sum of the complimentary group. Essentially, the mass values are converted to moles, then their
             *  moles are divided by the mole sum to find mole percents for all but one of the comonomers. The final comonomer's mole percent is found by finding
             *  the difference between 100 and the partial mole percent sum.  With this unknown comonomer's mole percent found, its moles are found by multiplying
             *  the percent by the total sum, then converted to mass. From there, weights percents are found by summing all the mass values and dividing each one by it.
             * 
             *  In this case, no percents are given and only n - 1 masses are given.  If all the masses or any percents were given, then a separate calculation route 
             *  is required to consider the possible user error.
             */
            else if (almost_all_mass && !percent_present) {
                console.log("Your calculation route for complimentary group is: Given Mass");
                return 'GIVENMASSROUTE';
            }

            /*  
             *  Zipper Route - The conditions of this route are similar to the reference groups Zipper Route (refer to that above), but where they differ
             *  is that the complimentary group requires that one of the comonomers is unknown. An unknown is required so that there is 'wiggle room' for 
             *  complimentary calculations since they are based on the reference group, it is also limited by it as well.  
             * 
             *  Different routes are required for weight and mole percents because their calculations diverge so greatly, that they cannot be part of the
             *  same route with minor branching as is the case for some other routes.
             */
            else if (monomerStatCount[i].partial === (funcStats[i].num - 1) && !determined_present) {
                switch (funcStats[i].percent_type) {
                    case 'mole':
                        console.log("Your calculation route for complimentary group is: Mol Percent Zipper");
                        return 'MLP_ZIPPERROUTE';
                    case 'weight':
                        console.log("Your calculation route for complimentary group is: Wt Percent Zipper");
                        return 'WTP_ZIPPERROUTE';
                }
            }

            /*
             *  For both reference and complimentary groups, it is actually preferable that a user enters the minimum input necessary, but
             *  in the event that user enters more than necessary, this calculation route is intended to account for that. Excess information
             *  is oftentimes prone to error (e.g. percent sums don't add up to 100, or ratios between mass and percent don't match between
             *  different comonomers). As a result, that possibility needs to be considered, and either reject the user's input or complete
             *  the calculation if there are no errors.
             */
            else if (excess_info) {
                if (all_mass) {
                    console.log("Your calculation route for complimentary group is: Excess Mass");
                    return 'XS_MASSROUTE';
                } else if (all_percent && mass_present) {
                    switch (funcStats[i].percent_type) {
                        case 'mole':
                            console.log("Your calculation route for complimentary group is: Excess Ml% + Mass");
                            return 'XS_MLPROUTE';
                        case 'weight':
                            console.log("Your calculation route for complimentary group is: Excess Wt% + Mass");
                            return 'XS_WTPROUTE';
                    }
                }
                
            }

            // No calculation route was able to be found for the complimentary group with the information given
            else {
                console.log("No calculation route could be found for your complimentary group.\n\tIt may not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO (NUMBER OF MONOMERS - 1)");
            }

            break;
    }
}