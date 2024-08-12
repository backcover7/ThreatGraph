import * as basicShapes from '../illustrate/basic-shapes'

class diagram {
    shapes: any = {};

    constructor(excalidrawJson: string) {
        const excalidraw = JSON.parse(excalidrawJson);
        this.shapes = excalidraw.elements;
    }

    processShapes(): any[] {
        try {
            return this.shapes.map((shape: any) => {
                try {
                    const attached =  this.parseShapeToElement(shape);
                    return shape.model && attached;   // return complete built elements with attached object
                } catch (error) {
                    console.error('Error parsing shape:', error);
                }
            }).filter(Boolean);
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
                return this.parseArrowToDataflow(shape);
            case basicShapes.shapes.DATAFLOW:
                return this.parseTextToProcess(shape);
            default:
                return {};
        }
    }

    parseFrameToZone(frameShape: any) {
        return {
            // Excalidraw does not support multi-level frames
            // Hack to force applying parent frame.idd to child frameId property when creating frames
            parent: frameShape.frameId,
            child: this.shapes.filter((childFrameShapes: any) => childFrameShapes.frameId === frameShape.id),

            entities: this.shapes.filter((rectangleShape: any) =>
                rectangleShape.frameId === frameShape.id && rectangleShape.type === basicShapes.shapes.NODE && rectangleShape.model.metadata.type === 'entity')
                .map((rectangleShape: any) => rectangleShape.model),
            datastores: this.shapes.filter((rectangleShape: any) =>
                rectangleShape.frameId === frameShape.id && rectangleShape.type === basicShapes.shapes.NODE && rectangleShape.model.metadata.type === 'datastore')
                .map((rectangleShape: any) => rectangleShape.model),
        }
    }

    parseRectangleToNode(rectangleShape: any) {
        return {
            zone: this.shapes.find((frameShape: any) => frameShape.id === rectangleShape.frameId).model,
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
            console.error('Dataflow ' + arrowShape.id + ' is not connected correctly with nodes.')
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
        return { flow: arrowShape.model };
    }
}