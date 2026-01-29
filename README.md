# Magic Sudoku Lab — Algorithm Visualization & Benchmarking Lab

**Magic Sudoku Lab** is a high-performance, aesthetically pleasing web application built with **React 19** and **Vite**, designed to visualize and compare complex algorithms in real-time.

[![GitHub Portfolio](https://img.shields.io/badge/GitHub-Portfolio-blue?style=for-the-badge&logo=github)](https://github.com/lastjung/magic-sudoku)
[![Live Demo](https://img.shields.io/badge/Live-Demo-emerald?style=for-the-badge&logo=googlechrome)](https://lastjung.github.io/magic-sudoku/)

## 🧪 The Three Laboratories

### 1. Magic Square Laboratory [▶ Explore Live](https://lastjung.github.io/magic-sudoku/magic)

Explore the mathematical beauty of Magic Squares. This lab supports sizes from 3x3 to 10x10 and visualizes various construction algorithms.

- **Algorithms**: Swing mode, Direct Formula, CSP Solver, Backtracking, and more.
- **Interactive Controls**: Adjust grid size, algorithm mode, and simulation speed.
- **Analysis**: Step-by-step logic visualization and performance tracking.

### 2. Sudoku Optimization Lab [▶ Explore Live](https://lastjung.github.io/magic-sudoku/sudoku)

Analyze the efficiency of different Sudoku solving strategies using Constraint Satisfaction Problem (CSP) heuristics.

- **Solver Comparison**: Compare **Backtracking**, **Naked Single**, and **Full CSP Solver** side-by-side.
- **Solving Metrics**: Tracks steps, progress percentage, and solving time.
- **Configurable Difficulty**: Generate puzzles from Easy to Hard in 4x4 or 9x9 formats.

### 3. Sorting Laboratory [▶ Explore Live](https://lastjung.github.io/magic-sudoku/sorting)

Visualize classic sorting algorithms with high-fidelity animations and auditory feedback.

- **8 Supported Algorithms**: Bubble, Selection, Insertion, Quick, Merge, Heap, Shell, and Cocktail Sort.
- **Benchmarking**: Real-time tracking of comparisons, swaps, and execution time.
- **Audio Engine**: Interactive multi-sensory experience using Web Audio API.

## ✨ Core Features

- **Real-time Visualization**: Smooth, high-frame-rate animations using CSS and Framer Motion.
- **Performance Benchmarking**: Integrated scoreboard for algorithm performance comparison.
- **Multi-Algorithm Mode**: Run multiple algorithms simultaneously for direct benchmarking.
- **Responsive Design**: Modern Glassmorphism UI optimized for both Desktop and Mobile devices.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API

## 🚀 Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lastjung/magic-sudoku.git
   cd magic-sudoku
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/games/magic-square/`: Magic Square logic and components.
- `src/games/sudoku/`: Sudoku solvers and grid components.
- `src/algorithms/`: Core sorting algorithm implementations.
- `src/hooks/`: Custom state management and engine hooks.
- `src/components/`: Shared UI components and layout.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [lastjung](https://github.com/lastjung)
