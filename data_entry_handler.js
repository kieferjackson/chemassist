
class Substituent {
    constructor(percent_type, name, num, molar_eq) {
        this.percent_type = percent_type;
        this.name = name;
        this.num = num;
        this.molar_eq = molar_eq;
        this.start = start;
        this.end = end;
    }
}

class Monomer extends Substituent {
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
                end: parseInt(inputs[4].value) + parseInt(inputs[5].value) * i
            }; 
        }
    
        console.log(funcStats[0]);
        console.log(funcStats[1]);
    
        generateForm();
    }

}

function getDynamicFormData() {

    var dynFormData = document.getElementsByClassName("dyn_input_field");
    console.log(dynFormData);

    let inputsAcceptable = checkDataTypes("float", "dyn_input_field");

    if (inputsAcceptable === false) {
        console.log("inputsAcceptable: " + inputsAcceptable);
        monomerStats = [];
    } else {
        for (var i = 0 ; i < 2 ; i++) {
            for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {

                // Initialize monomerStats object
                monomerStats[q] = {
                    mass: 0,
                    percent: 0,
                    molar_mass: 0
                };

                if (dynFormData[0 + q * 3].value != '') {
                    monomerStats[q].mass = parseFloat(dynFormData[0 + q * 3].value);
                }

                if (dynFormData[1 + q * 3].value != '') {
                    monomerStats[q].percent = parseFloat(dynFormData[1 + q * 3].value);
                }

                if (dynFormData[2 + q * 3].value != '') {
                    monomerStats[q].molar_mass = parseFloat(dynFormData[2 + q * 3].value);
                }
                
            }
        }

        console.log(monomerStats);
    
        startDataSorting();

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

