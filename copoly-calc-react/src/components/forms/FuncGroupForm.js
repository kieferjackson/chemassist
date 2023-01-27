import React, { useState } from 'react';
import { useFuncGroups, useFuncDispatch } from '../../contexts/FuncContext';
import { UPDATE_FUNC } from '../../contexts/actions';
import { MONOMER_FORM } from '../../contexts/page_names';
// Import default starting values for Functional Group and Form fields
import { DEFAULT_FUNC_GROUP_DATA, FUNC_FORM_FIELDS } from './defaults/func_group_data';

// Import FuncGroup Class for defining input data
import FuncGroup from '../../utils/FuncGroup';
// Import validator functions and error message generation
import { checkDataTypes, checkParity } from '../../utils/validators';
import { invalidErrorMessage } from '../../utils/helpers';

export default function FuncGroupForm()
{
    const { funcGroups } = useFuncGroups();
    const { setFuncGroup, setPage } = useFuncDispatch();
    
    // Manages the entered Functional Group form values
    const [funcGroupsForm, setFuncGroupsForm] = useState(FUNC_FORM_FIELDS);

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        // Update form field to new value
        setFuncGroupsForm({ ...funcGroupsForm, [name]: value });
    }

    // Functions to increment/decrement monomer number fields
    const subtractMonomerNum = (func_letter) => {
        const num_field_name = `func${func_letter}_num`;
        let current_value = parseInt(funcGroupsForm[num_field_name]);
        
        if (current_value > 1 && current_value % 1 === 0) 
        {
            // The current value is a sufficiently large whole number, decrement it
            current_value -= 1;
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: current_value });
        } 
        else if (current_value > 2 && current_value % 1 !== 0) 
        {
            // The current value is a sufficiently large decimal number, floor and then decrement it
            current_value = Math.floor(current_value);
            current_value -= 1;
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: current_value });
        } 
        else if (current_value > 1 && current_value < 2 && current_value % 1 !== 0) 
        {
            // The current value is a decimal number between 1 and 2, set it to 1
            current_value = 1;
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: current_value });
        } 
        else 
        {
            // Set unexpected value to 1
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: 1 });
        }
    }

    const addMonomerNum = (func_letter) => {
        const num_field_name = `func${func_letter}_num`;
        let current_value = parseInt(funcGroupsForm[num_field_name]);
        
        if (current_value % 1 === 0) 
        {
            // The current value is a whole number, increment it
            current_value += 1;
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: current_value });
        } 
        else if (current_value % 1 > 0) 
        {
            // The current value is a decimal number, floor and then increment it
            current_value = Math.floor(current_value);
            current_value += 1;
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: current_value });
        } 
        else 
        {
            // Set unexpected value to 1
            setFuncGroupsForm({ ...funcGroupsForm, [num_field_name]: 1 });
        }
    }

    const toggleCheckBox = (event) => {
        event.preventDefault();

        const check_box = event.target;
        const molar_eq_section = document.getElementById("molar_eq_container");

        // Saving and Resetting Current State of Check Box
        const current_state = check_box.classList[1];
        check_box.classList.remove(current_state);

        // Update checkbox based on current state
        switch(current_state)
        {
            case 'unchecked':
                check_box.classList.add("checked");
                // The checkbox is checked, so the molar eq section should be visible
                molar_eq_section.className = 'visible';
                break;
            case 'checked':
                check_box.classList.add("unchecked");
                // The checkbox is unchecked, so the molar eq section should be hidden
                molar_eq_section.className = 'hidden';
                break;
            default:
                check_box.classList.add("unchecked");
                molar_eq_section.className = 'hidden';
                break;
        }
    }

    const toggleMolarEQ = (event) => {
        event.preventDefault();

        const molar_eq_container = event.target.parentElement;
        const molar_eq_status = molar_eq_container.className;

        // Deselect previous molar equivalents if one has already been selected
        switch(molar_eq_container.id)
        {
            case 'funcA_eq':
                const b_eq = document.getElementById("funcB_eq");
                b_eq.className = 'unselected';
                break;
            case 'funcB_eq': 
                const a_eq = document.getElementById("funcA_eq");
                a_eq.className = 'unselected';
                break;
            default:
                console.log('No associated id with this selected element.');
                break;
        }

        // Update button to reflect new state by changing class name
        switch(molar_eq_status)
        {
            case 'unselected':
                molar_eq_container.className = 'selected';
                break;

            case 'selected':
                molar_eq_container.className = 'unselected';
                break;

            default:
                molar_eq_container.className = 'unselected';
                break;
        }
    }

    const handleFormSubmission = () => {
        // Determine percent type by selecting Weight Percent Radio Button and see if it is checked
        const wt_percent_checked = document.getElementById("wpercent").checked;

        // Since there are only two options, if weight percent is not checked, then mole percent is, and vice-versa
        const PERCENT_TYPE = wt_percent_checked 
            ? 'weight' 
            : 'mole';

        // Check that functional group names are unique (duplicate names are not allowed)
        const { funcA_name, funcB_name } = funcGroupsForm;
        const funcNamesIdentical = checkParity(funcA_name.toLowerCase(), funcB_name.toLowerCase());

        if (funcNamesIdentical) {
            // Names cannot be identical, exit out of function
            console.error(invalidErrorMessage('unique', 'Functional group names'));
            return;
        }

        // Check whether an excess functional group has been selected, and determine the molar eq
        const xs_A_selected = document.getElementById("funcA_eq").className === 'selected';
        const xs_B_selected = document.getElementById("funcB_eq").className === 'selected';

        const molar_eq_is_checked = document.getElementById("molar_eq_check").classList[1] === 'checked';
        const molar_eq_selected = xs_A_selected || xs_B_selected;

        if (molar_eq_is_checked && !molar_eq_selected) {
            // Excess functional group was selected, but no group selected, exit out of function
            console.error(invalidErrorMessage('selected if excess molar eq is selected', 'Excess functional group'));
            return;
        }

        // Track that all given inputs are acceptable
        let inputsAcceptable = true;

        const parsedFuncGroups = DEFAULT_FUNC_GROUP_DATA.map(({ letter }) => {
            // Get functional group form values, accessed with key value, identified by `letter`
            const name = funcGroupsForm[`func${letter}_name`];
            const num = parseInt(funcGroupsForm[`func${letter}_num`]);
            // Depending on whether excess molar eq was selected, determine molar eq for this func group
            const determineMolarEq = () => {
                if (xs_A_selected && letter === 'A') 
                    return parseFloat(funcGroupsForm.func_xs);
                else if (xs_B_selected && letter === 'B') 
                    return parseFloat(funcGroupsForm.func_xs);
                else
                    return 1.0;
            }

            // Determine molar eq for this functional group; if not selected, default to `1.0`
            const molar_eq = molar_eq_is_checked ? determineMolarEq() : 1.0;

            // Check that input values are acceptable and the correct datatype
            const nameAcceptable = checkDataTypes('string', { value: name });
            const numAcceptable = checkDataTypes('int', { value: num });
            const molar_eqAcceptable = checkDataTypes('float', { value: molar_eq, isMonomer: false });
            
            if (nameAcceptable && numAcceptable && molar_eqAcceptable)
            {
                // Create Functional Group object with the FuncGroup class and validated values
                return {
                    data: new FuncGroup
                    (
                        PERCENT_TYPE,
                        name,
                        num,
                        molar_eq,
                        []          // Initialize monomer list to empty array
                    ),
                    isOK: inputsAcceptable
                };
            } else
            {
                const ERROR_MESSAGE = `One or multiple of the values given for Functional Group ${letter} is missing or invalid.`;
                console.error(ERROR_MESSAGE);
                inputsAcceptable = false;
                return { message: ERROR_MESSAGE, isOK: inputsAcceptable };
            }
            
        });

        console.log('Parsed funcGroups: ', parsedFuncGroups);
        console.log('Reducer State: ', funcGroups);

        // Check that both functional groups are valid by only returning acceptable values
        const validFuncGroups = parsedFuncGroups.reduce((validatedFuncGroups, funcGroup) => {
            if (funcGroup.isOK)
                validatedFuncGroups.push(funcGroup.data);

            return validatedFuncGroups;
        }, []);
        
        // Check that both functional groups are valid
        if (validFuncGroups.length === 2)
        {
            // Update the Functional Group Context with the validated func group data
            setFuncGroup({ type: UPDATE_FUNC, funcGroups: validFuncGroups });
        }
        else
            throw Error('One of the functional groups was given invalid input. Please try again.');
        
    }

    React.useEffect(() => {
        if (funcGroups !== undefined && funcGroups.length > 0) {
            setPage({ page: MONOMER_FORM });
        } 
    }, [funcGroups, setPage]);
    
    return(
        <div className="form_container">
            <form id="initial_data_entry">
                <section className="percent_type">
                    <label>
                        Weight %
                        <input type="radio" name="proportion" value="wpercent" id="wpercent" className="input_field" defaultChecked={true} />
                    </label>
                    <label>
                        Mole %
                        <input type="radio" name="proportion" value="mpercent" id="mpercent" className="input_field" />
                    </label>
                </section>
                <section className="ag_box">
                    {DEFAULT_FUNC_GROUP_DATA.map(({ letter, name_placeholder, num_placeholder }) =>
                        <div key={`func_group_${letter}`}>
                            <h1>Functional Group {letter}</h1>
                            <div className="input_block">
                                <label>
                                    Substituent Name
                                    <input 
                                        type="text" 
                                        name={`func${letter}_name`} 
                                        value={funcGroupsForm[`func${letter}_name`]} 
                                        onChange={handleFormChange}
                                        placeholder={`e.g. '${name_placeholder}'`} 
                                        id={`func${letter}_name`} 
                                        className="input_field string" 
                                    />
                                </label>
                            </div>
                            <br />
                            <div className="input_block">
                                <label>
                                    Number of Comonomers
                                    <input 
                                        type="text" 
                                        name={`func${letter}_num`} 
                                        value={funcGroupsForm[`func${letter}_num`]} 
                                        onChange={handleFormChange}
                                        placeholder={`e.g. '${num_placeholder}'`} 
                                        id={`func${letter}_num`} 
                                        className="input_field int" 
                                    />
                                </label>
                                <button 
                                    type="button" name="minus" 
                                    onClick={() => subtractMonomerNum(letter)} 
                                    className="square_button plus_minus" tabIndex="-1"
                                >
                                    <div>-</div>
                                </button>
                                <button 
                                    type="button" name="plus" 
                                    onClick={() => addMonomerNum(letter)} 
                                    className="square_button plus_minus" tabIndex="-1"
                                >
                                    <div>+</div>
                                </button>
                            </div>
                            <br />
                        </div>
                    )}
                </section>
                <br />
                <section className="optional">
                    <div className="input_block">
                        <label>
                            Is either group in excess?
                            <button 
                                type="button" name="molar_eq_check" 
                                id="molar_eq_check"
                                onClick={toggleCheckBox}
                                className="check_box unchecked" tabIndex="-1"
                            ></button>
                        </label>
                    </div>
                    <br />
                    <div id="molar_eq_container" className="hidden">
                        <div className="input_block">
                            {DEFAULT_FUNC_GROUP_DATA.map(({ letter }) =>
                                <div className="unselected" id={`func${letter}_eq`} key={`func${letter}_eq`} >
                                    <button 
                                        type="button" 
                                        name={`xs_${letter}`} 
                                        onClick={toggleMolarEQ} 
                                        className="square_button inactive_button"
                                    >
                                        {letter}
                                    </button>
                                </div>
                            )}
                            <label>
                                Molar Equivalents
                                <input 
                                    type="text" 
                                    name="func_xs" 
                                    value={funcGroupsForm.func_xs} 
                                    onChange={handleFormChange}
                                    placeholder="e.g. '1.1'" 
                                    id="func_xs" 
                                    className="input_field float" />
                            </label>
                        </div>
                    </div>
                </section>
                
                <div className="submit_container">
                    <button type="button" onClick={() => handleFormSubmission()} id="initial_submit" className="submit_button">Next</button>
                </div>
            </form>
        </div>
    );
}