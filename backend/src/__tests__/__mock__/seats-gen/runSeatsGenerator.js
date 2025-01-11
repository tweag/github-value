"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStatelessMetrics = generateStatelessMetrics;
exports.generateStatefulMetrics = generateStatefulMetrics;
var mockSeatsGenerator_js_1 = require("./mockSeatsGenerator.js");
//import seatsExample from '../seats-gen/seatsExample.json' ;
var fs_1 = require("fs");
var path_1 = require("path");
console.log("seatsExample:", "begin");
var seatsExample = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../seats-gen/seatsExample.json'), 'utf8'));
console.log("seatsExample:", seatsExample[0].length);
var mockConfig = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    usagePattern: 'heavy',
    heavyUsers: ['nathos', 'arfon', 'kyanny'],
    editors: [
        'copilot-chat-platform',
        'vscode/1.96.2/copilot/1.254.0',
        'GitHubGhostPilot/1.0.0/unknown',
        'vscode/1.96.2/',
        'vscode/1.97.0-insider/copilot-chat/0.24.2024122001'
    ]
};
// Load template data from seatsExample.json
var templateData = seatsExample;
var staticTemplateData = null;
function generateStatelessMetrics() {
    var generator = new mockSeatsGenerator_js_1.MockSeatsGenerator(mockConfig, templateData);
    return generator.generateMetrics();
}
function generateStatefulMetrics() {
    if (!staticTemplateData) {
        staticTemplateData = templateData;
    }
    var generator = new mockSeatsGenerator_js_1.MockSeatsGenerator(mockConfig, staticTemplateData);
    var generatedData = generator.generateMetrics();
    staticTemplateData = generatedData;
    return generatedData;
}
// // Example usage
//import templateData from '.seats-gen/seatsExample.json' assert { type: 'json' };
var statelessData = generateStatelessMetrics();
console.log("Stateless Data:", JSON.stringify(statelessData, null, 2));
// const statefulData = generateStatefulMetrics();
// console.log("Stateful Data:", JSON.stringify(statefulData, null, 2));
// // To simulate repeated calls for stateful generation
// for (let i = 0; i < 5; i++) {
//   const repeatedStatefulData = generateStatefulMetrics();
//   console.log(`Stateful Data Iteration ${i + 1}:`, JSON.stringify(repeatedStatefulData, null, 2));
// }
