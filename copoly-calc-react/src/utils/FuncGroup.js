import { typeErrorMessage, invalidErrorMessage } from './helpers';
import { checkDataTypes } from './validators';

const startingMonomerStatCount = {
    mass:         0,    // Total number of masses given
    percent:      0,    // Total number of percents given
    determined:   0,    // Total number of comonomers with both mass and percent given
    partial:      0     // Total number of comonomers with only either mass or percent given
}

export default class FuncGroup {
    constructor(percent_type, name, num, molar_eq, monomers, unknown = null) {
        this.percent_type = percent_type;
        this.name = name;
        this.num = num;
        this.molar_eq = molar_eq;
        this.monomers = monomers;
        this.isReference = false;
        this.unknown = unknown;
        this.monomerStatCount = { ...startingMonomerStatCount };
    }

    // Indicates whether this functional group is the reference (true) or complimentary group (false). Necessary for calculations
    setIsReference = (reference_state = true) => {
        this.isReference = reference_state;
        return this.isReference;
    }

    // Indicates whether or not this functional group has an unknown monomer (no mass or percent given)
    hasUnknown = () => this.unknown !== null;

    #increment_monomer_stat_count = (monomer_stat) => {
        this.monomerStatCount[monomer_stat]++;
    }

    determineMonomerStatCount = () => {
        // Reset previous stat counts back to 0
        this.monomerStatCount = { ...startingMonomerStatCount };

        this.monomers.forEach((monomer) => {
            const massGiven = monomer.massGiven();
            const percentGiven = monomer.weightPercentGiven() || monomer.molePercentGiven();

            if (massGiven) {
                this.#increment_monomer_stat_count('mass');
            }

            if (percentGiven) {
                this.#increment_monomer_stat_count('percent');
            }
                
            if (massGiven && percentGiven) {
                this.#increment_monomer_stat_count('determined');
            }

            // For groups with more than 1 comonomer, increment Partial Count if Mass is given and Percent is not given, and vice-versa
            if (this.num > 1) {
                const partial_info_given = (massGiven && !percentGiven) || (!massGiven && percentGiven);
                
                if (partial_info_given)
                    this.#increment_monomer_stat_count('partial');
            }
        });

        return this.monomerStatCount;
    }

    findRefMonomer = () => {
        let i = 0;
        let refMonomerFound = false;

        // Loop through monomers array until the first monomer with mass and percent value known is found
        while (i < this.monomers.length && !refMonomerFound)
        {
            const monomer = this.monomers[i];
            refMonomerFound = monomer.massGiven() && (monomer.weightPercentGiven() || monomer.molePercentGiven());

            // Go to the next monomer if no reference monomer was found
            if (!refMonomerFound) i++;
        }

        if (refMonomerFound) {
            const referenceMonomer = this.monomers[i];
            return referenceMonomer;
        }
        else {
            // No reference monomer could be found for this group
            console.error(Error(`No reference monomer could be found for the ${this.name} functional group.`));
            return false;
        }
    }

    sumMonomerStat = (monomer_stat) => {
        const sumValue = this.monomers.reduce((statSum, monomer) => {
            const statValue = monomer[monomer_stat];
            
            if (statValue !== undefined) {
                // Add this value to the stat sum
                statSum += statValue;
                return statSum;
            }
            else {
                // Invalid monomer stat selected
                console.error(Error(`Cannot sum ${monomer_stat}`));
                return 0;
            }
        }, 0);

        return sumValue;
    }

    // Get Functional Group property
    getPercentType = () => this.percent_type;
    getName = () => this.name;
    getNum = () => this.num;
    getMolarEQ = () => this.molar_eq;
    getMonomers = () => this.monomers;
    getIsReference = () => this.isReference;
    getUnknown = () => this.monomers[this.unknown];
    getMonomerStatCount = (stat_name = null) => {
        switch (stat_name)
        {
            case null:
                // Return the whole stat count object if stat name is `null`
                return this.monomerStatCount;
            case 'mass':
            case 'percent':
            case 'determined':
            case 'partial':
                // Return the selected stat count
                return this.monomerStatCount[stat_name];
            default:
                // Invalid stat name selected
                console.error(Error(`'${stat_name}' is not a valid monomerStatCount property selected`));
                return 0;
        }
    }

    #set_func_property(property_name, expected_type, value)
    {
        // Check that given value is expected data type
        if (property_name === 'monomers')
        {
            const monomersIsArray = value instanceof Array;

            if (!monomersIsArray)
                throw typeErrorMessage(expected_type, typeof value, property_name);
        }
        else if (typeof value !== expected_type) 
            throw typeErrorMessage(expected_type, typeof value, property_name);
        
        switch (property_name)
        {
            case 'monomers':
                const numMonomersGiven = value.length;

                // Check that there is at least 1 monomer
                if (numMonomersGiven <= 0) 
                    throw invalidErrorMessage('Functional groups must have at least 1 monomer', property_name);

                // Check that the number of monomers given is equivalent to the num expected
                if (numMonomersGiven !== this.num)
                    throw invalidErrorMessage(`equivalent to the number of comonomers provided for ${this.name} functional group (${this.num})\nInvalid value given: ${value}`, property_name);

                break;
            case 'unknown':
                // Check that the value being set for unknown is an integer value
                const unknown_isInteger = checkDataTypes('int', { value });
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

    // Clears Monomer values given, so that new monomers can be easily entered
    clearMonomers = () => {
        // Manually set `monomers` array to empty list
        this.monomers = [];
        
        // Return the empty monomer array
        return this.monomers;
    }
}