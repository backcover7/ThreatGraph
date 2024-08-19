/**
 *
 * This Diagram class is used to parse canvas to insert `attached` property in the `model` property object in every
 * element. The `attached` property is used to analyze connected element when scanning rules.
 *
 * The schema of `attached` property object will be as described in model.ts
 *
 */

import * as basicShapes from '../illustrate/basic-shapes';
import * as model from '../model';

export default class Diagram {
    #shapes: any = {};
    #processedElements: Map<string, any> = new Map();

    constructor(excalidrawJson: string) {
        const excalidraw = JSON.parse(excalidrawJson);
        this.#shapes = excalidraw.elements;
    }

    processCanvas(): any[] {
        try {
            this.#shapes.forEach((shape: any) => {
                if (shape.model && this.#parseShapeToElement(shape)) {
                    const processedElement = {
                        ...shape.model,
                        metadata: {
                            ...(shape.model.metadata || {}),
                            shape: shape.id
                        },
                        attached: {}
                    };
                    this.#processedElements.set(shape.id, processedElement);
                }
            });

            this.#processedElements.forEach((element, id) => {
                const shape = this.#shapes.find((s: any) => s.id === id);
                element.attached = this.#buildAttachedProperty(shape);
            });

            return Array.from(this.#processedElements.values());
        } catch (error) {
            console.error('Error processing diagram:', error);
            return [];
        }
    }

    #buildAttachedProperty(shape: any): any {
        switch (shape.model.metadata.element) {
            case model.ModelElements.ZONE:
                return this.#buildFrameAttached(shape);
            case model.ModelElements.ENTITY:
                return this.#buildNodeShapeAttached(shape);
            case model.ModelElements.DATASTORE:
                return this.#buildNodeShapeAttached(shape);
            case model.ModelElements.PROCESS:
                return this.#buildTextAttached(shape);
            case model.ModelElements.DATAFLOW:
                return this.#buildArrowAttached(shape);
            default:
                return {};
        }
    }

    #parseShapeToElement(shape: any): boolean {
        switch (shape.model.metadata.element) {
            case model.ModelElements.ZONE:
            case model.ModelElements.ENTITY:
            case model.ModelElements.DATASTORE:
            case model.ModelElements.PROCESS:
            case model.ModelElements.DATAFLOW:
                return true;
            default:
                return false;
        }
    }

    // Zone has to be frame shape.
    #buildFrameAttached(frameShape: any): model.ZoneAttached {
        return {
            parent: frameShape.frameId ? this.#processedElements.get(frameShape.frameId) : null,
            children: this.#shapes
                .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.FRAME)
                .map((s: any) => this.#processedElements.get(s.id)),
            entities: this.#shapes
                .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.RECTANGLE && s.model.metadata.element === model.ModelElements.ENTITY)
                .map((s: any) => this.#processedElements.get(s.id)),
            datastores: this.#shapes
                .filter((s: any) => s.frameId === frameShape.id && s.type === basicShapes.shapes.RECTANGLE && s.model.metadata.element === model.ModelElements.DATASTORE)
                .map((s: any) => this.#processedElements.get(s.id)),
        };
    }

    // Entity and Datastore could be any kind of shape, like rectangle, circle, diamond or image. But rectangle will be a default shape for Node.
    #buildNodeShapeAttached(nodeShape: any): model.NodeAttached {
        const boundedArrowShapes = nodeShape.boundElements
            .filter((b: any) => b.type === 'arrow')
            .map((b: any) => b.id);
        return {
            zone: this.#processedElements.get(nodeShape.frameId),
            flows: boundedArrowShapes.map((id: string) => this.#processedElements.get(id))
        };
    }

    // Dataflow has to be arrow shape. Cannot be line shape.
    #buildArrowAttached(arrowShape: any): model.DataflowAttached {
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
            process: this.#processedElements.get(processId),
            active: this.#processedElements.get(startId),
            passive: this.#processedElements.get(endId),
        };
    }

    // Process has to be label text of arrow shape.
    #buildTextAttached(textShape: any): model.ProcessAttached {
        const arrowShape = this.#shapes.find((s: any) => s.id === textShape.containerId && s.type === 'arrow');
        return { flow: this.#processedElements.get(arrowShape.id) };
    }
}