import { memo } from 'react';
import { Node, NodeResizer, XYPosition } from '@xyflow/react';

interface ZoneNodeProps {
    data: {
        type: 'group',
        label: string;
    };
}

function ZoneNode({ data }: ZoneNodeProps) {
    return (
        <>
            <NodeResizer
                minWidth={ 50 }
                minHeight={ 50 }
                color = '#ececec'
            />
            <div
                style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    justifyContent: 'space-evenly',
                    left: 0,
                }}
            >
            </div>
        </>
    );
}

export function groupElements(nodes: Node[]): Node[] {
    const zoneNodes = nodes.filter(node => node.type === 'group');

    return nodes.map(node => {
        if (node.type === 'group') return node;

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

function isNodeCompletelyInsideZone(node: Node, zoneNode: Node): boolean {
    const nodeRight = node.position.x + (node.style?.width as number || 0);
    const nodeBottom = node.position.y + (node.style?.height as number || 0);
    const zoneRight = zoneNode.position.x + (zoneNode.style?.width as number || 0);
    const zoneBottom = zoneNode.position.y + (zoneNode.style?.height as number || 0);

    return (
        node.position.x >= zoneNode.position.x &&
        node.position.y >= zoneNode.position.y &&
        nodeRight <= zoneRight &&
        nodeBottom <= zoneBottom
    );
}

export default memo(ZoneNode);