import React, { useState } from 'react';
import { useFuncGroups, useFuncDispatch } from '../../contexts/FuncContext';
import { UPDATE_MONOMERS } from '../../contexts/actions';
// Import default starting values for Functional Group and Form fields
import { MONOMER_FORM_FIELDS } from './defaults/monomer_data';

// Import FuncGroup Class for defining input data
import Monomer from '../../utils/Monomer';
// Import validator functions and error message generation
import { checkDataTypes } from '../../utils/validators';
import { invalidErrorMessage } from '../../utils/helpers';
// Import ornamental functions for improving displayed data
import { capitalizeFirstLetter, convertToScientificNotation } from '../../utils/ornaments';

export default function FuncGroupForm()
{
    const funcGroupsContextData = useFuncGroups();
    const updateFuncGroupsContext = useFuncDispatch();

    const generateMonomerFields = ({ num, name }) =>
    {
        let monomerFields = [];

        // Create inputs and labesl for mass, percent, and molar mass based on the number of monomers
        for (let i = 0 ; i < num ; i++)
        {
            const funcName = capitalizeFirstLetter(name);
            const generateLabel = (field_type, innerText) => <label for={`${field_type}${funcName}-${i + 1}`}>{innerText}</label>;
            const generateInput = (field_type) => <input type="text" name={`${field_type}${funcName}-${i + 1}`} className="dyn_input_field"></input>;

            const mass_label = generateLabel('mass', 'Mass (g)');
            const mass_input = generateInput('mass');
            const percent_label = generateLabel('percent', `${capitalizeFirstLetter(percent_type)} (%)`);
            const percent_input = generateInput('percent');
            const molar_mass_label = generateLabel('molar_mass', 'Molar Mass (g/mol)');
            const molar_mass_input = generateInput('molar_mass');

            const gap_break = <br />;

            monomerFields.push(
                mass_label, mass_input, 
                percent_label, percent_input,
                molar_mass_label, molar_mass_input,
                gap_break
            );
        }
    }

    return (
        <div className="form_container">
            <div id="monomer_data_entry" class="dynamic_form">
                {funcGroupsContextData.map((funcGroup) => {
                    <form name={`${funcGroup.name}_entry`} id={`${funcGroup.name}_entry`}>
                        <h2 className='dyn_heading'>{capitalizeFirstLetter(funcGroup.name)} Group</h2>
                        <section className="ag_box">
                            <h3 className='ag_box_dyn_heading'>{capitalizeFirstLetter(funcGroup.name)} Group</h3>
                            {generateMonomerFields(funcGroup)}
                        </section>
                    </form>
                })}
            </div>
        </div>
    );
}