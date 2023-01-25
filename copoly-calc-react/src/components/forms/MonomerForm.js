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
    const { funcGroups } = useFuncGroups();
    const { setFuncGroup, setPage } = useFuncDispatch();

    return (
        <div className="form_container">
            <div id="monomer_data_entry" className="dynamic_form">
                {funcGroups.map(({ name, num, percent_type }) => {
                    const funcName = capitalizeFirstLetter(name);

                    return (
                    <form key={`${name}_entry`} name={`${name}_entry`} id={`${name}_entry`}>
                        <h2 className='dyn_heading'>{funcName} Group</h2>
                        <section className="ag_box">
                            <h3 className='ag_box_dyn_heading'>{funcName} Group</h3>
                            {Array.from({ length: num }, (monomer, index) =>
                                <div key={`${name}-${index + 1}`}>
                                    {/* Mass Input Field */}
                                    <label htmlFor={`mass${funcName}-${index + 1}`}>Mass (g)</label>
                                    <input type="text" name={`mass${funcName}-${index + 1}`} className="dyn_input_field"></input>
                                    {/* Percent Input Field */}
                                    <label htmlFor={`percent${funcName}-${index + 1}`}>{`${capitalizeFirstLetter(percent_type)} (%)`}</label>
                                    <input type="text" name={`percent${funcName}-${index + 1}`} className="dyn_input_field"></input>
                                    {/* Molar Mass Input Field */}
                                    <label htmlFor={`molar_mass${funcName}-${index + 1}`}>Molar Mass (g/mol)</label>
                                    <input type="text" name={`molar_mass${funcName}-${index + 1}`} className="dyn_input_field"></input>
                                    <br />
                                </div>
                            )}
                        </section>
                    </form>
                    )
                })}
            </div>
        </div>
    );
}