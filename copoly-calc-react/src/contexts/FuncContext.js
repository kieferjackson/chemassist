import React, { useContext } from 'react';

export const FuncContext = React.createContext();
export const useFunc = () => useContext(FuncContext);

const { Provider } = FuncContext;

export default function FuncProvider(props)
{
    // Initial state for functional groups and monomers
    const funcGroups = [];

    return (
        <Provider value={funcGroups} {...props} />
    );
}