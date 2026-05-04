// Entry point — concatenated by build script in this order:
// 1. shared.jsx                        — Icon, NumInput, SLabel, Section, Row
// 2. Visualization.jsx                 — PanelRowVis, PanelSummary, LayoutVisualization, LayoutPanel, PreviewSection
// 3. Controls.jsx                      — S2Controls, S4Controls, LAYOUT_REGISTRY
// 4. utils/timesheet.js                — parseTime, parseLunch, parseSumTime, roundMins, fmtHHMM, fmtDecimal
// 5. components/Timesheet.jsx          — SheetTimesheet
// 6. components/Concrete.jsx            — SheetConcrete
// 7. components/Home.jsx               — SheetHome
// 8. components/GoldenRatio.jsx        — SheetGoldenRatio
// 9. components/SymmetricLayout.jsx    — SheetSymmetricLayout
// 10. components/SurfaceLayout.jsx     — SheetSurfaceLayout
// 11. Nav.jsx                          — isNavPageActive, NavButton, AppNav
// 12. themes.js                        — THEMES, getThemeOrder, getNextTheme, applyTheme
// 13. App.jsx                          — MainPageContent, App, ReactDOM.createRoot
