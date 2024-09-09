import {Node, NodeToolbar, Position, XYPosition} from "@xyflow/react";
import ZoneNode from "@/app/components/nodes/Zone";
import EntityNode from "@/app/components/nodes/Entity";
import DatastoreNode from "@/app/components/nodes/Datastore";
import React, {useCallback} from "react";

export const EntityOrDatastoreWidth = 80;
export const EntityOrDatastoreHeight = 60;

export const getElementId = () => crypto.randomUUID();

export const ElementColor = (node: Node): string => {
    switch (node.type) {
        case 'input':
            return '#d9fdde';
        case 'output':
            return '#ffe1e7';
        case 'group':
            return '#ececec';
        default:
            return '#d9edff';
    }
};

export const ElementNodes = {
    group: ZoneNode,
    default: EntityNode,
    output: DatastoreNode,
};

export function getNewElement(type: string, position: XYPosition, nodeName: string): Node {
    return {
        id: getElementId(),
        type,
        position,
        data: {label: nodeName},
        style:
            type === 'group' ? {width: 400, height: 240} :  // zone
                type === 'output' ? {width: EntityOrDatastoreWidth, height: EntityOrDatastoreHeight} :   // entity
                    type === 'default' ? {width: EntityOrDatastoreWidth, height: EntityOrDatastoreHeight} : undefined,   // datastore
    };
}

export const ElementToolbar: React.FC<{
    children: React.ReactNode;
    selected?: boolean;
}> = ({ children, selected }) => {

    const onTest = useCallback(() => {
        console.log("tese");
        // TODO Implement detach logic here
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
                <button onClick={onTest}>testbutton</button>
            </NodeToolbar>
        </>
    );
};