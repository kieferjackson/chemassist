
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

    let inputsAcceptable = checkDataTypes(inputs);

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

    for (var i = 0 ; i < 2 ; i++) {
        for (var q = funcStats[i].start ; q < funcStats[i].end ; q++) {
            monomerStats[q] = {
                mass: parseFloat(dynFormData[0 + q * 3].value),
                percent: parseFloat(dynFormData[1 + q * 3].value),
                molar_mass: parseFloat(dynFormData[2 + q * 3].value)
            };

            console.log(monomerStats[q]);
        }
    }

}

function checkDataTypes(inputs) {
    // String Checker
    if ((inputs[2].value || inputs[3].value) === "") {
        console.log("A valid name must be entered");
        var nameAcceptable = false;
    } else if (checkParity(inputs[2].value, inputs[3].value) === true) {
        console.log("A valid name must be entered (cannot be identical)");
        var nameAcceptable = false;
    } else if (typeof (inputs[2].value && typeof inputs[3].value) === 'string') {
        var nameAcceptable = true;
    } else {
        var nameAcceptable = false;
    }

    // Integer Checker
    if ((inputs[4].value || inputs[5].value) == 0) {
        console.log("0 is not an acceptable input for num.");
        var numAcceptable = false;
    } else if (inputs[4].value.match(/\d+/) && inputs[5].value.match(/\d+/) != null) {
        var numAcceptable = true;
    } else {
        var numAcceptable = false;
        console.log("ERROR - Invalid data at checkDataTypes function (Integer)\nOne of your input fields may be missing a value.");
    }

    // Float Checker
    if (inputs[6].value == 0 || inputs[7].value == 0) {
        console.log("0 is not an acceptable input for eq.");
        var eqAcceptable = false;
    } else if (inputs[6].value.match(/\d+/) && inputs[7].value.match(/\d+/) != null) {
        var eqAcceptable = true;
    } else {
        var eqAcceptable = false;
        console.log("ERROR - Invalid data at checkDataTypes function (Float)");
    }

    return nameAcceptable && numAcceptable && eqAcceptable;
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

