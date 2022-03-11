
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

function getInputValues() {
    var inputs = document.getElementsByClassName("input_field");

    let stringAcceptable = checkDataTypes("string", "input_field");
    let intAcceptable = checkDataTypes("int", "input_field");
    let floatAcceptable = checkDataTypes("float", "input_field");

    let inputsAcceptable = stringAcceptable && intAcceptable && floatAcceptable;

    if (inputsAcceptable === false) {
        console.log("inputsAcceptable: " + inputsAcceptable);
    } else {
        console.log("inputsAcceptable: " + inputsAcceptable);

        funcStats = [];
    
        for (var i = 0 ; i < 2 ; i++) {
            funcStats[i] = {
                percent_type: percentTypeChecker(),
                name: inputs[i + 2].value,
                num: parseInt(inputs[i + 4].value),
                molar_eq: parseFloat(inputs[i + 6].value),
                start: 0 + parseInt(inputs[4].value) * i,
                end: parseInt(inputs[4].value) + parseInt(inputs[5].value) * i,
                unknown: null
            }; 
        }
    
        generateForm();
    }

}

function getDynamicFormData() {

    var dynFormData = document.getElementsByClassName("dyn_input_field");

    let inputsAcceptable = checkDataTypes("float", "dyn_input_field");

    if (inputsAcceptable === false) {
        console.log("inputsAcceptable: " + inputsAcceptable);
        monomerStats = [];
    } else {
        for (var i = 0 ; i < 2 ; i++) {
            var unknownCount = [0, 0];

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

                if (mass_input.value === '' && percent_input.value === '') {
                    unknownCount[i]++;
                    funcStats[i].unknown = q;

                    if (unknownCount[i] > 1) {
                        debugger;
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
    
        if ((unknownCount[0] && unknownCount[1]) <= 1) {
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

            var i = 0;
            do {
                console.log(raw_float_data[i].value);

                if (input_class === "dyn_input_field" && raw_float_data[i].value === '') {
                    var floatAcceptable = true;
                } else if (raw_float_data[i].value <= 0) {
                    console.log("ERROR - Invalid data at checkDataTypes function (Float)\n\t*Values of 0 or blank strings are not accepted.");
                    var floatAcceptable = false;
                } else if (raw_float_data[i].value.match(/\d+/) != null) {
                    var floatAcceptable = true;
                } else {
                    var floatAcceptable = false;
                    console.log("ERROR - Invalid data at checkDataTypes function (Float)\n\t*One of your input fields may be missing a value.");
                }

                i++;

            } while (floatAcceptable === true && i < raw_float_data.length);

            return floatAcceptable;

        default:
            console.log("ERROR - Unknown datatype.");
    }

    return false;
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

