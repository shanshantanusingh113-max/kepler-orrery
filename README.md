# Solar System Lab

A browser-based planetary science lab: a live 3D orrery plus four analysis tools. Everything runs client-side as static pages, with no backend and no build step.

**Live site:** https://shanshantanusingh113-max.github.io/kepler-orrery/

| Page | What it does |
|---|---|
| `index.html` · **Home** | A live 3D solar system behind the page (scroll-driven camera, animated Sun, asteroid belt, comet), today's real numbers, animated Kepler's-laws demos, a light-speed race, and a Hindi/English voice intro with synced captions |
| `orrery.html` · **Kepler Orrery** | 3D solar system driven by real Keplerian elements, with live orbital-motion detection |
| `anomaly.html` · **Planetary Anomaly Hunter** | Registers two images of the same site, screens sensor artifacts, ranks surface changes and rare textures with confidence scores |
| `mission.html` · **Mission Failure Predictor** | Monte Carlo rover survival (power, thermal, comms, wear-out) and a ranking of design changes by survival gain |
| `landing.html` · **Landing Site Finder** | Scores every landing point on a DEM for safety, science diversity and uncertainty together, with a Pareto view |
| `discovery.html` · **Discovery Engine** | Links observations across missions, flags excursions and disagreements, and tests whether each is real, an artifact, or unresolved |

## Kepler Orrery


- **Real orbits.** Positions come from NASA JPL approximate Keplerian elements (valid 1800–2050). Each frame solves Kepler's equation `M = E − e·sin E` with Newton's method.
- **Axial rotation.** Each planet spins at its real sidereal day and axial tilt. Venus and Uranus rotate retrograde.
- **Live readout.** For the selected planet the panel shows distance from the Sun, orbital speed (vis-viva), radial velocity, mean, eccentric and true anomaly, solver iterations, distance and light-time from Earth, and checks of Kepler's 2nd and 3rd laws.
- **Motion detection.** As time runs, the page detects and logs perihelion, aphelion, and the start and end of apparent retrograde motion as seen from Earth.
- **Kepler II sweep.** A shaded wedge shows the area swept in 1/12 of the orbital period.
- **Controls.** Time speed from 1 hour to 1 year per second, reverse time, jump to now, follow a planet, toggle orbits, labels, and true-scale distances.

## Lab tools

**Anomaly Hunter.** Integer-pixel registration by exhaustive search, least-squares gain/offset fit, saturation masking, detector-stripe screening, hysteresis segmentation of a robust (median/MAD) z-score difference map, shape-based classification, and k-nearest-neighbour texture rarity. The built-in sample injects known changes and a hot detector column, and the page reports how many it recovered.

**Mission Failure Predictor.** Two-hour time steps over the whole mission: solar input with dust accumulation, cleaning events and dust storms; RTG decay; battery capacity fade; a single-node thermal model with a thermostat heater and proportional louvers; relay passes with an autonomy limit; and Weibull wear-out with optional redundancy. Design variants reuse the same random draws (common random numbers).

**Landing Site Finder.** Slope and roughness hazard maps, k-means terrain units, ellipse safety, an uncertainty term from ellipse drift and threshold sensitivity, and a science term from unit diversity, rarity and contacts within traverse range. Accepts an uploaded heightmap.

**Discovery Engine.** Cross-instrument pairing by distance, time and local time; excursion detection against each instrument's own baseline (site history, or a robust latitude-spline fit); disagreement detection by processing-version subsets; and tests for replication, coherence, version dependence, uniformity and observing-condition confounds. Accepts a CSV catalog. The sample catalog is synthetic.

## Run locally

All pages are static files. Open `index.html` in a browser, or serve the folder (some browsers block local scripts on `file://`):

```bash
python3 -m http.server 8000
```

## Tech

- `space.js`: shared three.js effects (shader Sun, GPU asteroid belt, twinkling stars, comet with anti-sunward tail)
- Narration generated offline with Piper neural TTS (Hindi voice *hi_IN-pratham*, English voice *en_US-ryan*) over a synthesized ambient bed; no copyrighted music

- [three.js](https://threejs.org/) r128 with OrbitControls (loaded from CDN)
- Procedural planet textures generated on a canvas at load time
- No build step

## Data source

Standish, E.M., *Keplerian Elements for Approximate Positions of the Major Planets*, JPL Solar System Dynamics.
