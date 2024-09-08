import { Node, NodeToolbar, Position, XYPosition } from "@xyflow/react";
import ZoneNode from "@/app/components/nodes/Zone";
import EntityNode from "@/app/components/nodes/Entity";
import DatastoreNode from "@/app/components/nodes/Datastore";
import React, {useCallback, useState} from "react";

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

export function getNewElement(type: string, position: XYPosition, nodeName: string, parentNode?: string): Node {
    const newElem: Node = {
        id: getElementId(),
        type,
        position,
        data: { label: nodeName },
        style:
            type === 'group' ? { width: 400, height: 240 } :  // zone
                type === 'output' ? { width: 80, height: 60 } :   // entity
                    type === 'default' ? { width: 80, height: 60 } : undefined,   // datastore
    }
    if (parentNode) {
        newElem.parentId = parentNode;
        // newElem.extent = 'parent';
    }
    return newElem;
}

export const ElementToolbar: React.FC<{
    children: React.ReactNode;
    selected?: boolean;
}> = ({ children, selected }) => {
    const [_, setToolbarVisible] = useState(false);

    const hideToolbar = useCallback(() => {
        setToolbarVisible(false);
    }, []);

    const onDetach = useCallback(() => {
        console.log("Detach clicked");
        // Implement detach logic here
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
                <button onClick={onDetach}>Detach</button>
                <button onClick={hideToolbar}>Close</button>
            </NodeToolbar>
        </>
    );
};