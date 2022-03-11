
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
                    
                break;
            }

            case 'WTP_ZIPPERROUTE':
            {
                var mass_sum = 0.0, percent_sum = 0.0, mol_sum = 0.0;
                var g_per_percent, percent_per_g, total_mass_percent;
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                percent_sum = sumMonomerStat(func_ref, "wpercent");
                
                var total_mass_percent = 100.0 - percent_sum;
                var g_per_percent = (mass_sum / total_mass_percent);
                var percent_per_g = 1.0 / g_per_percent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    if (monomerStats[q].wpercent == 0.0 && monomerStats[q].mass != 0.0)
                        monomerStats[q].wpercent = (monomerStats[q].mass * percent_per_g);
                    
                    else if (monomerStats[q].wpercent != 0.0 && monomerStats[q].mass == 0.0)
                        monomerStats[q].mass = (monomerStats[q].wpercent * g_per_percent);
                    
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_ZIPPERROUTE':
            {
                var mass_sum = 0.0, percent_sum = 0.0, mol_sum = 0.0;
                var mol_per_percent, percent_per_mol, total_mol_percent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    
                    if (monomerStats[q].mass != 0.0)
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");            // This is a partial mole sum
                percent_sum = sumMonomerStat(func_ref, "mpercent");     // This is a partial sum of all entered percent values, should not add to 100
                
                total_mol_percent = 100.0 - percent_sum;                // Calculates what percentage all moles take up
                var mol_per_percent = (mol_sum / total_mol_percent);
                var percent_per_mol = 1.0 / mol_per_percent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // For monomers with unknown ml% but known moles, calculate ml%
                    if (monomerStats[q].mpercent == 0.0 && monomerStats[q].moles != 0.0) {
                        monomerStats[q].mpercent = (monomerStats[q].moles * percent_per_mol);
                    } 
                    // For monomers with unknown moles but known ml%, calculate moles
                    else if (monomerStats[q].mpercent != 0.0 && monomerStats[q].moles == 0.0) {
                        monomerStats[q].moles = (monomerStats[q].mpercent * mol_per_percent);
                    }
                    // Now that moles should be known for all monomers, calculate mass using molar mass
                    monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                }
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                break;
            }

            case 'WTP_TETRISROUTE':
            {
                
                var g_per_percent = monomerStats[monomerStatCount[func_ref].tts_ref].mass / monomerStats[monomerStatCount[func_ref].tts_ref].wpercent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    if (monomerStats[q].mass == 0.0 && monomerStats[q].wpercent != 0.0)
                    {
                        monomerStats[q].mass = monomerStats[q].wpercent * g_per_percent;
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }
                    
                    else if (monomerStats[q].mass != 0.0 && monomerStats[q].wpercent == 0.0)
                    {
                        monomerStats[q].wpercent = monomerStats[q].mass / g_per_percent;
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }
                }
                
                // Find mass, wt%, and moles for unknown monomer
                let part_percent_sum = sumMonomerStat(func_ref, "wpercent");
                monomerStats[funcStats[func_ref].unknown].wpercent = 100.0 - part_percent_sum;
                monomerStats[funcStats[func_ref].unknown].mass = monomerStats[funcStats[func_ref].unknown].wpercent * g_per_percent;
                monomerStats[funcStats[func_ref].unknown].moles = monomerStats[funcStats[func_ref].unknown].mass / monomerStats[funcStats[func_ref].unknown].molar_mass;
                
                var mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_TETRISROUTE':
            {
                
                monomerStats[monomerStatCount[func_ref].tts_ref].moles = monomerStats[monomerStatCount[func_ref].tts_ref].mass / monomerStats[monomerStatCount[func_ref].tts_ref].molar_mass;
                var mol_per_percent = monomerStats[monomerStatCount[func_ref].tts_ref].moles / monomerStats[monomerStatCount[func_ref].tts_ref].mpercent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    if (monomerStats[q].mass == 0.0 && monomerStats[q].mpercent != 0.0)
                    {
                        monomerStats[q].moles = monomerStats[q].mpercent * mol_per_percent;
                        monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                    }
                    
                    else if (monomerStats[q].mass != 0.0 && monomerStats[q].mpercent == 0.0)
                    {
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                        monomerStats[q].mpercent = monomerStats[q].moles / mol_per_percent;
                    }
                }
                
                // Find mass, ml%, and moles for unknown monomer
                let part_percent_sum = sumMonomerStat(func_ref, "mpercent");
                monomerStats[funcStats[func_ref].unknown].mpercent = 100.0 - part_percent_sum;
                monomerStats[funcStats[func_ref].unknown].moles = monomerStats[funcStats[func_ref].unknown].mpercent * mol_per_percent;
                monomerStats[funcStats[func_ref].unknown].mass = monomerStats[funcStats[func_ref].unknown].moles * monomerStats[funcStats[func_ref].unknown].molar_mass;
                
                var mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                break;
            }

            case 'WTP_ALLPERCENT':
            {
                
                let ref_monomer = findRefMonomer(func_ref);
                var g_per_percent = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].wpercent
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    if (monomerStats[q].mass == 0.0)
                        monomerStats[q].mass = monomerStats[q].wpercent * g_per_percent;
                    
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_ALLPERCENT':
            {
                let ref_monomer = findRefMonomer(func_ref);

                monomerStats[ref_monomer].moles = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].molar_mass;
                var mol_per_percent = monomerStats[ref_monomer].moles / monomerStats[ref_monomer].mpercent
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    if (monomerStats[q].mass == 0.0) {
                        monomerStats[q].moles = monomerStats[q].mpercent * mol_per_percent;
                        monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                    }

                    if (monomerStats[q].moles == 0.0) {
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }   
                }
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
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
            return objectSum;

        case 'wpercent':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].wpercent;
            }
            return objectSum;

        case 'mpercent':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].mpercent;
            }
            return objectSum;

        case 'molar_mass':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].molar_mass;
            }
            return objectSum;

        case 'moles':
            for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
                objectSum += monomerStats[q].moles;
            }
            return objectSum;
    }
    

}

function findRefMonomer(func_group) {

    for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
        if (monomerStats[q].mass != 0) {
            return q;
        }
    }
}