/**
 * Find all complete paths in the canvas from start node to end node.
 * @param canvasElements
 */
function getConnectedFlows(canvasElements: any[]): any[][] {
    const nodes = canvasElements.filter(element => ['entity', 'datastore'].includes(element.model.element));
    const starts = getStarts(nodes);
    const ends = getEnds(nodes);

    const allPaths: any[][] = [];

    for (const start of starts) {
        dfs(start, ends, [], new Set(), allPaths);
    }

    return allPaths;
}

function dfs(
    currentNode: any,
    ends: any[],
    currentPath: any[],
    visited: Set<any>,
    allPaths: any[][]
) {
    currentPath.push(currentNode);
    visited.add(currentNode);

    if (ends.includes(currentNode)) {
        allPaths.push([...currentPath]);
    } else {
        const nextNodes = getNext(currentNode, currentPath);
        for (const nextNode of nextNodes) {
            if (!visited.has(nextNode)) {
                dfs(nextNode, ends, currentPath, visited, allPaths);
            }
        }
    }

    currentPath.pop();
    visited.delete(currentNode);
}

/**
 * Get all nodes which only actively initiate dataflow
 * @param nodes
 */
function getStarts(nodes: any[]): any[] {
    return nodes.filter(node => {
        return node.attached.flows.every((flow: any) => {
            return flow.attached.active === node && flow.attached.passive !== node;
        });
    })
}

/**
 * Get all nodes which only passively receive dataflow
 * @param nodes
 */
function getEnds(nodes: any[]): any[] {
    return nodes.filter(node => {
        return node.attached.flows.every((flow: any) => {
            return flow.attached.passive === node && flow.attached.active !== node;
        });
    })
}

/**
 * Get next forward node connected with dataflow
 * @param node
 * @param currentPath
 */
function getNext(node: any, currentPath: any[]): any[] {
    return node.attached.flows.map((flow: { attached: { active: any, passive: any; }; }) => {
        currentPath.push(flow); // add flow into path as well
        return flow.attached.passive;
    })
}

/**
 * Get next backward node connected with dataflow
 * @param node
 */
function getPrevious(node: any): any[] {
    return node.attached.flows.map((flow: { attached: { active: any, passive: any; }; }) => {
        return flow.attached.active;
    })
}