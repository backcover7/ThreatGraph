import React from 'react';
import { MdDeleteForever } from "react-icons/md";

type ProcessData = {
    label: string;
};

interface ProcessComponentProps {
    data: ProcessData;
    isProcessNode?: boolean;
}

const ProcessComponent: React.FC<ProcessComponentProps> = ({ data, isProcessNode = false }) => {
    const style = {
        background: '#e8e8e8',
        border: '1px solid #ddd',
        borderRadius: '5px',
        fontSize: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,  // Same as edgebutton
    };

    return (
        <div style={style}>
            <div>
                <MdDeleteForever />
            </div>
            <div>
                {data.label}
            </div>
        </div>
    );
};

export default ProcessComponent;