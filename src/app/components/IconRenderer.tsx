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
        return `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMzIgMzIiPjxwYXRoIGZpbGw9ImJsYWNrIiBkPSJNMjkuMzkxIDE0LjUyN0wxNy40NzMgMi42MDlDMTcuMDY3IDIuMjAzIDE2LjUzMyAyIDE2IDJzLTEuMDY3LjIwMy0xLjQ3My42MDlMMi42MDkgMTQuNTI3QzIuMjAzIDE0LjkzMyAyIDE1LjQ2NiAyIDE2cy4yMDMgMS4wNjcuNjA5IDEuNDczTDE0LjUyNiAyOS4zOWMuNDA3LjQwNy45NDEuNjEgMS40NzQuNjFzMS4wNjctLjIwMyAxLjQ3My0uNjA5TDI5LjM5IDE3LjQ3NGMuNDA3LS40MDcuNjEtLjk0LjYxLTEuNDc0cy0uMjAzLTEuMDY3LS42MDktMS40NzNNMTYgMjRhMS41IDEuNSAwIDEgMSAwLTNhMS41IDEuNSAwIDAgMSAwIDNtMS4xMjUtNi43NTJ2MS44NzdoLTIuMjVWMTVIMTdjMS4wMzQgMCAxLjg3NS0uODQxIDEuODc1LTEuODc1UzE4LjAzNCAxMS4yNSAxNyAxMS4yNWgtMmExLjg3NyAxLjg3NyAwIDAgMC0xLjg3NSAxLjg3NXYuNWgtMi4yNXYtLjVBNC4xMyA0LjEzIDAgMCAxIDE1IDloMmE0LjEzIDQuMTMgMCAwIDEgNC4xMjUgNC4xMjVhNC4xMyA0LjEzIDAgMCAxLTQgNC4xMjMiLz48cGF0aCBmaWxsPSJub25lIiBkPSJNMTYgMjFhMS41IDEuNSAwIDEgMS0uMDAxIDMuMDAxQTEuNSAxLjUgMCAwIDEgMTYgMjFtMS4xMjUtMy43NTJhNC4xMyA0LjEzIDAgMCAwIDQtNC4xMjNBNC4xMyA0LjEzIDAgMCAwIDE3IDloLTJhNC4xMyA0LjEzIDAgMCAwLTQuMTI1IDQuMTI1di41aDIuMjV2LS41YzAtMS4wMzQuODQxLTEuODc1IDEuODc1LTEuODc1aDJjMS4wMzQgMCAxLjg3NS44NDEgMS44NzUgMS44NzVTMTguMDM0IDE1IDE3IDE1aC0yLjEyNXY0LjEyNWgyLjI1eiIvPjwvc3ZnPg==`;
    }

    return (
        <img src={sanitizedUrl} alt="Icon" width={width} height={height}/> // TODO alt
    );
};

export default IconRenderer;