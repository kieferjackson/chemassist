import React, { useContext, useReducer } from 'react';
import { UPDATE_FUNC, UPDATE_MONOMERS } from './actions';

const FuncContext = React.createContext(null);
const FuncDispatchContext = React.createContext(null);

export const useFuncGroups = () => useContext(FuncContext);
export const useFuncDispatch = () => useContext(FuncDispatchContext);

function funcReducer(funcData, action)
{
    const { type } = action;

    switch (type)
    {
        case UPDATE_FUNC:
            const { funcGroups } = action;
            return funcGroups;
        case UPDATE_MONOMERS:
            break;
        default:
            throw Error('Invalid action: ', type);
    }
}

const initialFunc = [];

export default function FuncProvider({ children })
{
    // Initial state for functional groups and monomers
    const [funcGroups, dispatch] = useReducer(funcReducer, initialFunc);

    return (
        <FuncContext.Provider value={{ funcGroups }} >
            <FuncDispatchContext.Provider value={dispatch} >
                {children}
            </FuncDispatchContext.Provider>
        </FuncContext.Provider>
    );
}