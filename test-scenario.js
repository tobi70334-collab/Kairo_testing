// Test script to verify scenario logic
const fs = require('fs');

// Load the scenario
const scenario = JSON.parse(fs.readFileSync('./public/scenarios/escalating-bec.json', 'utf8'));

console.log('=== SCENARIO TEST ===');
console.log('Title:', scenario.title);
console.log('Total nodes:', scenario.nodes.length);

// Test node structure
const nodeIds = scenario.nodes.map(n => n.id);
console.log('Node IDs:', nodeIds);

// Test choice navigation
console.log('\n=== CHOICE NAVIGATION TEST ===');
const introNode = scenario.nodes.find(n => n.id === 'intro');
console.log('Intro node choices:');
introNode.choices.forEach((choice, i) => {
  console.log(`  Choice ${i+1}: "${choice.label}" -> "${choice.next}"`);
  const nextNode = scenario.nodes.find(n => n.id === choice.next);
  console.log(`    Next node exists: ${nextNode ? 'YES' : 'NO'}`);
  if (nextNode) {
    console.log(`    Next node has ${nextNode.choices ? nextNode.choices.length : 0} choices`);
  }
});

// Test escalation paths
console.log('\n=== ESCALATION PATHS TEST ===');
const escalationNodes = scenario.nodes.filter(n => n.id.startsWith('escalation_'));
console.log('Escalation nodes:', escalationNodes.map(n => n.id));

// Test each escalation path
['immediate', 'verify', 'policy', 'forward'].forEach(path => {
  console.log(`\n--- ${path.toUpperCase()} PATH ---`);
  let currentNode = scenario.nodes.find(n => n.id === `escalation_${path}`);
  let level = 1;
  
  while (currentNode && level <= 3) {
    console.log(`Level ${level}: ${currentNode.id}`);
    if (currentNode.choices && currentNode.choices.length > 0) {
      const firstChoice = currentNode.choices[0];
      console.log(`  First choice: "${firstChoice.label}" -> "${firstChoice.next}"`);
      currentNode = scenario.nodes.find(n => n.id === firstChoice.next);
      level++;
    } else {
      break;
    }
  }
});

console.log('\n=== TEST COMPLETE ===');
