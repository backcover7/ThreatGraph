import {Connection, Node} from "@xyflow/react";
import {getArea} from "@/app/components/nodes/Zone";

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

export function getEdgeIdFromConnection(conn: Connection) {
    return 'xy-edge__' + conn.source + conn.sourceHandle + '-' + conn.target + conn.targetHandle;
}