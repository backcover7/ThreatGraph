export const shapes = {
    FRAME: 'frame',
    RECTANGLE: 'rectangle',
    TEXT: 'text',
    ARROW: 'arrow',
}

function getAElement(type: string, x: number, y: number): {type: string; x: number; y: number} {
    return { type, x, y }
}

export function getAZone(x: number, y: number): {type: string; x: number; y: number} {
    return { type: shapes.FRAME, x, y }
}

export function getANode(x: number, y: number): {type: string; x: number; y: number} {
    return { type: shapes.RECTANGLE, x, y }
}

export function getAProcess(x: number, y: number): {type: string; x: number; y: number} {
    return { type: shapes.TEXT, x, y }
}

export function getADataflow(x: number, y: number): {type: string; x: number; y: number} {
    return { type: shapes.ARROW, x, y }
}

// TODO on create a new frame
// TODO if https://github.com/excalidraw/excalidraw/issues/8359 fixed, then remove this function and its references
export function hackHierarchicalFrames(frameShape: any, allShapes:any) {
    let smallestParentFrame: any, biggestChildFrame: any;
    let smallestParentArea: number = Infinity;
    let biggestChildArea: number = 0;
    let frameArea: number = frameShape.width * frameShape.height;

    allShapes.filter((otherFrameShape: any) => {
        if (otherFrameShape.type === shapes.FRAME && otherFrameShape.id !== frameShape.id) {
            const startXcordOffset = otherFrameShape.x - frameShape.x;
            const startYcordOffset = otherFrameShape.y - frameShape.y;
            const endXcordOffset = (otherFrameShape.x + otherFrameShape.width) - (frameShape.x + frameShape.width);
            const endYcordOffset = (otherFrameShape.y + otherFrameShape.height) - (frameShape.y + frameShape.height);
            const otherFrameArea = otherFrameShape.width * frameShape.height;
            // look for parent frames
            if (startXcordOffset < 0 && endXcordOffset > 0
                && startYcordOffset < 0 && endYcordOffset > 0
                && otherFrameArea < smallestParentArea
                && otherFrameArea > frameArea) {        // Redundant check but only for easy code readability
                smallestParentFrame = otherFrameShape;
            }
            // look for child frames
            else if (startXcordOffset > 0 && endXcordOffset < 0
                && startYcordOffset > 0 && endYcordOffset < 0
                && otherFrameArea > biggestChildArea
                && otherFrameArea < frameArea) {        // Redundant check but only for easy code readability
                biggestChildFrame = otherFrameShape;
            }
            // frame aligns with some other frames
            else if (startXcordOffset === 0 || endXcordOffset === 0
                || startYcordOffset === 0 || endYcordOffset === 0
                || otherFrameArea === frameArea) {
                // TODO make this frame not to align with the edge of another frame
                throw new Error('Wrong frame placing');
            }
            else {
                throw new Error('Wrong frame placing');
            }

            if (smallestParentFrame) {
                frameShape.frameId = smallestParentFrame.id;
            } else if (biggestChildFrame) {
                biggestChildFrame.frameId = frameShape.id;
            }
        }
    })
}


function checkNewDataflows(arrowShape: any, allShapes:any) {
    const start = allShapes.find((nodeElement: any) => nodeElement.id === arrowShape.startBinding.elementId);
    const end = allShapes.find((nodeElement: any) => nodeElement.id === arrowShape.endBinding.elementId);

    // Only connect entities and datastores using dataflows
    const validTypes = ['entity', 'datastore'];
    if (!validTypes.includes(start.model.metadata.type) ||
        !validTypes.includes(end.model.metadata.type)) {
        throw new Error('Wrong shape placing');
    }

    // Special bug case: arrow does not display when it connects between two nodes in different zones.
    // HACK to remove frameId of it will make arrow always display
    if (start.frameId !== end.frameId) {
        arrowShape.frameId = null;
    }
}

function isNodeInZone(nodeShape: any): boolean {
    return nodeShape.frameId !== null;
}