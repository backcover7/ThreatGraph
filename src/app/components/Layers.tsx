import {Node} from "@xyflow/react";
import {Zone} from "@/DFD/zone";
import {Entity} from "@/DFD/node/entity";
import {DataStore} from "@/DFD/node/datastore";
import {Process} from "@/DFD/process";
import {Button} from "@/components/ui/button";
import {LuFrame} from "react-icons/lu";

interface TreeNode {
    id: string;
    type: string | undefined;
    children: TreeNode[];
}

function getGroupTree(nodes: Node[]): TreeNode[] {
    const nodeMap: Map<string, TreeNode> = new Map();

    nodes.forEach(node => {
        nodeMap.set(node.id, {
            id: node.id,
            type: node.type,
            children: []
        });
    });

    const rootNodes: TreeNode[] = [];

    nodes.forEach(node => {
        const treeNode = nodeMap.get(node.id);
        if (!treeNode) return;

        if (node.parentId) {
            const parent = nodeMap.get(node.parentId);
            if (parent) {
                parent.children.push(treeNode);
            } else {
                rootNodes.push(treeNode);
            }
        } else {
            rootNodes.push(treeNode);
        }
    });

    return rootNodes;
}

interface TreeNodeComponentProps {
    treeNode: TreeNode;
    nodes: Node[];
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({ treeNode, nodes }) => {
    const node = nodes.find((node: Node) => node.id === treeNode.id);
    const model = node?.data?.model as Zone|Entity|DataStore|Process|undefined;
    const name = model?.metadata?.name ?? 'Unnamed';

    return (
        <div>
            {treeNode.children.length === 0 ? (
                <Button variant="ghost" size="sm">
                    <h4 className="text-sm font-semibold flex items-center">
                        <LuFrame className="mr-2 h-4 w-4" />
                        {name}
                    </h4>
                </Button>
            ) : (
                <div>
                    <h4 className="text-sm font-semibold">{name}</h4>
                    {treeNode.children.map(child => (
                        <TreeNodeComponent key={child.id} treeNode={child} nodes={nodes} />
                    ))}
                </div>
            )}
        </div>
    );
};


export default function TreeView(nodes: Node[]) {
    const tree = getGroupTree(nodes);

    return (
        <div>
            {tree.map(treeNode => (
                <TreeNodeComponent key={treeNode.id} treeNode={treeNode} nodes={nodes} />
            ))}
        </div>
    );
}