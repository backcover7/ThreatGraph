import React, {memo, useCallback} from 'react';
import {Node, NodeProps, NodeResizer, ResizeDragEvent, ResizeParams, useReactFlow} from '@xyflow/react';
import {EntityOrDatastoreHeight, EntityOrDatastoreWidth} from "@/app/components/nodes/Element";

let getInternalNodeHook: (arg0: string) => any;

interface ZoneNodeProps extends NodeProps {
    data: { label: string };
    type: 'group';
}

function ZoneNode({ id, data }: ZoneNodeProps) {
    const {setNodes, getNodes, getInternalNode} = useReactFlow();
    getInternalNodeHook = getInternalNode;
    const onResizeEnd = useCallback((evt: ResizeDragEvent, params: ResizeParams) => {
        setNodes((nodes) => {
            // debugger;
            return groupElements(nodes);
        });
    }, [id, setNodes, getNodes]);

    return (
        <>
            <NodeResizer
                color="#ececec"
                onResizeEnd={onResizeEnd}
                // minWidth={EntityOrDatastoreWidth + 1}
                // minHeight={EntityOrDatastoreHeight + 1}
            />
            <div className="font-bold p-2">{id}</div>
        </>
    );
}

export default memo(ZoneNode);

function sortZoneNodes(nodes: Node[]): Node[] {
    const zoneNodes = nodes.filter(node => node.type === 'group');
    const nonZoneNodes = nodes.filter(node => node.type !== 'group');

    const sortedZoneNodes = zoneNodes.sort((a, b) => {
        const areaA = getArea(a);
        const areaB = getArea(b);
        return areaB - areaA;  // sort from the biggest area to the smallest area
    });

    return [...sortedZoneNodes, ...nonZoneNodes];
}

export function detachElement(detachedNode: Node, nodes: Node[]): never[] {
    return nodes.map((n: Node) => {
        if ((n as Node).id === detachedNode.id) {
            // Calculate the new absolute position
            const parentNode = nodes.find((pn: Node) => (pn as Node).id === (n as Node).parentId);
            const newPosition = parentNode
                ? {
                    x: (parentNode as Node).position.x + (n as Node).position.x,
                    y: (parentNode as Node).position.y + (n as Node).position.y
                }
                : (n as Node).position;

            // Create the updated node
            return {
                ...(n as Node),
                parentId: undefined,
                extent: undefined,
                position: newPosition,
            };
        }
        return n;
    }) as never[];
}

export function groupElements(nodes: Node[]): Node[] {
    // TODO nested zones, check from smallest zone
    nodes = sortZoneNodes(nodes);
    let zoneNodes = nodes.filter(node => node.type === 'group');
    // debugger;
    zoneNodes = zoneNodes.reverse();

    return nodes.map(node => {
        if (node.parentId) return node;  // skip node which has already been grouped

        const parentZone = zoneNodes.find(zoneNode => isNodeCompletelyInsideZone(node, zoneNode));

        if (parentZone) {
            const internalZoneNode = getInternalNodeHook(parentZone.id);
            const parentZoneX = internalZoneNode?.internals.positionAbsolute?.x ?? parentZone.position.x;
            const parentZoneY = internalZoneNode?.internals.positionAbsolute?.y ?? parentZone.position.y;
            return {
                ...node,
                parentId: parentZone.id,
                extent: 'parent',
                position: {
                    x: node.position.x - (parentZoneX ? parentZoneX : parentZone.position.x),
                    y: node.position.y - (parentZoneY ? parentZoneY : parentZone.position.y),
                },
            };
        }

        return node;
    });
}

export function isNodeCompletelyInsideZone(node: Node, zoneNode: Node): boolean {
    if (node === zoneNode) return false;

    if (node.type === 'group' && getArea(node) >= getArea(zoneNode)) return false;

    // const internalNode = getInternalNodeHook(node.id);
    const internalZoneNode = getInternalNodeHook(zoneNode.id);

    // const nodeX = internalNode?.internals.positionAbsolute?.x ?? node.position.x;
    // const nodeY = internalNode?.internals.positionAbsolute?.y ?? node.position.y;
    const nodeRight = node.position.x + (Number(node.measured?.width) || Number(node.style?.width) || 0);
    const nodeBottom = node.position.y + (Number(node.measured?.height) || Number(node.style?.height) || 0);

    const zoneX = internalZoneNode?.internals.positionAbsolute?.x ?? zoneNode.position.x;
    const zoneY = internalZoneNode?.internals.positionAbsolute?.y ?? zoneNode.position.y;
    const zoneRight = zoneX + (Number(zoneNode.measured?.width) || Number(zoneNode.style?.width) || 0);
    const zoneBottom = zoneY + (Number(zoneNode.measured?.height) || Number(zoneNode.style?.height) || 0);

    return (
        node.position.x >= zoneX &&
        node.position.y >= zoneY &&
        nodeRight <= zoneRight &&
        nodeBottom <= zoneBottom
    );
}

function getArea(node: Node): number {
    return (Number(node.measured?.width) || Number(node.style?.width) || 0) * (Number(node.measured?.height) || Number(node.style?.height) || 0);
}