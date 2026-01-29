
import { generateMagicSquareSteps } from '../src/games/magic-square/logic.js';

// User's Golden Standard for 3x3 style
const STYLE_MAP = {
    // Logic description from code -> User's preferred label style
    "Top Center (Siamese)": "Top Center",
    "↗ Diagonal": "↗",
    "Blocked -> Down": "↓ (bcs blocked)"
};

// Fallback logic for Edge wraps (logic.js doesn't specifically name them "Bottom →", it just calculates coords)
// We need to infer the context based on the move type or geometry if logic.js description isn't granular enough.
// Fortunately, logic.js gives us generic descriptions. 
// However, the user wants specific "Bottom -> (bcs wall)" style labels.
// Since logic.js currently outputs "Top Center", "↗ Diagonal", "Blocked -> Down",
// we need to enhance the mapping or logic to distinguish the 'wrap' cases if they aren't explicit in logic.js.
//
// In logic.js:
// - "Top Center (Siamese)"
// - "Blocked -> Down"
// - "↗ Diagonal" (This covers normal diagonal AND wrap-arounds)
//
// We need to recalculate the specific type of move (Bottom Wall, Right Wall, etc.) based on coordinates
// to match the user's detailed 3x3 style.

const SIZES = [3, 5, 7, 9]; // Only Odd sizes as requested
const rules = {};

SIZES.forEach(n => {
    const steps = generateMagicSquareSteps(n);
    const sizeData = {};

    // Analyze each step to generate the correct Label/Icon
    // Step 0 is placing '1'
    steps.forEach((step, index) => {
        if (!step.val) return;

        let label = "";
        let icon = "";

        if (step.val === 1) {
            label = "Top Center";
            icon = ""; // No icon for 1 in the reference
        } else {
            // Find previous step to compare coordinates
            const prevStep = steps.find(s => s.val === step.val - 1);
            if (prevStep) {
                const prevR = prevStep.highlight.r;
                const prevC = prevStep.highlight.c;
                const currR = step.highlight.r;
                const currC = step.highlight.c;

                // Siamese Logic Analysis
                // Intended move: Up(-1), Right(+1)
                
                // Check if it was a Blocked move (Down)
                // In Siamese, if (r-1, c+1) is occupied, we go (r+1, c)
                // But logic.js says "Blocked -> Down" specifically.
                if (step.desc.includes("Blocked") || step.desc.includes("Down")) {
                     label = "↓ (bcs blocked)";
                     icon = "ArrowDown";
                } else {
                    // It was a diagonal-like move. Check for wraps.
                    const isRowWrap = (currR === n - 1) && (prevR === 0); // Wrapped from top to bottom
                    const isColWrap = (currC === 0) && (prevC === n - 1); // Wrapped from right to left (Wait, Siamese goes Right?)
                    // Siamese: (row - 1), (col + 1)
                    
                    // 1. Bottom Wall Wrap: Row goes 0 -> n-1 (Up from 0 wraps to bottom)
                    if (prevR === 0 && currR === n - 1) {
                        label = "Bottom → (bcs wall)"; // 'Bottom ->' implies wrapping to bottom? The user's text: "Bottom → (bcs wall)" for 2 (which is at bottom).
                        // Wait, 1 is at (0, 1). 2 is at (2, 2) in 3x3? No.
                        // 3x3: 
                        // 1 at (0, 1) -> Target (-1, 2) => Wrap Row to 2. Col 2. -> (2, 2).
                        // So Row changed 0->2 (Top to Bottom).
                        // User label: "Bottom → (bcs wall)"
                        icon = "ArrowRight"; // Use arrow right as requested?
                    }
                    // 2. Right Wall Wrap: Col goes n-1 -> 0
                    else if (prevC === n - 1 && currC === 0) {
                        // User label for 3 in 3x3 (which is wrap)?
                        // 2 is at (2, 2). Target (1, 3) => Wrap Col to 0. Row 1. -> (1, 0).
                        // User label for 3: "LeftEdge ↑ (bcs wall)"
                        label = "LeftEdge ↑ (bcs wall)";
                        icon = "ArrowUp";
                    }
                    else {
                        // Normal diagonal
                        label = "↗";
                        icon = "ArrowUpRight";
                    }
                }
            }
        }

        if (label) {
            sizeData[step.val] = { label, icon };
        }
    });

    rules[`${n}x${n}`] = sizeData;
});

// Override 3x3 to match exact golden file (just in case logic differs slightly)
// Actually, generating it guarantees consistency, but if my logic above is slightly different from user's manual expectation,
// I should ensure 3x3 matches the provided bak file exactly.
// But the user said "Use this to create the others", implying the logic should be derived.
// I will trust my derivation logic which mimics the 3x3 observations.

console.log(JSON.stringify(rules, null, 2));
