import React, { memo } from 'react';
import { useDnD } from '@/app/components/DnDContext';
import { LuDatabase, LuFrame, LuRectangleHorizontal } from "react-icons/lu";
import {AiOutlineFontColors} from "react-icons/ai";

type NodeType = 'input' | 'default' | 'output' | 'group' | 'annotation';

interface NodeInfo {
    type: NodeType;
    label: React.ReactNode;
    dragLabel: string;
}

const nodeTypes: NodeInfo[] = [
    { type: 'group', label: <LuFrame />, dragLabel: 'Zone' },
    { type: 'default', label: <LuRectangleHorizontal />, dragLabel: 'Entity' },
    { type: 'output', label: <LuDatabase />, dragLabel: 'Datastore' },
    { type: 'annotation', label: <AiOutlineFontColors />, dragLabel: 'Text' },
];

const Tooltip: React.FC = () => {
    const [_, __, setTypeAndName] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeInfo: NodeInfo) => {
        setTypeAndName([nodeInfo.type, nodeInfo.dragLabel]);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            background: '#fcfcfc',
            height: '100%',
        }}>
            {nodeTypes.map((nodeInfo) => (
                <div
                    key={nodeInfo.type}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '40px',
                        height: '40px',
                        border: '0px',
                        borderRadius: '4px',
                        cursor: 'grab',
                        fontSize: '18px',
                    }}
                    onDragStart={(event) => onDragStart(event, nodeInfo)}
                    draggable
                    title={nodeInfo.dragLabel}
                >
                    {nodeInfo.label}
                </div>
            ))}
        </div>
    );
};

export default memo(Tooltip);