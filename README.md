# 🐶 ChuChu — The Tiny Virtual Puppy

![ChuChu Banner](page@112cfbc8ec22a2e75951572bc54f173f.webm)

**ChuChu** is a feature-rich, hyper-speed virtual pet simulator built with vanilla JavaScript and CSS. Experience the nostalgic joy of a Tamagotchi-style pet with modern "Personal Touches," dynamic state transitions, and a 100% automated test suite.

---

## ✨ Key Features

### 🦴 Core Gameplay Loop
*   **Vitals Management**: Keep ChuChu's **Hunger**, **Happiness**, and **Energy** stats above 0.
*   **Hyper-Speed Experience**: Optimized for an engaging fast-paced session (1-second ticks).
*   **Persistence**: Auto-saves your progress to `localStorage` and calculates "offline decay" when you return.

### 🌟 Evolution System
*   **Single-Step Growth**: Watch **Baby ChuChu** transform into the magnificent **Evolved Puppy**.
*   **Care Quality Thresholds**: Evolution is earned! It requires at least 1 minute of active play and sustained high-quality care (>50%).
*   **Unique Visuals**: The Evolved state features golden fur, heart-shaped pupils, and persistent sparkles.

### 🧪 Dynamic State Machine
*   **🟢 Normal**: Healthy and happy.
*   **🔴 Sick**: Triggered by neglect (any stat = 0). Requires a specific recovery path (healing all stats >20).
*   **🟡 Evolving**: A special 10-second invulnerability state during the transformation process.

### 🥚 Hidden Easter Eggs
*   **🤧 Nose Boop**: Click ChuChu's nose to trigger a sneeze.
*   **😵‍💫 Dizzy Spin**: Rapidly click ChuChu to make them dizzy.
*   **💃 Dance Mode**: Stay idle for 60 seconds with high stats to see ChuChu's secret dance.
*   **🌈 Rainbow Mode**: Input the classic **Konami Code** for a fabulous rainbow effect.
*   **🎉 Weekend Mode**: ChuChu wears a party hat on Saturdays and Sundays!

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/usermanoj/Tamagotchi-SDD-Antigravity.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Tamagotchi-SDD-Antigravity
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the development server:
```bash
npm run dev
```
Open your browser to the URL provided (default is `http://localhost:5173/`).

---

## 🛠️ Tech Stack & Architecture
*   **Logic**: Vanilla JavaScript (ES Modules).
*   **Styling**: Pure CSS (No external frameworks for maximum flexibility).
*   **Build Tool**: [Vite](https://vitejs.dev/).
*   **Testing**: Custom 70-assertion automated test suite (`/tests/test-runner.html`).

---

## 📜 Documentation
For a deep dive into the technical specifications and a full audit of features, check out the [User Manual](docs/USER_MANUAL.md).

---

## 🎮 Automated Testing
We maintain 100% spec-to-code fidelity. To run the tests:
1. Navigate to `http://localhost:3000/tests/test-runner.html` while the dev server is running.
2. View the granular pass/fail results directly in the browser UI.

---

*ChuChu was designed for the Antigravity Coding Challenge. 🐕✨*
