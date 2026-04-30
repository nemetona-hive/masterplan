# NEMETONA MASTERPLAN — Project Context

React app for surface covering layout calculators (tiles, panels, etc.).
Hosted on GitHub Pages at: https://nemetona-hive.github.io/MASTERPLAN/

## Architecture

**No bundler / no npm.** JSX files are concatenated by a custom build script
into a single output file. React and ReactDOM are loaded from CDN.
All global state (config, constants, compute functions) lives outside `src/`
and is available as globals — do NOT import them.

## File load order (defined in components.jsx)

```
1.  shared.jsx                 → Icon, useProtectedRangeSlider, RangeSlider, NumInput, SLabel,
                                  Collapsible, Section, ControlPanel, Row,
                                  getLinkedCardTone, getLinkedCardMarker, useLinkedCardHighlight,
                                  Stack, Text
2.  Visualization.jsx          → PanelRowVis, PanelSummary, LayoutVisualization, LayoutPanel, PreviewSection
3.  Controls.jsx               → S2Controls, S4Controls, LAYOUT_REGISTRY
4.  utils/timesheet.js         → parseTime, parseLunch, parseSumTime, roundMins, fmtHHMM, fmtDecimal
5.  components/Timesheet.jsx   → SheetTimesheet
6.  components/SelfLevelingFloor.jsx → SheetSelfLevelingFloor
7.  Sheets.jsx                 → SheetHome, SheetConcrete, SheetGoldenRatio, SheetSymmetricLayout, SheetSurfaceLayout
8.  Nav.jsx                    → isNavPageActive, NavButton, initOpenGroups, AppNav
9.  themes.js                  → THEMES, getThemeOrder, getNextTheme, applyTheme
10. App.jsx                    → MainPageContent, App, ReactDOM.createRoot
```

`components.jsx` is the manifest — it documents order but contains no logic.
**Never add logic to components.jsx.**

## Key globals (defined outside src/, treat as read-only)

| Global | Purpose |
|---|---|
| `PAGES` | Navigation page definitions (id, label, title, desc, icon, parentId, isParent, noNav) |
| `SYSTEMS` | Layout system metadata (id, title, icon, subtitle — subtitle can be a function) |
| `DEFAULT_SH` | Default state for surface layout (W, H, PPi, PLa, offset, direction, minJ, startOff, s4Long, s4Short, rowStart) |
| `DEFAULT_SYM` | Default state for symmetric layout (roomWidth, panelWidth, oneFullEdge, customFirstPieceWidth) |
| `DEFAULT_GR` | Default items for golden ratio tool |
| `ICONS` | Map of icon name → FontAwesome class string |
| `PAL_CLASSES` | Palette class maps for segment coloring (s1, s4l, s4s) |
| `fmt` | Formatting helpers: fmt.decimals(v,n), fmt.area(v), fmt.decimal(v), fmt.mm(v) |
| `SUMMARY_LABELS` | Label maps for result summary rows (s0, s1s2s3, s4 keys) |
| `computeS0` | Symmetric layout compute (takes sym state) |
| `computeS1/S2/S3/S4` | Surface layout computes (each takes sh state) |
| `getDescription(id, sh)` | Human-readable description for a layout system |
| `getSegmentClass(seg, palClasses)` | Returns CSS class for a row segment |
| `THEMES` | Theme definitions (name, label, icon, colors map of CSS vars) |
| `getThemeOrder()` | Ordered list of theme keys |
| `getNextTheme(current)` | Next theme name in rotation |
| `applyTheme(name)` | Applies a theme's CSS custom properties to `documentElement` |

## State shape

**sh (surface layout state)**
```js
{ W, H, PPi, PLa, offset, direction, minJ, startOff, s4Long, s4Short, rowStart }
// W/H = surface mm, PPi/PLa = panel mm, direction = "V"|"H", rowStart = "top"|"bottom"
```

**sym (symmetric layout state)**
```js
{ roomWidth, panelWidth, oneFullEdge, customFirstPieceWidth }
// oneFullEdge = bool, customFirstPieceWidth = number|null
```

**grItems (golden ratio items)**
```js
[{ id, value, suffix, saved, savedCommitted }]
// id = "a"|"b"|"c"|"d", PHI = 1.6180339887499
```

## Pages & routing

Hash-based routing (`#page-id`). Home = no hash.
Page render is handled in `MainPageContent` in App.jsx — add new pages there.
Nav items come from `PAGES` global — add new pages in config (outside src/).

Current pages: `home`, `layout` (parent), `pattern-layout`, `symmetric-layout`,
`concrete`, `self-leveling-floor`, `golden-ratio`, `pipe-wrap`, `timesheet`.

## UI components (from shared.jsx)

- `<Icon name="..." />` — renders FontAwesome icon via ICONS map
- `<NumInput id label value onChange step min unit />` — controlled number input with commit-on-blur
- `<RangeSlider id value onChange min max step className />` — lockable range slider with lock/unlock toggle; uses `useProtectedRangeSlider` for mobile touch-scroll protection. Starts locked; click row or tap lock icon to unlock.
- `<ControlPanel id title open setOpen>` — collapsible panel for controls sidebar
- `<Section title bg>` — collapsible section for preview area
- `<Collapsible>` — base for both Section and ControlPanel (variant="section"|"panel")
- `<Row label value unit hi hoverType hoveredType setHoveredType />` — data display row
- `<SLabel>` — simple label div for section headings in controls
- `<Stack gap direction className as>` — flex layout primitive; gap uses spacing scale (0.5–7); direction = "column"|"row"
- `<Text size weight variant color as>` — typography primitive; size = xs–xxl, weight = reg–black, variant = sans|mono

## Standalone page components

| Page ID | Component | Location | Description |
|---|---|---|---|
| `pipe-wrap` | `PipeWrapCalculator` | `components/PipeWrapCalculator.jsx` | Pipe wrap length calculator with SVG diagram; uses presets, RangeSlider for overlap/gap |
| `self-leveling-floor` | `SheetSelfLevelingFloor` | `components/SelfLevelingFloor.jsx` | Self-leveling floor compound estimator; area/thickness modes, bag count, pricing |
| `timesheet` | `SheetTimesheet` | `components/Timesheet.jsx` | Work hours calculator; dynamic rows, lunch presets, decimal copy |

## Layout systems

| ID | Name | Controls |
|---|---|---|
| s0 | Symmetric Layout | roomWidth, panelWidth, oneFullEdge, customFirstPieceWidth (in SheetSymmetricLayout) |
| s1 | Straight Layout | none |
| s2 | Shifted Layout | offset slider (0.1–0.9 × panel length) via RangeSlider |
| s3 | Stepped Layout | none |
| s4 | Long/Short | s4Long, s4Short (two panel sizes) |

LAYOUT_REGISTRY in Controls.jsx maps s1–s4 to their compute functions and control components.
Best layout = fewest total pieces among valid results.

## Visualization

- `LayoutVisualization` — renders row-by-row or strip view depending on `result.meta.visualization`
- `PanelRowVis` — renders one row of segments as positioned divs (React.memo)
- Segments have types: `full`, `cut`, `edge`, `offcut`, `gap`
- Gap segments get red hatched styling; others get palette classes from PAL_CLASSES
- `hoveredType` cross-highlights between summary rows and visualization segments

## Mobile / responsive

- Mobile breakpoint: width ≤ 768px OR height ≤ 500px
- Nav collapses to hamburger on mobile, sidebar on desktop
- `isMobile` state in App.jsx drives nav behavior reactively on resize/rotate
- `RangeSlider` starts locked; distinguishes horizontal drag (slider) from vertical swipe (scroll) on mobile

## Theme system

Defined in `themes.js` (loaded as global, not inside `src/`).
- `THEMES` object maps theme keys to `{ name, label, icon, colors }` where `colors` is CSS var → value
- `applyTheme(name)` sets CSS custom properties on `:root` and a `data-theme` attribute
- App.jsx holds `theme` state (default: `"navi"`), applies via `useEffect`
- To add a theme: add entry to `THEMES` in `themes.js` — it auto-rotates via `getNextTheme`

## Golden Ratio tool

PHI = 1.6180339887499. Builds 7 descending steps: `base / PHI^n`.
Cards use tone system (a/b/c/d) for visual identity.
`useLinkedCardHighlight` hook links control cards to preview cards on click.

## Important conventions

- `useState` destructured from React at top of shared.jsx — use directly
- All other React hooks via `React.useXxx`
- Enter key in inputs triggers blur (global handler in App.jsx) — do not add separate Enter handlers
- No CSS-in-JS except inline style for dynamic values; use className strings
- CSS class names follow BEM-ish patterns: block, block-element, modifier

## What does NOT exist yet (possible future work)

- Concrete page (SheetConcrete) — placeholder divs only, no logic
- Export / print functionality
- Persistence (no localStorage)
- Unit tests
