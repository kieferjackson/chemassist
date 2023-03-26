
export function startDataSorting(funcGroups) {
    const [ funcA, funcB ] = funcGroups;

    // Get the updated functional groups with monomer stat counts for both A and B
    const funcA_statCount = funcA.determineMonomerStatCount();
    const funcB_statCount = funcB.determineMonomerStatCount();

    const { mass: funcA_massCount, percent: funcA_percentCount } = funcA_statCount;
    const { mass: funcB_massCount, percent: funcB_percentCount } = funcB_statCount;

    // Check that functional groups have at least 1 mass or more, and that the total number of knowns for percent and mass are greater than or equal to the number of comonomers
    const funcA_canBeReference = funcA_massCount >= 1 && ((funcA_massCount + funcA_percentCount) >= funcA.getNum())
    const funcB_canBeReference = funcB_massCount >= 1 && ((funcB_massCount + funcB_percentCount) >= funcB.getNum())

    // Determine which of the functional groups should be the reference group
    if (funcA_canBeReference && !funcB_canBeReference) {
        // Only Functional Group A is a suitable reference group
        funcA.setIsReference();
    }
    else if (!funcA_canBeReference && funcB_canBeReference) {
        // Only Functional Group B is a suitable reference group
        funcB.setIsReference();
    }
    else if (funcA_canBeReference && funcB_canBeReference) {
        // Both functional groups are suitable reference groups. Determine functional group with greater proportion of knowns to be reference group
        const funcA_xsKnowns = (funcA_massCount + funcA_percentCount) - funcA.getNum();
        const funcB_xsKnowns = (funcB_massCount + funcB_percentCount) - funcB.getNum();

        // A greater mass proportion signifies more mass values given, which indicates a more suitable reference group
        const funcA_massProportion = funcA_massCount - funcA.getNum();
        const funcB_massProportion = funcB_massCount - funcB.getNum();

        if (funcA_xsKnowns > funcB_xsKnowns || funcA_massProportion > funcB_massProportion) {
            // Functional group A has either more information given or more masses given, so it is the more suitable reference group
            funcA.setIsReference();
        }
        else if (funcB_xsKnowns > funcA_xsKnowns  || funcB_massProportion > funcA_massProportion) {
            // Functional group B has either more information given or more masses given, so it is the more suitable reference group
            funcB.setIsReference();
        }
        else {
            // The proportions for functional groups A & B are equivalent, so the reference group defaults to A
            funcA.setIsReference();
        }
    }
    else {
        // Neither functional groups are a suitable reference group; return false to indicate failed data sorting
        return false;
    }

    // Find calculation routes for each functional group
    const funcA_route = findRoute(funcA);
    const funcB_route = findRoute(funcB);

    // Check that calculation route was found for both functional groups
    if (!funcA_route && !funcB_route) {
        // Neither functional group found a valid calculation route
        console.error(Error(`Neither functional group ${funcA.getName()} or ${funcB.getName()} have a valid calculation route.`));
        return false;
    }      
    else if (!funcA_route && funcB_route) {
        // No valid calculation route for functional group B
        console.error(Error(`No valid calculation route for functional group for ${funcB.getName()}.`));
        return false;
    } 
    else if (funcA_route && !funcB_route) {
        // No valid calculation route for functional group A
        console.error(Error(`No valid calculation route for functional group for ${funcA.getName()}.`));
        return false;
    }
    
    return [funcA, funcA_route, funcB, funcB_route];
}

function findRoute(funcGroup) {

    /*  Route Finder:
        (1) - Determine what are known values for monomers by boolean expressions based on stat counts
        (2) - Select an appropiate calculation route for reference and complimentary groups
    */

    const { percent_type, num: funcNum, isReference: funcIsReference, unknown } = funcGroup;

    const { 
        mass: massCount, 
        percent: percentCount, 
        determined: determinedCount, 
        partial: partialCount } = funcGroup.monomerStatCount;

    // (1)
    const mass_present = massCount >= 1;
    const percent_present = percentCount >= 1;
    const determined_present = determinedCount >= 1;

    const all_mass = massCount === funcNum;
    const all_percent = percentCount === funcNum;
    const almost_all_mass = massCount === funcNum - 1;
    const almost_all_percent = percentCount === funcNum - 1;

    // The Tetris Route requires that there is a determined comonomer, 1 unknown comnomer, and that all remaining comonomers are partially known
    let tetris_possible = determined_present && unknown !== null && (partialCount === funcNum - 2);

    // Scenarios which have special conditions depending on whether the functional group is reference or complimentary
    let excess_info, zpr_possible;

    // Determine if excess information given and/or zipper route is possible
    if (funcIsReference) {
        // Reference Group
        const ref_knowns = massCount + percentCount;

        // Only n (funcNum) information needs to be given for calculations to be possible, anything more is unnecessary and must be accounted for user error
        excess_info = ref_knowns > funcNum;

        // The Reference Zipper Route requires that all comonomers be partially known with at least one mass given
        zpr_possible = partialCount === funcNum && mass_present;
    }
    else {
        // Complimentary Group
        const comp_knowns = massCount + percentCount;

        // Only n (funcNum) - 1  information needs to be given for calculations to be possible, anything more is unnecessary and must be accounted for user error
        excess_info = comp_knowns > funcNum - 1;

        // The Complimentary Zipper Route requires that nearly all comonomers be partially known with at least one mass given, and that there is an unknown comonomer present
        zpr_possible = partialCount === funcNum - 1 && mass_present && unknown !== null;
    }
    
    // (2)
    // REFERENCE GROUP
    if (funcIsReference) {

       // All Mass Route - All comonomer masses given and no percent values given
        if (all_mass && !percent_present) {
            console.log("Your calculation route for reference group is: All Mass");
            return 'ALLMASSROUTE';
        }

       // Zipper Route = Every comonomer either has mass as a known and percent as an unknown, and vice-versa
        else if (zpr_possible) {
            switch (percent_type) {
                case 'weight':
                    console.log("Your calculation route for reference group is: wt% Zipper");
                    return 'WTP_ZIPPERROUTE';
                case 'mole':
                    console.log("Your calculation route for reference group is: ml% Zipper");
                    return 'MLP_ZIPPERROUTE';
            }
            
        }
    
       // Excess Info - The user has given more information than necessary. User error is a concern for this route
       // Tetris Route - One reference monomer, one unknown, and all other comonomer(s) partially known
        else if (excess_info || tetris_possible) {
            switch (percent_type) {
                case 'weight':
                    if (tetris_possible) {
                        console.log("Your calculation route for reference group is: wt% Tetris via xs info");
                    } 
                    else {
                        console.log("Your calculation route for reference group is: Excess wt%");
                    }
                    
                    return 'XS_WTPROUTE';
                case 'mole':
                    if (tetris_possible) {
                        console.log("Your calculation route for reference group is: ml% Tetris via xs info");
                    } 
                    else {
                        console.log("Your calculation route for reference group is: Excess ml%");
                    }

                    return 'XS_MLPROUTE';
            }
        }
        
        // No calculation route was able to be found for the reference group with the information given
        else {
            console.log("No calculation route could be found for your reference group.\n\tIt may be missing key information (mass) and/or not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO NUMBER OF MONOMERS");
            return false;
        }
    }

    // COMPLIMENTARY GROUP
    else {
        // All Percent Route - All comonomer percents given and no mass values given
        if ((all_percent || almost_all_percent) && !mass_present) {
            console.log("Your calculation route for complimentary group is: All Percent");
            return 'ALLPERCENTROUTE';
        }

        // Given Mass Route - Almost all masses given with no percents given
        else if (almost_all_mass && !percent_present) {
            console.log("Your calculation route for complimentary group is: Given Mass");
            return 'GIVENMASSROUTE';
        }

       // Zipper Route - One unknown and almost every comonomer either has mass as a known and percent as an unknown, and vice-versa
        else if (zpr_possible) {
            switch (percent_type) {
                case 'mole':
                    console.log("Your calculation route for complimentary group is: Mol Percent Zipper");
                    return 'MLP_ZIPPERROUTE';
                case 'weight':
                    console.log("Your calculation route for complimentary group is: Wt Percent Zipper");
                    return 'WTP_ZIPPERROUTE';
            }
        }

        // Excess Info - The user has given more information than necessary. User error is a concern for this route
        else if (excess_info) {
            console.log("Your calculation route for complimentary group is: Excess Info");
            return 'XS_INFOROUTE';
        }

        // No calculation route was able to be found for the complimentary group with the information given
        else {
            console.log("No calculation route could be found for your complimentary group.\n\tIt may not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO (NUMBER OF MONOMERS - 1)");
            return false;
        }
    }
}