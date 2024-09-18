/**
 * diagram -> analyze elements -> apply threat
 */
import Template from './parser/template';
import Analyzer from './parser/analyzer';
import fs from 'fs/promises';
import { Result } from './DFD/result';
import Canvas from "./draw/canvas";

async function main() {
    const loader = new Template();
    const templates = await loader.loadBuiltinTemplates();
    const allThreats = templates.threat;
    const allRules = templates.rule;

    // drawing

    // Users add customized templates

    // Threat Modeling
    const outOfScope: string[] = [];  // shape id collection
    const canvas = new Canvas(await fs.readFile('../tests/authn.excalidraw.png', 'utf-8')); // TODO
    const canvasElems = canvas.process();

    const inScopeElems = canvasElems.filter(elem => !outOfScope.includes(elem.id));

    const results: [] = [];

    console.log('Start Scanning ...')
    allRules.forEach((rule) => {
        const analyzer = new Analyzer(rule, inScopeElems, allThreats);
        analyzer.startEvaluation(results);
    })

    results.forEach((result: Result) => {
        const threat = allThreats.find(threat => threat.id === result.threat);
        const element = canvasElems.find(elem => elem.metadata.shape === result.shape);
        console.log('[+] Found threat ' + threat.name + ' > ' + element.metadata.name);
    })
    console.log('[!] ' + results.length + ' threats found!')
    console.log('Finished');
}

main();