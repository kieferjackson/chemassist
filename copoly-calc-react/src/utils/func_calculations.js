import { compareFloatValues } from "./validators";
import { ERROR_TOLERANCE } from "./standards";

export function doReferenceCalculations(refGroup, calculation_route)
{
    switch (calculation_route)
    {
        case 'ALLMASSROUTE':        return      ref_allMass(refGroup);    
        case 'WTP_ZIPPERROUTE':     return      ref_wtpZipper(refGroup);  
        case 'MLP_ZIPPERROUTE':     return      ref_mlpZipper(refGroup);  
        case 'XS_WTPROUTE':         return      ref_xsWeight(refGroup);   
        case 'XS_MLPROUTE':         return      ref_xsMole(refGroup);   
        default:                    return      false;  
    }
}

export function doComplimentaryCalculations(refGroup, compGroup, calculation_route)
{
    switch (calculation_route)
    {
        case 'ALLPERCENTROUTE':     return      comp_allPercent(refGroup, compGroup);
        case 'GIVENMASSROUTE':      return      comp_givenMass(refGroup, compGroup); 
        case 'MLP_ZIPPERROUTE':     return      comp_mlpZipper(refGroup, compGroup); 
        case 'WTP_ZIPPERROUTE':     return      comp_wtpZipper(refGroup, compGroup); 
        case 'MLP_XS_INFOROUTE':    return      comp_mlpXS(refGroup, compGroup);     
        case 'WTP_XS_INFOROUTE':    return      comp_wtpXS(refGroup, compGroup);  
        default:                    return      false;  
    }
}

// Reference calculations
function ref_allMass(refGroup)
{
    const mass_sum = refGroup.sumMonomerStat('mass');
         
    refGroup.getMonomers().forEach((monomer) => {
        // Calculating Wt% from mass and total mass
        const wpercent = (monomer.getMass() / mass_sum) * 100.0;
        monomer.setWeightPercent(wpercent);

        // Calculating moles from mass and molar mass
        const moles = monomer.getMass() / monomer.getMolarMass();
        monomer.setMoles(moles);
    });
    
    const mol_sum = refGroup.sumMonomerStat('moles');
    
    refGroup.getMonomers().forEach((monomer) => {
        // Calculating Ml% from moles and total moles
        const mpercent = (monomer.getMoles() / mol_sum) * 100.0;
        monomer.setMolePercent(mpercent);
    });
        
    // Calculations were successful for the All Mass Route
    return true;
}

function ref_wtpZipper(refGroup)
{
    // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
    const mass_sum = refGroup.sumMonomerStat('mass');
    const percent_sum = refGroup.sumMonomerStat('wpercent');
    
    // Total mass percent is the percentage that masses take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns masses account for 40%)
    const total_mass_percent = 100.0 - percent_sum;

    // This gives the ratio between mass and percent (e.g. 4 g for 40% means that 20% would be 2 g or that 55% would be 5.5 g)
    const g_per_percent = mass_sum / total_mass_percent;
    
    // Loop through given values for comonomers and use predefined ratios of mass and percent to find their respective unknowns
    refGroup.getMonomers().forEach((monomer) => {
        // Mass is known, so calculate the value for weight percent
        if (!monomer.weightPercentGiven() && monomer.massGiven()) {
            const wpercent = monomer.getMass() / g_per_percent;
            monomer.setWeightPercent(wpercent);
        }
        // Weight percent is known, so calculate the value for mass
        else if (monomer.weightPercentGiven() && !monomer.massGiven()) {
            const mass = monomer.getWeightPercent() * g_per_percent;
            monomer.setMass(mass);
        }
        
        // Mass should be known, so calculate moles using molar mass
        const moles = monomer.getMass() / monomer.getMolarMass();
        monomer.setMoles(moles);
    });
    
    const mol_sum = refGroup.sumMonomerStat('moles');

    refGroup.getMonomers().forEach((monomer) => {
        // Calculating Ml% from moles and total moles
        const mpercent = (monomer.getMoles() / mol_sum) * 100.0;
        monomer.setMolePercent(mpercent);
    });
    
    // Calculations were successful for the Weight Percent Zipper Route
    return true;
}

function ref_mlpZipper(refGroup)
{
    // Cycle through functional group to find comonomers with mass, and calculate their moles if so
    refGroup.getMonomers().forEach((monomer) => {
        if (monomer.massGiven()) {
            const moles = monomer.getMass() / monomer.getMolarMass();
            monomer.setMoles(moles);
        }
    });

    // These represent their respective partial sums where they each make up a fraction of the functional group with the other making up the difference
    const mol_sum = refGroup.sumMonomerStat('moles');
    const percent_sum = refGroup.sumMonomerStat('mpercent');

    // Total mole percent is the percentage that moles take up that is unaccounted for (e.g. total percents are 60%, therefore the knowns moles account for 40%)
    const total_mol_percent = 100.0 - percent_sum;

    // This gives the ratio between moles and percent (e.g. 0.04 mol for 40% means that 20% would be 0.02 mol or that 55% would be 0.055 mol)
    const mol_per_percent = mol_sum / total_mol_percent;

    refGroup.getMonomers().forEach((monomer) => {
        // Moles are known (mass is given), so calculate the value for mole percent
        if (!monomer.molePercentGiven() && monomer.massGiven()) {
            const mpercent = monomer.getMoles() / mol_per_percent;
            monomer.setMolePercent(mpercent);
        }
        // Mole percent is known, so calculate the value for moles then mass
        else if (monomer.molePercentGiven() && !monomer.massGiven()) {
            const moles = monomer.getMolePercent() * mol_per_percent;
            const mass = moles * monomer.getMolarMass();
            monomer.setMoles(moles);
            monomer.setMass(mass);
        }
    });

    const mass_sum = refGroup.sumMonomerStat('mass');

    // Calculate weight percent for each comonomer using their individual mass and the mass sum
    refGroup.getMonomers().forEach((monomer) => {
        const wpercent = (monomer.getMass() / mass_sum) * 100.0;
        monomer.setWeightPercent(wpercent);
    });

    // Calculations were successful for the Mole Percent Zipper Route
    return true;
}

function ref_xsWeight(refGroup)
{
    // Find the reference monomer with mass and percent given
    const ref_monomer = refGroup.findRefMonomer();

    if (!ref_monomer) {
        // There was no reference monomer
        console.error(Error(`Cannot proceed calculations for ${refGroup.getName()} because there was no reference monomer`));
        return false;
    }

    // This gives the ratio between mass and percent (e.g. 4 g for 40% means that 20% would be 2 g or that 55% would be 5.5 g)
    const g_per_percent = ref_monomer.getMass() / ref_monomer.getWeightPercent();

    // Iterate through each comonomer and calculate their mass and moles
    refGroup.getMonomers().forEach((monomer) => {
        // If both mass and percent given, then check their ratio to the reference
        if (monomer.massGiven() && monomer.weightPercentGiven()) {
            const current_ratio = monomer.getMass() / monomer.getWeightPercent();
            const wt_ratios_match = compareFloatValues(g_per_percent, current_ratio, ERROR_TOLERANCE);

            if (!wt_ratios_match) {
                // The ratio between mass and percent for one of the comonomers did not match the reference within the tolerance
                console.error(Error(`Mass/Percent ratios don't match the reference for ${refGroup.getName()}...`));
                return false;
            }
        }
        // Mass is unknown, so calculate using ratio between mass and percent
        else if (!monomer.massGiven() && monomer.weightPercentGiven()) {
            const mass = monomer.getWeightPercent() * g_per_percent;
            monomer.setMass(mass);
        }
        // Weight percent is unknown, so calculate using ratio between mass and percent
        else if (monomer.massGiven() && !monomer.weightPercentGiven()) {
            const wpercent = monomer.getMass() / g_per_percent;
            monomer.setWeightPercent(wpercent);
        }
        // No `else` statement should be here to prevent preemptive calculations of the unknown comonomer

        // Mass should be known, so calculate moles using molar mass
        const moles = monomer.getMass() / monomer.getMolarMass();
        monomer.setMoles(moles);
    });

    // Unknown can only be calculated once weight percent for all other comonomers values have been found
    if (refGroup.hasUnknown()) {
        // Find the partial weight percent sum, and get the unknown monomer
        const part_percent_sum = refGroup.sumMonomerStat('wpercent');
        const unknown_monomer = refGroup.getUnknown();

        // Calculate unknown monomer's values
        const unknown_wpercent = 100.0 - part_percent_sum;
        const unknown_mass = unknown_wpercent * g_per_percent;
        const unknown_moles = unknown_mass / unknown_monomer.getMolarMass();

        // Set calculated unknown monomer values
        unknown_monomer.setWeightPercent(unknown_wpercent);
        unknown_monomer.setMass(unknown_mass);
        unknown_monomer.setMoles(unknown_moles);
    }

    const mol_sum = refGroup.sumMonomerStat('moles');

    refGroup.getMonomers().forEach((monomer) => {
        // Calculating Ml% from moles and total moles
        const mpercent = (monomer.getMoles() / mol_sum) * 100.0;
        monomer.setMolePercent(mpercent);
    });

    // Calculations were successful for the Excess Weight Percent Route (or Tetris Route)
    return true;
}

function ref_xsMole(refGroup)
{
    // Find the reference monomer with mass and percent given
    const ref_monomer = refGroup.findRefMonomer();

    if (!ref_monomer) {
        // There was no reference monomer
        console.error(Error(`Cannot proceed calculations for ${refGroup.getName()} because there was no reference monomer`));
        return false;
    }

    // Calculate and set moles for reference comonomer, and use that value for the ratio between moles and percent
    const reference_moles = ref_monomer.getMass() / ref_monomer.getMolarMass();
    ref_monomer.setMoles(reference_moles);

    // This gives the ratio between moles and percent (e.g. 0.04 mol for 40% means that 20% would be 0.02 mol or that 55% would be 0.055 mol)
    const mol_per_percent = ref_monomer.getMoles() / ref_monomer.getMolePercent();

    // Iterate through each comonomer and calculate their mass and moles
    refGroup.getMonomers().forEach((monomer) => {
        // If both mass and percent given, then check their ratio to the reference
        if (monomer.massGiven() && monomer.molePercentGiven()) {
            // Calculate the comonomer's moles
            const moles = monomer.getMass() / monomer.getMolarMass();

            const current_ratio = moles / monomer.getMolePercent();
            const ml_ratios_match = compareFloatValues(mol_per_percent, current_ratio, ERROR_TOLERANCE);

            if (ml_ratios_match) {
                // The ratios match, so update the monomer's moles
                monomer.setMoles(moles);
            }
            else {
                // The ratio between mass and percent for one of the comonomers did not match the reference within the tolerance
                console.error(Error(`Moles/Percent ratios don't match the reference for ${refGroup.getName()}...`));
                return false;
            }
        }
        // Mole percent is given but mass is undetermined, so calculate moles and mass using ratio between calculated moles and percent
        else if (!monomer.massGiven() && monomer.molePercentGiven()) {
            const moles = monomer.getMolePercent() * mol_per_percent;
            const mass = moles * monomer.getMolarMass();
            monomer.setMoles(moles);
            monomer.setMass(mass);
        }
        // Mass is given but mole percent is undetermined, so calculate using ratio between calculated moles and percent
        else if (monomer.massGiven() && !monomer.molePercentGiven()) {
            const moles = monomer.getMass() / monomer.getMolarMass();
            const mpercent = moles / mol_per_percent;
            monomer.setMoles(moles);
            monomer.setMolePercent(mpercent);
        }
        // No `else` statement should be here to prevent preemptive calculations of the unknown comonomer
    });

    // Unknown can only be calculated once mole percent for all other comonomers values have been found
    if (refGroup.hasUnknown()) {
        // Find the partial mole percent sum, and get the unknown monomer
        const part_percent_sum = refGroup.sumMonomerStat('mpercent');
        const unknown_monomer = refGroup.getUnknown();

        // Calculate unknown monomer's values
        const unknown_mpercent = 100.0 - part_percent_sum;
        const unknown_moles = unknown_mpercent * mol_per_percent;
        const unknown_mass = unknown_moles * unknown_monomer.getMolarMass();

        // Set calculated unknown monomer values
        unknown_monomer.setMolePercent(unknown_mpercent);
        unknown_monomer.setMoles(unknown_moles);
        unknown_monomer.setMass(unknown_mass);
    }

    const mass_sum = refGroup.sumMonomerStat('mass');

    // Calculate weight percent for each comonomer using their individual mass and the mass sum
    refGroup.getMonomers().forEach((monomer) => {
        const wpercent = (monomer.getMass() / mass_sum) * 100.0;
        monomer.setWeightPercent(wpercent);
    });

    // Calculations were successful for the Excess Mole Percent Route (or Tetris Route)
    return true;
}

// Complimentary Calculations
function comp_allPercent(refGroup, compGroup)
{
    const almost_all_percent = compGroup.getMonomerStatCount('percent') === compGroup.getNum() - 1;

    // For partial percent sum calculations to find the unknown comonomer's percent
    // Check that there is more than one comonomer in the complimentary group and that there are n - 1 percents given
    if (compGroup.getNum() > 1 && almost_all_percent)
    {
        // The unknown monomer to find its percent value
        const unknown_monomer = compGroup.getUnknown();

        // The partial sum is defined by the given percent type chosen and its values given, so branch the path based on the chosen percent type
        switch (compGroup.getPercentType())
        {
            case 'weight':
                const part_wpercent_sum = compGroup.sumMonomerStat('wpercent');
                
                // Calculate the unknown comonomer's weight percent by finding the difference between the sum of every other's comonomer's weight percent and 100
                const unknown_wpercent = 100.0 - part_wpercent_sum;
                unknown_monomer.setWeightPercent(unknown_wpercent);
                break;
            case 'mole':
                const part_mpercent_sum = compGroup.sumMonomerStat('mpercent');

                // Calculate the unknown comonomer's mole percent by finding the difference between the sum of every other's comonomer's mole percent and 100
                const unknown_mpercent = 100.0 - part_mpercent_sum;
                unknown_monomer.setMolePercent(unknown_mpercent);
                break;
        }
    }

    // Calculate Weight Percent for groups with more than one comonomer
    if (compGroup.getNum() > 1 && compGroup.getPercentType() === 'weight')
    {
        // Initialize the proportion sum and collection to put weight percents in terms of moles
        var wtp_proportion_sum = 0.0; 
        const wtp_proportions = [];     // The indices of this array should match the comp group's monomers array

        // Iterate through each comonomer in the complimentary group
        compGroup.getMonomers().forEach((monomer) => {
            // Put weight percent in terms of moles and set this comonomer's proportion
            const wtp_proportion = monomer.getWeightPercent() / monomer.getMolarMass();
            wtp_proportions.push(wtp_proportion);

            // Add the calculated proportion to the current proportion total
            wtp_proportion_sum += wtp_proportion;
        });

        // Calculate Mole Percent from Weight Percent  using proportion
        compGroup.getMonomers().forEach((monomer, proportion_index) => {
            // Calculate mole percent using the ratio between an individual complimentary comonomer's proportion and the sum of those proportions
            const mpercent = (wtp_proportions[proportion_index] / wtp_proportion_sum) * 100;
            monomer.setMolePercent(mpercent);
        });
    }

    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();

    // Iterate through complimentary group to calculate missing values (Moles & Mass)
    compGroup.getMonomers().forEach((monomer) => {
        // Mole percent is known and mass is unknown, so calculate moles then mass
        const moles = comp_mol_sum * (monomer.getMolePercent() / 100.0);
        const mass = moles * monomer.getMolarMass();
        monomer.setMoles(moles);
        monomer.setMass(mass);
    });

    // For mole percent calculations, calculate the still unknown weight percent values for each comonomer
    if (compGroup.getPercentType() === 'mole')
    {
        const mass_sum = compGroup.sumMonomerStat('mass');
        
        // Calculate weight percent for each comonomer using their individual mass and the mass sum
        compGroup.getMonomers().forEach((monomer) => {
            const wpercent = (monomer.getMass() / mass_sum) * 100.0;
            monomer.setWeightPercent(wpercent);
        });
    }

    // Calculations were successful for the All Percent Route
    return true;
}

function comp_givenMass(refGroup, compGroup)
{
    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();
    var part_mol_sum = 0.0, part_percent_sum = 0.0, mol_per_percent = 0.0;

    // Iterate through each given mass and calculate moles and mole percent, in addition to finding the partial mole and mole percent sums
    compGroup.getMonomers().forEach((monomer) => {
        if (monomer.massGiven())
        {
            // Calculate moles and mole percent from given mass
            const moles = monomer.getMass() / monomer.getMolarMass();
            const mpercent = (moles / comp_mol_sum) * 100.0;

            // Set moles and mole percent
            monomer.setMoles(moles);
            monomer.setMolePercent(mpercent);

            // Add calculated mole values to partial mole sums
            part_mol_sum += moles;
            part_percent_sum += mpercent;
        }
    });

    // Check that the partial mole sum is less than the complimentary mole sum calculated using the reference mole sum
    if (part_mol_sum >= comp_mol_sum) {
        // The user's masses did not match the expected mole sum for the complimentary group
        console.error(Error(
            `The partial mole sum (${part_mol_sum} mol) for the complimentary (${compGroup.getName()}) group is greater than or equal to expected mole sum (${comp_mol_sum} mol). 
            \nPlease enter valid masses or remove invalid ones.`
        ));
        return false;
    }

    // Iterate through each comonomer until the ratio between mole and percent is found. A loop must be used since any comomonmer may be the one unknown.
    var mpp_index = 0;
    while (mol_per_percent === 0.0 && mpp_index < compGroup.getNum()) {
        // Get monomer
        const monomer = compGroup.getMonomers()[mpp_index];

        // Check that mass was given (therefore moles and mole percent calculated), then calculate moles per percent, and increment to next monomer
        mol_per_percent = monomer.massGiven() 
            ? monomer.getMoles() / monomer.getMolePercent()
            : 0.0;
        mpp_index++;

        if (mpp_index === compGroup.getNum()) {
            // There are no more monomers remaining, and no ratio could be found
            console.error(Error(`No comonomer with moles and mole percent defined`));
            return false;
        }
    } 

    // Get the unknown monomer, then calculate its mole percent, moles and mass
    const unknown_monomer = compGroup.getUnknown();
    const unknown_mpercent = 100.0 - part_percent_sum;
    const unknown_moles = (unknown_mpercent / 100.0) * comp_mol_sum;
    const unknown_mass = unknown_moles * unknown_monomer.getMolarMass();
    // Set the unknown's calculated values
    unknown_monomer.setMolePercent(unknown_mpercent);
    unknown_monomer.setMoles(unknown_moles);
    unknown_monomer.setMass(unknown_mass);

    // All comonomer masses have been found, sum their values
    const mass_sum = compGroup.sumMonomerStat('mass');

    // Calculate weight percent for each comonomer using their individual mass and the mass sum
    compGroup.getMonomers().forEach((monomer) => {
        const wpercent = (monomer.getMass() / mass_sum) * 100.0;
        monomer.setWeightPercent(wpercent);
    });

    // Calculations were successful for the Given Mass Route
    return true;
}

function comp_mlpZipper(refGroup, compGroup)
{
    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();
    var part_percent_sum = 0.0, part_mol_sum = 0.0, calc_mol_sum = 0.0;

    // Iterate through each comonomer with either mass or mole percent known
    compGroup.getMonomers().forEach((monomer) => {
        // Mole percent is known, so calculate moles and then mass
        if (monomer.molePercentGiven())
        {
            const moles = comp_mol_sum * (monomer.getMolePercent() / 100.0);
            const mass = moles * monomer.getMolarMass();
            // Add calculated moles to the calculated mole sum representing the user's given values
            calc_mol_sum += moles;

            // Set moles and mass
            monomer.setMoles(moles);
            monomer.setMass(mass);
        }
        // Mass is known, so calculate moles and then mole percent
        else if (monomer.massGiven())
        {
            const moles = monomer.getMass() / monomer.getMolarMass();
            const mpercent = (moles / comp_mol_sum) * 100.0;
            // Add this comonomer's mass to the partial mole sum and calculated mole sum representing the user's given values
            part_mol_sum += moles;
            calc_mol_sum += moles;

            // Set moles and mole percent
            monomer.setMoles(moles);
            monomer.setMolePercent(mpercent);
        }

        // Add calculated/given mole percent to partial percent sum
        part_percent_sum += monomer.getMolePercent();
    });

    // Check that the partial mole sum is less than the expected mole sum
    const part_mol_sum_valid = part_mol_sum < comp_mol_sum;

    if (!part_mol_sum_valid) {
        // The user's masses exceeded the expected mole sum for the complimentary group
        console.error(Error(
            `Partial mole sum exceeded the expected mole sum for the complimentary (${compGroup.getName()}) group. 
            \nPlease enter valid masses or remove invalid ones.`
        ));
        return false;
    }

    // Check that the partial percent sum is less than 100
    const part_percent_sum_valid = part_percent_sum < 100.0;

    if (!part_percent_sum_valid) {
        // The calculated sum of all mole percents exceeded 100 for the complimentary group
        console.error(Error(
            `Calculated sum of all mole percents (${part_percent_sum}%) exceeded 100% for the complimentary (${compGroup.getName()}) group. 
            \nPlease enter valid masses/percents or remove invalid ones.`
        ));
        return false;
    }

    // Get the unknown monomer, then calculate its mole percent, moles and mass
    const unknown_monomer = compGroup.getUnknown();
    const unknown_mpercent = 100.0 - part_percent_sum;
    const unknown_moles = (unknown_mpercent / 100.0) * comp_mol_sum;
    const unknown_mass = unknown_moles * unknown_monomer.getMolarMass();
    // Add the unknown's found moles to the calculated mole sum and make sure it is equivalent to the expected mole sum
    calc_mol_sum += unknown_moles;
    const calc_mol_sum_valid = compareFloatValues(comp_mol_sum, calc_mol_sum, ERROR_TOLERANCE);

    if (!calc_mol_sum_valid) {
        // The user's masses exceeded the expected mole sum for the complimentary group
        console.error(Error(
            `Calculated mole sum exceeded the expected mole sum for the complimentary (${compGroup.getName()}) group. Please enter valid masses or remove invalid ones.`
        ));
        return false;
    }
    // Set the unknown's calculated values
    unknown_monomer.setMolePercent(unknown_mpercent);
    unknown_monomer.setMoles(unknown_moles);
    unknown_monomer.setMass(unknown_mass);

    // All comonomer masses have been found, sum their values
    const mass_sum = compGroup.sumMonomerStat('mass');

    // Calculate weight percent for each comonomer using their individual mass and the mass sum
    compGroup.getMonomers().forEach((monomer) => {
        const wpercent = (monomer.getMass() / mass_sum) * 100.0;
        monomer.setWeightPercent(wpercent);
    });

    // Calculations were successful for the Mole Percent Zipper Route
    return true;
}

function comp_wtpZipper(refGroup, compGroup)
{
    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();

    var part_percent_sum = 0.0,                 // Indicates the weight percent occupied by comonomer(s) with known mass in addition to the unknown comonomer
        part_mol_sum = comp_mol_sum,            // Initialized with complimentary mole sum, decremented by calculated moles
        unknown_mol_offset = 0.0,               // Found value by putting known masses in terms of the unknown monomer's molar mass
        percent_contribution_to_mol_sum = 0.0;  // Indicates how much weight percents contribute to the total mole sum

    // Get the complimentary group's unknown monomer
    const unknown_monomer = compGroup.getUnknown();

    for (let i = 0 ; i < compGroup.getMonomers().length ; i++) 
    {
        const monomer = compGroup.getMonomers(i);

        // Mass is known, so calculate moles and then mole percent
        if (monomer.massGiven())
        {
            // Mass is given, so calculate moles and mole percent
            const moles = monomer.getMass() / monomer.getMolarMass();
            const mpercent = (moles / comp_mol_sum) * 100.0;

            // Divide this monomer's mass by the unknown comonomer's molar mass
            unknown_mol_offset += monomer.getMass() / unknown_monomer.getMolarMass();

            // Subtract this monomer's moles from the partial mole sum to find the moles accounted by the weight percents and unknown comonomer
            part_mol_sum -= moles;

            // Make sure that partial mole sum is greater than 0
            if (part_mol_sum <= 0.0) {
                // The calculated moles from given masses are invalid for the complimentary group
                console.error(Error(
                    `Calculated moles from given masses are invalid for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }

            // Set the monomer's calculated moles and mole percent
            monomer.setMoles(moles);
            monomer.setMolePercent(mpercent);
        }
        // Weight Percent is known, so calculate the weight percent's contribution to the total moles
        else if (monomer.weightPercentGiven())
        {
            const percent_contribution = (monomer.getWeightPercent() / 100.0) / monomer.getMolarMass(); // formerly `wumbo_factor`
            percent_contribution_to_mol_sum += percent_contribution;

            // Add this weight percent to the partial percent sum to find the weight percent occupied by the known masses and unknown comonomer
            part_percent_sum += monomer.getWeightPercent();
        }
    }

    // Find the moles contributed by the comonomers with weight percent given in addition to the unknown comonomer's moles
    const all_non_mass_mol_contribution = percent_contribution_to_mol_sum + (((100.0 - part_percent_sum) / 100.0) / unknown_monomer.getMolarMass());
    const mass_sum = (part_mol_sum + unknown_mol_offset) / all_non_mass_mol_contribution;

    // Initialize calculated mole sum with partial mole sum
    let calc_mol_sum = part_mol_sum;        // Any moles calculated with given percent will be added to this
    let calc_mass_sum = 0.0;                // Makes sure that the calculated mass sum matches the expected mass sum previously calculated

    compGroup.getMonomers().forEach((monomer) => {
        // For known masses, calculate their weight percents using the mass sum
        if (monomer.massGiven())
        {
            const wpercent = (monomer.getMass() / mass_sum) * 100.0;
            // Add calculated weight percent to partial percent sum and update the monomer
            part_percent_sum += wpercent;
            monomer.setWeightPercent(wpercent);
        }
        // For known weight percents, calculate their mass using the mass sum, then their moles and mole percent
        else if (monomer.weightPercentGiven())
        {
            const mass = (monomer.getWeightPercent() / 100.0) * mass_sum;
            const moles = mass / monomer.getMolarMass();
            const mpercent = (moles / comp_mol_sum) * 100.0;

            // Add calculated moles to calculated mole sum and update the monomer
            calc_mol_sum += moles;
            monomer.setMass(mass);
            monomer.setMoles(moles);
            monomer.setMolePercent(mpercent);
        }

        // Add this comonomer's calculated/given mass to the calculated mass sum
        calc_mass_sum += monomer.getMass();
    });

    // Check that the calculated mass sum is less than the expected mass sum
    const user_mass_sum_valid = mass_sum > calc_mass_sum;

    if (!user_mass_sum_valid) {
        // The calculated mass sum exceeded the expected mass sum for the complimentary group
        console.error(Error(
            `Calculated mass sum (${calc_mass_sum} g) exceeded or equaled the expected mass sum (${mass_sum} g) for the complimentary (${compGroup.getName()}) group. 
            \nPlease enter valid masses or remove invalid ones.`
        ));
        return false;
    }

    // Check that the calculated mole sum does not exceed or equal the expected mole sum 
    const user_mol_sum_valid = comp_mol_sum > calc_mol_sum;
                
    if (!user_mol_sum_valid) {
        // The user's masses exceeded the expected mole sum for the complimentary group
        console.error(Error(
            `Calculated mole sum (${calc_mol_sum} mol) exceeded or equaled the expected mole sum (${comp_mol_sum} mol) for the complimentary (${compGroup.getName()}) group. 
            \nPlease enter valid masses or remove invalid ones.`
        ));
        return false;
    }

    // Check that the partial percent sum is less than 100
    const part_percent_sum_valid = part_percent_sum < 100.0;
                
    if (!part_percent_sum_valid) {
        // The calculated sum of all mole percents exceeded 100 for the complimentary group
        console.error(Error(
            `Calculated sum of all mole percents (${part_percent_sum}%) exceeded 100 for the complimentary (${compGroup.getName()}) group. 
            \nPlease enter valid masses or remove invalid ones.`
        ));
        return false;
    }

    // Calculate wt%, mass, moles, and ml% for unknown comonomer
    const unknown_wpercent = 100.0 - part_percent_sum;
    const unknown_mass = (unknown_wpercent / 100.0) * mass_sum;
    const unknown_moles = unknown_mass / unknown_monomer.getMolarMass();
    const unknown_mpercent = (unknown_moles / comp_mol_sum) * 100.0;
    // Set calculated values for unknown comonomer
    unknown_monomer.setWeightPercent(unknown_wpercent);
    unknown_monomer.setMass(unknown_mass);
    unknown_monomer.setMoles(unknown_moles);
    unknown_monomer.setMolePercent(unknown_mpercent);

    // Calculations were successful for the Weight Percent Zipper Route
    return true;
}

function comp_mlpXS(refGroup, compGroup)
{
    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();

    // Validate any masses given and calculate any possible values (e.g. moles)
    const { calc_complete, calc_failed } = xsInfo_validateMasses(compGroup, comp_mol_sum);

    // Check if calculations are complete and that there were no problems
    if (calc_failed) {
        // There was a problem with the masses given
        return false;
    }
    else if (calc_complete && !calc_failed) {
        // The calculations succeeded and no more are necessary
        return true;
    }

    /********************************************************************************************************************
     * There is more than one comonomer, so check the ratios between mass and percent for those which give both values  *
     * (the ratio between different comonomers and their percents may differ and lead to error depending on user input) *
     ********************************************************************************************************************/
    
    // List of comonomers with mass and mole percent given
    const determined_comonomers = compGroup.getMonomers()
        .filter((monomer) => monomer.massGiven() && monomer.molePercentGiven());

    // For complimentary group with more than one comonomer and at least one comonomer with both mass and percent given
    if (determined_comonomers.length >= 1) 
    {
        // Because mole percent was chosen, a given mole percent may not match the expected mole percent based on the calculated moles of each given mass
        for (let i = 0 ; i < determined_comonomers.length ; i++) 
        {
            const monomer = determined_comonomers[i];
    
            const expected_mpercent = monomer.getMoles() / comp_mol_sum;
            const given_mpercent = monomer.getMolePercent();

            // Validate that the user's mole percent is equivalent to the expected mole percent within reasonable error
            const mpercents_match = compareFloatValues(expected_mpercent, given_mpercent, ERROR_TOLERANCE);

            if (!mpercents_match) {
                // The given mole percents do not match the expected mole percent
                console.error(Error(
                    `The given mole percents do not match the expected mole percent for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }
        }

        // Set the reference comonomer to the first one in the index. Any ratio value which differ from this reference are invalid
        const [ reference_monomer ] = determined_comonomers;
        const reference_ratio = reference_monomer.getMoles() / reference_monomer.getMolePercent();

        for (let i = 0 ; i < determined_comonomers.length ; i++) 
        {
            const monomer = determined_comonomers[i];
            const mol_per_percent = monomer.getMoles() / monomer.getMolePercent();

            // Validate that the user's mole ratio is equivalent to the reference ratio within reasonable error
            const ml_ratios_match = compareFloatValues(reference_ratio, mol_per_percent, ERROR_TOLERANCE);

            if (!ml_ratios_match) {
                console.error(Error(
                    `The ratios between calculated moles and percents did not all match for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }
        }

        // No issues detected with ratios, so calculate remaining undetermined mole percent and mass/moles values
        if (determined_comonomers.length < compGroup.getNum())
        {
            compGroup.getMonomers().forEach((monomer) => {
                // Mass is given but mole percent is unknown, so calculate mole percent using moles and mole sum
                if(monomer.massGiven() && !monomer.molePercentGiven()) {
                    const mpercent = monomer.getMoles() / reference_ratio;
                    monomer.setMolePercent(mpercent);
                } 
                // Mole percent is given but mass is unknown, so calculate mass then moles using reference ratio
                else if (!monomer.massGiven() && monomer.molePercentGiven()) {
                    const moles = monomer.getMolePercent() * reference_ratio;
                    const mass = moles * monomer.getMolarMass();
                    monomer.setMoles(moles);
                    monomer.setMass(mass);
                }
            });
        }

        // Check for an unknown, and calculate its missing values if it exists
        if (compGroup.hasUnknown()) {
            const unknown_monomer = compGroup.getUnknown();
            const part_mlp_sum = compGroup.sumMonomerStat('mpercent');

            if (part_mlp_sum >= 100.0) 
            {
                // The calculated sum of all weight percents exceeded 100 for the complimentary group
                console.error(Error(
                    `Calculated sum of all mole percents (${part_mlp_sum}%) exceeded 100 for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }

            const unknown_mpercent = 100.0 - part_mlp_sum;
            const unknown_moles = unknown_mpercent * reference_ratio;
            const unknown_mass = unknown_moles * unknown_monomer.getMolarMass();
            unknown_monomer.setMolePercent(unknown_mpercent);
            unknown_monomer.setMoles(unknown_moles);
            unknown_monomer.setMass(unknown_mass);
        }

        const mass_sum = compGroup.sumMonomerStat('mass');

        // All masses should have been calculated, so find weight percents using calculated mass sum
        compGroup.getMonomers().forEach((monomer) => {
            const wpercent = (monomer.getMass() / mass_sum) * 100.0;
            monomer.setWeightPercent(wpercent);
        });

        // Calculations were successful for the Excess Mass Route
        return true;
    }
    // For complimentary group with a configuration similar to reference Zipper Route
    else {
        // There are no reference comonomers with both mass and percent given, nor are all masses given, so calculate using ratio between the sum of masses and the remaining percent left
        const part_mlp_sum = compGroup.sumMonomerStat('mpercent');
        const part_mole_sum = compGroup.sumMonomerStat('moles');
        const mol_per_percent = part_mole_sum / (100.0 - part_mlp_sum);

        compGroup.getMonomers().forEach((monomer) => {
            // Mass is known (moles were already calculated previously), so calculate the value for mole percent
            if (!monomer.molePercentGiven() && monomer.massGiven()) {
                const mpercent = monomer.getMoles() / mol_per_percent;
                monomer.setMolePercent(mpercent);
            }
            // Mole Percent is known, so calculate the value for mass and moles
            if (monomer.molePercentGiven() && !monomer.massGiven()) {
                const moles = monomer.getMolePercent() * mol_per_percent;
                const mass = moles * monomer.getMolarMass();
                monomer.setMoles(moles);
                monomer.setMass(mass);
            }
        });

        // Check that the mole sum matches the expected mole sum within reasonable error
        const user_mol_sum = compGroup.sumMonomerStat('moles');
        const user_mol_sum_valid = compareFloatValues(comp_mol_sum, user_mol_sum, ERROR_TOLERANCE);

        if (!user_mol_sum_valid) {
            // The user's masses did not match the expected mole sum for the complimentary group
            console.error(Error(
                `The masses given did not match the calculated mole sum for the complimentary (${compGroup.getName()}) group. 
                \nPlease enter valid masses or remove invalid ones.`
            ));
            return false;
        }

        // Calculations were successful for the Excess Mass Route
        return true;
    }
}

function comp_wtpXS(refGroup, compGroup)
{
    // Find the mole sums for the complimentary group based on the their molar equivalents
    const comp_mol_sum = (refGroup.sumMonomerStat('moles') / refGroup.getMolarEQ()) * compGroup.getMolarEQ();

    // Validate any masses given and calculate any possible values (e.g. moles)
    const { calc_complete, calc_failed } = xsInfo_validateMasses(compGroup, comp_mol_sum);

    // Check if calculations are complete and that there were no problems
    if (calc_failed) {
        // There was a problem with the masses given
        return false;
    }
    else if (calc_complete && !calc_failed) {
        // The calculations succeeded and no more are necessary
        return true;
    }

    /********************************************************************************************************************
     * There is more than one comonomer, so check the ratios between mass and percent for those which give both values  *
     * (the ratio between different comonomers and their percents may differ and lead to error depending on user input) *
     ********************************************************************************************************************/
    
    // List of comonomers with mass and weight percent given
    const determined_comonomers = compGroup.getMonomers()
        .filter((monomer) => monomer.massGiven() && monomer.weightPercentGiven());

    // For complimentary group with more than one comonomer and at least one comonomer with both mass and percent given
    if (determined_comonomers.length >= 1) 
    {
        /**************************************************************
         *  CHECK RATIOS BETWEEN MASS/MOLES AND THEIR PERCENT VALUES  *
         **************************************************************/

        // Set the reference comonomer to the first one in the index. Any ratio value which differ from this reference are invalid
        const [ reference_monomer ] = determined_comonomers;
        const reference_ratio = reference_monomer.getMass() / reference_monomer.getWeightPercent();

        // Check ratios of mass to percent for comonomers with both given
        for (let i = 0 ; i < determined_comonomers.length ; i++) 
        {
            const monomer = determined_comonomers[i];
            const g_per_percent = monomer.getMass() / monomer.getWeightPercent();

            // Validate that the user's weight ratio is equivalent to the reference ratio within reasonable error
            const wt_ratios_match = compareFloatValues(reference_ratio, g_per_percent, ERROR_TOLERANCE);

            if (!wt_ratios_match) {
                // The given weight ratios do not match the reference ratio
                console.error(Error(
                    `The given weight percents do not match the expected weight ratio for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }
        }

        // No issues detected with ratios, so calculate remaining undetermined weight percent values
        if (determined_comonomers.length < compGroup.getNum())
        {
            compGroup.getMonomers().forEach((monomer) => {
                // Mass is given but weight percent is unknown, so calculate weight percent using reference ratio
                if(monomer.massGiven() && !monomer.weightPercentGiven()) {
                    const wpercent = monomer.getMass() / reference_ratio;
                    monomer.setWeightPercent(wpercent);
                } 
                // Weight percent is given but mass is unknown, so calculate mass then moles using reference ratio
                else if (!monomer.massGiven() && monomer.weightPercentGiven()) {
                    const mass = monomer.getWeightPercent() * reference_ratio;
                    const moles = mass / monomer.getMolarMass();
                    monomer.setMass(mass);
                    monomer.setMoles(moles);
                }
            });
        }

        // Check for an unknown, and calculate its missing values if it exists
        if (compGroup.hasUnknown())
        {
            const unknown_monomer = compGroup.getUnknown();
            const part_wtp_sum = compGroup.sumMonomerStat('wpercent');

            if (part_wtp_sum >= 100.0) 
            {
                // The calculated sum of all weight percents exceeded 100 for the complimentary group
                console.error(Error(
                    `Calculated sum of all weight percents (${part_wtp_sum}%) exceeded 100 for the complimentary (${compGroup.getName()}) group. 
                    \nPlease enter valid masses or remove invalid ones.`
                ));
                return false;
            }

            const unknown_wpercent = 100.0 - part_wtp_sum;
            const unknown_mass = unknown_wpercent * reference_ratio;
            const unknown_moles = unknown_mass / unknown_monomer.getMolarMass();
            unknown_monomer.setWeightPercent(unknown_wpercent);
            unknown_monomer.setMass(unknown_mass);
            unknown_monomer.setMoles(unknown_moles);
        }

        // All moles should have been calculated, so find mole percents using calculated mole sum
        compGroup.getMonomers().forEach((monomer) => {
            const mpercent = (monomer.getMoles() / comp_mol_sum) * 100.0;
            monomer.setMolePercent(mpercent);
        });

        // Calculations were successful for the Excess Mass Route
        return true;
    }
    // For complimentary group with a configuration similar to reference Zipper Route
    else {
        // There are no reference comonomers with both mass and percent given, nor are all masses given, so calculate using ratio between the sum of masses and the remaining percent left
        const part_wtp_sum = compGroup.sumMonomerStat('wpercent');
        const part_mass_sum = compGroup.sumMonomerStat('mass');
        const g_per_percent = part_mass_sum / (100.0 - part_wtp_sum);

        compGroup.getMonomers().forEach((monomer) => {
            // Mass is known, so calculate the value for weight percent
            if (!monomer.weightPercentGiven() && monomer.massGiven()) {
                const wpercent = monomer.getMass() / g_per_percent;
                monomer.setWeightPercent(wpercent);
            }
            // Weight percent is known, so calculate the value for mass
            else if (monomer.weightPercentGiven() && !monomer.massGiven()) {
                const mass = monomer.getWeightPercent() * g_per_percent;
                const moles = mass / monomer.getMolarMass();
                monomer.setMass(mass);
                monomer.setMoles(moles);
            }
        });

        // Check that the mole sum matches the expected mole sum within reasonable error
        const user_mol_sum = compGroup.sumMonomerStat('moles');
        const user_mol_sum_valid = compareFloatValues(comp_mol_sum, user_mol_sum, ERROR_TOLERANCE);

        if (!user_mol_sum_valid) {
            // The user's masses did not match the expected mole sum for the complimentary group
            console.error(Error(
                `The masses given did not match the calculated mole sum for the complimentary (${compGroup.getName()}) group. 
                \nPlease enter valid masses or remove invalid ones.`
            ));
            return false;
        }

        // Calculations were successful for the Excess Mass Route
        return true;
    }
}

function xsInfo_validateMasses(compGroup, comp_mol_sum)
{
    let user_mol_sum = 0;
    const ALL_MASSES_GIVEN = compGroup.getMonomerStatCount('mass') === compGroup.getNum();
    const NO_PERCENT_GIVEN = compGroup.getMonomerStatCount('percent') === 0;

    // Calculate the moles of masses given by the user and add to user mol sum
    compGroup.getMonomers().forEach((monomer) => {
        if (monomer.massGiven())
        {
            const moles = monomer.getMass() / monomer.getMolarMass();
            user_mol_sum += moles;
            monomer.setMoles(moles);
        }
    });

    // Validate that the masses given follow the expected mole sum
    if (ALL_MASSES_GIVEN)
    {
        // Validate that the user's mole sum is equivalent to the calculated mole sum within reasonable error
        const user_mol_sum_valid = compareFloatValues(comp_mol_sum, user_mol_sum, ERROR_TOLERANCE);

        if (!user_mol_sum_valid) {
            // The user's masses exceeded the expected mole sum for the complimentary group
            console.error(Error(
                `Calculated mole sum exceeded the expected mole sum for the complimentary (${compGroup.getName()}) group. 
                \nPlease enter valid masses or remove invalid ones.`
            ));
            return { calc_complete: false, calc_failed: true };
        }
    }
    else 
    {
        // Not all masses were given, so user mole sum should be less than expected mole sum
        const user_mol_sum_valid = comp_mol_sum > user_mol_sum;

        if (!user_mol_sum_valid) {
            // The user's masses exceeded the expected mole sum for the complimentary group
            console.error(Error(
                `Calculated mole sum must be less than the expected mole sum for the complimentary (${compGroup.getName()}) group. 
                \nPlease enter valid masses or remove invalid ones.`
            ));
            return { calc_complete: false, calc_failed: true };
        }
    }

    // If there is only one monomer (mass must be given to to use this calc route)
    if (compGroup.getNum() === 1) {
        // No more calculations are necessary
        return { calc_complete: true, calc_failed: false };
    }
    // For complimentary group with more than one comonomer and all masses given, but no percents given
    else if (ALL_MASSES_GIVEN && NO_PERCENT_GIVEN) {
        // All masses were given and all moles were calculated and validated
        const mass_sum = compGroup.sumMonomerStat('mass');
        
        // Calculate mole percent and weight percent
        compGroup.getMonomers().forEach((monomer) => {
            const wpercent = (monomer.getMass() / mass_sum) * 100.0;
            const mpercent = (monomer.getMoles() / comp_mol_sum) * 100.0;
            monomer.setWeightPercent(wpercent);
            monomer.setMolePercent(mpercent);
        });

        // No more calculations are necessary
        return { calc_complete: true, calc_failed: false };
    }

    // The prior checks did not return out of the function, so there are no problems but more calculations are required
    return { calc_complete: false, calc_failed: false };
}