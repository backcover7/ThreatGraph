/**
 * diagram -> analyze elements -> apply threat
 */

// Use circular-json to stringfy the following objects
// import * as CircularJSON from 'circular-json';
// console.log(CircularJSON.stringify(objA));

// Use lodash to deep copy the following objects
// import _ from 'lodash';
// const lodashCloned = _.cloneDeep(objA);

import Loader from './parser/template';
import RuleEngine from "./parser/rule-engine";
import Canvas from "./draw/canvas";
import fs from 'fs/promises';
import { Result } from "./DFD/result";

async function main() {
    const loader = new Loader();
    const templates = await loader.loadBuiltinTemplates();
    const allThreats = templates.threat;
    const allRules = templates.rule;

    // drawing

    // Users add customized templates

    // Threat Modeling
    const outOfScope: string[] = [];  // shape id collection
    const canvas = new Canvas(await fs.readFile('../../tests/authn.json', 'utf-8')); // TODO
    const canvasElems = canvas.process();

    const inScopeElems = canvasElems.filter(elem => !outOfScope.includes(elem.id));

    const results: [] = [];

    console.log('Start Scanning ...')
    allRules.forEach((rule) => {
        const ruleEngine = new RuleEngine(rule, inScopeElems, allThreats);
        ruleEngine.startEvaluation(results);
    })

    results.forEach((result: Result) => {
        const threat = allThreats.find(threat => threat.id === result.threat);
        const element = inScopeElems.find(elem => elem.metadata.shape === result.shape);
        console.log('[+] Found threat "' + threat.name + '" > ' + element.metadata.name);
    })
    console.log('Finished');
}

main();