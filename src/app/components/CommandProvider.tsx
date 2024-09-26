'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";

const CommandContext = createContext<{
    isCommandOpen: boolean;
    setIsCommandOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    isCommandOpen: false,
    setIsCommandOpen: () => {},
});

export const useCommand = () => useContext(CommandContext);

export const CommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isCommandOpen, setIsCommandOpen] = useState(false);
    const commandRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey && event.key === 'k') {
                event.preventDefault();
                setIsCommandOpen(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
                setIsCommandOpen(false);
            }
        };

        if (isCommandOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCommandOpen]);

    return (
        <CommandContext.Provider value={{ isCommandOpen, setIsCommandOpen }}>
            {children}
            {isCommandOpen && (
                <div className="fixed top-[10%] left-0 w-full h-full flex items-center justify-center z-50">
                    <div ref={commandRef} className="command-wrapper">
                        <Card className="w-[400px]">
                            <Command>
                                <CommandInput placeholder="Type a command or search..." />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="Suggestions">
                                        <CommandItem>Add Node</CommandItem>
                                        <CommandItem>Remove Node</CommandItem>
                                        <CommandItem>Connect Nodes</CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </Card>
                    </div>
                </div>
            )}
        </CommandContext.Provider>
    );
};