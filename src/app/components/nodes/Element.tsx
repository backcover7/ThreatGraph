import {Node, NodeToolbar, Position, useReactFlow, XYPosition} from "@xyflow/react";
import ZoneNode from "@/app/components/nodes/Zone";
import EntityNode from "@/app/components/nodes/Entity";
import DatastoreNode from "@/app/components/nodes/Datastore";
import React, {useCallback} from "react";
import TextNode from "@/app/components/nodes/TextNode";

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
    annotation: TextNode,
};

export function getNewElement(type: string, position: XYPosition, nodeName: string): Node {
    return {
        id: getElementId(),
        type,
        position,
        data: {
            label: nodeName,
            level: type === 'annotation' ? 1 : undefined,
            arrowStyle: type === 'annotation' ? { position: 'absolute', bottom: -10, right: -10 } : undefined,
        },
        style:
            type === 'group' ? {width: 400, height: 240} :
                type === 'output' ? {width: EntityOrDatastoreWidth, height: EntityOrDatastoreHeight} :
                    type === 'default' ? {width: EntityOrDatastoreWidth, height: EntityOrDatastoreHeight} :
                        type === 'annotation' ? {width: 150, height: 50} : undefined,
    };
}

export const ElementToolbar: React.FC<{
    children: React.ReactNode;
    selected?: boolean;
    id: string;
}> = ({ children, selected, id }) => {
    const { getNodes } = useReactFlow();

    const onTest = useCallback(() => {
        console.log("test");
        // TODO Implement logic here
    }, []);

    const getChildrenLabels = useCallback(() => {
        const nodes = getNodes();
        const childNodes = nodes.filter(node => node.id === id);
        return childNodes[0].data.label as string;
    }, [getNodes, id]);

    return (
        <>
            <div>
                {children}
            </div>
            <NodeToolbar
                isVisible={selected}
                position={Position.Top}
            >
                <button onClick={onTest}>bt1</button>
                <button onClick={onTest}>bt2</button>
            </NodeToolbar>
            <NodeToolbar
                isVisible={true}
                position={Position.Bottom}
                className="font-bold"
            >
                {getChildrenLabels()}
            </NodeToolbar>
        </>
    );
};