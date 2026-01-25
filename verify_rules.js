
import { generateMagicSquareSteps } from './src/games/magic-square/logic.js';
import rulesData from './src/games/magic-square/rules.json' assert { type: "json" };

const SIZES_TO_TEST = [3, 5, 7]; // Test Odd sizes

console.log("=== Magic Square Rule Verification Log ===\n");

SIZES_TO_TEST.forEach(size => {
    const sizeKey = `${size}x${size}`;
    const steps = generateMagicSquareSteps(size);
    const rules = rulesData[sizeKey];

    console.log(`\n[ Testing Size: ${sizeKey} ]`);
    
    // Test random samples: Start(1), Middle, End
    const testValues = [1, 2, 3, 4, 10, size*size];
    
    testValues.forEach(val => {
        if (val > size*size) return;
        
        const rule = rules[val];
        if (rule) {
            console.log(`  ✅ Value ${val}: Label="${rule.label}", Icon="${rule.icon}"`);
        } else {
            console.log(`  ❌ Value ${val}: MISSING in rules.json!`);
        }
    });
});

console.log("\n=== Verification Complete ===");
