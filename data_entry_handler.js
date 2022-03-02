
class Substituent {
    constructor(percent_type, name, num, molar_eq) {
        this.percent_type = percent_type;
        this.name = name;
        this.num = num;
        this.molar_eq = molar_eq;
    }
}

class Monomer {
    constructor(mass, wpercent, mpercent, molar_mass, moles) {
        this.mass = mass;
        this.wpercent = wpercent;
        this.mpercent = mpercent;
        this.molar_mass = molar_mass;
        this.moles = moles;
    }
}

function getInputValues() {
    var inputs = document.getElementsByClassName("input_field");

    let inputsAcceptable = validate(inputs);

    let percent_type = percentTypeChecker();

    var funcStats = [];

    for (var i = 0 ; i < 2 ; i++) {
        funcStats[i] = new Substituent(percent_type, inputs[i + 2].value, parseInt(inputs[i + 4].value), parseFloat(inputs[i + 6].value));
    }

    console.log(funcStats[0]);
    console.log(funcStats[1]);

    addElement();
}

function validate(values) {
    if (typeof values[2] === 'string') {
        var nameAcceptable = true;
    } else {
        var nameAcceptable = false;
    }

    if (typeof parseInt(values[4].value) === 'number') {
        var numAcceptable = true;
    } else {
        var numAcceptable = false;
    }

    if (typeof parseFloat(values[6].value) === 'number') {
        var eqAcceptable = true;
    } else {
        var eqAcceptable = false;
    }

    return nameAcceptable && numAcceptable && eqAcceptable;
}

function percentTypeChecker() {
    if (document.getElementsByClassName("input_field")[0].checked == true) {
        return "weight";
    } else {
        return "mole";
    }
}

