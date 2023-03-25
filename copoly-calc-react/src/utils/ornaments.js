import { INVALID_PLACEHOLDER } from "./standards";

export function capitalizeFirstLetter (string_value) 
{
    try {
        if (string_value.length > 1) {
            return string_value.charAt(0).toUpperCase() + string_value.slice(1);
        } else if (string_value.length === 1) {
            return string_value.charAt(0).toUpperCase();
        } else {
            console.log(`Your input value of (${string_value}) is not a string datatype. Its return value will be converted to a string.`);
            return String(string_value);
        }
    }
    catch (error) {
        console.error(error);
        return INVALID_PLACEHOLDER;
    }
}
