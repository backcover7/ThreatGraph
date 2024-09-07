'use client'

import { memo } from 'react';
import { NodeResizer } from '@xyflow/react';

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

export default memo(ZoneNode);