import { typeErrorMessage, invalidErrorMessage } from "./helpers";

/**
 * 
 * @param {String} data_type - Identifies which datatype to check of three options: 'int', 'string', and 'float'
 * @param {Object} data - An object which must contain a `value` property (the value to be checked) 
 * and an `isMonomer` property which is required when checking 'float' values
 * @returns A boolean which indicates whether the data matches the expected datatype
 */
function checkDataTypes(data_type, data) {
    const { value } = data;

    switch (data_type) {
        case 'int':     // Integer Checker
            console.log("checking integer value...");
            var intAcceptable;

            if (value <= 0) {
                const int_ltz_error = invalidErrorMessage('greater than 0', 'Integer');
                console.error(int_ltz_error);
                intAcceptable = false;
            } else if (value > 0 && value % 1 === 0) {
                // The input value is a positive non-zero number that it is a whole number, therefore it is acceptable
                intAcceptable = true;
            } else {
                const int_inv_error = typeErrorMessage(data_type, typeof value, 'integer value');
                console.error(int_inv_error);
                intAcceptable = false;
            }

            return intAcceptable;

        case 'string':  // String Checker
            console.log("checking string value...");

            var nameAcceptable;
            
            if (value === "") {
                const string_bst_error = invalidErrorMessage('a non-blank string', 'Functional group name');
                console.error(string_bst_error);
                nameAcceptable = false;
            } else if (typeof value === 'string') {
                // The input value is a non-blank string, therefore it is acceptable
                nameAcceptable = true;
            } else {
                const string_inv_error = typeErrorMessage(data_type, typeof value, 'Functional group name');
                console.error(string_inv_error);
                nameAcceptable = false;
            }
            
            return nameAcceptable;

        case 'float':   // Float Checker
            console.log("checking float value...");

            const { isMonomer } = data;
            var floatAcceptable;

            if (value < 0) {
                const float_ltz_error = invalidErrorMessage('greater than 0', 'Float');
                console.error(float_ltz_error);
                floatAcceptable = false;
            } else if (value === 0 && isMonomer) {
                // If the value being checked is for a monomer, a value of 0 is acceptable
                floatAcceptable = true;
            } else if (value > 0) {
                // The input value is a positive non-zero number, therefore it is acceptable
                floatAcceptable = true;
            } else {
                const float_inv_error = typeErrorMessage(data_type, typeof value, 'float value');
                console.error(float_inv_error);
                floatAcceptable = false;
            }

            return floatAcceptable;

        default:
            // An invalid datatype was selected
            invalidErrorMessage('an integer, string, or float', data_type);
    }

    return false;
}

function checkParity(var1, var2) {
    if (var1 === var2) {
        return true;
    } else if (var1 !== var2) {
        return false;
    } else {
        console.error("There was a problem checking parity between var1: " + var1 + " and var2: " + var2);
    }
}

export { checkDataTypes, checkParity }