/**
 * diagram -> analyze elements -> apply threat
 */

// Use circular-json to stringfy the following objects
// import * as CircularJSON from 'circular-json';
// console.log(CircularJSON.stringify(objA));

// Use lodash to deep copy the following objects
// import _ from 'lodash';
// const lodashCloned = _.cloneDeep(objA);

import * as template from './template/loader';
import RuleEngine from "./parser/rule-engine";
import Diagram from "./parser/diagram";
import fs from 'fs/promises';
import * as model from "@/modeling/model";

async function main() {
    // Load built in elements
    // TODO refactor elements variable name to elementsTemplates, these are not real constructed elements. They are only for user building.
    const elements: template.templateType = await template.loadBuiltinTemplates(template.ELEMENT_TEMPLATE);

    // drawing

    // Users add customized templates

    // Threat Modeling
    const outOfScope: string[] = [];  // shape id collection
    const diagram = new Diagram(await fs.readFile('../../tests/authz.json', 'utf-8'));
    const canvasElements = diagram.processCanvas();


    const inScopeElements = canvasElements.filter(element => !outOfScope.includes(element.id));

    const threats = await template.loadBuiltinTemplates(template.THREAT_TEMPLATE).then(templates => { return templates.threat });
    const rules = await template.loadBuiltinTemplates(template.RULE_TEMPLATE).then(templates => { return templates.rule });

    const results: model.Result[] = [];
    rules.forEach((rule) => {
        const ruleEngine = new RuleEngine(rule, inScopeElements, threats);
        ruleEngine.startEvaluation(results);
    })

    console.log('Finished');
}

main();