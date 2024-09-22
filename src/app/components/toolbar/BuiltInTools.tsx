'use client';

import React from 'react';
import { useDnD } from "@/app/components/DnDContext";
import { useTemplate } from "@/app/components/toolbar/TemplateContext";
import { NodeType } from "@/app/components/nodes/ElementNode";
import IconRenderer from "@/app/components/IconRenderer";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";


const BuiltInTools: React.FC = () => {
    const [, , setDnDState] = useDnD();
    const templates = useTemplate();

    const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: NodeType, modelData: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setDnDState([nodeType, { model: modelData }]);
    };

    const renderToolSection = (type: keyof typeof templates, nodeType: NodeType) => {
        if (!templates[type] || templates[type].length === 0) return null;

        const rows = [];
        for (let i = 0; i < templates[type].length; i += 3) {
            const rowItems = templates[type].slice(i, i + 3);
            rows.push(
                <div key={`${type}-row-${i}`} className="flex justify-start space-x-2 mb-2">
                    {rowItems.map((item: any, index: number) => (
                        <Button
                            variant="outline"
                            size="icon"
                            key={`${type}-${i + index}`}
                            onDragStart={(event) => onDragStart(event, nodeType, item)}
                            draggable
                            className="w-1/3 h-20 flex flex-col items-center justify-center"
                        >
                            <IconRenderer dataUrl={item.metadata.icon} width={'30%'} height={'30%'} />
                            <span className="text-xs mt-1 text-center">{item.metadata.name}</span>
                        </Button>
                    ))}
                </div>
            );
        }

        return rows;
    };

    return (
        <ScrollArea className="h-[80vh] w-[26vh] rounded-md border p-4">
            <Tabs defaultValue="zone" className="w-[300px]">
                <TabsList>
                    <TabsTrigger value="zone">Zone</TabsTrigger>
                    <TabsTrigger value="entity">Entity</TabsTrigger>
                    <TabsTrigger value="datastore">Datastore</TabsTrigger>
                    <TabsTrigger value="process">Process</TabsTrigger>
                    {/*<TabsTrigger value="filetype">FileType</TabsTrigger>*/}
                </TabsList>
                <TabsContent value="zone">
                    {renderToolSection('zone', 'group')}
                </TabsContent>
                <TabsContent value="entity">
                    {renderToolSection('entity', 'default')}
                </TabsContent>
                <TabsContent value="datastore">
                    {renderToolSection('datastore', 'output')}
                </TabsContent>
                <TabsContent value="process">
                    {renderToolSection('process', 'process')}
                </TabsContent>
                {/*<TabsContent value="filetype">*/}
                {/*    {renderToolSection('process', 'process')}*/}
                {/*</TabsContent>*/}
            </Tabs>
        </ScrollArea>
    );
};

export default BuiltInTools;