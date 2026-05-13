# My Reading Mind — Setup Guide

## What you need first (one-time installs)
1. **Node.js** → go to https://nodejs.org and download the "LTS" version, run the installer
2. **VS Code** → go to https://code.visualstudio.com and download, install it
3. That's it.

---

## Getting the project running

### Step 1 — Open a Terminal
- **Mac**: Press Cmd+Space, type "Terminal", press Enter
- **Windows**: Press the Windows key, type "cmd", press Enter

### Step 2 — Navigate to this project folder
In the terminal, type exactly:
```
cd path/to/reading-mind
```
Replace `path/to/reading-mind` with wherever you unzipped this folder.
Example on Mac: `cd ~/Downloads/reading-mind`
Example on Windows: `cd C:\Users\YourName\Downloads\reading-mind`

### Step 3 — Install dependencies (first time only)
```
npm install
```
This downloads the libraries the app needs. Takes 1-2 minutes.

### Step 4 — Start the app
```
npm start
```
Your browser will open automatically at http://localhost:3000
The app is now running locally on your computer.

### Step 5 — Use it!
- Your thoughts are saved automatically in your browser (localStorage)
- They persist between sessions — closing the tab doesn't lose anything
- To stop the app, go back to the terminal and press Ctrl+C

---

## How to open it again later
Every time you want to use the app:
1. Open Terminal
2. `cd path/to/reading-mind`
3. `npm start`

---

## Files you should know about
```
src/
  App.js          ← the main wiring
  data/seed.js    ← edit this to change your starting books
  components/
    LiveStream.js ← the thought feed
    CaptureBar.js ← the input at the bottom
    ThoughtCard.js← each thought card
    Sidebar.js    ← the left navigation
```

---

## Next views being built
- Topic pages (cross-referencing)
- Timeline (historical events)
- Mind map (ideas and philosophers)
- World map (geographic layer)
