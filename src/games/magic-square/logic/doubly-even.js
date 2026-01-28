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
      
      // -- Phase 3: Group 1 - Invert Edges (Outer Non-Diagonals) --
      const edgeTargets = [];
      const innerTargets = [];
      
      const isDiagonal = (r, c) => ((r % 4 === c % 4) || (r % 4 + c % 4 === 3));
      
      for(let r=0; r<n; r++) {
          for(let c=0; c<n; c++) {
              if (!isDiagonal(r, c)) {
                  // It's a target to invert. Decide if Edge or Inner.
                  if (r === 0 || r === n - 1 || c === 0 || c === n - 1) {
                      edgeTargets.push({r, c});
                  } else {
                      innerTargets.push({r, c});
                  }
              }
          }
      }
      
      // Step A: Invert Edges
      if (edgeTargets.length > 0) {
          addStep(board, null, { targets: edgeTargets, group: 'top_bottom' }, "Invert Outer Edges!", "pop_prepare"); // Re-use style or new
          for (let i = 0; i < edgeTargets.length; i++) {
              const { r, c } = edgeTargets[i];
              board[r][c] = (n * n + 1) - board[r][c];
          }
           addStep(board, null, { targets: edgeTargets, group: 'top_bottom' }, "Outer Edges Inverted!", "mass_invert");
      }

      // Step B: Invert Inner Cells (For 8x8 or larger)
      if (innerTargets.length > 0) {
          addStep(board, null, { targets: innerTargets, group: 'left_right' }, "Invert Inner Center!", "pop_prepare"); // Re-use style or new
          for (let i = 0; i < innerTargets.length; i++) {
              const { r, c } = innerTargets[i];
              board[r][c] = (n * n + 1) - board[r][c];
          }
          addStep(board, null, { targets: innerTargets, group: 'left_right' }, "Inner Center Inverted!", "mass_invert");
      }

      if (steps.length > 0) {
        steps[steps.length - 1].type = 'complete';
        steps[steps.length - 1].desc = 'Magic Square Complete!';
      }
      
      return steps;
    }
  }
  
