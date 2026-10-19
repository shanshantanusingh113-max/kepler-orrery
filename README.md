# Solar System Lab

A browser-based planetary science lab: a live 3D orrery, a tonight's-sky guide, a Marswalk planner and four analysis tools. Everything runs client-side as static pages, with no backend and no build step.

**Live site:** https://shanshantanusingh113-max.github.io/kepler-orrery/

| Page | What it does |
|---|---|
| `index.html` · **Home** | A live 3D solar system behind the page (scroll-driven camera, animated Sun, asteroid belt, comet), today's real numbers, animated Kepler's-laws demos, and a light-speed race |
| `sky.html` · **Tonight's Sky (आज रात का आसमान)** | Pick an Indian city (or your location) and see which planets are visible tonight: rise/set, best time, direction and height, brightness, constellation, Moon phase, a time-scrubbable sky view and a night timeline. Hindi and English |
| `orrery.html` · **Kepler Orrery** | 3D solar system driven by real Keplerian elements, with live orbital-motion detection |
| `marswalk.html` · **Marswalk Planner** | A layered map of western Jezero Crater (terrain, slope hazards, CRISM-style minerals, THEMIS-style rock cover, radio line of sight, walk-back time) with a route planner that checks a suited astronaut's walk against oxygen, EVA time, daylight, radio gaps, dust and radiation, plus a live Mars clock and NASA MOLA regional relief |
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

## Tonight's Sky

`sky-engine.js` converts the same JPL elements into topocentric altitude and azimuth: precession to date, light-time correction, ecliptic-to-equatorial rotation, sidereal time and the observer's latitude and longitude. The Moon uses a simplified lunar theory with its main perturbation terms and a parallax correction. Rise, set and twilight times come from 4-minute sampling with interpolation, good to about two minutes for planets. Magnitudes use standard Astronomical Almanac approximations.

## Marswalk Planner

Built for the NASA Space Apps challenge on planning a human Marswalk.

- **Layers.** Elevation and slope (MOLA, HiRISE/CTX DEMs), orbital image (HiRISE/CTX/HRSC), minerals (CRISM: olivine, Fe/Mg clay, carbonate, pyroxene), rock cover and thermal inertia (THEMIS), geology units, radio line of sight from a 6 m camp mast, time to walk home, and science value. Hovering reads every layer at one point.
- **Routing.** A* on a 25 m grid. Walking speed follows Tobler's hiking rule scaled for a suited crew, slowed by roughness, sand and rocks; ground steeper than the slope limit is impassable. Dijkstra from camp gives the walk-home time from every cell.
- **Walk-back rule.** At each point of the route, oxygen left minus the reserve must cover the walk home, and so must the remaining EVA time. Metabolic power includes the work of climbing in Mars gravity; oxygen use is about 1 kg per 14 MJ.
- **Conditions.** NASA GISS Mars24 equations give the Mars year, solar longitude, local solar time, sunrise and sunset, sol number and Perseverance mission sol; JPL elements give the Earth–Mars light time. Temperature, pressure, wind and dust come from a climatology model fitted to Perseverance MEDA ranges.
- **Data honesty.** The regional relief is live MOLA from NASA Mars Trek. The 8 km map is a modeled reconstruction: named features are where the missions put them, but positions are approximate and the terrain is synthetic. Not for real mission use.

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

## Sharing

Every page carries Open Graph and Twitter card tags with a 1200×630 preview image (`og-image.jpg`), plus an SVG favicon and an Apple touch icon.

## Tech

- `space.js`: shared three.js effects (shader Sun, GPU asteroid belt, twinkling stars, comet with anti-sunward tail)

- [three.js](https://threejs.org/) r128 with OrbitControls (loaded from CDN)
- Procedural planet textures generated on a canvas at load time
- No build step

## Data source

Standish, E.M., *Keplerian Elements for Approximate Positions of the Major Planets*, JPL Solar System Dynamics.
