# Kepler Orrery

An interactive 3D solar system that runs in the browser. Every planet's position is calculated from real orbital elements, not animated along a fixed path.

## Features

- **Real orbits.** Positions come from NASA JPL approximate Keplerian elements (valid 1800–2050). Each frame solves Kepler's equation `M = E − e·sin E` with Newton's method.
- **Axial rotation.** Each planet spins at its real sidereal day and axial tilt. Venus and Uranus rotate retrograde.
- **Live readout.** For the selected planet the panel shows distance from the Sun, orbital speed (vis-viva), radial velocity, mean, eccentric and true anomaly, solver iterations, distance and light-time from Earth, and checks of Kepler's 2nd and 3rd laws.
- **Motion detection.** As time runs, the page detects and logs perihelion, aphelion, and the start and end of apparent retrograde motion as seen from Earth.
- **Kepler II sweep.** A shaded wedge shows the area swept in 1/12 of the orbital period.
- **Controls.** Time speed from 1 hour to 1 year per second, reverse time, jump to now, follow a planet, toggle orbits, labels, and true-scale distances.

## Run locally

It is a single static file. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Tech

- [three.js](https://threejs.org/) r128 with OrbitControls (loaded from CDN)
- Procedural planet textures generated on a canvas at load time
- No build step

## Data source

Standish, E.M., *Keplerian Elements for Approximate Positions of the Major Planets*, JPL Solar System Dynamics.
