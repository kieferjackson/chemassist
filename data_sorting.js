
monomerStatCount = [
{   // Stat Count for Func Group 1
    mass: 0,
    percent: 0,
    // Zipper Method Count
    zprMethod: 0,
    // Tetris Method Values
    tts_ref: 0,
    tts_refFound: false,
},
{   // Stat Count for Func Group 2
    mass: 0,
    percent: 0,
    // Zipper Method Count
    zprMethod: 0,
    // Tetris Method Values
    tts_ref: 0,
    tts_refFound: false,
},
];

func_ref = 0;
func_comp = 0;

function startDataSorting() {

    for (var i = 0 ; i < 2 ; i++) {

        /*  Stat Counter - If a value is not 0, the stat count increments by one to indicate the number of known values for mass and percent. 
            Molar mass is assumed to be known for all monomers, so it is not considered.
        */
        monomerStatCount[i].mass =          0;
        monomerStatCount[i].percent =       0;
        monomerStatCount[i].zprMethod =     0;
        monomerStatCount[i].tts_ref =       0;
        monomerStatCount[i].tts_refFound =  false;

        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            // Increment Mass Count if it is a positive number
            if (monomerStats[q].mass != 0) {
                monomerStatCount[i].mass += 1;
            }

            // Increment Percent Count if it is a positive number
            if (monomerStats[q].percent != 0) {
                monomerStatCount[i].percent += 1;
            }

            // Increment Zipper Method if Mass is known but Percent is unknown, and vice-versa
            if (funcStats[i].num >= 3 && ((monomerStats[q].mass != 0 && monomerStats[q].percent === 0) || (monomerStats[q].mass === 0 && monomerStats[q].percent != 0))) {
                monomerStatCount[i].zprMethod += 1;
            }

            // Set Tetris Method values if conditions are met
            if (monomerStatCount[i].tts_refFound === false && monomerStats[q].mass != 0 && monomerStats[q].percent != 0) {
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
        funcStats[i].isReference = monomerStatCount[i].mass >= 1 && ((monomerStatCount[i].mass + monomerStatCount[i].percent) >= funcStats[i].num)
    }

    // If both functional groups are valid as reference groups for any reason(s), the one with more knowns and/or masses will be chosen as the reference group
    if (funcStats[FUNC_A].isReference === true && funcStats[FUNC_B].isReference === true) {

        funcA_known = monomerStatCount[FUNC_A].mass + monomerStatCount[FUNC_A].percent;
        funcB_known = monomerStatCount[FUNC_B].mass + monomerStatCount[FUNC_B].percent;

        if (monomerStatCount[FUNC_A].mass > monomerStatCount[FUNC_B].mass || funcA_known > funcB_known) {
            funcStats[FUNC_A].isReference === true

            func_ref = FUNC_A;
            func_comp = FUNC_B;
        } else {
            funcStats[FUNC_B].isReference === true

            func_ref = FUNC_B;
            func_comp = FUNC_A;
        }

    }

    /*  Route Finder:
        (1) - Determine what is known values for monomers by boolean expressions
        (2) - Select an appropiate calculation route for reference and complimentary groups
    */



}

function routeFinder(i, funcType) {
    let mass_present = monomerStatCount[i].mass >= 1;
    let percent_present = monomerStatCount[i].percent >= 1;

    let all_mass = monomerStatCount[i].mass === funcStats[i].num;
    let all_percent = monomerStatCount[i].percent === funcStats[i].num;
    let almost_all_mass = monomerStatCount[i].mass === funcStats[i].num - 1;
    let almost_all_percent = monomerStatCount[i].percent === funcStats[i].num - 1;

    let percent_and_mass = (all_percent || almost_all_percent) && mass_present;   // Checks if all weight percents are known and there is at least one mass

    let zpr_possible = monomerStatCount[i].zprMethod === funcStats[i].num;
    let tetris_possible = monomerStatCount[i].tts_refFound === true;

    switch(funcType) {
        case 'REFERENCE':
            if (all_mass === true) {
                console.log("Your calculation route for reference group is: All Mass");
                return 'ALLMASSROUTE';
            }

            else if (zpr_possible === true) {
                console.log("Your calculation route for reference group is: Zipper");
                return 'ZIPPERROUTE'
            }

            else if (percent_and_mass === true) {
                console.log("Your calculation route for reference group is: All Percent");
                return 'ALLPERCENTROUTE';
            }

            else if (tetris_possible === true) {
                console.log("Your calculation route for reference group is: Tetris");
                return 'TETRISROUTE';
            }
            
            else {
                console.log("No calculation route could be found for your reference group.\n\tIt may be missing key information (mass) and/or not have enough information:\n\tNUMBER OF KNOWNS SHOULD BE GREATER THAN OR EQUAL TO NUMBER OF MONOMERS")
            }

            break;

        case 'COMPLIMENTARY':
            break;
    }
}