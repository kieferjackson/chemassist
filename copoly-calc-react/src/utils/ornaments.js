import { SIG_FIG } from './standards';

export function capitalizeFirstLetter (string_value) {
    if (string_value.length > 1) {
        return string_value.charAt(0).toUpperCase() + string_value.slice(1);
    } else if (string_value.length === 1) {
        return string_value.charAt(0).toUpperCase();
    } else {
        console.log(`Your input value of (${string_value}) is not a string datatype. Its return value will be converted to a string.`);
        return String(string_value);
    }
}

export function convertToScientificNotation (real_number) {
    let it_num = String(real_number);
    var exp_count = -1;
    
    for (var i = 2 ; i < it_num.length ; i++) {
        // Count the number of decimal places before the first significant figures
        while (it_num[i] === 0 && i < it_num.length) {
            exp_count--;
            i++;
        }

        if (it_num[i] !== 0) {
            // Initialize scientific notation value
            var sn_number = '';
            for (var q = i ; q < SIG_FIG + i ; q++) {
                if (it_num[q] !== undefined) {
                    sn_number += it_num[q];
                }

                // Add a decimal point ONLY if it is the first iteration of the loop and the next digit is defined
                if (q === i && it_num[q + 1] !== undefined) {
                    sn_number += '.';
                } else if (q === i && it_num[q + 1] === undefined) {
                    // Terminate the number with '.0' if the current digit is undefined
                    sn_number += '.0';
                }
            }

            return `${sn_number} &#215; 10<sup>${exp_count}</sup>`;
        }
    }
}
