import React from 'react';
import { useDnD } from '@/app/components/DnDContext';

type NodeType = 'input' | 'default' | 'output' | 'group';

interface NodeInfo {
    type: NodeType;
    label: string;
}

const nodeTypes: NodeInfo[] = [
    { type: 'default', label: 'Entity' },
    { type: 'output', label: 'Datastore' },
    { type: 'group', label: 'Zone' },
];

const Tooltip: React.FC = () => {
    const [_, __, setTypeAndName] = useDnD();

    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeInfo: NodeInfo) => {
        setTypeAndName([nodeInfo.type, nodeInfo.label]);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            {nodeTypes.map((nodeInfo) => (
                <div
                    key={nodeInfo.type}
                    className={`dndnode ${nodeInfo.type}`}
                    onDragStart={(event) => onDragStart(event, nodeInfo)}
                    draggable
                >
                    {nodeInfo.label}
                </div>
            ))}
        </aside>
    );
};

export default Tooltip;