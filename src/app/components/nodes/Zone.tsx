'use client'

import React, { memo, useState, useCallback } from 'react';
import { Node, NodeResizer, XYPosition, NodeToolbar, Position } from '@xyflow/react';

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
            {/*<div style={{ padding: 10 }}>{data.label}</div>*/}
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

export function groupElements(nodes: Node[], position: XYPosition, newNode: Node): void {
    const parentNode = nodes.find((node) =>
        node.type === 'group' &&
        position.x > node.position.x &&
        position.x < node.position.x + (node.style?.width as number || 0) &&
        position.y > node.position.y &&
        position.y < node.position.y + (node.style?.height as number || 0)
    );

    if (parentNode) {
        newNode.parentId = parentNode.id;
        newNode.extent = 'parent';

        // Adjust the position to be relative to the parent
        newNode.position = {
            x: position.x - parentNode.position.x,
            y: position.y - parentNode.position.y,
        };
    }
}

export default memo(ZoneNode);