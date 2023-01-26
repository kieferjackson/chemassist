import React, { useContext, useReducer } from 'react';
import { UPDATE_FUNC, UPDATE_MONOMERS } from './actions';
import { FUNC_FORM, MONOMER_FORM, FINAL_RESULTS } from './page_names';

const FuncContext = React.createContext(null);
const FuncDispatchContext = React.createContext(null);

export const useFuncGroups = () => useContext(FuncContext);
export const useFuncDispatch = () => useContext(FuncDispatchContext);

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
}

const initialFunc = [];

export default function FuncProvider({ children })
{
    // Initial state for functional groups and monomers
    const [funcGroups, setFuncGroup] = useReducer(funcReducer, initialFunc);
    // Tracks which form/page should be displayed
    const [page, setPage] = useReducer(pageReducer, FUNC_FORM);

    return (
        <FuncContext.Provider value={{ funcGroups, page }} >
            <FuncDispatchContext.Provider value={{ setFuncGroup, setPage }} >
                {children}
            </FuncDispatchContext.Provider>
        </FuncContext.Provider>
    );
}