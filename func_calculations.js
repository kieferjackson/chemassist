
function doReferenceCalculations(route) {
    switch (route)
        {
            case 'ALLMASSROUTE':
            {
                console.log("Your reference calculation is Mass Route");
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    // Calculating Wt% from mass and total mass
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;

                    // Calculating moles from mass and molar mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++) {
                    // Calculating Ml% from moles and total moles
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                }
                    
                break;
            }

            case 'WTP_ZIPPERROUTE':
            {
                var mass_sum = 0.0, percent_sum = 0.0, mol_sum = 0.0;
                var g_per_percent, percent_per_g, total_mass_percent;
                
                // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
                mass_sum = sumMonomerStat(func_ref, "mass");
                percent_sum = sumMonomerStat(func_ref, "wpercent");
                
                // Total mass percent is the percentage that masses take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns masses account for 40%)
                var total_mass_percent = 100.0 - percent_sum;

                // This gives the ratio between mass and percent (e.g. 4 g for 40% means that 20% would be 2 g or that 55% would be 5.5 g)
                var g_per_percent = (mass_sum / total_mass_percent);
                var percent_per_g = 1.0 / g_per_percent;
                
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
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_ZIPPERROUTE':
            {
                var mass_sum = 0.0, percent_sum = 0.0, mol_sum = 0.0;
                var mol_per_percent, percent_per_mol, total_mol_percent;
                
                // Cycle through functional group to find comonomers with mass, and calculate their moles if so
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    
                    if (monomerStats[q].mass != 0.0)
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    
                }
                
                // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
                mol_sum = sumMonomerStat(func_ref, "moles");
                percent_sum = sumMonomerStat(func_ref, "mpercent");
                
                // Total mole percent is the percentage that moles take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns moles account for 40%)
                total_mol_percent = 100.0 - percent_sum;

                // This gives the ratio between moles and percent (e.g. 0.04 mol for 40% means that 20% would be 0.02 mol or that 55% would be 0.055 mol)
                var mol_per_percent = (mol_sum / total_mol_percent);
                var percent_per_mol = 1.0 / mol_per_percent;
                
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
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                break;
            }

            case 'WTP_TETRISROUTE':
            {
                // Tetris reference comonomer is already known, so calculate its moles
                monomerStats[monomerStatCount[func_ref].tts_ref].moles = monomerStats[monomerStatCount[func_ref].tts_ref].mass / monomerStats[monomerStatCount[func_ref].tts_ref].molar_mass;
                
                // Find the ratio between mass and percent from the tetris refence comonomer
                var g_per_percent = monomerStats[monomerStatCount[func_ref].tts_ref].mass / monomerStats[monomerStatCount[func_ref].tts_ref].wpercent;
                
                // Iterate through each comonomer with either mass or percent known, and calculate their unknown using the ratio between mass and percent
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
                monomerStats[funcStats[func_ref].unknown].wpercent = 100.0 - part_percent_sum;
                monomerStats[funcStats[func_ref].unknown].mass = monomerStats[funcStats[func_ref].unknown].wpercent * g_per_percent;
                monomerStats[funcStats[func_ref].unknown].moles = monomerStats[funcStats[func_ref].unknown].mass / monomerStats[funcStats[func_ref].unknown].molar_mass;
                
                // Now that the unknown comonomer's moles have been calculated, all moles should be known, so calculate total moles
                var mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_TETRISROUTE':
            {
                // Tetris reference comonomer is already known, so calculate its moles
                monomerStats[monomerStatCount[func_ref].tts_ref].moles = monomerStats[monomerStatCount[func_ref].tts_ref].mass / monomerStats[monomerStatCount[func_ref].tts_ref].molar_mass;

                // Find the ratio between moles and percent from the tetris refence comonomer
                var mol_per_percent = monomerStats[monomerStatCount[func_ref].tts_ref].moles / monomerStats[monomerStatCount[func_ref].tts_ref].mpercent;
                
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
                monomerStats[funcStats[func_ref].unknown].mpercent = 100.0 - part_percent_sum;
                monomerStats[funcStats[func_ref].unknown].moles = monomerStats[funcStats[func_ref].unknown].mpercent * mol_per_percent;
                monomerStats[funcStats[func_ref].unknown].mass = monomerStats[funcStats[func_ref].unknown].moles * monomerStats[funcStats[func_ref].unknown].molar_mass;

                // Now that the unknown comonomer's mass has been calculated, all masses should be known, so calculate total mass
                var mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                break;
            }

            case 'WTP_ALLPERCENT':
            {
                // Find the index for the comonomer with a mass value given
                let ref_monomer = findRefMonomer(func_ref);
                var g_per_percent = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].wpercent
                
                // Iterate through each comonomer and calculate their mass and moles
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // Mass is unknown, so calculate using ratio between mass and percent
                    if (monomerStats[q].mass == 0.0)
                        monomerStats[q].mass = monomerStats[q].wpercent * g_per_percent;
                    
                    // Mass should be known, so calculate moles using molar mass
                    monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                }
                
                mol_sum = sumMonomerStat(func_ref, "moles");
                
                // Calculate mole percent for each comonomer using their individual moles and the mole sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].mpercent = (monomerStats[q].moles / mol_sum) * 100.0;
                
                break;
            }

            case 'MLP_ALLPERCENT':
            {
                // Find the index for the comonomer with a mass value given
                let ref_monomer = findRefMonomer(func_ref);

                // Calculate moles for reference comonomer, and use that value for the ratio between moles and percent
                monomerStats[ref_monomer].moles = monomerStats[ref_monomer].mass / monomerStats[ref_monomer].molar_mass;
                var mol_per_percent = monomerStats[ref_monomer].moles / monomerStats[ref_monomer].mpercent
                
                // Iterate through each comonomer and calculate their mass and moles
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                {
                    // Mass is unknown, so calculate mass and then moles using ratio between mass and percent
                    if (monomerStats[q].mass == 0.0) {
                        monomerStats[q].moles = monomerStats[q].mpercent * mol_per_percent;
                        monomerStats[q].mass = monomerStats[q].moles * monomerStats[q].molar_mass;
                    }

                    // Moles are unknown but mass is known, so calculate moles using molar mass
                    if (monomerStats[q].moles == 0.0) {
                        monomerStats[q].moles = monomerStats[q].mass / monomerStats[q].molar_mass;
                    }   
                }
                
                mass_sum = sumMonomerStat(func_ref, "mass");
                
                // Calculate weight percent for each comonomer using their individual mass and the mass sum
                for (var q = funcStats[func_ref].start ; q < funcStats[func_ref].end ; q++)
                    monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
                
                break;
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

                        // Calculate the unknown comonomer's weight percent by finding the difference between the sum of every other's comonomer's weight percent and 100
                        monomerStats[funcStats[func_comp].unknown].wpercent = 100.0 - part_percent_sum;
                        break;
                    case 'mole':
                        var part_percent_sum = sumMonomerStat(func_comp, "mpercent");

                        // Calculate the unknown comonomer's mole percent by finding the difference between the sum of every other's comonomer's mole percent and 100
                        monomerStats[funcStats[func_comp].unknown].mpercent = 100.0 - part_percent_sum;
                        break;
                }
            } 
            
            // If the complimentary group only has 1 comonomer, then its percent values for both weight and mole can only be 100.
            else if (funcStats[func_comp].num === 1) {
                monomerStats[funcStats[func_comp].unknown].wpercent = 100.0;
                monomerStats[funcStats[func_comp].unknown].mpercent = 100.0;
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
            
            break;
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
                    console.log("ERROR - Inputted mass is greater than molar equivalent for complementary group. Program will continue with given input.");
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
            
            var mass_sum = sumMonomerStat(func_comp, "mass");
            
            // Calculate weight percent for each comonomer using their individual mass and the mass sum
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
                monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
            
            break;
        }

        case 'MLP_ZIPPERROUTE':
        {
            var mol_sum = [], mass_sum = 0.0;
            
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
            
            mass_sum = sumMonomerStat(func_comp, "mass");
            
            // Calculate weight percent for each comonomer using their individual mass and the mass sum
            for (var q = funcStats[func_comp].start ; q < funcStats[func_comp].end ; q++)
                monomerStats[q].wpercent = (monomerStats[q].mass / mass_sum) * 100.0;
            
            break;
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
            var mass_sum = (part_mol_sum + unknown_mol_offset) / all_non_mass_mol_contribution;
            
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
            
            break;
        }
    }
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