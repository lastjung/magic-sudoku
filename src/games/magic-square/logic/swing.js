export class MagicSquareSwing {
    // Exact logic for Snake (ZigZag) placement
    static getZigZagPositions(n) {
        const pos = [];
        for (let r = 0; r < n; r++) {
            if (r % 2 === 0) {
                // Left -> Right
                for (let c = 0; c < n; c++) pos.push({r, c});
            } else {
                // Right -> Left
                for (let c = n - 1; c >= 0; c--) pos.push({r, c});
            }
        }
        return pos;
    }

    static generateSteps(n) {
      if (n !== 4 && n !== 8 && n !== 6) return [];
      
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
      
      // Starting point: Ready
      addStep(board, null, null, "Ready to Fill", "setup");

      if (n === 6) {
        // 6x6 Mode: Show 4 Sub-squares of 3x3
        const m = 3;
        const quadrants = [
            { r: 0, c: 0, start: 1, name: "A (Top-Left)" },
            { r: m, c: m, start: 10, name: "B (Bottom-Right)" },
            { r: 0, c: m, start: 19, name: "C (Top-Right)" },
            { r: m, c: 0, start: 28, name: "D (Bottom-Left)" }
        ];

        for (const q of quadrants) {
            const targets = [];
            for (let dr = 0; dr < m; dr++) {
                for (let dc = 0; dc < m; dc++) targets.push({ r: q.r + dr, c: q.c + dc });
            }
            
            // Highlight Quadrant Area
            addStep(board, null, { targets }, `Fill Sub-square ${q.name}`, "highlight_quadrant");

            // Fill Numbers step-by-step in Quadrant
            for (let i = 0; i < 9; i++) {
                const r = q.r + Math.floor(i / 3);
                const c = q.c + (i % 3);
                board[r][c] = q.start + i;
                addStep(board, board[r][c], { r, c }, `Filling ${q.name}...`, "setup");
            }
        }
        
        addStep(board, null, null, "4 Sub-squares Ready", "complete");
        return steps;
      }

      // 1. Fill step-by-step using FOR LOOP and POSITION LIST (for 4, 8)
      const positions = this.getZigZagPositions(n);
      for (let i = 0; i < positions.length; i++) {
        const { r, c } = positions[i];
        board[r][c] = i + 1;
        addStep(board, i + 1, { r, c }, "ZigZag Filling", "setup");
      }
      
      // 2. Target Columns
      const targetCols = n === 4 ? [1, 2] : [1, 2, 5, 6];
      const targets = [];
      for (let r = 0; r < n; r++) {
          for (let c of targetCols) targets.push({r, c});
      }

      // 3. Highlight and Rotate
      addStep(board, null, { targets }, "Select Swing Cells", "highlight_targets");
      addStep(board, null, { targets }, "Swing!", "swing_rotating");
      
      // 4. Result
      const finalBoard = JSON.parse(JSON.stringify(board));
      for (const { r, c } of targets) {
          finalBoard[n-1-r][n-1-c] = board[r][c];
      }
      addStep(finalBoard, null, null, "That's it", "complete");
      
      return steps;
    }
}
