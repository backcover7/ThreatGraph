import {Node} from "@xyflow/react";
import {getArea} from "@/app/components/nodes/ZoneNode";
import DOMPurify from "dompurify";

function compare(node1: Node, node2: Node): number {
    if (node1.type === 'group' && node2.type !== 'group') return -1;  // node1 should be placed before node2
    if (node1.type !== 'group' && node2.type === 'group') return 1;   // node2 should be placed before node1

    // Both are group node
    // If node1 is in the node2, node2 should be placed before node1 because parentNode node2 should be previous to childNode node1
    if (getArea(node1) < getArea(node2)) return 1;
    else return -1;
}

function sortArray(arr: ReadonlyArray<Node>): Node[] {
    return [...arr].sort(compare);
}

export function push(arr: ReadonlyArray<Node>, element: Node): Node[] {
    return sortArray([...arr, element]);
}

export function concat(arr: ReadonlyArray<Node>, elements: ReadonlyArray<Node>): Node[] {
    return sortArray([...arr, ...elements]);
}

export function sanitizeDataUrl(dataUrl: string): string {
    try {
        const url = new URL(dataUrl);
        // Use regex to match if the data URL is an SVG XML base64 encoded data URL
        const svgDataUrlRegex: RegExp = /^data:image\/svg\+xml;base64,/;
        if (!svgDataUrlRegex.test(url.href)) {
            throw new Error('Invalid SVG data URL');
        }

        // Convert data URL to SVG
        const base64Data: string = url.href.split(',')[1];
        const svgString: string = atob(base64Data);

        // Call svgToDataUrl
        return svgToDataUrl(svgString);
    } catch {
        throw new Error('Invalid SVG data URL');
    }
}

export function svgToDataUrl(svgString: string): string {
    // Use DOMPurify to sanitize SVG
    const sanitizedSvg: string = DOMPurify.sanitize(svgString);
    if (!sanitizedSvg) {
        throw new Error('SVG sanitization failed');
    }

    // Convert sanitized SVG to data URL
    const encodedSvg: string = encodeURIComponent(sanitizedSvg);
    return `data:image/svg+xml,${encodedSvg}`;
}