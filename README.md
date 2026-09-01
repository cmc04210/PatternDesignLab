# PatternDesignLab

A lab on the **Builder design pattern**, in two forms:

- `Java/` – the original console demo (`CarBuilder` assembles a `Car` from `Tires` and `Exhaust` parts).
- `docs/` – **Garage Rush**, a mobile web game built on the same classes, playable on iPhone.

## Play Garage Rush on your iPhone

Customers show up with an order (season, budget, sometimes a special request). Tap one part from each
category – Tires, Exhaust, Engine – then hit **Deliver** before the timer runs out. Wrong build or too
slow costs a wrench; lose three and the shift is over. Faster deliveries and money left under budget
earn bonus points.

### Option 1: GitHub Pages (recommended)

1. In this repository go to **Settings → Pages**.
2. Under *Build and deployment*, set **Source** to *Deploy from a branch*, pick the `main` branch and the
   `/docs` folder, then save.
3. After a minute the game is live at `https://<your-username>.github.io/PatternDesignLab/`.
4. Open that URL in Safari on your iPhone, tap the **Share** button, then **Add to Home Screen**.
   It installs like an app (full screen, custom icon, works offline).

### Option 2: run it locally on the same Wi-Fi

```bash
cd docs
python3 -m http.server 8000
```

Then browse to `http://<your-computer-ip>:8000` from your iPhone. (Offline/home-screen install needs
HTTPS, so this option is for quick testing only.)

## Run the Java demo

```bash
javac -d out Java/*.java
java -cp out BuilderPatternDemo
```

## How the game maps to the pattern

| Java                                   | Game (`docs/game.js`)                                  |
| -------------------------------------- | ------------------------------------------------------ |
| `Part` interface (`name()`, `price()`) | `Part` class with `name()`, `price()`                  |
| `Tires`, `Exhaust` abstract classes    | `Tires`, `Exhaust`, plus a new `Engine` category       |
| `Summer`, `Winter`, `SingleExitPipe`…  | Catalog entries with the same names and prices         |
| `Car` (`addPart`, `getCost`, `showParts`) | `Car` with the same methods                          |
| `CarBuilder.PrepareWinterCar()` etc.   | Fluent `CarBuilder.withTires().withExhaust().withEngine().build()` – the player drives the builder |
