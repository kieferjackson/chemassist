import { compareFloatValues } from "./validators";

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

export function doComplimentaryCalculations(refGroup, calculation_route)
{
    switch (calculation_route)
    {
        case 'ALLPERCENTROUTE':     return      comp_allPercent(refGroup);
        case 'GIVENMASSROUTE':      return      comp_givenMass(refGroup); 
        case 'MLP_ZIPPERROUTE':     return      comp_mlpZipper(refGroup); 
        case 'WTP_ZIPPERROUTE':     return      comp_wtpZipper(refGroup); 
        case 'XS_INFOROUTE':        return      ref_xsInfo(refGroup);     
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
        // Moles are known, so calculate the value for mole percent
        if (!monomer.molePercentGiven() && monomer.molesGiven()) {
            const mpercent = monomer.getMoles() / mol_per_percent;
            monomer.setMolePercent(mpercent);
        }
        // Mole percent is known, so calculate the value for moles
        else if (monomer.molePercentGiven() && !monomer.molesGiven()) {
            const moles = monomer.getMolePercent() * mol_per_percent;
            monomer.setMoles(moles);
        }
        
        // Moles should be known, so calculate mass using molar mass
        const mass = monomer.getMoles() * monomer.getMolarMass();
        monomer.setMass(mass);
    });

    const mass_sum = refGroup.sumMonomerStat('mass');

    // Calculate weight percent for each comonomer using their individual mass and the mass sum
    refGroup.getMonomers().forEach((monomer) => {
        const wpercent = monomer.getMass() / mass_sum;
        monomer.setWeightPercent(wpercent);
    });

    return true;
}

function ref_xsWeight(refGroup)
{
    
}

function ref_xsMole(refGroup)
{
    
}

// Complimentary Calculations
function comp_allPercent(refGroup)
{

}

function comp_givenMass(refGroup)
{
    
}

function comp_mlpZipper(refGroup)
{
    
}

function comp_wtpZipper(refGroup)
{
    
}

function ref_xsInfo(refGroup)
{
    
}