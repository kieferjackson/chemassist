import React, { useState } from 'react';

export default function FuncGroupForm()
{
    const func_groups =
    [
        // Functional Group A
        {
            letter: 'A',
            name_placeholder: 'diester',
            num_placeholder: 1,
        },
        // Functional Group B
        {
            letter: 'B',
            name_placeholder: 'diol',
            num_placeholder: 2,
        }
    ];

    // Starting values for Functional Group Form
    const FUNC_FORM_FIELDS =
    {
        // Functional Group A Form Fields
        funcA_name: '', funcA_num: '', funcA_molar_eq: '',
        // Functional Group B Form Fields
        funcB_name: '', funcB_num: '', funcB_molar_eq: ''
    };

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

    }

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
                    {func_groups.map(({ letter, name_placeholder, num_placeholder }) =>
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
                            {func_groups.map(({ letter }) =>
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
                                <input type="text" name="func_xs" placeholder="e.g. '1.1'" id="func_xs" className="input_field float" />
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