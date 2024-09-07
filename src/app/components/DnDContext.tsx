'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type DnDContextType = [string | null, string | null, React.Dispatch<React.SetStateAction<[string | null, string | null]>>];

export const DnDContext = createContext<DnDContextType>([null, null, () => {}]);

interface DnDProviderProps {
    children: ReactNode;
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
    const [typeAndName, setTypeAndName] = useState<[string | null, string | null]>([null, null]);

    return (
        <DnDContext.Provider value={[...typeAndName, setTypeAndName]}>
            {children}
        </DnDContext.Provider>
    );
}

export const useDnD = (): DnDContextType => {
    return useContext(DnDContext);
}