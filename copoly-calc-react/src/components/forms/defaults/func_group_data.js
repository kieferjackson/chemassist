
export const DEFAULT_FUNC_GROUP_DATA =
[
    // Functional Group A
    {
        letter: 'A',
        name_placeholder: 'diester',
        num_placeholder: 1,
    },
    // Functional Group B
    {
        letter: 'B',
        name_placeholder: 'diol',
        num_placeholder: 2,
    }
];

export const REQUIRED_FUNC_FIELDS = 
{
    // Functional Group A Form Fields
    funcA_name: true, funcA_num: true,
    // Functional Group B Form Fields
    funcB_name: true, funcB_num: true, 
    // Unique Form fields
    func_xs: false, xsGroup: false, isExcessEQ: false
}