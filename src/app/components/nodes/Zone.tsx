import React, {memo, useCallback} from 'react';
import {Node, NodeProps, NodeResizer, ResizeDragEvent, ResizeParams, useReactFlow} from '@xyflow/react';
import {EntityOrDatastoreHeight, EntityOrDatastoreWidth} from "@/app/components/nodes/Element";

let getInternalNodeHook: (arg0: string) => any;

interface ZoneNodeProps extends NodeProps {
    data: { label: string };
    type: 'group';
}

function ZoneNode({ id, data, selected }: ZoneNodeProps) {
    const {setNodes, getNodes, getInternalNode} = useReactFlow();
    getInternalNodeHook = getInternalNode;

    // const onResizeStart = useCallback((event: ResizeDragEvent, params: ResizeParams) => {
    //     setNodes((nodes) => {
    //         const detachedNode = nodes.find(dn => dn.id === id);
    //         return detachElement(detachedNode as Node, nodes);
    //     });
    // }, [setNodes]);
    //
    //
    // const onResizeEnd = useCallback(() => {
    //     setNodes((nodes) => {
    //         return groupElements(nodes);
    //     });
    // }, [setNodes]);

    return (
        <>
            <NodeResizer
                color="#ececec"
                isVisible={selected}
                // onResizeStart={onResizeStart}
                // onResizeEnd={onResizeEnd}
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

/**
 * Detach the node itself
 * @param detachedNode
 * @param nodes
 */
export function detachElement(detachedNode: Node, nodes: Node[]): never[] {
    return nodes.map((n: Node) => {
        if ((n as Node).id === detachedNode.id) {
            // the element is processed is a normal node
            const internalNode = getInternalNodeHook(detachedNode.id)
            const newPosition = internalNode.parentId
                ? {
                    x: internalNode.internals.positionAbsolute.X,
                    y: internalNode.internals.positionAbsolute.Y,
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

/**
 * Group nodes
 * @param nodes
 */
export function groupElements(nodes: Node[]): Node[] {
    nodes = sortZoneNodes(nodes);

    let zoneNodes = nodes.filter(node => node.type === 'group');
    zoneNodes = zoneNodes.reverse();

    return nodes.map(node => {
        // TODO when drag or resize a zone node, the node with other parentid might be affected
        // if (node.parentId) return node;  // skip node which has already been grouped

        const parentZone = zoneNodes.find(zoneNode => isNodeCompletelyInsideZone(node, zoneNode));

        if (parentZone && parentZone.id !== node.parentId) {
            const internalNode = getInternalNodeHook(node.id)
            const nodeAbsoluteX = internalNode?.internals.positionAbsolute?.x ?? node.position.x;
            const nodeAbsoluteY = internalNode?.internals.positionAbsolute?.y ?? node.position.y;

            const internalZoneNode = getInternalNodeHook(parentZone.id);
            const parentZoneAbsoluteX = internalZoneNode?.internals.positionAbsolute?.x ?? parentZone.position.x;
            const parentZoneAbsoluteY = internalZoneNode?.internals.positionAbsolute?.y ?? parentZone.position.y;
            return {
                ...node,
                parentId: parentZone.id,
                extent: 'parent',
                position: {
                    x: nodeAbsoluteX - (parentZoneAbsoluteX ? parentZoneAbsoluteX : parentZone.position.x),
                    y: nodeAbsoluteY - (parentZoneAbsoluteY ? parentZoneAbsoluteY : parentZone.position.y),
                },
            };
        }

        return node;
    });
}

export function isNodeCompletelyInsideZone(node: Node, zoneNode: Node): boolean {
    if (node === zoneNode) return false;

    if (node.type === 'group' && getArea(node) >= getArea(zoneNode)) return false;

    const internalNode = getInternalNodeHook(node.id);
    const internalZoneNode = getInternalNodeHook(zoneNode.id);

    const nodeAbsoluteX = internalNode?.internals.positionAbsolute?.x ?? node.position.x;
    const nodeAbsoluteY = internalNode?.internals.positionAbsolute?.y ?? node.position.y;
    const nodeRight = nodeAbsoluteX + (Number(node.measured?.width) || Number(node.style?.width) || 0);
    const nodeBottom = nodeAbsoluteY + (Number(node.measured?.height) || Number(node.style?.height) || 0);

    const zoneAbsoluteX = internalZoneNode?.internals.positionAbsolute?.x ?? zoneNode.position.x;
    const zoneAbsoluteY = internalZoneNode?.internals.positionAbsolute?.y ?? zoneNode.position.y;
    const zoneRight = zoneAbsoluteX + (Number(zoneNode.measured?.width) || Number(zoneNode.style?.width) || 0);
    const zoneBottom = zoneAbsoluteY + (Number(zoneNode.measured?.height) || Number(zoneNode.style?.height) || 0);

    return (
        nodeAbsoluteX >= zoneAbsoluteX &&
        nodeAbsoluteY >= zoneAbsoluteY &&
        nodeRight <= zoneRight &&
        nodeBottom <= zoneBottom
    );
}

function getArea(node: Node): number {
    return (Number(node.measured?.width) || Number(node.style?.width) || 0) * (Number(node.measured?.height) || Number(node.style?.height) || 0);
}