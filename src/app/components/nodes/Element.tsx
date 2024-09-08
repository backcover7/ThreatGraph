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

export function getNewElement(type: string, position: XYPosition, nodeName: string): Node {
    return {
        id: getElementId(),
        type,
        position,
        data: { label: nodeName },
        style:
            type === 'group' ? { width: 400, height: 240 } :  // zone
                type === 'output' ? { width: 80, height: 60 } :   // entity
                    type === 'default' ? { width: 80, height: 60 } : undefined,   // datastore
    }
}

/**
 * <ElementToolbar></ElementToolbar>
 * @param children
 * @constructor
 */
export const ElementToolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState<Position>(Position.Top);

    const toggleToolbar = useCallback(() => {
        setToolbarVisible((prev) => !prev);
    }, []);

    const hideToolbar = useCallback(() => {
        setToolbarVisible(false);
    }, []);

    return (
        <>
            <NodeToolbar
                isVisible={toolbarVisible}
                position={toolbarPosition}
            >
                <button onClick={() => setToolbarPosition(Position.Top)}>Top</button>
                <button onClick={() => setToolbarPosition(Position.Right)}>Right</button>
                <button onClick={() => setToolbarPosition(Position.Bottom)}>Bottom</button>
                <button onClick={() => setToolbarPosition(Position.Left)}>Left</button>
                <button onClick={hideToolbar}>Close</button>
            </NodeToolbar>
            <div onClick={toggleToolbar}>
                {children}
            </div>
        </>
    );
};