import { typeErrorMessage, invalidErrorMessage } from './helpers';

// All properties of monomer should be a number
const EXPECTED_TYPE = 'number';

export default class Monomer {
    constructor(mass, wpercent, mpercent, molar_mass, moles) {
        this.mass = mass;
        this.wpercent = wpercent;
        this.mpercent = mpercent;
        this.molar_mass = molar_mass;
        this.moles = moles;
    }

    // Get Monomer property
    getMass = () => this.mass;
    getWeightPercent = () => this.wpercent;
    getMolePercent = () => this.mpercent;
    getMolarMass = () => this.molar_mass;
    getMoles = () => this.moles;

    #set_monomer_property(property_name, expected_type, value)
    {
        // Check that given value is expected data type
        if (typeof value !== expected_type) 
            throw typeErrorMessage(expected_type, typeof value, property_name);
        
        // Check that number value is a natural number (greater than or equal to 0)
        if (value < 0) 
            throw invalidErrorMessage('Monomer values must be greater than or equal to 0', property_name);

        // Set property to given value
        this[property_name] = value;
    }
    
    // Set Monomer properties, checking that given value is valid
    setMass = (mass_value) => this.#set_monomer_property('mass', EXPECTED_TYPE, mass_value);
    setWeightPercent = (wpercent_value) => this.#set_monomer_property('wpercent', EXPECTED_TYPE, wpercent_value);
    setMolePercent = (mpercent_value) => this.#set_monomer_property('mpercent', EXPECTED_TYPE, mpercent_value);
    setMolarMass = (molar_mass_value) => this.#set_monomer_property('molar_mass', EXPECTED_TYPE, molar_mass_value);
    setMoles = (moles_value) => this.#set_monomer_property('moles', EXPECTED_TYPE, moles_value);
}