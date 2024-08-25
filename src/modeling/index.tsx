/**
 * diagram -> analyze elements -> apply threat
 */

// Use circular-json to stringfy the following objects
// import * as CircularJSON from 'circular-json';
// console.log(CircularJSON.stringify(objA));

// Use lodash to deep copy the following objects
// import _ from 'lodash';
// const lodashCloned = _.cloneDeep(objA);

import Loader from './template/loader';
import RuleEngine from "./parser/rule-engine";
import Diagram from "./parser/diagram";
import fs from 'fs/promises';
import * as model from "@/modeling/model";

async function main() {
    // Load built in elements
    // TODO refactor elements variable name to elementsTemplates, these are not real constructed elements. They are only for user building.

    const loader = new Loader();
    const templates = await loader.loadBuiltinTemplates();
    const allThreats = templates.threat;
    const allRules = templates.rule;

    // drawing

    // Users add customized templates

    // Threat Modeling
    const outOfScope: string[] = [];  // shape id collection
    const diagram = new Diagram(await fs.readFile('../../tests/authz.json', 'utf-8'));
    const canvasElems = diagram.processCanvas();

    const inScopeElems = canvasElems.filter(elem => !outOfScope.includes(elem.id));

    const results: model.Result[] = [];

    console.log('Start Scanning ...')
    allRules.forEach((rule) => {
        const ruleEngine = new RuleEngine(rule, inScopeElems, allThreats);
        ruleEngine.startEvaluation(results);
    })

    results.forEach((result: model.Result) => {
        const threat = allThreats.find(threat => threat.id === result.threat);
        const element = inScopeElems.find(elem => elem.metadata.shape === result.shape);
        console.log('[+] Found threat "' + threat.name + '" > ' + element.metadata.name);
    })
    console.log('Finished');
}

main();