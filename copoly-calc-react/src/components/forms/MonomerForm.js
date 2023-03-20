import React, { useState } from 'react';
import { useFuncGroups, useFuncDispatch } from '../../contexts/FuncContext';
import { UPDATE_FUNC, UPDATE_MONOMERS } from '../../contexts/actions';
import { FUNC_FORM, FINAL_RESULTS } from '../../contexts/page_names';
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

    const handleFormSubmission = () => {
        // Contains the monomers for both functional groups as two separate arrays
        const parsedMonomers = funcGroups.map(({ name, num, percent_type }, funcGroupIndex) => {
            // Lists the monomers for this particular functional group
            let funcGroupMonomers = [];
            const funcName = capitalizeFirstLetter(name);

            // Track the number of unknowns per functional group !THERE CAN ONLY BE UP TO 1 UNKNOWN PER FUNCTIONAL GROUP
            let unknownCount = [0, 0];
            // Track that all given inputs are acceptable
            let inputsAcceptable = true;

            for (let i = 0 ; i < num ; i++)
            {
                const monomerName = `${funcName}-${i + 1}`

                // Get given monomer form values, accessed with key value, identified by monomer name
                const given_mass = monomersForm[`mass${monomerName}`];
                const given_percent = monomersForm[`percent${monomerName}`];
                const given_molar_mass = monomersForm[`molar_mass${monomerName}`];

                // Set mass, percent, and molar mass values depending on input given
                const mass = given_mass === '' ? 0 : parseFloat(given_mass);
                const percent = given_percent === '' ? 0 : parseFloat(given_percent);
                const molar_mass = given_molar_mass === '' ? 0 : parseFloat(given_molar_mass);

                // Check that input values are acceptable and the correct datatype
                const massAcceptable = checkDataTypes('float', { value: mass, isMonomer: true });
                const percentAcceptable = checkDataTypes('float', { value: percent, isMonomer: true });
                const molar_massAcceptable = checkDataTypes('float', { value: molar_mass, isMonomer: true });

                // Set weight percent value depending on given conditions
                const weight_percent = percentAcceptable && percent_type === 'weight'
                    ? percent   // Set this monomer to the given percent value
                    : 0;        // Set weight percent to 0 to indicate that it is undetermined

                // Set mole percent value depending on given conditions
                const mole_percent = percentAcceptable && percent_type === 'mole'
                    ? percent   // Set this monomer to the given percent value
                    : 0;        // Set weight percent to 0 to indicate that it is undetermined

                // Check if mass and percents are unknown
                if (mass === 0 && weight_percent === 0 && mole_percent === 0) 
                {
                    unknownCount[funcGroupIndex] += 1;

                    if (unknownCount[funcGroupIndex] > 1)
                    {
                        // There can only be up to 1 unknown in a functional group
                        console.error(invalidErrorMessage('less than or equal to 1', 'Unknowns'));
                        inputsAcceptable = false;
                    }
                }

                // Check if molar mass is unknown (for molar mass to be given, it must be greater than 0)
                if (!molar_mass > 0)
                {
                    console.error(invalidErrorMessage('greater than 0', 'Molar Mass'));
                    inputsAcceptable = false;
                }

                if (massAcceptable && percentAcceptable && molar_massAcceptable)
                {
                    const monomer = new Monomer(
                        mass,
                        weight_percent,
                        mole_percent,
                        molar_mass,
                        // The last property (moles) defaults to 0 because it will be calculated at its calculation route
                        0
                    );
                    
                    funcGroupMonomers.push({ data: monomer, isOK: inputsAcceptable });
                } else
                {
                    const ERROR_MESSAGE = `One or multiple of the values given for the ${monomerName} monomer name is missing or invalid.`;
                    console.error(ERROR_MESSAGE);
                    inputsAcceptable = false;
                    return { message: ERROR_MESSAGE, isOK: inputsAcceptable };
                }
            }

            // Add this functional group's monomers to the parseMonomers array
            return funcGroupMonomers;
        });
        
        console.log('Parsed funcGroups: ', parsedMonomers);
        console.log('Reducer State: ', funcGroups);

        const validateMonomers = (monomers) => {
            return monomers.reduce((validatedMonomers, monomer) => {
                if (monomer.isOK)
                    validatedMonomers.push(monomer.data);
                
                return validatedMonomers;
            }, []);
        }

        // Check that all monomers are valid by filtering out any which are not acceptable
        const [ monomersFuncA, monomersFuncB ] = parsedMonomers;
        const validMonomersFuncA = validateMonomers(monomersFuncA);
        const validMonomersFuncB = validateMonomers(monomersFuncB);
        const validMonomers = [validMonomersFuncA, validMonomersFuncB];
        
        // Evaluate if the monomers for each functional group are valid
        const [ funcA, funcB ] = funcGroups;
        const funcA_monomersOK = validMonomersFuncA.length === funcA.getNum();
        const funcB_monomersOK = validMonomersFuncB.length === funcB.getNum();
        
        if (funcA_monomersOK && funcB_monomersOK)
        {
            // Update the Functional Group Context with the validated monomer data
            setFuncGroup({ type: UPDATE_MONOMERS, 'funcGroups': { monomers: validMonomers } });
        }
        // Only the monomers for functional group A were invalid
        else if (funcA_monomersOK)
            throw Error('One of the monomers for Functional Group A was given invalid input. Please try again.');
        // Only the monomers for functional group B were invalid
        else if (funcB_monomersOK)
            throw Error('One of the monomers for Functional Group B was given invalid input. Please try again.');
        else
            throw Error('One of the monomers was given invalid input. Please try again.');

    }

    React.useEffect(() => {
        if (funcGroups.length > 0)
        {
            const [ funcA, funcB ] = funcGroups;
            const monomersDefined = funcA.monomers.length > 0 && funcB.monomers.length > 0;
            
            // All necessary information has been given, so display final results
            if (monomersDefined) {
                setPage({ page: FINAL_RESULTS });
            } 
        }
        else
        {
            // Func Groups were reset, so return to Func Group Form
            setPage({ page: FUNC_FORM });
        }
    }, [funcGroups, setPage]);

    const backToFuncForm = () => {
        setFuncGroup({ type: UPDATE_FUNC, funcGroups: [] });
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
                <div id='monomer_submit_container' className='submit_container'>
                    <button type='button' onClick={() => backToFuncForm()} className='back_button'>Back</button>
                    <button type='button' onClick={() => handleFormSubmission()} className='submit_button'>Next</button>
                </div>
            </div>
        </div>
    );
}