import { typeErrorMessage, invalidErrorMessage } from "./helpers";

/**
 * 
 * @param {string} data_type - Identifies which datatype to check of three options: 'int', 'string', and 'float'
 * @param {object} data - An object which must contain a `value` property (the value to be checked) 
 * and an `isMonomer` property which is required when checking 'float' values
 * @returns A boolean which indicates whether the data matches the expected datatype
 */
function checkDataTypes(data_type, data) {
    const { value } = data;

    switch (data_type) {
        case 'index':
            console.log("checking index value...");
            var indexAcceptable;

            const { value: index, index_end } = data;
            const index_isInteger = index % 1 === 0 && index >= 0;
            const index_inBounds = index <= index_end

            if (index_isInteger && index_inBounds) {
                // The input value is a positive, whole number within the set bounds, therefore it is acceptable
                indexAcceptable = true;
            }
            else if (!index_isInteger && index_inBounds) {
                const index_ltz_error = invalidErrorMessage('greater than or equal to 0', 'Index');
                console.error(index_ltz_error);
                indexAcceptable = false;
            }
            else if (index_isInteger && !index_inBounds) {
                const index_bnd_error = invalidErrorMessage(`within bounds of array (0-${index_end})`, 'Index');
                console.error(index_bnd_error);
                indexAcceptable = false;
            }
            else {
                const index_error = Error(`Index must be a valid index value and within bounds of array (0-${index_end})`);
                console.error(index_error);
                indexAcceptable = false;
            }

            return indexAcceptable;

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

function compareFloatValues(reference_value, comparison_value, error_tolerance)
{
    // Check that reference and compare values are floats
    const referenceIsFloat = checkDataTypes('float', { value: reference_value });
    const comparisonIsFloat = checkDataTypes('float', { value: comparison_value });
    const toleranceIsFloat = checkDataTypes('float', { value: error_tolerance });

    if (toleranceIsFloat) {
        if (referenceIsFloat && comparisonIsFloat) {
            // Compare values to see if they are close to each other within bounds of error tolerance
            const withinLowerBounds = comparison_value > (reference_value - error_tolerance);
            const withinUpperBounds = comparison_value < (reference_value + error_tolerance);
    
            return withinLowerBounds && withinUpperBounds;
        }
        else if (!referenceIsFloat && comparisonIsFloat) {
            // Reference value given was not a float value
            console.error(typeErrorMessage('float', typeof reference_value, 'reference value'));
    
            return false;
        }
        else if (referenceIsFloat && !comparisonIsFloat) {
            // Comparison value given was not a float value
            console.error(typeErrorMessage('float', typeof comparison_value, 'comparison value'));
    
            return false;
        }
        else {
            // Neither values given were a float value
            console.error(typeErrorMessage('float', typeof reference_value, 'reference value'));
            console.error(typeErrorMessage('float', typeof comparison_value, 'comparison value'));
    
            return false;
        }
    }
    else {
        // A non float error tolerance value was given
        console.error(typeErrorMessage('float', typeof error_tolerance, 'error tolerance'));
    
        return false;
    }
}

export { checkDataTypes, checkParity, compareFloatValues }