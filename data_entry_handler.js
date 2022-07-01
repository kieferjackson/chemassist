
class Monomer {
    constructor(mass, wpercent, mpercent, molar_mass, moles) {
        this.mass = mass;
        this.wpercent = wpercent;
        this.mpercent = mpercent;
        this.molar_mass = molar_mass;
        this.moles = moles;
    }
}

funcStats = [];
monomerStats = [];

funcID = ['A', 'B'];

previous_A_inputs = [];
previous_B_inputs = [];

function getInputValues() {
    /*  
     *  Set Molar EQ section options status - If excess groups is selected, then an excess group (A or B) must be selected
     *  We determine if an excess group is selected based off of the classname of the container. Only one group may be se-
     *  lected at a time.
     */ 
    let xs_A_selected = document.getElementById("funcA_eq").className === 'selected';
    let xs_B_selected = document.getElementById("funcB_eq").className === 'selected';

    const molar_eq_is_checked = document.getElementById("molar_eq_check").classList[1] === 'checked';
    const molar_eq_selected = xs_A_selected || xs_B_selected;

    if (molar_eq_is_checked && !molar_eq_selected) {
        console.log("You must choose a excess functional group to proceed.");
        return false;
    }

    // Get Initial Data Entry Form Input Fields
    var inputs = document.getElementsByClassName("input_field");

    // Validate datatypes of entered field values
    let stringAcceptable = checkDataTypes("string", "input_field");
    let intAcceptable = checkDataTypes("int", "input_field");

    // If no optional float fields are checked, then their fields should not be validated
    let floatAcceptable;
    if (molar_eq_is_checked) {
        // Excess group selected, therefore check float fields
        floatAcceptable = checkDataTypes("float", "input_field"); 
    } else {
        // No excess group selected, therefore do not check float fields
        floatAcceptable = true;
    }

    let inputsAcceptable = stringAcceptable && intAcceptable && floatAcceptable;

    if (inputsAcceptable) {
        // All necessary fields have valid input necessary for defining copolymer functional groups, therefore proceed
        console.log("inputsAcceptable: " + inputsAcceptable);

        // Save previously entered values for monomer data entry if they exist
        savePreviousValues("dyn_input_field");

        // Remove the previous monomer data entry forms generated if they exist
        removeElement("dynamic_form", "_entry", true);
        removeElement("final_results", "_results", false);

        /*  
         *  Reset funcStats which defines the various parameters of a functional group necessary for subsequent calculatio-
         *  ns and setting id/classnames for elements. For the latter reason, the functional group name must be unique for
         *  each one so that there are no repeated element ids.
         * 
         *  It is necessary to reset this array if new input is submitted to clear the previous functional group data.
         */

        funcStats = [];
    
        for (var i = 0 ; i < 2 ; i++) {
            // Initialize variable for molar equivalent value
            var molar_eq_value;

            if (molar_eq_is_checked && xs_A_selected && funcID[i] === 'A') {
                // Excess A selected and current group being defined is A, therefore set its molar excess
                molar_eq_value = parseFloat(document.getElementById("func_xs").value);

            } else if (molar_eq_is_checked && xs_B_selected && funcID[i] === 'B') {
                // Excess B selected and current group being defined is B, therefore set its molar excess
                molar_eq_value = parseFloat(document.getElementById("func_xs").value);

            } else {
                // No excess group selected or current group being defined is not the chosen group in excess
                molar_eq_value = 1.0;

            }

            funcStats[i] = {
                percent_type: percentTypeChecker(),
                name: inputs[2 + (2 * i)].value,
                num: parseInt(inputs[3 + (2 * i)].value),
                molar_eq: molar_eq_value,
                start: 0 + parseInt(inputs[3].value) * i,
                end: parseInt(inputs[3].value) + parseInt(inputs[5].value) * i,
                unknown: null
            }; 
            console.log(funcStats[i]);
        }

        // Create the form and append to the page
        generateForm();
        
    } else {
        // One or more fields contained invalid inputs, therefore reject submission request
        console.log("inputsAcceptable: " + inputsAcceptable);
        
    }

}

function getDynamicFormData() {
    // Get Monomer Data Entry Form Input Fields
    var dynFormData = document.getElementsByClassName("dyn_input_field");

    // Only float values or blank strings are acceptable for the monomer fields, so do not check for integer/string values
    let inputsAcceptable = checkDataTypes("float", "dyn_input_field");

    /*  Initialize number of unknowns for both functional groups, their number of unknowns are defined as the number of co-
     *  monomers in a functional group where neither mass nor their chosen percent value are known. There can only be up to
     *  one unknown for a single functional group, regardless if they are the reference or complimentary group.
     */

    var unknownCount = [0, 0];

    if (inputsAcceptable) {

        // Monomer inputs valid, loop through the two functional groups to set their monomer values
        for (var i = 0 ; i < 2 ; i++) {

            // Loop through each comonomer in each functional group to set their inputted value
            for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {

                // Initialize monomerStats object values to zero
                monomerStats[q] = {
                    mass:       0,
                    wpercent:   0,
                    mpercent:   0,
                    molar_mass: 0,
                    moles:      0
                }

                // Set current comonomer input fields for mass, chosen percent, and molar mass
                mass_input = dynFormData[0 + q * 3];
                percent_input = dynFormData[1 + q * 3];
                molar_mass_input = dynFormData[2 + q * 3];

                // Check for unknown monomers (missing information for mass and percent)
                if (mass_input.value === '' && percent_input.value === '') {
                    unknownCount[i]++;
                    // An unknown has been found for the group currently being assigned, and its index has been saved for future reference
                    funcStats[i].unknown = q;

                    if (unknownCount[i] > 1) {
                        // Unknown count cannot exceed 1 for either functional group
                        console.log("Your unknowns for functional group: " + funcStats[i].name + " has exceeded 1. Please enter more information for your input to be accepted.");
                        inputsAcceptable = false;
                    }
                }

                // Set entered mass for current comonomer
                if (mass_input.value != '') {
                    monomerStats[q].mass = parseFloat(mass_input.value);
                    console.log("Mass for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].mass);
                }

                // Set chosen percent for current comonomer
                if (percent_input.value != '') {
                    switch (funcStats[i].percent_type) {
                        case 'weight':
                            monomerStats[q].wpercent = parseFloat(percent_input.value);
                            console.log("Wt Percent for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].wpercent);
                            break;

                        case 'mole':
                            monomerStats[q].mpercent = parseFloat(percent_input.value);
                            console.log("Ml Percent for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].mpercent);
                            break;
                    }
                }

                // Set entered molar mass for current comonomer, reject user input if molar mass field is blank
                if (molar_mass_input.value != '') {
                    monomerStats[q].molar_mass = parseFloat(molar_mass_input.value);
                    console.log("Molar Mass for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].molar_mass);
                } else {
                    // Molar mass must be known for all comonomers for calculations to be possible
                    console.log(`No molar mass entered for ${funcStats[i].name} ${(q - funcStats[i].start) + 1}`);
                    inputsAcceptable = false;
                }
                
            }
        }
        
        if (inputsAcceptable) {
            /* 
             *  Initial data analysis indicates that there are no obvious issues with the given values. 
             *  Further analysis is required to determine whether or not calculations are possible.
             *  
             *  Data Sorting counts up the number of known values for mass and percent for each functional
             *  group. In addition, it will determine whether or not the 'Zipper' or 'Tetris' routes have
             *  adequate information given for their calculation routes to be possible.
             * 
             */
            startDataSorting();
        } else {
            console.log("There is not enough monomer information given for calculations to be possible.");
        }

    } else {
        // One or more fields contained invalid inputs, therefore reject submission request and reset monomerStats array
        console.log("inputsAcceptable: " + inputsAcceptable);
        monomerStats = [];
    }

}

function checkDataTypes(data_type, input_class) {
    /*  
     *  Since JavaScript cannot adequately check datatypes for variables, particularly for integer values. This function
     *  is designed to accept parameters for the data type being analysed in addition to the input field class which specifies
     *  which fields are being analysed.  
     * 
     *  Field elements have two classes: '*_input_field' and '[data type]'. 
     *      The former is to select which form fields are selected
     *      with either the initial data entry fields ('input_field') or the monomer entry fields ('dyn_input_fields'). 
     *      
     *      The latter is to further specify which fields are selected based on their accepted data types and also
     *      allow for the branching within this function.
     * 
     */

    let raw_field_data = document.getElementsByClassName(`${input_class} ${data_type}`);

    switch (data_type) {
        case 'int':     // Integer Checker
            console.log("checking integer values...");

            var i = 0;

            do {

                if (parseInt(raw_field_data[i].value) <= 0) {
                    console.log("Number values must be greater than 0.");
                    var intAcceptable = false;
                } else if (raw_field_data[i].value.match(/\d+/) != null && raw_field_data[i].value % 1 === 0) {
                    // The input value is a positive non-zero number that it is a whole number, therefore it is acceptable
                    var intAcceptable = true;
                } else {
                    var intAcceptable = false;
                    console.log("ERROR - Invalid data at checkDataTypes function (Integer)\nOne of your input fields may be missing a value.");
                }

                i++;

            } while (intAcceptable === true && i < raw_field_data.length);

            return intAcceptable;

        case 'string':  // String Checker
            console.log("checking string values...");

            var nameAcceptable = true;
            
            var i = 0;
            const func_A_name = raw_field_data[0].value;
            const func_B_name = raw_field_data[1].value;
            
            if (raw_field_data.length > 0) while (nameAcceptable && i < raw_field_data.length) {
                if (raw_field_data[i].value === "") {
                    console.log("A valid name must be entered");
                    nameAcceptable = false;
                } else if (checkParity(func_A_name, func_B_name) === true) {
                    console.log("A valid name must be entered (cannot be identical)");
                    nameAcceptable = false;
                } else if (typeof raw_field_data[i].value === 'string') {
                    nameAcceptable = true;
                } else {
                    nameAcceptable = false;
                }

                i++;

            }
            
            return nameAcceptable;

        case 'float':   // Float Checker
            console.log("checking float values...");

            var floatAcceptable = true;
            
            var i = 0;

            if (raw_field_data.length > 0) while (floatAcceptable && i < raw_field_data.length) {
                console.log(raw_field_data[i].value);

                if (input_class === "dyn_input_field" && raw_field_data[i].value === '') {
                    // This is an exception case for the monomer data entry, where empty fields are acceptable
                    floatAcceptable = true;
                } else if (raw_field_data[i].value <= 0) {
                    console.log("ERROR - Invalid data at checkDataTypes function (Float)\n\t*Values less than or equal to 0 are not accepted.");
                    floatAcceptable = false;
                } else if (raw_field_data[i].value.match(/\d+/) != null) {
                    // The input value is a positive non-zero number, therefore it is acceptable
                    floatAcceptable = true;
                } else {
                    floatAcceptable = false;
                    console.log("ERROR - Invalid data at checkDataTypes function (Float)\n\t*One of your input fields may be missing a value.");
                }
                
                i++;

            }

            return floatAcceptable;

        default:
            console.log("ERROR - Unknown datatype.");
    }

    return false;
}

function add_subtractField (field_id, add_or_subtract) {
   /*  
    *  This function increments or decrements an input field specified by its id attribute by clicking on the plus or minus buttons.
    *  It gets whatever the current value entered into a field is and will perform various actions on it based off the content entered.
    * 
    *  Blank fields or values less than or equal to 0 are not accepted, so any field that calls this function with those values
    *  entered will be changed to 1. The same is true also for fields which contains string values.
    *  Furthermore, decrementing a field value of 1 is not permitted, and the value will stay at 1 as such.
    * 
    *  If a decimal number is entered such as 2.3, then incrementing will floor the value to 2, then increment it to 3. 
    *  Conversely, decrementing 2.3 would floor it to 2, then decrement it to 1.
    *  A special case for decrementing is present for values between 1 and 2, where a value like 1.4 is simply set to 1.
    * 
    */

    let field = document.getElementById(field_id);
    let current_value = field.value;
    
    if (current_value === '' || current_value <= 0) {
        field.value = 1;
        
    } else if (current_value > 0) {
        switch (add_or_subtract) {
            case 'add':
                if (current_value % 1 === 0) {
                    // The current value is a whole number, increment it
                    field.value++;
                } else {
                    // The current value is a decimal number, floor and then increment it
                    field.value = Math.floor(field.value);
                    field.value++;
                }
                
                break;
            case 'subtract':
                if (current_value > 1 && current_value % 1 === 0) {
                    // The current value is a sufficiently large whole number, decrement it
                    field.value--;
                } else if (current_value > 2 && current_value % 1 !== 0) {
                    // The current value is a sufficiently large decimal number, floor and then decrement it
                    field.value = Math.floor(field.value);
                    field.value--;
                } else if (current_value > 1 && current_value < 2 && current_value % 1 !== 0) {
                    // The current value is a decimal number between 1 and 2, set it to 1
                    field.value = 1;
                } else {
                    console.log("Your input will not be decremented because it is not allowed to be zero.")
                }
                
                break;
        }
    } else {
        // If there is an unexpected value in the field, set it to 1
        field.value = 1;
    }
}

function toggleCheckBox(check_box_type) {
   /*  
    *  The parameter for this function specifies the check box being toggled based off of its id attribute.
    *  Its id is used to branch the function depending on the checkbox being toggled to allow for multiple
    *  checkboxes which can change their respective section states.
    * 
    *  By nature, these checkboxes are used for optional fields, and so when unselected, those fields and
    *  their associated elements (buttons, labels, etc) are hidden. Conversely, when selected, those fields
    *  become visible. Both of these states (hidden and visible) are controlled by changing their container
    *  class.
    * 
    */

    switch(check_box_type) {
        case 'molar_eq':
            // Selecting Check Box and Molar EQ Sections
            const check_box = document.getElementsByName("molar_eq_check")[0];
            const molar_eq_section = document.getElementById("molar_eq_container");

            // Saving and Resetting Current State of Check Box
            const current_state = check_box.classList[1];
            check_box.classList.remove(current_state);

            switch(current_state) {
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
            }

    }
}

function toggleMolarEQ(xs_func_group) {
    /*
     *  Controls the state of the molar equivalents functional group buttons with the parameter specifying
     *  which group is being toggled on or off.
     * 
     *  By default, these buttons are unselected, however toggling their state activates whichever group is 
     *  selected. If a user selects an already selected group, then the buttons go back to their default state
     *  with neither being selected.
     * 
     */

    console.log(xs_func_group);

    // Define parameters for A
    const a_eq = document.getElementById("funcA_eq");
    const a_status = a_eq.className;

    // Define parameters for B
    const b_eq = document.getElementById("funcB_eq");
    const b_status = b_eq.className;

    switch (xs_func_group) {
        case 'A':
            //Toggle off B
            b_eq.className = 'unselected';

            switch (a_status) {
                case 'unselected':
                    // Toggle off Molar EQ for B
                    a_eq.className = 'selected';
                    break;

                case 'selected':
                    // Toggle off Molar EQ for A
                    a_eq.className = 'unselected';
                    break;
            }
            
            break;

        case 'B':
            //Toggle off A
            a_eq.className = 'unselected';
            
            switch (b_status) {
                case 'unselected':
                    // Toggle off Molar EQ for B
                    b_eq.className = 'selected';
                    break;

                case 'selected':
                    // Toggle off Molar EQ for B
                    b_eq.className = 'unselected';
                    break;
            }

            break;
    }
    
}

function savePreviousValues(element_class) {
   /*
    *  All of the values in the selected input fields for both functional group forms
    *  will be saved in two global arrays: previous_A_inputs and previous_B_inputs.
    * 
    *  The 'element_class' parameter selects the specific form fields whose field values will be saved.
    * 
    */

    if (document.querySelectorAll(`.${element_class}`).length > 0) {
        // Clear previous inputs
        previous_A_inputs = [];
        previous_B_inputs = [];

        // Select any dynamic forms that were previously generated
        A_fields = document.getElementsByName(`${funcStats[0].name}_entry`)[0];
        B_fields = document.getElementsByName(`${funcStats[1].name}_entry`)[0];

        // Get current values for A form
        for (var i = 0 ; i < A_fields.length ; i++) {
            previous_A_inputs[i] = A_fields[i].value;
        }

        // Get current values for B form
        for (var i = 0 ; i < B_fields.length ; i++) {
            previous_B_inputs[i] = B_fields[i].value;
        }
    }
}

function removeElement (element_class, element_type, isForm) {
   /*  
    *  For elements related to functional groups (monomer data entry forms, final results), they must be removed if new values
    *  are submitted. 
    * 
    *  The 'element_class' parameter specifies which container's elements need to be removed.
    *  The 'element_type' parameter gives the element's subcontainer id.
    *      -the subcontainer holds all of the fields/results for each functional group, as such there are two.
    *  The 'isForm' parameter is a boolean value given when the function is called. It is necessary to distinguish between
    *      the final results and monomer data entry, because the latter must generate a submit button which is removed when 
    *      a new form is generated.
    * 
    */

    // Check if there are existing elements generated
    if (document.querySelector(`.${element_class}`).childElementCount > 0) {
        // Select any dynamic elements that were previously generated
        let element1 = document.getElementById(funcStats[0].name + element_type);
        let element2 = document.getElementById(funcStats[1].name + element_type);
        
        // Remove previous forms to generate a new one
        element1.remove();
        element2.remove();
        
        // Select dynamically generated submit button container and its children
        if (isForm) {
            submit = document.getElementById("monomer_submit_container");
            submit.remove();
        }
    }
}

function checkParity(var1, var2) {
    if (var1 === var2) {
        return true;
    } else if (var1 != var2) {
        return false;
    } else {
        console.log("There was a problem checking parity between var1: " + var1 + " and var2: " + var2);
    }
}

function percentTypeChecker() {
    // Look at the radio button option for weight percent and determine whether or not it is checked
    wt_percent_checked = document.getElementById("wpercent").checked;

    if (wt_percent_checked) {
        // Weight percent was selected, so the percent type is 'weight'
        return "weight";
    } else {
        // Mole percent was selected, so the percent type is 'mole''
        return "mole";
    }
}

