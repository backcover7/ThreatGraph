"use client";

import React from 'react';
import * as excalidrawLib from "@excalidraw/excalidraw";

const ExcalidrawWrapper: React.FC = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
        }}>
            <excalidrawLib.Excalidraw />
        </div>
    );
};

export default ExcalidrawWrapper;