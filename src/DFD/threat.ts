import { randomUUID, UUID } from 'crypto';
import { Entity } from './node/entity';
import { DataStore } from './node/datastore';
import { Process } from './process';
import { DataFlow } from './dataflow';

// Threat Type
export type Threat = {
    id: UUID;
    name: string;
    severity: 'informative' | 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation: string;
    references?: string[];
    compliance: {
        cwe: number[];
        owasp: string[];
        stride: ('Spoofing' | 'Tampering' | 'Repudiation' | 'Information disclosure' | 'Denial of service' | 'Elevation of privilege')[];
    };
    attached?: {
        entities?: Entity[];
        datastores?: DataStore[];
        processes?: Process[];
        dataflows?: DataFlow[];
    };
}

export const threatSchema = {
    type: 'object',
    additionalProperties: false,
    required: ['id', 'name', 'severity', 'description', 'mitigation', 'compliance'],
    properties: {
        id: {  type: 'string', format: 'uuid' },
        name: { type: 'string' },
        severity: { type: 'string', enum: ['informative', 'low', 'medium', 'high', 'critical'] },
        description: { type: 'string' },
        mitigation: { type: 'string' },
        references: { type: 'array', items: { type: 'string' } },
        compliance: {
            type: 'object',
            additionalProperties: false,
            required: ['cwe', 'owasp', 'stride'],
            properties: {
                cwe: { type: 'array', items: { type: 'string' } },
                owasp: { type: 'array', items: { type: 'string' } },
                stride: {
                    type: 'array',
                    items: {
                        type: 'string',
                        enum: ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege']
                    }
                },
            },
        },
    },
};

// Build Threat
function buildThreat(
    name: string,
    severity: 'informative' | 'low' | 'medium' | 'high' | 'critical',
    description: string,
    mitigation: string,
    stride: ('Spoofing' | 'Tampering' | 'Repudiation' | 'Information disclosure' | 'Denial of service' | 'Elevation of privilege')[],
    cwe: number[],
    owasp: string[],
    references: string[],
    id?: UUID | undefined): Threat {
    return {
        id: id !== undefined ? id : randomUUID(),
        name,
        severity,
        description,
        mitigation,
        references,
        compliance: {
            cwe,
            owasp,
            stride,
        }
    };
}

export function threatBuilder(item: any) {
    return buildThreat(
        item.name,
        item.severity,
        item.description,
        item.mitigation,
        item.compliance.stride,
        item.compliance.cwe,
        item.compliance.owasp,
        item.references || [],
        item.id
    );
}