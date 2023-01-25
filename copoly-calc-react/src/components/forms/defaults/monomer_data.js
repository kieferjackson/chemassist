import { capitalizeFirstLetter } from '../../../utils/ornaments';

export function GENERATE_MONOMER_FORM_FIELDS (funcGroups) 
{
    let monomerFormFields = {};

    for (const funcGroup of funcGroups)
    {
        const { num, name } = funcGroup;
        const funcName = capitalizeFirstLetter(name);

        // Generate field properties for each comonomer identified by its name (e.g. massDiol-1)
        for (let i = 0 ; i < num ; i++)
        {
            monomerFormFields[`mass${funcName}-${i + 1}`] = '';
            monomerFormFields[`percent${funcName}-${i + 1}`] = '';
            monomerFormFields[`molar_mass${funcName}-${i + 1}`] = '';
        }
    }
    
    return monomerFormFields;
}