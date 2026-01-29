
import { generateMagicSquareSteps } from '../src/games/magic-square/logic.js';
import fs from 'fs';

const SIZES = [3, 4, 5, 6, 7, 8, 9, 10];
const OUTPUT_FILE = '../src/games/magic-square/rules.json';

const ICON_MAP = {
    // Siamese (Odd)
    "Top Center (Siamese)": "BrainCircuit",
    "↗ Diagonal": "ArrowUpRight",
    "Blocked -> Down": "ArrowDown",
    
    // Inversion (Doubly Even)
    "Natural Fill": "CheckCircle2",
    "Inversion Gap": "Zap",

    // Strachey (Singly Even)
    "Q-A (Siamese)": "LayoutGrid", 
    "Q-B (Offset)": "LayoutGrid",
    "Q-C (Offset)": "LayoutGrid",
    "Q-D (Offset)": "LayoutGrid",
    "Final Adjustment Swaps": "RefreshCw",
    
    // Generic
    "Magic Square Balanced!": "CheckCircle2"
};

const LABEL_MAP = {
    "Top Center (Siamese)": "Top Center",
    "↗ Diagonal": "Move ↗",
    "Blocked -> Down": "Down (Blocked)",
    "Natural Fill": "Natural Fill",
    "Inversion Gap": "Invert Value",
    "Q-A (Siamese)": "Quad A (Siamese)",
    "Q-B (Offset)": "Quad B (Offset)", 
    "Q-C (Offset)": "Quad C (Offset)",
    "Q-D (Offset)": "Quad D (Offset)",
    "Final Adjustment Swaps": "Swap & Balance",
    "Magic Square Balanced!": "Complete!"
};

const rules = {};

SIZES.forEach(n => {
    const steps = generateMagicSquareSteps(n);
    const sizeData = {};
    
    steps.forEach(step => {
        if (step.val) {
            // Some steps might not have a distinct description in logic.js if not careful, 
            // but the current logic.js seems to produce good descriptions.
            // We use the value as the key.
            const desc = step.desc || "Unknown";
            const label = LABEL_MAP[desc] || desc;
            const icon = ICON_MAP[desc] || "Target";
            
            sizeData[step.val] = {
                label,
                icon
            };
        }
    });

    rules[`${n}x${n}`] = sizeData;
});

// Add metadata or extra instructions if needed
rules["metadata"] = {
    "generated": true,
    "timestamp": new Date().toISOString()
};

console.log(JSON.stringify(rules, null, 2));
