import React from 'react';

export default function FuncGroupForm()
{
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
                    <h1>Functional Group A</h1>
                    <div className="input_block">
                        <label>
                            Substituent Name
                            <input type="text" name="funcA_name" placeholder="e.g. 'diester'" id="funcA_name" className="input_field string" />
                        </label>
                    </div>
                    <br />
                    <div className="input_block">
                        <label>
                            Number of Comonomers
                            <input type="text" name="funcA_num" placeholder="e.g. '1'" id="funcA_num" className="input_field int" />
                        </label>
                        <button 
                            type="button" name="minus" 
                            onClick="add_subtractField('funcA_num', 'subtract')" 
                            className="square_button plus_minus" tabIndex="-1"
                        >
                            <div>-</div>
                        </button>
                        <button 
                            type="button" name="plus" 
                            onClick="add_subtractField('funcA_num', 'add')" 
                            className="square_button plus_minus" tabIndex="-1"
                        >
                            <div>+</div>
                        </button>
                    </div>
                    
                    <br />
                    <h1>Functional Group B</h1>
                    <div className="input_block">
                        <label>
                            Substituent Name
                            <input type="text" name="funcB_name" placeholder="e.g. 'diol'" id="funcB_name" className="input_field string" />
                        </label>
                    </div>
                    <br />
                    <div className="input_block">
                        <label>
                            Number of Comonomers
                            <input type="text" name="funcB_num" placeholder="e.g. '2'" id="funcB_num" className="input_field int" />
                        </label>
                        <button 
                            type="button" name="minus" 
                            onClick="add_subtractField('funcB_num', 'subtract')" 
                            className="square_button plus_minus" tabIndex="-1"
                        >
                            <div>-</div>
                        </button>
                        <button 
                            type="button" name="plus" 
                            onClick="add_subtractField('funcB_num', 'add')" 
                            className="square_button plus_minus" tabIndex="-1"
                        >
                            <div>+</div>
                        </button>
                    </div>
                </section>
                <br />
                <section className="optional">
                    <div className="input_block">
                        <label>
                            Is either group in excess?
                            <button 
                                type="button" name="molar_eq_check" 
                                id="molar_eq_check"
                                onClick="toggleCheckBox('molar_eq')" 
                                className="check_box unchecked" tabIndex="-1"
                            ></button>
                        </label>
                    </div>
                    <br />
                    <div id="molar_eq_container" className="hidden">
                        <div className="input_block">
                            <div className="unselected" id="funcA_eq">
                                <button type="button" name="xs_A" onClick="toggleMolarEQ('A')" className="square_button inactive_button">A</button>
                            </div>
                            <div className="unselected" id="funcB_eq">
                                <button type="button" name="xs_B" onClick="toggleMolarEQ('B')" className="square_button inactive_button">B</button>
                            </div>
                            <label>
                                Molar Equivalents
                                <input type="text" name="func_xs" placeholder="e.g. '1.1'" id="func_xs" className="input_field float" />
                            </label>
                        </div>
                    </div>
                </section>
                
                <div className="submit_container">
                    <button type="button" onClick="getInputValues()" id="initial_submit" className="submit_button">Next</button>
                </div>
            </form>
        </div>
    );
}