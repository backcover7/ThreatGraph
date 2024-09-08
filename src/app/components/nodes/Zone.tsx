import React, {memo, useCallback} from 'react';
import {Node, NodeProps, NodeResizer, ResizeDragEvent, ResizeParams, useReactFlow} from '@xyflow/react';

interface ZoneNodeProps extends NodeProps {
    data: { label: string };
    type: 'group';
}

function ZoneNode({ id, data }: ZoneNodeProps) {
    const {setNodes, getNodes} = useReactFlow();

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
            />
            {/*<div className="font-bold p-2">{data.label}</div>*/}
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

export function groupElements(nodes: Node[]): Node[] {
    nodes = sortZoneNodes(nodes);
    const zoneNodes = nodes.filter(node => node.type === 'group');

    return nodes.map(node => {
        if (node.parentId) return node;  // skip node which has already been grouped

        const parentZone = zoneNodes.find(zoneNode => isNodeCompletelyInsideZone(node, zoneNode));

        if (parentZone) {
            return {
                ...node,
                parentId: parentZone.id,
                extent: 'parent',
                position: {
                    x: node.position.x - parentZone.position.x,
                    y: node.position.y - parentZone.position.y,
                },
            };
        }

        return node;
    });
}

export function isNodeCompletelyInsideZone(node: Node, zoneNode: Node): boolean {
    if (node === zoneNode) return false;

    if (getArea(node) >= getArea(zoneNode)) return false;

    const nodeRight = node.position.x + (Number(node.measured?.width) || Number(node.style?.width) || 0);
    const nodeBottom = node.position.y + (Number(node.measured?.height) || Number(node.style?.height) || 0);
    const zoneRight = zoneNode.position.x + (Number(zoneNode.measured?.width) || Number(node.style?.width) || 0);
    const zoneBottom = zoneNode.position.y + (Number(zoneNode.measured?.height) || Number(node.style?.height) || 0);
    return (
        node.position.x >= zoneNode.position.x &&
        node.position.y >= zoneNode.position.y &&
        nodeRight <= zoneRight &&
        nodeBottom <= zoneBottom
    );
}

function getArea(node: Node): number {
    return (Number(node.measured?.width) || Number(node.style?.width) || 0) * (Number(node.measured?.height) || Number(node.style?.height) || 0);
}