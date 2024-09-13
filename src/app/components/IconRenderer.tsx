'use client'

import React, { useState, useEffect } from 'react';
import { sanitizeDataUrl } from "@/app/components/utils";

interface IconRendererProps {
    dataUrl?: string;
    width?: string;
    height?: string;
}

const IconRenderer: React.FC<IconRendererProps> = ({ dataUrl = '', width='100%', height='100%' }) => {
    const [svgContent, setSvgContent] = useState<string>(dataUrl);
    const [sanitizedUrl, setSanitizedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (svgContent) {
            if (svgContent.startsWith('<svg')) {  // Resolve svg element
                const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;
                setSanitizedUrl(sanitizeDataUrl(svgDataUrl));
            } else {
                setSanitizedUrl(sanitizeDataUrl(svgContent));
            }
        } else {
            setSanitizedUrl(null);
        }
    }, [svgContent]);

    if (!sanitizedUrl) {
        return null; // TODO: image placeholder
    }

    return (
        <img src={sanitizedUrl} alt="Icon" width={width} height={height}/> // TODO alt
    );
};

export default IconRenderer;