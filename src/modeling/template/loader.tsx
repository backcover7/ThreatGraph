import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import * as model from '../model';
import schema from './schema';

type templateType = {
    zone: any[],
    entity: any[],
    datastore: any[],
    process: any[],
    threat: any[],
    rule: any[]
}

export default class {
    #ajv = new Ajv({
        allErrors: true,
        strict: true,
        strictSchema: true,
        validateFormats: true,
    });

    #uuidSet = new Set<string>();

    constructor() {
        addFormats(this.#ajv);
    }

    async loadBuiltinTemplates(): Promise<templateType> {
        const builtin = './built-in';
        return await this.loadBulkTemplates(builtin);
    }

    async loadBulkTemplates(dir: string): Promise<templateType> {
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
                            this.#loadTemplate(content, templates, fullPath);
                        } catch (error) {
                            console.error(`Error processing file ${entry.name}:`, error);
                        }
                    }
                }
            }

            console.log(`Finished loading templates...`);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }

        return templates;
    }

    #loadTemplate(
        content: string,
        templates: templateType,
        fullPath: string) {
        const yml = yaml.load(content);
        if (this.#validateYaml(yml, fullPath)) {
            this.#build(yml, templates);
        }
    }

    #validateYaml(yml: unknown, fullPath: string): boolean {
        try {
            const validate = this.#ajv.compile(schema.moduleSchema);
            const flag =  validate(yml);
            if (!flag) {
                console.log('[!] Format wrong in ' + fullPath);
            }
            return flag;
        } catch (error) {
            console.error('Error validating YAML:', error);
            return false;
        }
    }

    /**
     * Builds the templates based on the provided YAML content.
     *
     * @param {any} yml - The YAML content to build the templates from.
     * @param {templateType} templates - The object containing the templates to populate.
     * @return {void} This function does not return anything.
     */
    #build(
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

        function checkUUIDExistence(uuid: model.UUID, uuidSet: Set<string>) {
            if (uuidSet.has(uuid)) {
                console.error(`UUID already exists: ${uuid}`);
                return false;
            } else {
                uuidSet.add(uuid);
            }
            return true;
        }

        safeBuildAndPush(templates.zone, module.zone, item =>
            checkUUIDExistence(item.metadata.id, this.#uuidSet) ?
                model.buildZone(
                    item.metadata.name,
                    item.metadata.type,
                    item.trust,
                    item?.tags,
                    item.metadata.id,
                    item.metadata.description,
                    item.metadata.icon,
                    item?.additions
                ) : null
        );

        safeBuildAndPush(templates.entity, module.entity, item =>
            checkUUIDExistence(item.metadata.id, this.#uuidSet) ?
                model.buildEntity(
                    item.metadata.name,
                    item.metadata.type,
                    item?.tags,
                    item.object,
                    item.metadata.id,
                    item.metadata.description,
                    item.metadata.icon,
                    item?.additions
                ) : null
        );

        safeBuildAndPush(templates.datastore, module.datastore, item =>
            checkUUIDExistence(item.metadata.id, this.#uuidSet) ?
                model.buildDataStore(
                    item.metadata.name,
                    item.metadata.type,
                    item.tags,
                    item.object,
                    item?.authentication?.credential.required,
                    item?.authentication?.credential.strong,
                    item?.authentication?.credential.expiration,
                    item?.authentication?.antiAbuse,
                    item.metadata.id,
                    item.metadata.description,
                    item.metadata.icon,
                    item.additions
                ) : null
        );

        safeBuildAndPush(templates.process, module.process, item =>
            checkUUIDExistence(item.metadata.id, this.#uuidSet) ?
                model.buildProcess(
                    item.metadata.name,
                    item.metadata.type,
                    item.tags,
                    item.attributes.critical,
                    item.attributes?.isCsrfProtected,
                    item.attributes?.isAuthn,
                    item.attributes.operation,
                    item.metadata.id,
                    item.metadata.description,
                    item.metadata.icon,
                    item.additions
                ) : null
        );

        safeBuildAndPush(templates.threat, module.threat, item =>
            checkUUIDExistence(item.id, this.#uuidSet) ?
                model.buildThreat(
                    item.name,
                    item.severity,
                    item.description,
                    item.mitigation,
                    item.compliance.stride,
                    item.compliance.cwe,
                    item.compliance.owasp,
                    item.references || [],
                    item.id
                ) : null
        );

        safeBuildAndPush(templates.rule, module.rule, item =>
            checkUUIDExistence(item.id, this.#uuidSet) ?
                model.buildRule(
                    item.threat,
                    item.element,
                    item.designs,
                    item.id
                ) : null
        );
    }
}