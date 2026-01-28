export class MagicSquareDoublyEven {
    static generateSteps(n) {
      const board = Array.from({ length: n }, () => Array(n).fill(null));
      const steps = [];
  
      const addStep = (boardState, val, highlight, desc, type) => {
        steps.push({
          board: JSON.parse(JSON.stringify(boardState)),
          val,
          highlight,
          desc,
          type
        });
      };
      
      // -- Phase 1: Sequential Fill (1 to N^2) --
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
           const val = (r * n) + c + 1;
           board[r][c] = val;
           addStep(board, val, { r, c }, `Sequential Fill: ${val}`, "setup");
        }
      }
      
      // -- Phase 2: Identify Diagonals (Keep - Green) --
      addStep(board, null, null, "Diagonals: Safe (Green) | Others: Targets (Grey)", "scan");
      
      // -- Phase 3: Group 1 - Top & Bottom Center (2,3 & 14,15) --
      // Collect Top/Bottom targets
      const group1Targets = [];
      const isTopBottom = (r, c) => (r === 0 || r === n - 1) && !((r % 4 === c % 4) || (r % 4 + c % 4 === 3));
      
      for(let r=0; r<n; r++) {
          for(let c=0; c<n; c++) {
              if(isTopBottom(r, c)) group1Targets.push({r, c});
          }
      }
      
      // Step A: Pop Up (Red/Blue Highlight)
      addStep(board, null, { targets: group1Targets, group: 'top_bottom' }, "Preparing Top & Bottom Inversion...", "pop_prepare");
      
      // Step B: Flip & Invert
      for (let i = 0; i < group1Targets.length; i++) {
          const { r, c } = group1Targets[i];
          board[r][c] = (n * n + 1) - board[r][c];
      }
      addStep(board, null, { targets: group1Targets, group: 'top_bottom' }, "Invert Top & Bottom!", "mass_invert");

      // Step C: Land (Settle)
      addStep(board, null, null, "Top & Bottom Complete", "settle");
      
      
      // -- Phase 4: Group 2 - Left & Right Center (5,9 & 8,12) --
      // Collect Left/Right targets
      const group2Targets = [];
      const isLeftRight = (r, c) => (c === 0 || c === n - 1) && !((r % 4 === c % 4) || (r % 4 + c % 4 === 3));

      for(let r=0; r<n; r++) {
          for(let c=0; c<n; c++) {
              if(isLeftRight(r, c)) group2Targets.push({r, c});
          }
      }

      // Step A: Pop Up (Red/Blue Highlight)
      addStep(board, null, { targets: group2Targets, group: 'left_right' }, "Preparing Left & Right Inversion...", "pop_prepare");
      
      // Step B: Flip & Invert
      for (let i = 0; i < group2Targets.length; i++) {
          const { r, c } = group2Targets[i];
          board[r][c] = (n * n + 1) - board[r][c];
      }
      addStep(board, null, { targets: group2Targets, group: 'left_right' }, "Invert Left & Right!", "mass_invert");

      if (steps.length > 0) {
        steps[steps.length - 1].type = 'complete';
        steps[steps.length - 1].desc = 'Magic Square Complete!';
      }
      
      return steps;
    }
  }
  
