
export function GENERATE_MONOMER_FORM_FIELDS (funcGroups) 
{
    const defaultFields = { mass: '', percent: '', molar_mass: '' };
    let monomerFormFields = {};

    for (const funcGroup of funcGroups)
    {
        const { num, name } = funcGroup;

        // Generate the default fields for monomers, indentified by monomer name (e.g. diol-1)
        let monomerFields = {};

        for (let i = 0 ; i < num ; i++)
        {
            monomerFields[`${name}-${i + 1}`] = defaultFields;
        }
        
        // Add default fields to monomer form fields, using func group name as the key value
        monomerFormFields[funcGroup.name] = monomerFields;
    }
    
    return monomerFormFields;
}