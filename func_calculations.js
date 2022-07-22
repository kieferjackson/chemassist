
function doReferenceCalculations(route) {
    switch (route)
        {
            case 'ALLMASSROUTE':
            {
                console.log("Your reference calculation is Mass Route");
                
                let mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    // Calculating Wt% from mass and total mass
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;

                    // Calculating moles from mass and molar mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                let mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    // Calculating Ml% from moles and total moles
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                }
                   
                // Calculations were successful for the All Mass Route
                return true;
            }

            case 'WTP_ZIPPERROUTE':
            {
                // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
                let mass_sum = sumMonomerStat(func_ref, "mass");
                let percent_sum = sumMonomerStat(func_ref, "wpercent");
                
                // Total mass percent is the percentage that masses take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns masses account for 40%)
                let total_mass_percent = 100.0 - percent_sum;

                // This gives the ratio between mass and percent (e.g. 4 g for 40% means that 20% would be 2 g or that 55% would be 5.5 g)
                let g_per_percent = (mass_sum / total_mass_percent);
                let percent_per_g = 1.0 / g_per_percent;
                
                // Loop through given values for comonomers and use predefined ratios of mass and percent to find their respective unknowns
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    // Mass is known, so calculate the value for weight percent
                    if (monomerStats[q].wpercent == 0.0 && monomerStats[q].mass != 0.0)
                        monomerStats[q].wpercent = (monomerStats[q].mass * percent_per_g);
                    
                    // Weight percent is known, so calculate the value for mass
                    else if (monomerStats[q].wpercent != 0.0 && monomerStats[q].mass == 0.0)
                        monomerStats[q].mass = (monomerStats[q].wpercent * g_per_percent);
                    
                    // Mass should be known, so calculate moles using molar mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                let mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                // Calculations were successful for the Weight Percent Zipper Route
                return true;
            }

            case 'MLP_ZIPPERROUTE':
            {
                // Cycle through functional group to find comonomers with mass, and calculate their moles if so
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    
                    if (monomerStats[q].mass != 0.0)
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    
                }
                
                // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
                let mol_sum = sumMonomerStat(func_ref, "moles");
                let percent_sum = sumMonomerStat(func_ref, "mpercent");
                
                // Total mole percent is the percentage that moles take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns moles account for 40%)
                let total_mol_percent = 100.0 - percent_sum;

                // This gives the ratio between moles and percent (e.g. 0.04 mol for 40% means that 20% would be 0.02 mol or that 55% would be 0.055 mol)
                let mol_per_percent = (mol_sum / total_mol_percent);
                let percent_per_mol = 1.0 / mol_per_percent;
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // Moles are known, so calculate the value for mole percent
                    if (monomerStats[q].mpercent == 0.0 && monomerStats[q].moles != 0.0) {
                        monomerStats[q].mpercent = (monomerStats[q].moles * percent_per_mol);
                    } 

                    // Mole percent is known, so calculate the value for moles
                    else if (monomerStats[q].mpercent != 0.0 && monomerStats[q].moles == 0.0) {
                        monomerStats[q].moles = (monomerStats[q].mpercent * mol_per_percent);
                    }
                    // Moles should be known, so calculate mass using molar mass
                    monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                }
                
                let mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                // Calculations were successful for the Mole Percent Zipper Route
                return true;
            }

            case 'WTP_TETRISROUTE':
            {
                // Find comonomer with both mass and percent given to act as reference
                let tts_ref = findRefMonomer(func_ref);

                // Tetris reference comonomer is already determined, so calculate its moles
                monomerStats[tts_ref].moles = monomerStats[tts_ref].mass / monomerStats[tts_ref].molar_mass;
                
                // Find the ratio between mass and percent from the tetris refence comonomer
                let g_per_percent = monomerStats[tts_ref].mass / monomerStats[tts_ref].wpercent;
                
                // Iterate through each comonomer with either mass or percent known, and calculate their undetermined values using the ratio between mass and percent
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // Weight percent is known, so calculate the value for mass, then moles
                    if (monomerStats[q].mass == 0.0 && monomerStats[q].wpercent != 0.0)
                    {
                        monomerStats[q].mass = monomerStats[q].wpercent * g_per_percent;
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }
                    
                    // Mass is known, so calculate the value for weight percent, then moles
                    else if (monomerStats[q].mass != 0.0 && monomerStats[q].wpercent == 0.0)
                    {
                        monomerStats[q].wpercent = monomerStats[q].mass / g_per_percent;
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }
                }
                
                // Find mass, wt%, and moles for unknown monomer
                let part_percent_sum = sumMonomerStat(func_ref, "wpercent");
                // Get the index value for the unknown comonomer of the reference group
                let unknown = funcStats[func_ref].unknown;
                monomerStats[unknown].wpercent = 100.0 - part_percent_sum;
                monomerStats[unknown].mass = monomerStats[unknown].wpercent * g_per_percent;
                monomerStats[unknown].moles = monomerStats[unknown].mass / monomerStats[unknown].molar_mass;
                
                // Now that the unknown comonomer's moles have been calculated, all moles should be known, so calculate total moles
                var mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                // Calculations were successful for the Weight Percent Tetris Route
                return true;
            }

            case 'MLP_TETRISROUTE':
            {
                // Find comonomer with both mass and percent given to act as reference
                let tts_ref = findRefMonomer(func_ref);

                // Tetris reference comonomer is already determined, so calculate its moles
                monomerStats[tts_ref].moles = monomerStats[tts_ref].mass / monomerStats[tts_ref].molar_mass;

                // Find the ratio between moles and percent from the tetris refence comonomer
                let mol_per_percent = monomerStats[tts_ref].moles / monomerStats[tts_ref].mpercent;
                
                // Iterate through each comonomer with either mass or percent known, and calculate their unknown using the ratio between moles and percent
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
                // Get the index value for the unknown comonomer of the reference group
                let unknown = funcStats[func_ref].unknown;
                monomerStats[unknown].mpercent = 100.0 - part_percent_sum;
                monomerStats[unknown].moles = monomerStats[unknown].mpercent * mol_per_percent;
                monomerStats[unknown].mass = monomerStats[unknown].moles * monomerStats[unknown].molar_mass;

                // Now that the unknown comonomer's mass has been calculated, all masses should be known, so calculate total mass
                var mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                // Calculations were successful for the Mole Percent Tetris Route
                return true;
            }

            case 'XS_WTPROUTE':
            {
                // Find the index for the comonomer with a mass value given
                let ref_monomer = findRefMonomer(func_ref);
                let g_per_percent = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].wpercent
                
                // Iterate through each comonomer and calculate their mass and moles
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // If both mass and percent given, then check their ratio to the reference
                    if (monomerStats[q].mass != 0.0 && monomerStats[q].wpercent != 0.0) {
                        let current_ratio = monomerStats[q].mass / monomerStats[q].wpercent;
                        let wt_ratios_match = compareFloatValues(current_ratio, g_per_percent, 0.0001);

                        if (!wt_ratios_match) {
                            // The ratio between mass and percent for one of the comonomers did not match the reference within the tolerance
                            console.log("Mass/Percent ratios don't match the reference...");
                            generateErrorMsg("monomer_data_entry", `The ratios between mass and percents did not match the reference ratio for the reference (${funcStats[func_ref].name}) group. Please enter valid masses or remove invalid ones.`);
                            return false;
                        }
                    }

                    // Mass is unknown, so calculate using ratio between mass and percent
                    if (monomerStats[q].mass == 0.0 && monomerStats[q].wpercent != 0.0)
                        monomerStats[q].mass = monomerStats[q].wpercent * g_per_percent;

                    // Weight percent is unknown, so calculate using ratio between mass and percent
                    if (monomerStats[q].wpercent == 0.0 && monomerStats[q].mass != 0.0 )
                        monomerStats[q].wpercent = monomerStats[q].mass / g_per_percent;
                    
                    // Mass should be known, so calculate moles using molar mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }

                // Find wt%, mass, and moles for unknown monomer if there is one
                if (funcStats[func_ref].unknown != null) {
                    // Find the partial weight percent sum
                    let part_percent_sum = sumMonomerStat(func_ref, "wpercent");
                    let unknown = funcStats[func_ref].unknown;
                    monomerStats[unknown].wpercent = 100.0 - part_percent_sum;
                    monomerStats[unknown].mass = monomerStats[unknown].wpercent * g_per_percent;
                    monomerStats[unknown].moles = monomerStats[unknown].mass / monomerStats[unknown].molar_mass;
                }
                
                let mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                // Calculations were successful for the All Weight Percent Route
                return true;
            }

            case 'XS_MLPROUTE':
            {
                // Find the index for the comonomer with a mass value given
                let ref_monomer = findRefMonomer(func_ref);

                // Calculate moles for reference comonomer, and use that value for the ratio between moles and percent
                monomerStats[ref_monomer].moles = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].molar_mass;
                let mol_per_percent = monomerStats[ref_monomer].moles / monomerStats[ref_monomer].mpercent
                
                // Iterate through each comonomer and calculate their mass and moles
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // If both mass and percent given, then check their ratio to the reference
                    if (monomerStats[q].mass != 0.0 && monomerStats[q].mpercent != 0.0) {
                        // Calculate the comonomer's moles
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;

                        let current_ratio = monomerStats[q].moles / monomerStats[q].mpercent;
                        let ml_ratios_match = compareFloatValues(current_ratio, mol_per_percent, 0.0001);

                        if (!ml_ratios_match) {
                            // The ratio between moles and percent the current comonomer did not match the reference within tolerance
                            console.log("Moles/Percent ratios don't match the reference...");
                            generateErrorMsg("monomer_data_entry", `The ratios between moles and percents did not match the reference ratio for the reference (${funcStats[func_ref].name}) group. Please enter valid masses or remove invalid ones.`);
                            return false;
                        }
                    }

                    // Mole percent is given but mass is undetermined, so calculate moles and mass using ratio between calculated moles and percent
                    if (monomerStats[q].mass == 0.0 && monomerStats[q].mpercent != 0.0 ) {
                        monomerStats[q].moles = monomerStats[q].mpercent * mol_per_percent;
                        monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                    } 

                    // Mass is given but mole percent is undetermined, so calculate using ratio between calculated moles and percent
                    if (monomerStats[q].mpercent == 0.0 && monomerStats[q].mass != 0.0 ) {
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass
                        monomerStats[q].mpercent = monomerStats[q].moles / mol_per_percent;
                    }
                    
                }

                // Find ml%, moles, and mass for unknown monomer if there is one
                if (funcStats[func_ref].unknown != null) {
                    // Find the partial mole percent sum
                    let part_percent_sum = sumMonomerStat(func_ref, "mpercent");
                    let unknown = funcStats[func_ref].unknown;
                    monomerStats[unknown].mpercent = 100.0 - part_percent_sum;
                    monomerStats[unknown].moles = monomerStats[unknown].mpercent * mol_per_percent;
                    monomerStats[unknown].mass = monomerStats[unknown].moles * monomerStats[unknown].molar_mass;
                }
                
                let mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                // Calculations were successful for the All Mole Percent Route
                return true;
            }

        }
}

function doComplimentaryCalculations(route) {
    switch(route) {
        case 'ALLPERCENTROUTE':
        {
            // Initalize mole sum array to hold the mole sums for both reference group and complimentary group
            var mol_sum = [];
            
            // For partial percent sum calculations to find the unknown comonomer's percent, check that there is more than one comonomer in the complimentary group and that there are n - 1 percents given
            if (funcStats[func_comp].num > 1 && monomerStatCount[func_comp].percent == funcStats[func_comp].num - 1) {

                // The partial sum is defined by the given percent type chosen and its values given, so branch the path based on the chosen percent type
                switch(funcStats[func_comp].percent_type) {
                    case 'weight':
                        var part_percent_sum = sumMonomerStat(func_comp, "wpercent");

                        let wtp_unknown = funcStats[func_comp].start; 
                        // Find the comonomer with no weight percent value given
                        while (monomerStats[wtp_unknown].wpercent != 0) {
                            // Iterate to next comonomer until the undetermined weight percent comonomer is found
                            wtp_unknown++;
                        }

                        // Calculate the unknown comonomer's weight percent by finding the difference between the sum of every other's comonomer's weight percent and 100
                        monomerStats[wtp_unknown].wpercent = 100.0 - part_percent_sum;
                        break;
                    case 'mole':
                        var part_percent_sum = sumMonomerStat(func_comp, "mpercent");

                        let mlp_unknown = funcStats[func_comp].start; 
                        // Find the comonomer with no mole percent value given
                        while (monomerStats[mlp_unknown].mpercent != 0) {
                            // Iterate to next comonomer until the undetermined mole percent comonomer is found
                            mlp_unknown++;
                        }

                        // Calculate the unknown comonomer's mole percent by finding the difference between the sum of every other's comonomer's mole percent and 100
                        monomerStats[mlp_unknown].mpercent = 100.0 - part_percent_sum;
                        break;
                }
            } 
            
            // If the complimentary group only has 1 comonomer, then its percent values for both weight and mole can only be 100.
            else if (funcStats[func_comp].num === 1) {
                monomerStats[funcStats[func_comp].start].wpercent = 100.0;
                monomerStats[funcStats[func_comp].start].mpercent = 100.0;
            }
            
            /*  
             *  Weight percent calculations vary greatly from mole percent because complimentary calculations are partly based and reliant on the reference groups mole sum.
             *  In the case of mole percents, the conversion of values is simple since they are all in terms of moles. However, this is not the case for the weight percent.
             *  
             *  In essence, the goal is to convert the given weight percent values to mole percents by bringing their percent values (which are in terms of weight) in terms
             *  of moles using their respective molar mass (its terms are mass / moles). We take each of those proportions, sum all them together, then divide each of them
             *  by the total sum and multiply that result by 100 to get the percent value.
             * 
             *  It is worth noting that these calculations are only applicable to complimentary groups with more than 1 comonomer because their percents can only be 100. As
             *  well, the calculations work on the assumption that the total mass is 100, so that the given percentage values are the same as the pseudo-masses* calculated.
             *      *40% -> 40 pseudo-g; 40 p-g / molar_mass = -- pseudo-mol
             */
            if (funcStats[func_comp].num > 1 && funcStats[func_comp].percent_type === 'weight')
            {
                // Initialize the proportion variable and array
                var wtp_proportion_sum = 0.0, wtp_proportion = [];

                // Iterate through each comonomer in the complimentary group
                for (var w = 0 ; w < funcStats[func_comp].num ; w++)
                {
                    // q is the index for the current complimentary comonomer (funcStats(----).start acts as an offset to select the correct functional group within the monomerStats array)
                    let q = w + funcStats[func_comp].start;

                    // Put weight percent in terms of moles and set this comonomer's proportion
                    wtp_proportion[w] = monomerStats[q].wpercent / monomerStats[q].molar_mass;

                    // Add the proportion just calculated to the current proportion total
                    wtp_proportion_sum += wtp_proportion[w];
                }
                
                // Converting Weight Percent to Mole Percent
                for (var w = 0 ; w < funcStats[func_comp].num ; w++)
                {
                    // q is the index for the current complimentary comonomer (funcStats(----).start acts as an offset to select the correct functional group within the monomerStats array)
                    let q = w + funcStats[func_comp].start;

                    // Calculate mole percent using the ratio between an individual complimentary comonomer's proportion and the sum of those proportions, multiplied by 100 to display as a conventional percent value
                    monomerStats[q].mpercent = (wtp_proportion[w] / wtp_proportion_sum) * 100.0;
                }
            }
            
            // Find the mole sums for the reference group, then calculate complimentary mole sum based on their molar equivalents
            mol_sum[func_ref] = sumMonomerStat(func_ref, "moles");
            mol_sum[func_comp] = (mol_sum[func_ref] / funcStats[func_ref].molar_eq) * funcStats[func_comp].molar_eq;
            
            // Iterate through complimentary group to calculate missing values
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
            {
                // Mole percent is known and mass is unknown, so calculate moles then mass
                if (monomerStats[q].mpercent != 0.0 && monomerStats[q].mass == 0.0)
                {
                    monomerStats[q].moles = mol_sum[func_comp] * (monomerStats[q].mpercent / 100.0);
                    monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                }
                
                // Mass is known and mole percent is unknown, so calculate moles then mole percent
                else if (monomerStats[q].mass != 0.0 && monomerStats[q].mpercent == 0.0)
                {
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum[func_comp]) * 100.0;
                }
            }
            
            // For mole percent calculations, calculate the still unknown weight percent values for each comonomer
            if (funcStats[func_comp].percent_type === 'mole')
            {
                var mass_sum = sumMonomerStat(func_comp, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
            }
            
            // Calculations were successful for the All Percent Route
            return true;
        }

        case 'GIVENMASSROUTE':
        {
            // Initalize mole sum array to hold the mole sums for both reference group and complimentary group
            var mol_sum = [];
            
            // Find the mole sums for the reference group, then calculate complimentary mole sum based on their molar equivalents
            mol_sum[func_ref] = sumMonomerStat(func_ref, "moles");
            mol_sum[func_comp] = (mol_sum[func_ref] / funcStats[func_ref].molar_eq) * funcStats[func_comp].molar_eq;
            
            var part_mol_sum = 0.0, part_percent_sum = 0.0, mol_per_percent = 0.0;
            
            // Iterate through each given mass and calculate moles and mole percent, in addition to finding the partial mole and mole percent sums
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
            {
                if (monomerStats[q].mass != 0.0)
                {
                    // Calculate moles and mole percent from given mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum[func_comp]) * 100.0;
                    
                    // Add calculated mole values to partial mole sums
                    part_mol_sum += monomerStats[q].moles;
                    part_percent_sum += monomerStats[q].mpercent;
                }
                
                // The partial mole sum must be less than the complimentary mole sum calculated using the reference mole sum
                if (part_mol_sum >= mol_sum[func_comp])
                {
                    // The user's masses did not match the expected mole sum for the complimentary group
                    console.log("The partial mole sum for complimentary group is greater than or equal to expected mole sum...");
                    generateErrorMsg("monomer_data_entry", `The partial mole sum for the complimentary (${funcStats[func_comp].name}) group is greater than or equal to expected mole sum. Please enter valid masses or remove invalid ones.`);
                    return false;
                }
            }
            
            var q = funcStats[func_comp].start;
            
            // Iterate through each comonomer until the ratio between mole and percent is found. A loop must be used since any comomonmer may be the one unknown.
            do {
                mol_per_percent = monomerStats[q].moles / monomerStats[q].mpercent;
                q++;
            } while (mol_per_percent == 0.0);
            
            // Calculate ml%, moles, and mass for unknown comonomer
            monomerStats[funcStats[func_comp].unknown].mpercent = 100.0 - part_percent_sum;
            monomerStats[funcStats[func_comp].unknown].moles = (monomerStats[funcStats[func_comp].unknown].mpercent / 100.0) * mol_sum[func_comp];
            monomerStats[funcStats[func_comp].unknown].mass = monomerStats[funcStats[func_comp].unknown].moles * monomerStats[funcStats[func_comp].unknown].molar_mass;
            
            let mass_sum = sumMonomerStat(func_comp, "mass");
            
            // Calculate weight percent for each comonomer using their individual mass and the mass sum
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
                monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
            
            // Calculations were successful for the Given Mass Route
            return true;
        }

        case 'MLP_ZIPPERROUTE':
        {
            var mol_sum = [];
            
            // Find the mole sums for the reference group, then calculate complimentary mole sum based on their molar equivalents
            mol_sum[func_ref] = sumMonomerStat(func_ref, "moles");
            mol_sum[func_comp] = (mol_sum[func_ref] / funcStats[func_ref].molar_eq) * funcStats[func_comp].molar_eq;
            
            var part_percent_sum = 0.0;
            
            // Iterate through each comonomer with either mass or mole percent known
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
            {
                // Mole percent is known, so calculate moles and then mass
                if (monomerStats[q].mpercent != 0.0)
                {
                    monomerStats[q].moles = mol_sum[func_comp] * (monomerStats[q].mpercent / 100.0);
                    monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                }
                
                // Mass is known, so calculate moles and then mole percent
                else if (monomerStats[q].mass != 0.0)
                {
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum[func_comp]) * 100.0;
                }
                
                // Add calculated moles to partial percent sum
                part_percent_sum += monomerStats[q].mpercent;
            }
            
            // Calculate ml%, moles, and mass for unknown comonomer
            monomerStats[funcStats[func_comp].unknown].mpercent = 100.0 - part_percent_sum;
            monomerStats[funcStats[func_comp].unknown].moles = (monomerStats[funcStats[func_comp].unknown].mpercent / 100.0) * mol_sum[func_comp];
            monomerStats[funcStats[func_comp].unknown].mass = monomerStats[funcStats[func_comp].unknown].moles * monomerStats[funcStats[func_comp].unknown].molar_mass;
            
            let mass_sum = sumMonomerStat(func_comp, "mass");
            
            // Calculate weight percent for each comonomer using their individual mass and the mass sum
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
                monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
            
            // Calculations were successful for the Mole Percent Zipper Route
            return true;
        }

        case 'WTP_ZIPPERROUTE':
        {
            /*  
             *  For this calculation route, the mass sum must be calculated first so that all other values can be calculated as needed.
             *  However, calculating the mass sum is complicated by the existence of two unknowns: the mass sum and the mass of the unknown comonomer. 
             *  As such, to calculate the mass sum, there are two equations which consider the knowns and unknowns for the mass and weight percents.
             *  For these two equations, the first of them works on the basis that once the known masses' moles are subtracted from the total moles, we
             *  end up with the remaining moles which are occupied by the remaining weight percents and the unknown comonomer. The second of the two 
             *  works on the basis that once the weight percents are subtracted from 100 to find the remaining weight percent, this remaining weight percent
             *  is occupied by the remaining masses and unknown comonomer.
             * 
             *  The main issue that has to be solved in this route is eliminating the two unknown variables present so that there is only one remaining.
             *  In this case, the one unknown variable to determine is the total mass sum.  This is accomplished by:
             *      (1) finding the total moles that the weight percents and unknown account for (e.g. if the total moles were 0.8 mol, and the moles accounted 
             *          by the masses were 0.15 mol, then this value would be 0.65 mol). 
             *      (2) then, for each weight percent, its percent is treated as a real number (between 0 and 1) divided by its respective molar mass to bring it
             *          into terms of moles / grams, and these values are summed to give the weight percents' contribution to the mole sum.
             *      (3) the weight percent occupied by the masses and unknown are calculated by summing the given weight percents, then later finding the difference
             *          between that value and 100 (e.g. if the summed weight percents were 30%, then this value would be 70 wt%).
             *      (4) with the weight percent occupied by mass and the unknown, it is set equal to each mass divided by total mass (x) and the unknown mass divided 
             *          by x as well. This equation can be rearranged so that it set equal to the value of the unknown's mass.
             *      (5) with two equations with two unknowns, one of the the unknown variables can be eliminated and the total mass can be solved for.
             * 
             *  -------- KNOWN VALUES --------
             *  wtp = Weight Percent Value Given for n# comonomer
             *  mas = Mass Value Value Given for n# comonomer
             *  mom = Molar Mass Value Given for n# comonomer
             *  ------- UNKNOWN VALUES -------
             *  ??? = Unknown Comonomer
             *  x = total_mass
             * 
             *  [-] - Indicates that a value is not given or able to calculated immediately
             * 
             *      I:      part_mol_sum = sum((wtp_n1 / mom_n1) * [x] + (wtp_n2 / mom_n2) * [x] + ...) + [???_mas] / ???_mom
             *      II:     ((100.0 - part_percent_sum) / 100.0) =  sum((mas_n1 / [x]) + (mas_n2 / [x]) + ...) + [???_mas] / [x]
             * 
             *  Combine equations I & II...
             *      III:    part_mol_sum = sum((wtp_n1 / mom_n1) * [x] + (wtp_n2 / mom_n2) * [x] + ...) + ((100.0 - part_percent_sum) / 100.0) [x] / ???_mom + sum(mas_n1 + mas_n2 + ...)
             *                  Now the only unknown is x (total mass), and it can be solved for.
             * 
             *  Rearranged to be set equal to total mass...
             *      IV:     x = (part_mol_sum + unknown_mol_offset) / (percent_contribution_to_mol_sum + ((100.0 - part_percent_sum) / 100.0) / ???_mom)
             * 
             */
            var mol_sum = [];
            
            // Find the mole sums for the reference group, then calculate complimentary mole sum based on their molar equivalents
            mol_sum[func_ref] = sumMonomerStat(func_ref, "moles");
            mol_sum[func_comp] = (mol_sum[func_ref] / funcStats[func_ref].molar_eq) * funcStats[func_comp].molar_eq;
            
            var part_percent_sum = 0.0;
            var part_mol_sum = mol_sum[func_comp];
            var unknown_mol_offset = 0.0;
            var percent_contribution_to_mol_sum = 0.0;
            
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
            {
                if (monomerStats[q].mass != 0.0)
                {
                    // Mass is given, so calculate moles and mole percent
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum[func_comp]) * 100.0;
                    
                    // The unknown mole offset is the value gained by rearranging equation II to move x to the other side, leaving the sum of the known masses
                    unknown_mol_offset += (monomerStats[q].mass / monomerStats[funcStats[func_comp].unknown].molar_mass);
                    
                    // (1) - Subtracting the given moles from the total to give the moles associated with the weights percents and unknown comonomer
                    part_mol_sum -= monomerStats[q].moles;

                }
                
                else if (monomerStats[q].wpercent != 0.0)
                {
                    let wumbo_factor = (monomerStats[q].wpercent / 100.0) / monomerStats[q].molar_mass;
                    // (2) - Represents the moles that the weight percents contribute to the total, the partial mole sum from (2) is divided by these values' sum
                    percent_contribution_to_mol_sum += wumbo_factor;
                    
                    // (3) - The difference between this value and 100 is the weight percent occupied by the known masses and unknown comonomers
                    part_percent_sum += monomerStats[q].wpercent;
                }
            }
            
            // (4) & (5) - The following two calculations represent a two-step version of equation IV
            let all_non_mass_mol_contribution = percent_contribution_to_mol_sum + (((100.0 - part_percent_sum) / 100.0) / monomerStats[funcStats[func_comp].unknown].molar_mass);
            let mass_sum = (part_mol_sum + unknown_mol_offset) / all_non_mass_mol_contribution;
            
            // Iterate through each comonomer with values given and find its remaining values
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
            {
                // For known masses, calculate their weight percents using the mass sum
                if (monomerStats[q].mass != 0.0)
                {
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                    part_percent_sum += monomerStats[q].wpercent;
                }
                
                // For known weight percents, calculate their mass using the mass sum, then their moles and mole percent
                else if (monomerStats[q].wpercent != 0.0)
                {
                    monomerStats[q].mass = (monomerStats[q].wpercent / 100.0) * mass_sum;
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum[func_comp]) * 100.0;
                }
            }
            
            // Calculate wt%, mass, moles, and ml% for unknown comonomer
            monomerStats[funcStats[func_comp].unknown].wpercent = 100.0 - part_percent_sum;
            monomerStats[funcStats[func_comp].unknown].mass = (monomerStats[funcStats[func_comp].unknown].wpercent / 100.0) * mass_sum;
            monomerStats[funcStats[func_comp].unknown].moles = monomerStats[funcStats[func_comp].unknown].mass / monomerStats[funcStats[func_comp].unknown].molar_mass;
            monomerStats[funcStats[func_comp].unknown].mpercent = (monomerStats[funcStats[func_comp].unknown].moles / mol_sum[func_comp]) * 100.0;
            
            // Calculations were successful for the Weight Percent Zipper Route
            return true;
        }

        case 'XS_INFOROUTE':
        {
            // Initalize mole sum array to hold the mole sums for both reference group and complimentary group
            var mol_sum = [];

            // Find the mole sum for the reference group
            mol_sum[func_ref] = sumMonomerStat(func_ref, "moles");
            // The mole sum for the complimentary group should be the following value because it is based on the reference functional group
            mol_sum[func_comp] = (mol_sum[func_ref] / funcStats[func_ref].molar_eq) * funcStats[func_comp].molar_eq;

            let user_mol_sum = 0;
            const ALL_MASSES_ARE_GIVEN = monomerStatCount[func_comp].mass === funcStats[func_comp].num;
            const TOLERANCE = 0.0001;

            // Calculate the moles of masses given by the user
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                if (monomerStats[q].mass != 0) {
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    user_mol_sum += monomerStats[q].moles;
                }
            }

            // Validate that the masses given follow the expected mole sum
            if (ALL_MASSES_ARE_GIVEN) {
                // Validate that the user's mole sum is equivalent to the calculated mole sum within reasonable error
                user_mol_sum_valid = compareFloatValues(user_mol_sum, mol_sum[func_comp], TOLERANCE);
                
                if (!user_mol_sum_valid) {
                    // The user's masses did not match the expected mole sum for the complimentary group
                    console.log("Calculated mole sum does not match user given values...");
                    generateErrorMsg("monomer_data_entry", `The masses given did not match the calculated mole sum for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                    return false;
                }
            }
            else {
                // Not all masses were given, so calculated partial mole sum should be less than the expected total mole sum
                user_mol_sum_valid = user_mol_sum < mol_sum[func_comp];
                
                if (!user_mol_sum_valid) {
                    // The user's masses exceeded the expected mole sum for the complimentary group
                    console.log("Calculated mole sum exceeded the expected mole sum for the complimentary group...");
                    generateErrorMsg("monomer_data_entry", `Calculated mole sum exceeded the expected mole sum for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                    return false;
                }
            }
            
            // Percent values can only be 100 for any group with only one comonomer
            if (funcStats[func_comp].num === 1) {
                // If the complimentary group only has 1 comonomer, then its percent values for both weight and mole can only be 100.
                monomerStats[funcStats[func_comp].unknown].wpercent = 100.0;
                monomerStats[funcStats[func_comp].unknown].mpercent = 100.0;
            }
            // There is more than one comonomer, so check the ratios between mass and percent for those which give both values
            // (the ratio between different comonomers and their percents may differ and lead to error depending on user input)
            else {
                // Array to store the indexes of comonomers with mass and a percent value given
                let mass_percent_comonomers = [];

                // Get the indexes of all comonomers with percent and mass given
                for (var q = funcStats[func_comp].start, w = 0 ; q < funcStats[func_comp].end ; q++) {
                    if (monomerStats[q].mass != 0 && (monomerStats[q].wpercent != 0 || monomerStats[q].mpercent != 0)) {
                        mass_percent_comonomers[w] = q;
                        w++;
                    }
                }

                // For complimentary group with more than one comonomer and at least one comonomer with both mass and percent given
                if (mass_percent_comonomers.length >= 1) {
                    /****************************************************************
                     *  CHECK THAT GIVEN MOLE PERCENTS MATCH EXPECTED MOLE PERCENT  * 
                     ****************************************************************/
                    
                    // If mole percent is chosen, a given mole percent may not match the expected mole percent based on the calculated moles of each given mass
                    if (funcStats[func_comp].percent_type === 'mole') {
                        // Check that the mole percent from mass and the given mole percent match
                        for (var i = 0 ; i < mass_percent_comonomers.length ; i++) {
                            let index = mass_percent_comonomers[i];
                            let expected_mol_percent = monomerStats[index].moles / mol_sum[func_comp];
                            let given_mol_percent = monomerStats[index].mpercent;

                            let mol_percents_match = compareFloatValues(expected_mol_percent, given_mol_percent, TOLERANCE);
                            
                            if (!mol_percents_match) {
                                console.log("The given mole percents do not match the expected mole percent");
                                generateErrorMsg("monomer_data_entry", `The given mole percents do not match the expected mole percent for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                                return false;
                            }
                        }
                    }

                    /**************************************************************
                     *  CHECK RATIOS BETWEEN MASS/MOLES AND THEIR PERCENT VALUES  *
                     **************************************************************/

                    // Set the reference comonomer to the first one in the index. Any ratio value which differ from this reference are invalid
                    let reference_index = mass_percent_comonomers[0];
                    let reference_ratio;
                    
                    // Check ratios of mass to percent for comonomers with both given
                    switch(funcStats[func_comp].percent_type) {
                        case 'weight':
                            reference_ratio = monomerStats[reference_index].mass / monomerStats[reference_index].wpercent;

                            for (var i = 0 ; i < mass_percent_comonomers.length ; i++) {
                                let index = mass_percent_comonomers[i];
        
                                let g_per_percent = monomerStats[index].mass / monomerStats[index].wpercent;
                                let wt_ratios_match = compareFloatValues(g_per_percent, reference_ratio, TOLERANCE);

                                if (!wt_ratios_match) {
                                    console.log("The ratio between mass and weight percents did not all match for complimentary group");
                                    generateErrorMsg("monomer_data_entry", `The ratios between masses and percents did not all match for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                                    return false;
                                }
                            }

                            // No issues detected with ratios, so calculate remaining undetermined weight percent values
                            if (mass_percent_comonomers.length < funcStats[func_comp].num) 
                                for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                    // Mass is given but weight percent is unknown, so calculate weight percent using reference ratio
                                    if(monomerStats[q].mass != 0 && monomerStats[q].wpercent == 0) {
                                        monomerStats[q].wpercent = monomerStats[q].mass / reference_ratio;
                                    } 
                                    // Weight percent is given but mass is unknown, so calculate mass then moles using reference ratio
                                    else if (monomerStats[q].mass == 0 && monomerStats[q].wpercent != 0) {
                                        monomerStats[q].mass = monomerStats[q].wpercent * reference_ratio;
                                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass
                                    }
                                }

                            // Check for an unknown, and calculate its missing values if it exists
                            if (funcStats[func_comp].unknown != null) {
                                let unknown = funcStats[func_comp].unknown;

                                let part_wtp_sum = sumMonomerStat(func_comp, "wpercent");

                                monomerStats[unknown].wpercent = 100 - part_wtp_sum;
                                monomerStats[unknown].mass = monomerStats[unknown].wpercent * reference_ratio;
                                monomerStats[unknown].moles = monomerStats[unknown].mass / monomerStats[unknown].molar_mass;
                            }

                            // All moles should have been calculated, so find mole percents using calculated mole sum
                            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                monomerStats[q].mpercent = monomerStats[q].moles / mol_sum[func_comp];
                            }

                            break;
                        case 'mole':
                            reference_ratio = monomerStats[reference_index].moles / monomerStats[reference_index].mpercent;

                            for (var i = 0 ; i < mass_percent_comonomers.length ; i++) {
                                let index = mass_percent_comonomers[i];

                                let mol_per_percent = monomerStats[index].moles / monomerStats[index].mpercent;
                                let ml_ratios_match = compareFloatValues(mol_per_percent, reference_ratio, TOLERANCE);

                                if (!ml_ratios_match) {
                                    console.log("The ratio between moles and mole percents did not all match for complimentary group");
                                    generateErrorMsg("monomer_data_entry", `The ratios between calculated moles and percents did not all match for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                                    return false;
                                }
                            }

                            // No issues detected with ratios, so calculate remaining undetermined mole percent values
                            if (mass_percent_comonomers.length < funcStats[func_comp].num) 
                                for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                    // Mass is given but mole percent is unknown, so calculate mole percent using moles and mole sum
                                    if(monomerStats[q].mass != 0 && monomerStats[q].wpercent == 0) {
                                        monomerStats[q].mpercent = monomerStats[q].moles / mol_sum[func_comp];
                                    } 
                                    // Mole percent is given but mass is unknown, so calculate mass then moles using reference ratio
                                    else if (monomerStats[q].mass == 0 && monomerStats[q].mpercent != 0) {
                                        monomerStats[q].moles = monomerStats[q].mpercent * reference_ratio;
                                        monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass
                                    }
                                }

                            // Check for an unknown, and calculate its missing values if it exists
                            if (funcStats[func_comp].unknown != null) {
                                let unknown = funcStats[func_comp].unknown;

                                let part_mlp_sum = sumMonomerStat(func_comp, "mpercent");

                                monomerStats[unknown].mpercent = 100 - part_mlp_sum;
                                monomerStats[unknown].moles = monomerStats[unknown].mpercent * reference_ratio;
                                monomerStats[unknown].mass = monomerStats[unknown].moles * monomerStats[unknown].molar_mass;
                            }

                            let mass_sum = sumMonomerStat(func_comp, "mass");

                            // All masses should have been calculated, so find weight percents using calculated mass sum
                            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                monomerStats[q].wpercent = monomerStats[q].mass / mass_sum;
                            }
                                
                            break;
                    }
                }
                // For complimentary group with more than one comonomer and all masses given, but no percents
                else if (ALL_MASSES_ARE_GIVEN) {
                    let mass_sum = sumMonomerStat(func_comp, "mass");

                    // All masses are given and have been validated, so calculate mole percent and weight percent (moles were already calculated previously)
                    for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                        monomerStats[q].wpercent = monomerStats[q].mass / mass_sum;
                        monomerStats[q].mpercent = monomerStats[q].moles / mol_sum[func_comp];
                    }
                }
                // For complimentary group with a configuration similar to reference Zipper Route
                else {
                    // There are no reference comonomers with both mass and percent given, nor are all masses given, so calculate using ratio between the sum of masses and the remaining percent left

                    switch(funcStats[func_comp].percent_type) {
                        case 'weight':
                            let part_wtp_sum = sumMonomerStat(func_comp, "wpercent");
                            let part_mass_sum = sumMonomerStat(func_comp, "mass");

                            let g_per_percent = part_mass_sum / (100 - part_wtp_sum);

                            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                // Mass is known, so calculate the value for weight percent
                                if (monomerStats[q].wpercent == 0.0 && monomerStats[q].mass != 0.0)
                                    monomerStats[q].wpercent = (monomerStats[q].mass / g_per_percent);
                                
                                // Weight percent is known, so calculate the value for mass
                                else if (monomerStats[q].wpercent != 0.0 && monomerStats[q].mass == 0.0) {
                                    monomerStats[q].mass = (monomerStats[q].wpercent * g_per_percent);
                                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                                }
                            }
                            
                            break;

                        case 'mole':
                            let part_mlp_sum = sumMonomerStat(func_comp, "mpercent");
                            let part_mole_sum = sumMonomerStat(func_comp, "moles");

                            let mol_per_percent = part_mole_sum / (100 - part_mlp_sum);

                            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++) {
                                // Mass is known (moles were already calculated previously), so calculate the value for mole percent
                                if (monomerStats[q].mpercent == 0.0 && monomerStats[q].mass != 0.0)
                                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_per_percent);
                                
                                // Mole Percent is known, so calculate the value for mass and moles
                                else if (monomerStats[q].wpercent != 0.0 && monomerStats[q].mass == 0.0) {
                                    monomerStats[q].moles = (monomerStats[q].mpercent * mol_per_percent);
                                    monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                                }
                            }

                            break;
                    }

                    // Check that the mole sum matches the expected mole sum within reasonable error
                    user_mol_sum = sumMonomerStat(func_comp, "moles");
                    user_mol_sum_valid = compareFloatValues(user_mol_sum, mol_sum[func_comp], TOLERANCE);

                    if (!user_mol_sum_valid) {
                        // The user's masses did not match the expected mole sum for the complimentary group
                        console.log("Calculated mole sum does not match user given values...");
                        generateErrorMsg("monomer_data_entry", `The masses given did not match the calculated mole sum for the complimentary (${funcStats[func_comp].name}) group. Please enter valid masses or remove invalid ones.`);
                        return false;
                    }

                }
            }
            
            // Calculations were successful for the Excess Mass Route
            return true;
        }
    }
}

function compareFloatValues (value_to_compare, reference_value, TOLERANCE) {
    // Compare values and return an boolean value depending on whether or not the value to compare falls within the range of tolerance
    return ((value_to_compare > (reference_value - TOLERANCE)) && (value_to_compare < (reference_value + TOLERANCE)));
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
    // Find a comonomer with both mass and percent given for a particular functional group
    for (var q = funcStats[func_group].start ; q < funcStats[func_group].end ; q++) {
        if (monomerStats[q].mass != 0 && (monomerStats[q].wpercent != 0 || monomerStats[q].mpercent != 0)) {
            return q;
        }
    }
}