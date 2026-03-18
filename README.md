# 👾 Phaser Invaders

A high-performance, browser-based **Space Invaders** clone built using **Phaser 3**. This project was developed as a collaborative experiment between a human developer and **Gemini 3 Flash**, focusing on clean JavaScript architecture and retro arcade mechanics.

## 🚀 Features

* **Classic "Stutter" Movement:** Authentically recreated alien grid movement that speeds up as you progress.
* **Attract Mode (AI Demo):** When idle, the game plays itself using a "Smooth AI" logic to showcase gameplay.
* **Competitive Metrics:** Includes a live Score tracker, Bullet counter, Accuracy percentage, and an Elapsed Time clock for speedrunning.
* **Scaling Difficulty:** Every time a wave is cleared, the aliens respawn faster and more aggressively.
* **Object Pooling:** Efficient memory management using Phaser's Group system to handle bullet recycling.

## 🛠️ Tech Stack

* **Engine:** [Phaser 3](https://phaser.io/) (Arcade Physics)
* **Language:** JavaScript (ES6+)
* **Styling:** CSS3
* **Collaboration:** Built with **Gemini**

## 📂 Project Structure

```text
├── index.html      # Game entry point & library CDN
├── style.css       # Layout and arcade-style aesthetics
├── game.js        # Core game engine logic and state management
└── README.md       # Project documentation