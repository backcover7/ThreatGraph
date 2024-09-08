import {Node, NodeToolbar, Position, XYPosition} from "@xyflow/react";
import ZoneNode from "@/app/components/nodes/Zone";
import EntityNode from "@/app/components/nodes/Entity";
import DatastoreNode from "@/app/components/nodes/Datastore";
import {useCallback, useState} from "react";

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
        newElem.extent = 'parent';
    }
    return newElem;
}

/**
 * <ElementToolbar></ElementToolbar>
 * @param children
 * @constructor
 */
export const ElementToolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toolbarVisible, setToolbarVisible] = useState(false);

    const toggleToolbar = useCallback(() => {
        setToolbarVisible((prev) => !prev);
    }, []);

    const hideToolbar = useCallback(() => {
        setToolbarVisible(false);
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                cursor: 'pointer'
            }}
            onClick={toggleToolbar}>
            {children}
            <NodeToolbar
                isVisible={toolbarVisible}
                position={Position.Top}
            >
                <button onClick={() => console.log(children)}>Detach</button>
                <button onClick={hideToolbar}>Close</button>
            </NodeToolbar>
        </div>
    );
};