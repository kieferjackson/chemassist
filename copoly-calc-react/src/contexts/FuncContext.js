import React, { useContext, useReducer } from 'react';
import { UPDATE_FUNC, INITIALIZE_MONOMERS, UPDATE_MONOMERS } from './actions';
import { FUNC_FORM, MONOMER_FORM, FINAL_RESULTS } from './page_names';
// Import Functional Group Starting Fields
import { FUNC_FORM_FIELDS } from './field_defaults/func_group_data';

const FuncContext = React.createContext(null);
const FuncDispatchContext = React.createContext(null);

export const useFuncGroups = () => useContext(FuncContext);
export const useFuncDispatch = () => useContext(FuncDispatchContext);

function formReducer(formData, { formType, formField, value })
{
    switch (formType)
    {
        case FUNC_FORM:
            const updatedFuncData = { ...formData.funcGroupsForm, [formField]: value };
            return { ...formData, funcGroupsForm: updatedFuncData };

        case INITIALIZE_MONOMERS:
            const { monomersForm } = formData;

            if (monomersForm === undefined) {
                // This is the first time the monomersForm has been initialized
                formData.monomersForm = value;
                return formData;
            }
            else {
                const { monomersForm: prevMonomersForm } = formData;
                
                // Iterate previous fields over given value for new monomer form fields
                for (let prevField in prevMonomersForm)
                {
                    const prevFieldValue = prevMonomersForm[prevField];
                    // Check if the previous field appears in the new one, and set it to the previous value if so
                    if (value[prevField] !== undefined)
                        value[prevField] = prevFieldValue;
                }

                return { ...formData, monomersForm: value };
            }

        case MONOMER_FORM:
            const updatedMonomerData = { ...formData.monomersForm, [formField]: value };
            return { ...formData, monomersForm: updatedMonomerData };

        default:
            throw Error('Invalid form type: ', formType);
    }
}

function funcReducer(funcData, { type, funcGroups })
{
    switch (type)
    {
        case UPDATE_FUNC:
            return funcGroups;
        
        case UPDATE_MONOMERS:
            const { monomers } = funcGroups;
            
            const [funcA, funcB ] = funcData;
            const [ monomersA, monomersB ] = monomers;
            
            // Add the monomers to functional groups A and B
            funcA.setMonomers(monomersA);
            funcB.setMonomers(monomersB);
            
            return [funcA, funcB];

        default:
            throw Error('Invalid action: ', type);
    }
}

function pageReducer(current_page, { page })
{
    // Only switch page if the selected page does not match the current page
    if (current_page !== page)
    {
       switch (page)
        {
            case FUNC_FORM:
            case MONOMER_FORM:
            case FINAL_RESULTS:
                return page;
            default:
                throw Error('Invalid page: ', page);
        } 
    }
    
    return current_page;
}

const initialFunc = [];

export default function FuncProvider({ children })
{
    // Tracks Form Data so that it persists between page renders
    const [formData, setFormData] = useReducer(formReducer, { funcGroupsForm: FUNC_FORM_FIELDS });
    // Initial state for functional groups and monomers
    const [funcGroups, setFuncGroup] = useReducer(funcReducer, initialFunc);
    // Tracks which form/page should be displayed
    const [page, setPage] = useReducer(pageReducer, FUNC_FORM);

    return (
        <FuncContext.Provider value={{ formData, funcGroups, page }} >
            <FuncDispatchContext.Provider value={{ setFormData, setFuncGroup, setPage }} >
                {children}
            </FuncDispatchContext.Provider>
        </FuncContext.Provider>
    );
}