import { typeErrorMessage, invalidErrorMessage } from './helpers';
import { checkDataTypes } from './validators';

export default class FuncGroup {
    constructor(percent_type, name, num, molar_eq, monomers, unknown = null) {
        this.percent_type = percent_type;
        this.name = name;
        this.num = num;
        this.molar_eq = molar_eq;
        this.monomers = monomers;
        this.unknown = unknown;
    }

    // Get Functional Group property
    getPercentType = () => this.percent_type;
    getName = () => this.name;
    getNum = () => this.num;
    getMolarEQ = () => this.molar_eq;
    getMonomers = () => this.monomers;
    getUnknown = () => this.unknown;

    #set_func_property(property_name, expected_type, value)
    {
        // Check that given value is expected data type
        if (typeof value !== expected_type) 
            throw typeErrorMessage(expected_type, typeof value, property_name);
        
        switch (property_name)
        {
            case 'monomers':
                // Check that there is at least 1 monomer
                if (this[property_name].length <= 0) 
                    throw invalidErrorMessage('Functional groups must have at least 1 monomer', property_name);
                break;
            case 'unknown':
                // Check that the value being set for unknown is an integer value
                const unknown_isInteger = checkDataTypes('int', value);
                if (!unknown_isInteger)
                    throw invalidErrorMessage('A functional group unknown must be an index value of type integer', value);

                // Check that index value given is within bounds of the monomers and greater than 0
                const unknown_isIndex = value < this.num && value >= 0;
                if (!unknown_isIndex)
                    throw invalidErrorMessage('Unknown value must be within bounds of functional group', property_name);
                
                break;
            default:
                throw Error(`Invalid functional group property. Cannot update (${property_name})`);
        }

        // Set property to given value
        this[property_name] = value;
    }
    
    // Set Monomer properties, checking that given value is valid
    setMonomers = (monomers) => this.#set_func_property('monomers', 'Array', monomers);
    setUnknown = (unknown_monomer_index) => this.#set_func_property('unknown', 'number', unknown_monomer_index);
}