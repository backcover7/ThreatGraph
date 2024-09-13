'use client'

import React, { useEffect, useState } from 'react';
import {useDnD} from "@/app/components/DnDContext";
import IconRenderer from "@/app/components/IconRenderer";
import {useTemplate} from "@/app/components/toolbar/TemplateContext";
import {NodeType} from "@/app/components/nodes/ElementNode";

const BuiltInTools: React.FC = () => {
    const [, , setDraggedItem] = useDnD();
    const templates = useTemplate();
    const [loadedTemplates, setLoadedTemplates] = useState<any>({});

    useEffect(() => {
        setLoadedTemplates(templates);
    }, [templates]);

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, data: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem([nodeType, data]);
    };

    const renderTemplateItems = (items: any[], type: NodeType) => {
        return items.map((item, index) => (
            <div
                key={`${type}-${index}`}
                className="dndnode"
                onDragStart={(event) => onDragStart(event, type, item)}
                draggable
            >
                {item.metadata.icon ? (
                    <IconRenderer dataUrl={item.metadata.icon} />
                ) : (
                    <div className="dndnode-icon">{type.charAt(0).toUpperCase()}</div>
                )}
                <div className="dndnode-label">{item.metadata.name}</div>
            </div>
        ));
    };

    return (
        <div className="built-in-tools">
            <h3>Built-in Tools</h3>
            {loadedTemplates.zone && (
                <div className="tool-section">
                    <h4>Zones</h4>
                    {renderTemplateItems(loadedTemplates.zone, 'group')}
                </div>
            )}
            {loadedTemplates.entity && (
                <div className="tool-section">
                    <h4>Entities</h4>
                    {renderTemplateItems(loadedTemplates.entity, 'default')}
                </div>
            )}
            {loadedTemplates.datastore && (
                <div className="tool-section">
                    <h4>Datastores</h4>
                    {renderTemplateItems(loadedTemplates.datastore, 'output')}
                </div>
            )}
            {loadedTemplates.process && (
                <div className="tool-section">
                    <h4>Processes</h4>
                    {renderTemplateItems(loadedTemplates.process, 'process')}
                </div>
            )}
        </div>
    );
};

export default BuiltInTools;