import { typeErrorMessage, invalidErrorMessage } from './helpers';
import { SIG_FIG, INVALID_PLACEHOLDER } from './standards';

// All properties of monomer should be a number
const EXPECTED_TYPE = typeof Number();

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
        try {
            // Check that given value is expected data type
            if (typeof value !== expected_type) 
                throw typeErrorMessage(expected_type, typeof value, property_name);
        
            // Check that number value is a natural number (greater than or equal to 0)
            if (value < 0) 
                throw invalidErrorMessage('greater than 0', property_name);

            // Set property to given value
            this[property_name] = value;

            // Return the updated property value
            return this[property_name];
        }
        catch (error) {
            console.error(error);
        }
    }
    
    // Set Monomer properties, checking that given value is valid
    setMass = (mass_value) => this.#set_monomer_property('mass', EXPECTED_TYPE, mass_value);
    setWeightPercent = (wpercent_value) => this.#set_monomer_property('wpercent', EXPECTED_TYPE, wpercent_value);
    setMolePercent = (mpercent_value) => this.#set_monomer_property('mpercent', EXPECTED_TYPE, mpercent_value);
    setMolarMass = (molar_mass_value) => this.#set_monomer_property('molar_mass', EXPECTED_TYPE, molar_mass_value);
    setMoles = (moles_value) => this.#set_monomer_property('moles', EXPECTED_TYPE, moles_value);

    // Indicates if mass, weight percent, or moles percent have been given
    massGiven = () => this.mass > 0;
    weightPercentGiven = () => this.wpercent > 0;
    molePercentGiven = () => this.mpercent > 0;

    // Display Monomer properties
    display = (monomer_property) => {
        const property_value = this[monomer_property];

        switch (monomer_property)
        {
            case 'mass':
            case 'wpercent':
            case 'mpercent':
            case 'molar_mass':
            case 'moles':
                let format_options = {};

                if (property_value >= 1000) {
                    format_options = { notation: 'scientific', maximumSignificantDigits: SIG_FIG };
                    const formatted_molar_mass = Intl.NumberFormat('en-US', format_options).format(property_value);
                    return improveScientificNotation(formatted_molar_mass);
                }
                else if (property_value < 1000 && property_value >= 100) 
                    format_options = { maximumSignificantDigits: SIG_FIG + 2 };
                else if (property_value < 100 && property_value >= 10) 
                    format_options = { maximumSignificantDigits: SIG_FIG + 1 };
                else if (property_value < 10 && property_value >= 1) 
                    format_options = { maximumSignificantDigits: SIG_FIG };
                else if (property_value < 1) {
                    format_options = { notation: 'scientific', maximumSignificantDigits: SIG_FIG };
                    const formatted_molar_mass = Intl.NumberFormat('en-US', format_options).format(property_value);
                    return improveScientificNotation(formatted_molar_mass);
                }

                const formatted_molar_mass = Intl.NumberFormat('en-US', format_options).format(property_value);
                return formatted_molar_mass;
                
            default:
                // Invalid monomer property selected
                const invalid_monomer_property = invalidErrorMessage('a valid property.', 'Selected monomer property');
                console.error(invalid_monomer_property);
                return INVALID_PLACEHOLDER;
        }
    }
}

/**
 * @param {string} scientific_value - Value in the format '1.11E-3' for 0.00111
 * @returns 
 */
function improveScientificNotation(scientific_value)
{
    // Get notation components
    const base_ten = '&#215; 10';
    const [ coefficient, exponent ] = scientific_value.split('E'); 

    // Format the moles to display in markup
    return `${coefficient} ${base_ten}<sup>${exponent}</sup>`;
}