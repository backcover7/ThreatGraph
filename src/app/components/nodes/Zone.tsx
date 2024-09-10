import React, {memo, useCallback} from 'react';
import {Node, NodeProps, NodeResizer, NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import {re} from "mathjs";

interface ZoneNodeProps extends NodeProps {
    data: {
        label: string
    };
    type: 'group';
}

const ZoneNode: React.FC<ZoneNodeProps> = ({ id, data, selected }) => {
    const { setNodes, getInternalNode } = useReactFlow();

    const onResizeStart = useCallback(() => {
        setNodes((nodes) => {
            return groupElements(nodes as Node[], getInternalNode, setNodes) as never;
        })
    }, [setNodes, getInternalNode]);

    const onResize = useCallback(() => {
        setNodes((nodes) => {
            return groupElements(nodes as Node[], getInternalNode, setNodes) as never;
        })
    }, [setNodes, getInternalNode]);

    const onResizeEnd = useCallback(() => {
        setNodes((nodes) => {
            return groupElements(nodes as Node[], getInternalNode, setNodes) as never;
        })
    }, [setNodes, getInternalNode]);

    const onTest = useCallback(() => {
        console.log("test");
        // TODO Implement logic here
    }, []);

    return (
        <>
            <NodeResizer
                color='#2561ff'
                isVisible={selected}
                minWidth={100}
                minHeight={50}
                onResizeStart={onResizeStart}
                // onResize={onResize}
                onResizeEnd={onResizeEnd}
            />
            <NodeToolbar
                isVisible={selected}
                position={Position.Top}
            >
                <button onClick={onTest}>button1</button>
                <button onClick={onTest}>button2</button>
            </NodeToolbar>
            <div style={{
                position: 'absolute',
                color: '#555',
                top: 2,
                fontSize: 8,
                left: 5
            }}>
                {data.label}
            </div>
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
        return areaB - areaA;
    });

    return [...sortedZoneNodes, ...nonZoneNodes];
}

/**
 * Detach the node itself
 * @param detachedNode
 * @param nodes
 * @param getInternalNode
 */
export function detachElement(detachedNode: Node, nodes: Node[], getInternalNode: any): never[] {
    return nodes.map((n: Node) => {
        if (n.id === detachedNode.id) {
            // the element is processed is a normal node
            const internalNode = getInternalNode(detachedNode.id)
            const newPosition = internalNode.parentId
                ? {
                    x: internalNode.internals.positionAbsolute.x,
                    y: internalNode.internals.positionAbsolute.y,
                }
                : n.position;

            return {
                ...n,
                parentId: undefined,
                extent: undefined,
                position: newPosition,
            };
        }
        return n;
    }) as never;
}

/**
 * Group nodes
 * @param nodes
 * @param getInternalNode
 */
export function groupElements(nodes: Node[], getInternalNode: any, setNodes: any): Node[] {
    nodes = sortZoneNodes(nodes);

    let zoneNodes = nodes.filter(node => node.type === 'group').reverse();

    return nodes.map(node => {
        const parentZone = zoneNodes.find(zoneNode => {
            const isInside = isNodeCompletelyInsideZone(node, zoneNode, getInternalNode);
            if (node.parentId === zoneNode.id && !isInside) {
                setNodes((nodes: Node[]) => detachElement(node, nodes, getInternalNode) as never );
            }
            return isInside;
        });

        if (parentZone && parentZone.id !== node.parentId) {
            const internalNode = getInternalNode(node.id);
            const nodeAbsoluteX = internalNode?.internals.positionAbsolute?.x ?? node.position.x;
            const nodeAbsoluteY = internalNode?.internals.positionAbsolute?.y ?? node.position.y;

            const internalZoneNode = getInternalNode(parentZone.id);
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

export function isNodeCompletelyInsideZone(node: Node, zoneNode: Node, getInternalNode: any): boolean {
    if (node === zoneNode) return false;

    if (node.type === 'group' && getArea(node) >= getArea(zoneNode)) return false;

    const internalNode = getInternalNode(node.id);
    const internalZoneNode = getInternalNode(zoneNode.id);

    const nodeAbsoluteX = internalNode?.internals.positionAbsolute?.x ?? node.position.x;
    const nodeAbsoluteY = internalNode?.internals.positionAbsolute?.y ?? node.position.y;
    const nodeRight = nodeAbsoluteX + (Number(node.measured?.width) || Number(node.style?.width) || 0);
    const nodeBottom = nodeAbsoluteY + (Number(node.measured?.height) || Number(node.style?.height) || 0);

    const zoneAbsoluteX = internalZoneNode?.internals.positionAbsolute?.x ?? zoneNode.position.x;
    const zoneAbsoluteY = internalZoneNode?.internals.positionAbsolute?.y ?? zoneNode.position.y;
    const zoneRight = zoneAbsoluteX + (Number(zoneNode.measured?.width) || Number(zoneNode.style?.width) || 0);
    const zoneBottom = zoneAbsoluteY + (Number(zoneNode.measured?.height) || Number(zoneNode.style?.height) || 0);

    return (
        nodeAbsoluteX > zoneAbsoluteX &&
        nodeAbsoluteY > zoneAbsoluteY &&
        nodeRight < zoneRight &&
        nodeBottom < zoneBottom
    );
}

export function getArea(node: Node): number {
    return (Number(node.measured?.width) || Number(node.style?.width) || 0) * (Number(node.measured?.height) || Number(node.style?.height) || 0);
}