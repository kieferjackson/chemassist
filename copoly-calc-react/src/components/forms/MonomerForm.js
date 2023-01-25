import React, { useState } from 'react';
import { useFuncGroups, useFuncDispatch } from '../../contexts/FuncContext';
import { UPDATE_MONOMERS } from '../../contexts/actions';
// Import default generation function for Monomer Form fields
import { GENERATE_MONOMER_FORM_FIELDS } from './defaults/monomer_data';

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
    
    // Manages the entered Functional Group form values
    const [monomersForm, setMonomersForm] = useState(GENERATE_MONOMER_FORM_FIELDS(funcGroups));
    
    const handleFormChange = (event) => {
        const { name, value } = event.target;
        
        // Update form field to new value
        setMonomersForm({ ...monomersForm, [name]: value });
    }
    
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
                                    <input 
                                        type="text" 
                                        name={`mass${funcName}-${index + 1}`} 
                                        value={monomersForm[`mass${funcName}-${index + 1}`]}
                                        onChange={handleFormChange}
                                        className="dyn_input_field"
                                    />

                                    {/* Percent Input Field */}
                                    <label htmlFor={`percent${funcName}-${index + 1}`}>{`${capitalizeFirstLetter(percent_type)} Percent (%)`}</label>
                                    <input 
                                        type="text" 
                                        name={`percent${funcName}-${index + 1}`} 
                                        // Disable percent input and display 100 if there is only one monomer
                                        disabled={num === 1}
                                        placeholder={ num === 1 ? '100' : '' }
                                        value={monomersForm[`percent${funcName}-${index + 1}`]}
                                        onChange={handleFormChange}
                                        className="dyn_input_field"
                                    />

                                    {/* Molar Mass Input Field */}
                                    <label htmlFor={`molar_mass${funcName}-${index + 1}`}>Molar Mass (g/mol)</label>
                                    <input 
                                        type="text" 
                                        name={`molar_mass${funcName}-${index + 1}`} 
                                        value={monomersForm[`molar_mass${funcName}-${index + 1}`]}
                                        onChange={handleFormChange}
                                        className="dyn_input_field" 
                                    />
                                    
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