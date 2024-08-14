import * as basicShapes from '../illustrate/basic-shapes'

export default class Diagram {
    shapes: any = {};

    constructor(excalidrawJson: string) {
        const excalidraw = JSON.parse(excalidrawJson);
        this.shapes = excalidraw.elements;
    }

    processShapes(): any[] {
        try {
            return this.shapes.reduce((acc: any[], shape: any) => {
                const attached = this.parseShapeToElement(shape);
                if (attached !== null) acc.push({ ...shape.model, attached: { ...attached } });
                return acc;
            }, []);
        } catch (error) {
            console.error('Error processing diagram:', error);
            return [];
        }
    }

    /**
     * To get attached object of elements
     * @param shape
     */
    parseShapeToElement(shape: any) {
        switch (shape.type) {
            case basicShapes.shapes.ZONE:
                return this.parseFrameToZone(shape);
            case basicShapes.shapes.NODE:
                return this.parseRectangleToNode(shape);
            case basicShapes.shapes.PROCESS:
                return this.parseTextToProcess(shape);
            case basicShapes.shapes.DATAFLOW:
                return this.parseArrowToDataflow(shape);
            default:
                return {};
        }
    }

    parseFrameToZone(frameShape: any) {
        const entities: any[] = this.shapes.filter((rectangleShape: any) =>
                rectangleShape.frameId === frameShape.id && rectangleShape.type === basicShapes.shapes.NODE && rectangleShape.model.metadata.element === 'entity')
                .map((rectangleShape: any) => rectangleShape.model);
        const datastores: any[] = this.shapes.filter((rectangleShape: any) =>
                rectangleShape.frameId === frameShape.id && rectangleShape.type === basicShapes.shapes.NODE && rectangleShape.model.metadata.element === 'datastore')
                .map((rectangleShape: any) => rectangleShape.model);
        const children: any[] = this.shapes.filter((childFrameShape: any) =>
            childFrameShape.frameId === frameShape.id && childFrameShape.type === basicShapes.shapes.ZONE)
            .map((childFrameShapes: any) => childFrameShapes.model);
        return {
            // Excalidraw does not support multi-level frames
            // Hack to force applying parent frame.idd to child frameId property when creating frames
            parent: frameShape.frameId?.model ?? null,
            children,
            entities,
            datastores,
        }
    }

    parseRectangleToNode(rectangleShape: any) {
        const boundedArrowShapes = rectangleShape.boundElements.filter(
            (boundedArrowShape: { type: string; id: string; }) => boundedArrowShape.type === 'arrow' )
            .map((boundedArrowShape: any) => boundedArrowShape.id);
        return {
            zone: this.shapes.find((frameShape: any) => frameShape.id === rectangleShape.frameId).model,
            flow: this.shapes.filter((arrowShape: any) =>
                boundedArrowShapes.includes(arrowShape.id)).map((arrowShape: any) => arrowShape.model)
        }
    }

    parseArrowToDataflow(arrowShape: any) {
        let startId: string, endId: string;
        if (arrowShape.startArrowhead) {
            startId = arrowShape.startBinding.elementId;
            endId = arrowShape.endBinding.elementId;
        } else if (arrowShape.endArrowhead) {
            startId = arrowShape.endBinding.elementId;
            endId = arrowShape.startBinding.elementId;
        } else {
            throw new Error('Dataflow ' + arrowShape.id + ' is not connected correctly with nodes.')
        }

        const processId = arrowShape.boundElements.find((textShape: any) => textShape.type === 'text').id;

        return {
            process: this.shapes.find((textShape: any) => textShape.id === processId).model,
            active: this.shapes.find((rectangleShape: any) => rectangleShape.id === startId).model,
            passive: this.shapes.find((rectangleShape: any) => rectangleShape.id === endId).model,
        }

    }

    parseTextToProcess(textShape: any) {
        // Make sure the text shape is bounded on an arrow
        const arrowShape = this.shapes.find((arrowShape: any) =>
            arrowShape.id === textShape.containerId && arrowShape.type === 'arrow');

        return arrowShape?.model ? { flow: arrowShape.model } : null;
    }
}