# NEXUS ARENA — 3D Rock Paper Scissors 🪨📄✂️

The flagship. A fully 3D Rock–Paper–Scissors arena built with **Three.js**: real 3D
weapon models, dramatic lighting with bloom, a "3·2·1·GO" countdown, weapons that fly
in and clash, particle victory bursts, orbit camera, synthesized WebAudio sound effects,
and a persistent scoreboard.

**Single file.** Everything lives in `index.html`. The only external dependency is
Three.js, loaded from a CDN.

## ▶️ Play locally

Because it uses ES modules (Three.js), it **must be served over HTTP** — opening
`index.html` by double-clicking (`file://`) will not work.

```bash
# from this folder
python -m http.server 8080
# then open http://localhost:8080
```

(Any static server works: `npx serve`, VS Code "Live Server", etc.)

## 🚀 Host it on GitHub Pages

This folder is its own repository. To publish it:

1. **Create a new empty repo** on GitHub, e.g. `nexus-arena` (github.com → New repository → don't add a README).
2. **Push this folder** (run these from inside `1-nexus-arena/`):

   ```bash
   git init
   git add .
   git commit -m "Nexus Arena — 3D Rock Paper Scissors"
   git branch -M main
   git remote add origin https://github.com/<YOUR-USERNAME>/nexus-arena.git
   git push -u origin main
   ```

3. **Enable Pages**: on GitHub go to **Settings → Pages → Build and deployment**,
   set **Source = "Deploy from a branch"**, **Branch = `main`**, folder = `/ (root)`, **Save**.
4. Wait ~1 minute. Your game is live at:

   ```
   https://<YOUR-USERNAME>.github.io/nexus-arena/
   ```

> GitHub Pages serves over HTTPS, so the Three.js CDN and ES modules work out of the box.

## 🎮 Controls

| Action | How |
|---|---|
| Play a weapon | Click **ROCK / PAPER / SCISSORS**, press **R / P / S**, or click the floating 3D model |
| Orbit the camera | Click-drag (mouse) / one-finger drag (touch) |
| Mute / unmute | **♪ SOUND** button |
| Reset score | **⟲ RESET** button |

## 🛠️ Tech

Three.js (WebGLRenderer, OrbitControls, EffectComposer + UnrealBloomPass), procedurally
generated weapon meshes (displaced icosahedron rock, waved-plane paper, primitive-built
scissors), a Points-based particle system, the WebAudio API for all sound, and
`localStorage` (`nexus_arena`) for the scoreboard. No build step.
