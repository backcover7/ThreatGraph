import { memo } from 'react';
import { Node, NodeResizer, XYPosition } from '@xyflow/react';

interface ZoneNodeProps {
    data: { label: string; },
    type: 'group',
}

function ZoneNode({ data }: ZoneNodeProps) {
    return (
        <>
            <NodeResizer color = '#ececec'/>
        </>
    );
}

export function groupElements(nodes: Node[]): Node[] {
    const zoneNodes = nodes.filter(node => node.type === 'group');

    return nodes.map(node => {
        // debugger;
        // if (node.type === 'group') return node;
        if (node.parentId) return node;  // skip node which has already been grouped  TODO nested zone

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

    const nodeRight = node.position.x + (Number(node.width) || Number(node.style?.width) || 0);
    const nodeBottom = node.position.y + (Number(node.height) || Number(node.style?.height) || 0);
    const zoneRight = zoneNode.position.x + (Number(zoneNode.width) || Number(zoneNode.style?.width) || 0);
    const zoneBottom = zoneNode.position.y + (Number(zoneNode.height) || Number(zoneNode.style?.height) || 0);
    return (
        node.position.x >= zoneNode.position.x &&
        node.position.y >= zoneNode.position.y &&
        nodeRight <= zoneRight &&
        nodeBottom <= zoneBottom
    );
}

export default memo(ZoneNode);