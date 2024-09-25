'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import {templateType} from "@/parser/template";

const TemplateContext = createContext<templateType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: ReactNode; templates: templateType }> = ({ children, templates }) => {
    return (
        <TemplateContext.Provider value={templates}>
            {children}
        </TemplateContext.Provider>
    );
};

export const useTemplate = (): templateType => {
    const context = useContext(TemplateContext);
    if (context === undefined) {
        throw new Error('useTemplate must be used within a TemplateProvider');
    }
    return context;
};