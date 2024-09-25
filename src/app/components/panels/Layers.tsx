import React from 'react';
import { Node } from "@xyflow/react";
import { Zone } from "@/DFD/zone";
import { Entity } from "@/DFD/node/entity";
import { DataStore } from "@/DFD/node/datastore";
import { Process } from "@/DFD/process";
import { Button } from "@/components/ui/button";
import {LuFrame, LuChevronRight, LuChevronDown, LuRectangleHorizontal, LuDatabase} from "react-icons/lu";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {GiGearStick} from "react-icons/gi";
import {AiOutlineFontColors} from "react-icons/ai";
import {ScrollArea} from "@/components/ui/scroll-area";

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
    level: number;
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({ treeNode, nodes, level }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const node = nodes.find((node: Node) => node.id === treeNode.id);
    const model = node?.data?.model as Zone|Entity|DataStore|Process|undefined;
    const name = model?.metadata?.name ?? 'Unnamed';

    const indentationStyle = {
        paddingLeft: `${level * 5}px`,
        borderLeft: level > 0 ? '1px solid #e2e8f0' : 'none',
        marginLeft: level > 0 ? '4px' : '0',
    };

    if (treeNode.children.length === 0) {
        return (
            <div style={indentationStyle} className="py-1">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                    <h4 className="text-sm font-semibold flex items-center">
                        {
                            treeNode?.type === 'group' ? <LuFrame className="mr-2 h-4 w-4" /> :
                            treeNode?.type === 'default' ? <LuRectangleHorizontal className="mr-2 h-4 w-4" /> :
                            treeNode?.type === 'output' ? <LuDatabase className="mr-2 h-4 w-4" /> :
                            treeNode?.type === 'process' ? <GiGearStick className="mr-2 h-4 w-4" /> :
                            treeNode?.type === 'text' ? <AiOutlineFontColors className="mr-2 h-4 w-4" /> :
                            <></>
                        }
                        {name}
                    </h4>
                </Button>
            </div>
        );
    }

    return (
        <div style={indentationStyle}>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full"
            >
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start py-1">
                        <h4 className="text-sm font-semibold flex items-center">
                            {isOpen ? <LuChevronDown className="mr-2 h-4 w-4" /> : <LuChevronRight className="mr-2 h-4 w-4" />}
                            <LuFrame className="mr-2 h-4 w-4" />{name}
                        </h4>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4">
                        {treeNode.children.map(child => (
                            <TreeNodeComponent key={child.id} treeNode={child} nodes={nodes} level={level + 1} />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
};

interface TreeViewProps {
    nodes: Node[];
}

export default function TreeView(nodes: Node[]) {
    const tree = getGroupTree(nodes);

    return (
        <div className="p-4">
            {tree.map(treeNode => (
                <TreeNodeComponent key={treeNode.id} treeNode={treeNode} nodes={nodes} level={0} />
            ))}
        </div>
    );
}