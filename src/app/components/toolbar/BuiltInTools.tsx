'use client'

import React, { memo } from 'react';
import { useDnD } from '@/app/components/DnDContext';
import Template from "@/parser/template";
import {LuFrame} from "react-icons/lu";
import IconRenderer from "@/app/components/IconRenderer";
import {NodeType} from "@/app/components/nodes/ElementNode";

interface NodeInfo {
    type: NodeType;
    label: React.ReactNode;
    dragLabel: string;
    data: any;
}

// const loader = new Template();
// const {zone, entity, datastore, process, threat, rule} = await loader.loadBuiltinTemplates();
//
let nodeTypes: NodeInfo[] = [];
// zone.forEach(z => {nodeTypes.push({type: 'group', label: <LuFrame />, dragLabel: z.metadata.name, data: z})});
// entity.forEach(e => {nodeTypes.push({type: 'default', label: <IconRenderer dataUrl={e.metadata.icon} />, dragLabel: e.metadata.name, data: e})});
// datastore.forEach(d => {nodeTypes.push({type: 'output', label: <IconRenderer dataUrl={d.metadata.icon} />, dragLabel: d.metadata.name, data: d})});
// process.forEach(p => {nodeTypes.push({type: 'process', label: <IconRenderer dataUrl={p.metadata.icon} />, dragLabel: p.metadata.name, data: p})});

const BuiltInTools: React.FC = () => {
    const [, , setDnDState] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeInfo: NodeInfo) => {
        setDnDState([nodeInfo.type, nodeInfo.data]);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div>
            {nodeTypes.map((nodeInfo, index) => (
                <div
                    key={nodeInfo.type}
                    onDragStart={(event) => onDragStart(event, nodeInfo)}
                    draggable
                    title={nodeInfo.dragLabel}
                >
                    {nodeInfo.label}
                </div>
            ))}
        </div>
    );
};

export default memo(BuiltInTools);