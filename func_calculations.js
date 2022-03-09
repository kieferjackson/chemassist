
function doReferenceCalculations(route) {
    switch (route)
        {
            case 'ALLMASSROUTE':
            {
                console.log("Your reference calculation is Mass Route");
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;       // Calculating Wt% from mass and total mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;  // Calculating moles from mass and molar mass
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                }
                    
                console.log("Finished Calculations for Reference Group Yielded:");
                console.log(monomerStats[func_ref]);
                break;
            }
        }
}

function doComplimentaryCalculations() {
    
}

function sumMonomerStat(func_group, object_stat) {

    let objectSum = 0;

    switch (object_stat) {
        case 'mass':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].mass;
            }
            break;

        case 'wpercent':
        for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
            objectSum += monomerStats[q].wpercent;
        }
        break;

        case 'mpercent':
        for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
            objectSum += monomerStats[q].mpercent;
        }
        break;

        case 'molar_mass':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].molar_mass;
            }
            break;

        case 'moles':
        for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
            objectSum += monomerStats[q].moles;
        }
        break;
    }
    

}