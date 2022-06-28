
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
    // Check that Molar EQ section has all necessary input if the option is checked
    const molar_eq_is_checked = document.getElementsByName("molar_eq_check")[0].classList[1] === 'checked';
    const molar_eq_selected = document.getElementsByClassName("selected").length === 1;

    if (molar_eq_is_checked && !molar_eq_selected) {
        console.log("You must choose a excess functional group to proceed.");
        return false;
    }

    var inputs = document.getElementsByClassName("input_field");

    let stringAcceptable = checkDataTypes("string", "input_field");
    let intAcceptable = checkDataTypes("int", "input_field");
    // If no groups are in excess, then the float should not be checked and should be considered acceptable
    let floatAcceptable;
    if (molar_eq_is_checked) {
        // Excess groups selected, therefore check float fields
        floatAcceptable = checkDataTypes("float", "input_field"); 
    } else {
        // No excess groups selected, therefore do not check float fields
        floatAcceptable = true;
    }

    let inputsAcceptable = stringAcceptable && intAcceptable && floatAcceptable;

    if (inputsAcceptable === false) {
        console.log("inputsAcceptable: " + inputsAcceptable);
    } else {
        console.log("inputsAcceptable: " + inputsAcceptable);

        // Save previously entered values
        savePreviousValues("dyn_input_field");

        // Remove the previous forms generated if they exist
        removeElement("dynamic_form", "_entry");
        removeElement("final_results", "_results");

        funcStats = [];
    
        for (var i = 0 ; i < 2 ; i++) {
            
            var molar_eq_value;

            if (molar_eq_is_checked) {
                // Define parameters for A
                const a_eq = document.getElementById("funcA_eq");
                const a_status = a_eq.className;

                // Define parameters for B
                const b_eq = document.getElementById("funcB_eq");
                const b_status = b_eq.className;

                if (a_status === 'selected' && funcID[i] === 'A') {
                    molar_eq_value = parseFloat(document.getElementById("func_xs").value);
                } else if (b_status === 'selected' && funcID[i] === 'B') {
                    molar_eq_value = parseFloat(document.getElementById("func_xs").value);
                } else {
                    molar_eq_value = 1.0;
                }
            } else {
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
    }

}

function getDynamicFormData() {

    var dynFormData = document.getElementsByClassName("dyn_input_field");

    let inputsAcceptable = checkDataTypes("float", "dyn_input_field");

    var unknownCount = [0, 0];

    if (inputsAcceptable === false) {
        console.log("inputsAcceptable: " + inputsAcceptable);
        monomerStats = [];
    } else {
        for (var i = 0 ; i < 2 ; i++) {
            
            for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {

                // Initialize monomerStats object to zero
                monomerStats[q] = {
                    mass:       0,
                    wpercent:   0,
                    mpercent:   0,
                    molar_mass: 0,
                    moles:      0
                }
                console.log(monomerStats[q].moles);

                mass_input = dynFormData[0 + q * 3];
                percent_input = dynFormData[1 + q * 3];
                molar_mass_input = dynFormData[2 + q * 3];

                // Check for unknown monomers (missing information for mass and percent)
                if (mass_input.value === '' && percent_input.value === '') {
                    unknownCount[i]++;
                    funcStats[i].unknown = q;

                    if (unknownCount[i] > 1) {
                        console.log("Your unknowns for functional group: " + funcStats[i].name + " has exceeded 1. Please enter more information for your input to be accepted.");
                    }
                }

                if (mass_input.value != '') {
                    monomerStats[q].mass = parseFloat(mass_input.value);
                    console.log("Mass for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].mass);
                }

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

                if (molar_mass_input.value != '') {
                    monomerStats[q].molar_mass = parseFloat(molar_mass_input.value);
                    console.log("Molar Mass for " + funcStats[i].name + funcStats[i].num + ": " + monomerStats[q].molar_mass);
                }
                
            }
        }
        
        if (unknownCount[0] <= 1 && unknownCount[1] <= 1) {
            startDataSorting();
        } else {
            console.log("There is not enough monomer information given for calculations to be possible.");
        }

    }

}

function checkDataTypes(data_type, input_class) {

    switch (data_type) {
        case 'int':     // Integer Checker
            console.log("checking integer values...");
            let raw_int_data = document.getElementsByClassName(input_class + " int");

            var i = 0;
            do {

                if (parseInt(raw_int_data[i].value) <= 0) {
                    console.log("Number values must be greater than 0.");
                    var intAcceptable = false;
                } else if (raw_int_data[i].value.match(/\d+/) != null) {
                    var intAcceptable = true;
                } else {
                    var intAcceptable = false;
                    console.log("ERROR - Invalid data at checkDataTypes function (Integer)\nOne of your input fields may be missing a value.");
                }

                i++;

            } while (intAcceptable === true && i < raw_int_data.length);

            return intAcceptable;

        case 'string':  // String Checker
            console.log("checking string values...");
            let raw_string_data = document.getElementsByClassName(input_class + " string");

            if ((raw_string_data[2].value || raw_string_data[3].value) === "") {
                console.log("A valid name must be entered");
                var nameAcceptable = false;
            } else if (checkParity(raw_string_data[2].value, raw_string_data[3].value) === true) {
                console.log("A valid name must be entered (cannot be identical)");
                var nameAcceptable = false;
            } else if (typeof (raw_string_data[2].value && typeof raw_string_data[3].value) === 'string') {
                var nameAcceptable = true;
            } else {
                var nameAcceptable = false;
            }

            return nameAcceptable;

        case 'float':   // Float Checker
            console.log("checking float values...");
            let raw_float_data = document.getElementsByClassName(input_class + " float");

            var floatAcceptable = true;
            
            var i = 0;
            if (raw_float_data.length > 0) while (floatAcceptable === true && i < raw_float_data.length) {
                console.log(raw_float_data[i].value);

                if (input_class === "dyn_input_field" && raw_float_data[i].value === '') {
                    floatAcceptable = true;
                } else if (raw_float_data[i].value <= 0) {
                    console.log("ERROR - Invalid data at checkDataTypes function (Float)\n\t*Values less than or equal to 0 are not accepted.");
                    floatAcceptable = false;
                } else if (raw_float_data[i].value.match(/\d+/) != null) {
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
    let field = document.getElementById(field_id);
    current_value = field.value;
    
    if (current_value === '' || current_value <= 0) {
        field.value = 1;
        
    } else if (current_value > 0) {
        switch (add_or_subtract) {
            case 'add':
                field.value++;
                
                break;
            case 'subtract':

                if (current_value > 1) {
                    field.value--;
                } else {
                    console.log("Your input will not be decremented because it is not allowed to be zero.")
                }
                
                break;
        }
    } else {
        field.value = 1;
    }
}

function toggleCheckBox(check_box_type) {
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

function createInputField(xs_func_group) {
    let field = document.createElement("input");
    field.setAttribute("type", "text");
    field.setAttribute("id", "molar_eq_input_field_" + xs_func_group);
    field.setAttribute("class", "input_field float");

    return field;
}

function savePreviousValues(element_class) {
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

function removeElement (element_class, element_type) {
    // Check if there are existing forms generated
    if (document.querySelector(`.${element_class}`).childElementCount > 0) {
        // Select any dynamic forms that were previously generated
        let form1 = document.getElementById(funcStats[0].name + element_type);
        let form2 = document.getElementById(funcStats[1].name + element_type);
        
        // Remove previous forms to generate a new one
        form1.remove();
        form2.remove();
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
    if (document.getElementsByClassName("input_field")[0].checked == true) {
        return "weight";
    } else {
        return "mole";
    }
}

