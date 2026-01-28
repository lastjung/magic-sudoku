export class MagicSquareSwing {
    static generateSteps(n) {
      if (n !== 4) return []; // Formula Swing is specific to 4x4
      
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
      
      // Step 0: Empty Board (Initial)
      addStep(board, null, null, "Ready for Swing Operation", "idle");

      // Step 1: Instant Fill (ZigZag Pattern 1-16)
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
           if (r % 2 === 0) {
             board[r][c] = (r * n) + c + 1;
           } else {
             board[r][c] = (r * n) + (n - 1 - c) + 1;
           }
        }
      }
      addStep(board, null, null, "ZigZag Numbers Loaded (1-16)", "setup_complete");
      
      // Step 2: Identify Swing Targets (Non-Diagonal Cells)
      const targets = [];
      for(let r=0; r<n; r++) {
        for(let c=0; c<n; c++) {
          if (!((r % 4 === c % 4) || (r % 4 + c % 4 === 3))) {
            targets.push({r, c});
          }
        }
      }
      addStep(board, null, { targets }, "Targeting Non-Diagonals for Swing...", "scan_swing");
      
      // Step 3: Swing Animation (Pop and Prepare)
      addStep(board, null, { targets }, "Initiating Formula Swing...", "swing_prepare");
      
      // Step 4: Perform the Swing (Inversion)
      for (let i = 0; i < targets.length; i++) {
          const { r, c } = targets[i];
          board[r][c] = (n * n + 1) - board[r][c];
      }
      addStep(board, null, { targets }, "Swing Completed! Balance Restored.", "swing_done");

      // Final Settle
      addStep(board, null, null, "4x4 Magic Square Balanced via Formula Swing", "complete");
      
      return steps;
    }
  }
