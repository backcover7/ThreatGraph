'use client';

import React from 'react';
import { useDnD } from "@/app/components/DnDContext";
import { useTemplate } from "@/app/components/toolbar/TemplateContext";
import { NodeType } from "@/app/components/nodes/ElementNode";
import IconRenderer from "@/app/components/IconRenderer";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


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

        return templates[type].map((item: any, index: number) => (
            <Button
                variant="outline"
                size="icon"
                key={`${type}-${index}`}
                onDragStart={(event) => onDragStart(event, nodeType, item)}
                draggable
                // title={item.metadata.name || 'Unnamed'}
            >
                <IconRenderer dataUrl={item.metadata.icon} width={'20%'} height={'20%'}/>{item.metadata.name}
            </Button>
        ));
    };

    return (
        <Card>
            <Tabs defaultValue="zone" className="w-[300px]">
                <TabsList>
                    <TabsTrigger value="zone">Zone</TabsTrigger>
                    <TabsTrigger value="entity">Entity</TabsTrigger>
                    <TabsTrigger value="datastore">Datastore</TabsTrigger>
                    <TabsTrigger value="process">Process</TabsTrigger>
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
            </Tabs>
        </Card>
    );
};

export default BuiltInTools;