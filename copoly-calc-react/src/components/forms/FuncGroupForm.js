import React from 'react';
import { useFuncGroups, useFuncDispatch } from '../../contexts/FuncContext';
import { UPDATE_FUNC, INITIALIZE_MONOMERS } from '../../contexts/actions';
import { FUNC_FORM, MONOMER_FORM } from '../../contexts/page_names';
// Import default starting values for Functional Group and Form fields
import { DEFAULT_FUNC_GROUP_DATA, REQUIRED_FUNC_FIELDS } from './defaults/func_group_data';
// Import default generation function for Monomer Form fields
import { GENERATE_MONOMER_FORM_FIELDS } from './defaults/monomer_data';

// Import FuncGroup Class for defining input data
import FuncGroup from '../../utils/FuncGroup';
// Import validator functions and error message generation
import { checkDataTypes, checkParity } from '../../utils/validators';
import { invalidErrorMessage } from '../../utils/helpers';

export default function FuncGroupForm()
{
    const { formData, funcGroups } = useFuncGroups();
    const { setFormData, setFuncGroup, setPage } = useFuncDispatch();

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        // Update form field to new value
        setFormData({ formType: FUNC_FORM, formField: name, value });
    }

    // Functions to increment/decrement monomer number fields
    const subtractMonomerNum = (func_letter) => {
        const num_field_name = `func${func_letter}_num`;
        let current_value = parseInt(formData.funcGroupsForm[num_field_name]);
        
        if (current_value > 1 && current_value % 1 === 0) 
        {
            // The current value is a sufficiently large whole number, decrement it
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: current_value - 1 });
        } 
        else if (current_value > 2 && current_value % 1 !== 0) 
        {
            // The current value is a sufficiently large decimal number, floor and then decrement
            current_value = Math.floor(current_value) - 1;
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: current_value });
        } 
        else if (current_value > 1 && current_value < 2 && current_value % 1 !== 0) 
        {
            // The current value is a decimal number between 1 and 2, set it to 1
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: 1 });
        } 
        else 
        {
            // Set unexpected value to 1
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: 1 });
        }
    }

    const addMonomerNum = (func_letter) => {
        const num_field_name = `func${func_letter}_num`;
        let current_value = parseInt(formData.funcGroupsForm[num_field_name]);
        
        if (current_value % 1 === 0) 
        {
            // The current value is a whole number, increment it
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: current_value + 1 });
        } 
        else if (current_value % 1 > 0) 
        {
            // The current value is a decimal number, floor and then increment it
            current_value = Math.floor(current_value) + 1;
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: current_value });
        } 
        else 
        {
            // Set unexpected value to 1
            setFormData({ formType: FUNC_FORM, formField: num_field_name, value: 1 });
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
        const { funcA_name, funcB_name } = formData.funcGroupsForm;
        const funcNamesIdentical = checkParity(funcA_name.toLowerCase(), funcB_name.toLowerCase());

        if (funcNamesIdentical) {
            // Names cannot be identical, exit out of function
            console.error(invalidErrorMessage('unique', 'Functional group names'));
            return;
        }

        // Check whether an excess functional group has been selected, and determine the molar eq
        const xs_A_selected = formData.funcGroupsForm.xsGroup === 'A';
        const xs_B_selected = formData.funcGroupsForm.xsGroup === 'B';

        const molar_eq_is_checked = formData.funcGroupsForm.isExcessEQ;
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
            const name = formData.funcGroupsForm[`func${letter}_name`];
            const num = parseInt(formData.funcGroupsForm[`func${letter}_num`]);
            // Depending on whether excess molar eq was selected, determine molar eq for this func group
            const determineMolarEq = () => {
                if (xs_A_selected && letter === 'A') 
                    return parseFloat(formData.funcGroupsForm.func_xs);
                else if (xs_B_selected && letter === 'B') 
                    return parseFloat(formData.funcGroupsForm.func_xs);
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
            
            // Initialize starting monomer form fields based on functional group information
            setFormData({ formType: INITIALIZE_MONOMERS, formField: null, value: GENERATE_MONOMER_FORM_FIELDS(validFuncGroups) });
        }
        else
            throw Error('One of the functional groups was given invalid input. Please try again.');
        
    }

    React.useEffect(() => {
        const { funcGroupsForm, monomersForm } = formData;
        
        const funcContextUpdated = funcGroups !== undefined && funcGroups.length > 0;
        const monomerFieldsGenerated = monomersForm !== undefined;

        // Check that all required fields are not blank, ignore any that are not required
        let numReqFieldsNotFilled = 0;

        for (let field in funcGroupsForm) 
        {
            const fieldIsRequired = REQUIRED_FUNC_FIELDS[field];
            const fieldValue = funcGroupsForm[field];
            
            if (fieldIsRequired && fieldValue === '')
                numReqFieldsNotFilled++;
        }
        
        if (funcContextUpdated && (numReqFieldsNotFilled === 0) && monomerFieldsGenerated) {
            setPage({ page: MONOMER_FORM });
        } 
    }, [formData, funcGroups, setPage]);
    
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
                                        value={formData.funcGroupsForm[`func${letter}_name`]} 
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
                                        value={formData.funcGroupsForm[`func${letter}_num`]} 
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
                            <input 
                                type="checkbox" name="molar_eq_check" 
                                id="molar_eq_check"
                                onClick={({ target }) => setFormData({ formType: FUNC_FORM, formField: 'isExcessEQ', value: target.checked })}
                                className="check_box" tabIndex="-1"
                            ></input>
                        </label>
                    </div>
                    <br />
                    {formData.funcGroupsForm.isExcessEQ ?
                    <div id="molar_eq_container">
                        <div className="input_block">
                            {DEFAULT_FUNC_GROUP_DATA.map(({ letter }) =>
                                <div className={formData.funcGroupsForm.xsGroup === letter ? "selected" : "unselected"} id={`func${letter}_eq`} key={`func${letter}_eq`} >
                                    <button 
                                        type="button" 
                                        name={`xs_${letter}`} 
                                        onClick={() => setFormData({ formType: FUNC_FORM, formField: 'xsGroup', value: formData.funcGroupsForm.xsGroup === letter ? '' : letter })} 
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
                                    value={formData.funcGroupsForm.func_xs} 
                                    onChange={handleFormChange}
                                    placeholder="e.g. '1.1'" 
                                    id="func_xs" 
                                    className="input_field float" />
                            </label>
                        </div>
                    </div>
                    : ''}
                </section>
                
                <div className="submit_container">
                    <button type="button" onClick={() => handleFormSubmission()} id="initial_submit" className="submit_button">Next</button>
                </div>
            </form>
        </div>
    );
}