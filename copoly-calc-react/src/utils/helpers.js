
/**
 * @param {String} expected_type - Expected datatype name
 * @param {String} received_type - Received datatype name
 * @param {String} value_name - Name of incorrectly set field
 * @returns `TypeError` object with an automatically set error message using the function parameters
 */
const typeErrorMessage = (expected_type, received_type, value_name) => new TypeError(`Expected (${expected_type}) for ${value_name}, received (${received_type})`);

/**
 * @param {String} condition_failed - A description of the failed condition
 * @param {String} value_name - Name of incorrectly set field
 * @returns `Error` object with an automatically set error message using the function parameters
 */
const invalidErrorMessage = (condition_failed, value_name) => new Error(`(${value_name}) must be "${condition_failed}"`);

export { typeErrorMessage, invalidErrorMessage }