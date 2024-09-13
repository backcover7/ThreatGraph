'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NodeType } from "@/app/components/nodes/ElementNode";

// Updated context type to include only `type` and `data`
type DnDContextType = [
        NodeType | null,
    any,
    React.Dispatch<React.SetStateAction<[NodeType | null, any]>>
];

// Initialize the context with default values
export const DnDContext = createContext<DnDContextType>([null, null, () => {}]);

interface DnDProviderProps {
    children: ReactNode;
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
    // Initialize the state with type and data
    const [state, setState] = useState<[NodeType | null, any]>([null, null]);

    return (
        <DnDContext.Provider value={[...state, setState]}>
            {children}
        </DnDContext.Provider>
    );
}

// Custom hook to use the DnDContext
export const useDnD = (): DnDContextType => {
    return useContext(DnDContext);
}
