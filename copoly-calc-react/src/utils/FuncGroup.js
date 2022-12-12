
export default class FuncGroup {
    constructor(percent_type, name, num, molar_eq, monomers, unknown = null) {
        this.percent_type = percent_type;
        this.name = name;
        this.num = num;
        this.molar_eq = molar_eq;
        this.monomers = monomers;
        this.unknown = unknown;
    }
}