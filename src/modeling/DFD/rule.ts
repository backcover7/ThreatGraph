import { UUID, generateUUID } from "./base";
import { Element, ElementType } from './element';
import { Threat } from "./threat";

// Rule Type
export type Rule = {
    id: UUID;
    threat: Threat;
    element: ElementType | Element;
    designs: any;
}

export const ruleSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'threat', 'element', 'designs'],
    properties: {
        id: { type: 'string', format: 'uuid' },
        threat: { type: 'string', format: 'uuid' },
        element: { type: 'string', enum: [ 'zone', 'entity', 'datastore', 'process', 'dataflow' ] },
        designs: { type: 'array', items: { type: 'object' } }
    }
};

// Build Rule
function buildRule(
    threat: Threat,
    element: Element | ElementType,
    designs: any,
    id?: UUID | undefined): Rule {
    return {
        id: id !== undefined ? id : generateUUID(),
        threat,
        element,
        designs
    };
}

export function ruleBuilder(item: any) {
    return buildRule(
        item.threat,
        item.element,
        item.designs,
        item.id
    );
}