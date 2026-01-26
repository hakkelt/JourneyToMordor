# 🏔️ Journey to Mordor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-black?logo=bun)](https://bun.sh)
[![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00?logo=svelte)](https://svelte.dev)

A lightweight, privacy-focused web application to track your progress on the legendary walk from Hobbiton to Mount Doom.

**[Live Demo](https://hakkelt.github.io/JourneyToMordor/)**

## 🧙 The Challenge

The "Walk to Mordor" is a fitness challenge inspired by J.R.R. Tolkien’s _The Lord of the Rings_. The goal is to walk, run, or hike the same distance Frodo and Sam travelled to destroy the One Ring.

The total journey is approximately **1,779 miles (2,863 km)**, traditionally broken down into four major stages:

1.  **Hobbiton to Rivendell**: 458 miles (737 km) – Through the Old Forest and Bree.
2.  **Rivendell to Lothlórien**: 462 miles (744 km) – Across the Misty Mountains and through Moria.
3.  **Lothlórien to Rauros Falls**: 389 miles (626 km) – Down the Great River Anduin.
4.  **Rauros Falls to Mount Doom**: 470 miles (756 km) – Through the Dead Marshes to the Heart of Mordor.

## 🧭 Why This Project? (Other Options)

Many tools exist to track this journey, but they often fall into three categories:

- **The Paid Powerhouse**: [The Conqueror Virtual Challenges](https://www.theconqueror.events/lotr/) offers a premium experience with physical medals, street view integration, and a social community. It is a fantastic service but comes with a significant price tag for the full series.
- **The Ghost of the Past**: For years, the "Walk to Mordor" app (by Tektite Software) was the go-to mobile tool. However, it hasn't been updated since 2018, and its backend services have largely been shut down.
- **The Community Classics**: The "Eowyn Challenge" and various Reddit-shared **Google Sheets** are the bedrock of the community. They are free and flexible but lack a modern interface and can be cumbersome to update on mobile.

**Journey to Mordor** aims to be the middle ground: a modern, free, open-source web app that works on any device without trackers or subscriptions.

## 🛠️ Built with Vibe Coding

This project is a hobby experiment created mostly through **vibe coding**. It was built by a human collaborating with **Gemini** and **Claude** to see how far "natural language as code" can go.

### 📜 Disclaimer

_This project is a work of fan-fiction and is intended for personal use and fitness tracking only. It has **no affiliation** with the Tolkien Estate, Middle-earth Enterprises, or any other organizations. All references to "Middle-earth," "Mordor," and related names are trademarks of their respective owners._

## 🤝 How to Help

We want this to be the best free tool for the community. Here is how you can contribute:

- **Report Bugs**: Open an [Issue](https://github.com/hakkelt/JourneyToMordor/issues) or if you know how to fix it, even better, submit a Pull Request!
- **Share Ideas**: Visit the [Discussions](https://github.com/hakkelt/JourneyToMordor/discussions) tab to suggest features or share your journey.
- **Visual Assets**: Many of the current images have an uncertain legal status (harvested from the deep web). If you are an artist or know of high-quality **Creative Commons** or **Public Domain** images that fit the theme, please suggest them! We would love to replace placeholders with art we have explicit permission to use.

## 💻 For Developers

This project is built with **Svelte 5** and **Bun**.

### Getting Started

1.  **Install dependencies**:
    ```bash
    bun install
    ```
2.  **Run development server**:
    ```bash
    bun run dev
    ```
3.  **Build for production**:
    ```bash
    bun run build
    ```

### Testing

**Important:** Always use `bun run test`. Avoid using `bun test` as it invokes Bun's native test runner which is not compatible with our Playwright/Vitest setup.

```bash
# Run all tests (Unit + E2E)
bun run test

# Unit tests only
bun run test:unit

# E2E tests only
bun run test:e2e
```
