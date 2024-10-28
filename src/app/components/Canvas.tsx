'use client'

import React, {useCallback, useRef, useState} from 'react';
import {
    addEdge, Connection, Controls, Edge, HandleType, MiniMap, Node, OnSelectionChangeParams, Panel,
    ReactFlow, reconnectEdge,
    useEdgesState, useNodesState, useOnSelectionChange, useReactFlow,
} from '@xyflow/react';
import GeneralTools from '@/app/components/panels/toolbar/GeneralTools';
import {useDnD} from '@/app/components/DnDContext';
import {detachElement, groupElements} from "@/app/components/nodes/ZoneNode";
import {defaultEdgeOptions, edgeTypes} from "@/app/components/nodes/DataflowEdge";
import {ElementColor, ElementNodes, getNewElement} from "@/app/components/nodes/ElementNode";
import {push} from "@/app/components/utils";
import BuiltInTools from "@/app/components/panels/toolbar/BuiltInTools";
import Diagram from "@/draw/diagram";
import Analyzer from "@/parser/analyzer";
import {Result} from "@/DFD/result";
import {useTemplate} from "@/app/components/panels/toolbar/TemplateContext";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {FaCirclePlay} from "react-icons/fa6";
import {AlertTriangle} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import TreeView from "@/app/components/panels/Layers";
import Properties from "@/app/components/panels/Properties";
import {useCommand} from "@/app/components/CommandProvider";

const Canvas: React.FC = () => {
    const { screenToFlowPosition, addNodes, getInternalNode, getNodes, getEdges } = useReactFlow();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const edgeReconnectSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [type, data] = useDnD();
    const { setIsCommandOpen } = useCommand();

    const templates = useTemplate();
    const [analysisResults, setAnalysisResults] = useState<Result[]>([]);
    const [activeTab, setActiveTab] = useState("layers");

    const isValidConnection = useCallback((connection: Connection | Edge) => {
        const { source, sourceHandle, target, targetHandle } = connection as Connection;
        // Check if source and target are the same
        if (source === target) return false;
        return !(edges as Edge[]).some(edge => (edge.source === source && edge.target === target) || (edge.target === source && edge.source === target))
    }, [edges]);

    const onConnect = useCallback((conn: Connection) => {
        setEdges((edges) => { return addEdge(conn, edges) as never; })
    }, [setEdges]);

    const onReconnectStart = useCallback(() => { edgeReconnectSuccessful.current = false; }, []);

    const onReconnect = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((edges) => { return reconnectEdge(oldEdge, newConnection, edges) as never });
    },[setEdges]);

    const onReconnectEnd = useCallback((event: MouseEvent | TouchEvent, edge: never, handleType: HandleType) => {
        if (!edgeReconnectSuccessful.current) setEdges((eds) => eds.filter((e) => (e as Edge).id !== (edge as Edge).id));
    }, [setEdges]);

    // Drag new element
    const onDragOver = useCallback( (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Check if process node is drop on edge. If so, turn it to a child div of EdgeLabelRenderer
    const checkDropOnEdge = (x: number, y: number) => {
        return getEdges().find(edge => {
            const edgeElement = document.querySelector(`[data-testid="rf__edge-${edge.id}"]`);
            if (edgeElement) {
                const rect = edgeElement.getBoundingClientRect();
                return (
                    x >= rect.left &&
                    x <= rect.right &&
                    y >= rect.top &&
                    y <= rect.bottom
                );
            }
            return false;
        });
    };

    // Drop new element
    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!type) return;

            const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newElem = getNewElement(type, position, data);

            const droppedOnEdge = checkDropOnEdge(event.clientX, event.clientY);

            if (droppedOnEdge && type === 'process') {
                // Update the edge to show ProcessComponent
                setEdges(edges => (edges as Edge[]).map(edge =>
                    edge.id === droppedOnEdge.id
                        ? {...edge, data: {...edge?.data, process: { ...(edge.data?.process ?? {}), ...data }, isProcessNode: true}}
                        : edge
                ) as never);
            } else {
                // Add node as usual
                if (nodes.length === 0) {
                    addNodes(newElem);
                } else {
                    setNodes((prevNodes) => {
                        const unSelectedNodes = prevNodes.map((node: Node) => ({...node, selected: false}));
                        return groupElements(push(unSelectedNodes, newElem as never), getInternalNode, setNodes) as never;
                    });
                }
            }
        },
        [nodes, screenToFlowPosition, setNodes, type, data, getInternalNode, getEdges, setEdges, addNodes]
    );

    const onNodeDragStart = useCallback((event: React.MouseEvent, detachedNode: Node) => {
        // Detach node from group
        setNodes(nodes => {
            return detachElement(detachedNode, nodes, getInternalNode);
        });
    }, [getInternalNode]);

    // drag existing element
    const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
        const droppedOnEdge = checkDropOnEdge(event.clientX, event.clientY);

        if (droppedOnEdge && node.type === 'process') {
            // Update the edge to show ProcessComponent
            setEdges(edges => (edges as Edge[]).map(edge =>
                edge.id === droppedOnEdge.id ? {...edge, data: {...edge?.data, process: { ...(edge.data?.process ?? {}), ...data }, isProcessNode: true}} : edge
            ) as never);

            // Remove the dragged process node
            setNodes(nodes => (nodes as Node[]).filter(n => n.id !== node.id) as never);
        } else {
            // Group elements as before
            setNodes((nodes) => groupElements(nodes as Node[], getInternalNode, setNodes) as never);
        }
    }, [setNodes, setEdges, getInternalNode]);

    const [selectedElems, setSelectedElems] = useState<string[]>([]);
    const [lastSelectedElem, setLastSelectedElem] = useState<string>();

    // get last selected element and show details in the properties panel
    useOnSelectionChange({
        onChange: useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
            const currentSelectedIds = new Set(selectedElems);
            const newSelectedIds = [
                ...nodes.map((node) => node.id),
                ...edges.map((edge) => edge.id)
            ];
            setSelectedElems(newSelectedIds);

            const newlySelectedId = newSelectedIds.find(id => !currentSelectedIds.has(id));
            if (newlySelectedId) setLastSelectedElem(newlySelectedId);

        }, [selectedElems])
    });

    const renderLayers = useCallback(() => {
        return (
            <>
                {TreeView(nodes)}
            </>
        );
    }, [nodes]);

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.metaKey && event.key === 'a') {
            event.preventDefault();
            setNodes(nodes => (nodes as Node[]).map(node => ({...node, selected: true,})) as never);
            setEdges(edges => (edges as Edge[]).map(edge => ({...edge, selected: true,})) as never);
        } else if (event.metaKey && event.key === 'J') {
            // TODO Command
            event.preventDefault();
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
            // TODO Copy
            event.preventDefault();
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            // TODO Paste
            event.preventDefault();
        }
    }, [setNodes, setEdges]);

    React.useEffect(() => {
        document.addEventListener('keydown', onKeyDown);
        return () => {document.removeEventListener('keydown', onKeyDown);};
    }, [onKeyDown]);

    const runAnalysis = useCallback(() => {
        const allNodes = getNodes();
        const allEdges = getEdges();
        const diagram = new Diagram(allNodes, allEdges);
        const canvasElems = diagram.process();

        const outOfScope: string[] = [];  // shape id collection
        const inScopeElems = canvasElems.filter(elem => !outOfScope.includes(elem.id));

        const results: [] = [];

        const allRules = templates.rule;
        const allThreats = templates.threat;
        allRules.forEach((rule) => {
            const analyzer = new Analyzer(rule, inScopeElems, allThreats);
            analyzer.startEvaluation(results);
        })

        results.forEach((result: Result) => {
            const threat = allThreats.find(threat => threat.id === result.threat);
            const element = canvasElems.find(elem => elem.metadata.shape === result.shape);
        })
        console.log('[!] ' + results.length + ' threats found!')
        setAnalysisResults(results);
        setActiveTab("threats");

    }, [getNodes, getEdges]);

    return (
        <div className="dndflow">
            <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                <ReactFlow
                    // fitView
                    className="touch-flow"
                    style={{cursor: 'default'}}
                    panOnScroll={true}
                    nodes={nodes}
                    nodeTypes={ElementNodes}
                    onNodesChange={onNodesChange}
                    isValidConnection={isValidConnection}
                    onEdgesChange={onEdgesChange}
                    edgesReconnectable={true}
                    onConnect={onConnect}
                    onReconnectStart={onReconnectStart}
                    onReconnect={onReconnect}
                    onReconnectEnd={onReconnectEnd}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onNodeDragStart={onNodeDragStart}
                    onNodeDragStop={onNodeDragStop}
                    edges={edges}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    // onNodeMouseEnter={}
                    // onNodeMouseLeave={}
                    // onEdgeMouseEnter={}
                    // onEdgeMouseLeave={}  // TODO hover and highlight node and edge
                >
                    <Controls>
                        {/**TODO**/}
                        {/*<ControlButton onClick={() => alert('This is ZoneZone')}>*/}
                        {/*    <HiQuestionMarkCircle />*/}
                        {/*</ControlButton>*/}
                    </Controls>
                    <MiniMap nodeColor={ElementColor} nodeStrokeWidth={1} zoomable pannable />
                    <Panel position='top-left'>
                        <BuiltInTools templates={templates} />
                    </Panel>
                    <Panel position='top-right'>
                        <Card className="flex h-[5vh]">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Button variant="ghost" onClick={runAnalysis}>
                                <FaCirclePlay className="h-4 w-4"/>
                            </Button>
                        </Card>

                        <Card className="h-[20vh]">
                            <Tabs defaultValue="properties" className="w-[400px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="properties">Properties</TabsTrigger>
                                    <TabsTrigger value="style">Style</TabsTrigger>
                                </TabsList>
                                <TabsContent value="properties">
                                    <Properties lastSelectedElem={lastSelectedElem} nodes={nodes} edges={edges} />
                                </TabsContent>
                                <TabsContent value="style">
                                    {/*TODO*/}
                                </TabsContent>
                            </Tabs>
                        </Card>

                        <Card className="h-[40vh]">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="layers">Layers</TabsTrigger>
                                    <TabsTrigger value="threats">Threats</TabsTrigger>
                                </TabsList>
                                <TabsContent value="layers">
                                     <ScrollArea className="grid w-full grid-cols-2">
                                         {renderLayers()}
                                     </ScrollArea>
                                </TabsContent>
                                <TabsContent value="threats">
                                    {analysisResults.length > 0 ? (
                                        <div className="space-y-2">
                                            {analysisResults.map((result, index) => {
                                                const threat = templates.threat.find(t => t.id === result.threat);
                                                return (
                                                    <Button key={index} variant="outline" className="w-full justify-start">
                                                        <AlertTriangle className="mr-2 h-4 w-4" /> {threat?.name}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div>No threats</div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </Panel>
                    <Panel position="top-center">
                        <GeneralTools/>
                    </Panel>
                    {/*<Background*/}
                    {/*    color="#00000" variant={BackgroundVariant.Cross} gap={30}*/}
                    {/*/>*/}
                    {/*<Panel position='top-center'>*/}
                    {/*    <Card>*/}
                    {/*        /!*This is for run background settings like dark mode TODO*!/*/}
                    {/*        <Button></Button>*/}
                    {/*    </Card>*/}
                    {/*</Panel>*/}
                </ReactFlow>
            </div>
        </div>
    );
};

export default Canvas;