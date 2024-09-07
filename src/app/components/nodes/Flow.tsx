import {MarkerType} from "@xyflow/react";

export const flowOptions = {
    type: 'default',
    animated: true,
    label: 'process',
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
    },
    style: {
        strokeWidth: 1,
    },
};