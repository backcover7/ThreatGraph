'use client'

import { Node } from "@xyflow/react";

function compare(node1: Node, node2: Node): number {
    if (node1.type === 'group' && node2.type !== 'group') return -1;
    if (node1.type !== 'group' && node2.type === 'group') return 1;
    return 0;
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