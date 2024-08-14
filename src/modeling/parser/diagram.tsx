import * as basicShapes from '../illustrate/basic-shapes';
import * as model from '../model';

export default class Diagram {
    shapes: any = {};
    processedElements: Map<string, any> = new Map();

    constructor(excalidrawJson: string) {
        const excalidraw = JSON.parse(excalidrawJson);
        this.shapes = excalidraw.elements;
    }

    processShapes(): any[] {
        try {
            this.shapes.forEach((shape: any) => {
                if (shape.model && this.parseShapeToElement(shape)) {
                    this.processedElements.set(shape.id, { ...shape.model, attached: {} });
                }
            });

            this.processedElements.forEach((element, id) => {
                const shape = this.shapes.find((s: any) => s.id === id);
                element.attached = this.buildAttachedProperty(shape);
            });

            return Array.from(this.processedElements.values());
        } catch (error) {
            console.error('Error processing diagram:', error);
            return [];
        }
    }

    buildAttachedProperty(shape: any): any {
        switch (shape.type) {
            case basicShapes.shapes.FRAME:
                return this.buildFrameAttached(shape);
            case basicShapes.shapes.RECTANGLE:
                return this.buildRectangleAttached(shape);
            case basicShapes.shapes.TEXT:
                return this.buildTextAttached(shape);
            case basicShapes.shapes.ARROW:
                return this.buildArrowAttached(shape);
            default:
                return {};
        }
    }

    parseShapeToElement(shape: any): boolean {
        switch (shape.type) {
            case basicShapes.shapes.FRAME:
            case basicShapes.shapes.RECTANGLE:
            case basicShapes.shapes.TEXT:
            case basicShapes.shapes.ARROW:
                return true;
            default:
                return false;
        }
    }

    buildFrameAttached(frameShape: any) {
        const entities = this.shapes
            .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.RECTANGLE && s.model.metadata.element === model.ModelElements.ENTITY)
            .map((s: any) => this.processedElements.get(s.id));
        const datastores = this.shapes
            .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.RECTANGLE && s.model.metadata.element === model.ModelElements.DATASTORE)
            .map((s: any) => this.processedElements.get(s.id));
        const children = this.shapes
            .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.FRAME)
            .map((s: any) => this.processedElements.get(s.id));
        return {
            parent: frameShape.frameId ? this.processedElements.get(frameShape.frameId) : null,
            children,
            entities,
            datastores,
        };
    }

    buildRectangleAttached(rectangleShape: any) {
        const boundedArrowShapes = rectangleShape.boundElements
            .filter((b: any) => b.type === 'arrow')
            .map((b: any) => b.id);
        return {
            zone: this.processedElements.get(rectangleShape.frameId),
            flow: boundedArrowShapes.map((id: string) => this.processedElements.get(id))
        };
    }

    buildArrowAttached(arrowShape: any) {
        let startId: string, endId: string;
        if (arrowShape.startArrowhead) {
            startId = arrowShape.startBinding.elementId;
            endId = arrowShape.endBinding.elementId;
        } else if (arrowShape.endArrowhead) {
            startId = arrowShape.endBinding.elementId;
            endId = arrowShape.startBinding.elementId;
        } else {
            throw new Error('Dataflow ' + arrowShape.id + ' is not connected correctly with nodes.');
        }

        const processId = arrowShape.boundElements.find((textShape: any) => textShape.type === 'text').id;

        return {
            process: this.processedElements.get(processId),
            active: this.processedElements.get(startId),
            passive: this.processedElements.get(endId),
        };
    }

    buildTextAttached(textShape: any) {
        const arrowShape = this.shapes.find((s: any) => s.id === textShape.containerId && s.type === 'arrow');
        return arrowShape ? { flow: this.processedElements.get(arrowShape.id) } : null;
    }
}