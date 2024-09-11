import React, { memo } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import ProcessComponent from './ProcessComponent';

type ProcessData = {
    label: string;
};

const ProcessNode: React.FC<NodeProps<Node<ProcessData>>> = ({ data }) => {
    return <ProcessComponent data={data} isProcessNode={true} />;
};

export default memo(ProcessNode);