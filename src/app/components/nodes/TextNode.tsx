'use client'

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';

interface TextNodeProps extends NodeProps {
    data: {
        label: string;
        isNew?: boolean;
    };
    type: 'text';
}

const TextNode: React.FC<TextNodeProps> = ({ id, data }) => {
    const [isEditing, setIsEditing] = useState(data.isNew ?? false);
    const [text, setText] = useState(data.label);
    const { setNodes } = useReactFlow();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    }, []);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        if (!text.trim()) {
            setNodes((nodes) => nodes.filter((node) => node.id !== id));
        }
    }, [text, id, setNodes]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setIsEditing(false);
        }
    }, []);

    useEffect(() => {
        if (isEditing) {
            const timeoutId = setTimeout(() => {
                inputRef.current?.focus();
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [isEditing]);

    useEffect(() => {
        if (!isEditing && !text.trim()) {
            setNodes((nodes) => nodes.filter((node) => node.id !== id));
        }
    }, [isEditing, text, id, setNodes]);

    return (
        <div style={{ padding: 0, display: 'flex', fontSize: 12 }}>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={text}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="blinking-cursor"
                    style={{
                        fontSize: 12,
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent'
                    }}
                />
            ) : (
                <div onDoubleClick={() => setIsEditing(true)}>{text}</div>
            )}
        </div>
    );
};

export default memo(TextNode);