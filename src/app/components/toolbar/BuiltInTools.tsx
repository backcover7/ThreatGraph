'use client';

import React from 'react';
import { useDnD } from "@/app/components/DnDContext";
import { useTemplate } from "@/app/components/toolbar/TemplateContext";
import { NodeType } from "@/app/components/nodes/ElementNode";
import { FaGlobe, FaDesktop, FaDatabase, FaCogs } from 'react-icons/fa';

const BuiltInTools: React.FC = () => {
    const [, , setDraggedItem] = useDnD();
    const templates = useTemplate();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: NodeType, data: any) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        setDraggedItem([nodeType, data]);
    };

    const renderToolSection = (type: keyof typeof templates, nodeType: NodeType, icon: React.ReactNode) => {
        if (!templates[type] || templates[type].length === 0) return null;

        return templates[type].map((item: any, index: number) => (
            <div
                key={`${type}-${index}`}
                className="dndnode"
                onDragStart={(event) => onDragStart(event, nodeType, item)}
                draggable
                title={item.metadata?.name || 'Unnamed'}
            >
                {icon}
            </div>
        ));
    };

    return (
        <div className="built-in-tools">
            {renderToolSection('zone', 'group', <FaGlobe />)}
            {renderToolSection('entity', 'default', <FaDesktop />)}
            {renderToolSection('datastore', 'output', <FaDatabase />)}
            {renderToolSection('process', 'process', <FaCogs />)}
        </div>
    );
};

export default BuiltInTools;