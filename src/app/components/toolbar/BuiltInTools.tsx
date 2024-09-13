'use client';

import React from 'react';
import { useDnD } from "@/app/components/DnDContext";
import { useTemplate } from "@/app/components/toolbar/TemplateContext";
import { NodeType } from "@/app/components/nodes/ElementNode";
import IconRenderer from "@/app/components/IconRenderer";


const BuiltInTools: React.FC = () => {
    const [, , setDnDState] = useDnD();
    const templates = useTemplate();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, modelData: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setDnDState([nodeType, { model: modelData }]);
    };

    const renderToolSection = (type: keyof typeof templates, nodeType: NodeType) => {
        if (!templates[type] || templates[type].length === 0) return null;

        return templates[type].map((item: any, index: number) => (
            <div
                key={`${type}-${index}`}
                className="dndnode"
                onDragStart={(event) => onDragStart(event, nodeType, item)}
                draggable
                title={item.metadata.name || 'Unnamed'}
            >
                <IconRenderer dataUrl={item.metadata.icon} />
                <div>{item.metadata.name}</div>
            </div>
        ));
    };

    return (
        <div className="built-in-tools">
            {renderToolSection('zone', 'group')}
            {renderToolSection('entity', 'default')}
            {renderToolSection('datastore', 'output')}
            {renderToolSection('process', 'process')}
        </div>
    );
};

export default BuiltInTools;