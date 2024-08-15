import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import * as model from '../model';
import schema from './schema';

export const ELEMENT_TEMPLATE: string = 'element';
export const THREAT_TEMPLATE: string = 'threat';
export const RULE_TEMPLATE: string = 'rule';
type TEMPLATE_GROUP = typeof ELEMENT_TEMPLATE | typeof THREAT_TEMPLATE | typeof RULE_TEMPLATE;

export type templateType = {
    zone: any[],
    entity: any[],
    datastore: any[],
    process: any[],
    threat: any[],
    rule: any[]
}

const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictSchema: true,
    validateFormats: true,
});
addFormats(ajv);

export async function loadBuiltinTemplates(type: TEMPLATE_GROUP): Promise<templateType> {
    const builtin = './built-in';
    return await loadBulkTemplates(builtin, type);
}

export async function loadBulkTemplates(dir: string, type: TEMPLATE_GROUP): Promise<templateType> {
    let templates = {
        zone: [],
        entity: [],
        datastore: [],
        process: [],
        threat: [],
        rule: []
    };

    const queue: string[] = [dir];

    try {
        while (queue.length > 0) {
            const currentDir = queue.shift()!;
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    queue.push(fullPath);
                } else if (entry.isFile() &&
                    (entry.name.endsWith(`.yaml`) || entry.name.endsWith(`.yml`))) {
                    try {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        loadTemplate(content, templates);
                    } catch (error) {
                        console.error(`Error processing file ${entry.name}:`, error);
                    }
                }
            }
        }

        console.log(`Finished loading ${type} templates...`);
    } catch (error) {
        console.error('Failed to load templates:', error);
    }

    return templates;
}

export function loadTemplate(
    content: string,
    templates: templateType) {
    const yml = yaml.load(content);
    if (validateYaml(yml)) {
        build(yml, templates);
    }
}

function validateYaml(yml: unknown): boolean {
    try {
        const validate = ajv.compile(schema.moduleSchema);
        return validate(yml);
    } catch (error) {
        console.error('Error validating YAML:', error);
        return false;
    }
}

function build(
    yml: any,
    templates: templateType): void {
    const module = yml?.module || {};

    // Helper function to safely build and push elements
    function safeBuildAndPush<T>(
        targetArray: T[],
        sourceArray: any[] | undefined,
        buildFn: (item: any) => T | null): void {
        if (!Array.isArray(sourceArray)) {
            return;
        }
        const builtItems = sourceArray.flatMap(item => {
            try {
                const result = buildFn(item);
                return result ? [result] : [];
            } catch (error) {
                console.error('Error building element:', error);
                return [];
            }
        });
        targetArray.push(...builtItems);
    }

    safeBuildAndPush(templates.zone, module.zone, item =>
        model.buildZone(
            item.metadata?.name,
            item.metadata?.type,
            item.trust,
            item.metadata?.id,
            item.metadata?.description,
            item.metadata?.icon,
            item.groups,
            item.additions
        )
    );

    safeBuildAndPush(templates.entity, module.entity, item =>
        model.buildEntity(
            item.metadata?.name,
            item.metadata?.type,
            item.object,
            item.metadata?.id,
            item.metadata?.description,
            item.metadata?.icon,
            item.groups,
            item.additions
        )
    );

    safeBuildAndPush(templates.datastore, module.datastore, item =>
        model.buildDataStore(
            item.metadata?.name,
            item.metadata?.type,
            item.metadata?.id,
            item.metadata?.description,
            item.metadata?.icon,
            item.groups,
            item.additions
        )
    );

    safeBuildAndPush(templates.process, module.process, item =>
        model.buildProcess(
            item.metadata?.name,
            item.metadata?.type,
            item.attributes?.critical,
            item.attributes?.isSanitizer,
            item.attributes?.isAuthn,
            item.attributes?.operation,
            item.metadata?.id,
            item.metadata?.description,
            item.metadata?.icon,
            item.additions
        )
    );

    safeBuildAndPush(templates.threat, module.threat, item =>
        model.buildThreat(
            item.name,
            item.severity,
            item.description,
            item.mitigation,
            item.compliance?.stride,
            item.compliance?.cwe,
            item.compliance?.owasp,
            item.references || [],
            item.id
        )
    );

    safeBuildAndPush(templates.rule, module.rule, item =>
        model.buildRule(
            item.threat,
            item.element,
            item.designs,
            item.id
        )
    );
}