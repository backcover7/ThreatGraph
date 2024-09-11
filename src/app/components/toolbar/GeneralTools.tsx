import React, { memo } from 'react';
import { useDnD } from '@/app/components/DnDContext';
import { LuDatabase, LuFrame, LuRectangleHorizontal } from "react-icons/lu";
import {AiOutlineFontColors} from "react-icons/ai";
import {GiGearStick} from "react-icons/gi";

type NodeType = 'group' | 'input' | 'default' | 'output' | 'process' | 'text';

interface NodeInfo {
    type: NodeType;
    label: React.ReactNode;
    dragLabel: string;
}

const nodeTypes: NodeInfo[] = [
    { type: 'group', label: <LuFrame />, dragLabel: 'Zone' },
    { type: 'default', label: <LuRectangleHorizontal />, dragLabel: 'Entity' },
    { type: 'output', label: <LuDatabase />, dragLabel: 'Datastore' },
    { type: 'process', label: <GiGearStick />, dragLabel: 'Process' },
    { type: 'text', label: <AiOutlineFontColors />, dragLabel: 'Text' },
];

const GeneralTools: React.FC = () => {
    const [_, __, setTypeAndName] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeInfo: NodeInfo) => {
        setTypeAndName([nodeInfo.type, nodeInfo.dragLabel]);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div>
            {nodeTypes.map((nodeInfo) => (
                <div
                    key={nodeInfo.type}
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

export default memo(GeneralTools);