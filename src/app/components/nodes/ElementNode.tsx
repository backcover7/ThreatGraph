'use client'

import {Node, NodeToolbar, Position, XYPosition} from "@xyflow/react";
import ZoneNode from "@/app/components/nodes/ZoneNode";
import EntityNode from "@/app/components/nodes/EntityNode";
import DatastoreNode from "@/app/components/nodes/DatastoreNode";
import React, {useCallback} from "react";
import TextNode from "@/app/components/nodes/TextNode";

export type NodeType = 'group' | 'input' | 'default' | 'output' | 'process' | 'text';

export const getElementId = () => crypto.randomUUID();

export const ElementColor = (node: Node): string => {
    switch (node.type) {
        case 'group':
            return '#ececec';
        case 'default':
            return '#d9fdde';
        case 'output':
            return '#ffe1e7';
        case 'process':
            return '#c2cf62';
        case 'text':
            return '#ffffff';
        default:
            return '#d9edff';
    }
};

export const ElementNodes = {
    group: ZoneNode,
    default: EntityNode,
    output: DatastoreNode,
    // process: ProcessNode,
    text: TextNode,
};

export function getNewElement(type: NodeType, position: XYPosition, data?: any): Node {
    if (type === 'text' && (!data || typeof data.label !== 'string')) {
        data = { label: '', isNew: true };
    }
    data = data || {};

    return {
        id: getElementId(),
        type,
        position,
        style:
            type === 'group' ? {width: 400, height: 240} :
            type === 'default' ? {width: 80, height: 60} :
            type === 'output' ? {width: 80, height: 60} :
            type === 'process' ? {width: 40, height: 10} :
            type === 'text' ? {width: 150, height: 50} :
            undefined,
        data,  // model data
    };
}

export const ElementToolbar: React.FC<{
    children: React.ReactNode;
    selected?: boolean;
    id: string;
}> = ({ children, selected, id }) => {
    const onTest = useCallback(() => {
        console.log("test");
        // TODO Implement logic here
    }, []);

    return (
        <>
            <div>
                {children}
            </div>
            <NodeToolbar
                isVisible={selected}
                position={Position.Top}
            >
                <button onClick={onTest}>button1</button>
                <button onClick={onTest}>button2</button>
            </NodeToolbar>
            <div style={{
                position: 'relative',
                color: '#555',
                bottom: 0,
                fontSize: 8,
            }}>
            </div>
        </>
    );
};