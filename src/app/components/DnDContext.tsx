'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NodeType } from "@/app/components/nodes/ElementNode";
import { Zone } from "@/DFD/zone";
import { Entity } from "@/DFD/node/entity";
import { DataStore } from "@/DFD/node/datastore";
import { Process } from "@/DFD/process";

type DnDData =
    | { model: Zone | Entity | DataStore | Process | undefined}  // 用于 BuiltInTools
    | { label: string }
    | null;

type DnDContextType = [
        NodeType | null,
    DnDData,
    (state: [NodeType, DnDData]) => void
];

const DnDContext = createContext<DnDContextType | undefined>(undefined);

export const DnDProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<[NodeType | null, DnDData]>([null, null]);

    const setDnDState = (newState: [NodeType, DnDData]) => {
        setState(newState);
    };

    return (
        <DnDContext.Provider value={[state[0], state[1], setDnDState]}>
            {children}
        </DnDContext.Provider>
    );
};

export const useDnD = (): DnDContextType => {
    const context = useContext(DnDContext);
    if (context === undefined) {
        throw new Error('useDnD must be used within a DnDProvider');
    }
    return context;
};