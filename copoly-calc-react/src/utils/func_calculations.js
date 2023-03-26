
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