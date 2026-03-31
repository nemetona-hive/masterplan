// ── Navigation ────────────────────────────────────────────────────────────────

function isNavPageActive(page, pg) {
  const childActive = PAGES.some(p => p.parentId === pg.id && p.id === page);
  return page === pg.id && !childActive;
}

function NavButton({ page, item, navOpen, setPage, layoutOpen, setLayoutOpen, onKeyNav }) {
  const isGroup     = !item.parentId && PAGES.some(pg => pg.parentId === item.id);
  const childActive = isGroup && PAGES.some(pg => pg.parentId === item.id && pg.id === page);
  const isActive    = isNavPageActive(page, item);
  const classes     = ["nav-btn"];
  if (isActive)      classes.push("active");
  if (isGroup)       classes.push("nav-parent");
  if (childActive)   classes.push("child-active");
  if (item.parentId) classes.push("nav-sub-btn");
  if (!navOpen)      classes.push("nav-btn-icon-only");

  const handleClick = () => isGroup ? setLayoutOpen(o => !o) : setPage(item.id);

  const handleKeyDown = e => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        handleClick();
        break;
      case "ArrowDown":
        e.preventDefault();
        onKeyNav("next");
        break;
      case "ArrowUp":
        e.preventDefault();
        onKeyNav("prev");
        break;
      case "ArrowRight":
        e.preventDefault();
        if (isGroup && !layoutOpen) setLayoutOpen(true);
        else onKeyNav("next");
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (isGroup && layoutOpen) setLayoutOpen(false);
        else onKeyNav("parent");
        break;
      case "Escape":
        e.preventDefault();
        if (isGroup) setLayoutOpen(false);
        break;
    }
  };

  return (
    <div className="nav-btn-wrap">
      <button
        className={classes.join(" ")}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-current={isActive ? "page" : undefined}
        aria-expanded={isGroup ? layoutOpen : undefined}
        aria-haspopup={isGroup ? "true" : undefined}
        tabIndex={0}>
        <span className="nav-btn-icon"><Icon name={item.icon} /></span>
        {navOpen && <span className="nav-btn-label">{item.label}</span>}
        {isGroup && navOpen && (
          <span className={"nav-parent-chevron " + (layoutOpen ? "open" : "closed")}>
            <Icon name={layoutOpen ? "chevron-down" : "chevron-right"} />
          </span>
        )}
        {!navOpen && <span className="nav-tooltip">{item.label}</span>}
      </button>
    </div>
  );
}

function AppNav({ page, setPage, navOpen, setNavOpen, mobileMenuOpen, setMobileMenuOpen }) {
  const mobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const showSubs = mobile ? mobileMenuOpen : navOpen;
  const [layoutOpen, setLayoutOpen] = React.useState(true);
  const navRef = React.useRef(null);
  const childActive = PAGES.some(pg => pg.parentId === "layout" && pg.id === page);
  React.useEffect(() => { if (childActive) setLayoutOpen(true); }, [page]);

  const navItems = PAGES.filter(pg => {
    if (pg.noNav) return false;
    if (!showSubs && pg.parentId) {
      // In collapsed mode, still show sub-items if their parent is open
      if (pg.parentId === "layout" && layoutOpen) return true;
      return false;
    }
    if (pg.parentId === "layout" && !layoutOpen) return false;
    return true;
  });

  const handleToggle = () => mobile ? setMobileMenuOpen(o => !o) : setNavOpen(o => !o);

  const handleKeyNav = direction => {
    if (!navRef.current) return;
    const btns = Array.from(navRef.current.querySelectorAll(".nav-btn"));
    const current = document.activeElement;
    const idx = btns.indexOf(current);
    if (direction === "next" && idx < btns.length - 1) btns[idx + 1].focus();
    if (direction === "prev" && idx > 0) btns[idx - 1].focus();
    if (direction === "parent") {
      const parentBtn = btns.find(b => b.classList.contains("nav-parent"));
      if (parentBtn) parentBtn.focus();
    }
  };

  return (
    <div id="page-side" className="page-side">
      <nav id="side-navi" ref={navRef}
        className={"nav" + (!mobile && !navOpen ? " nav-collapsed" : "")}
        role="navigation" aria-label="Main navigation">

        {/* Header */}
        <div className="nav-section nav-toggle">
          {(navOpen || mobile) && (
            <span className="nav-toggle-label" onClick={() => setPage("home")}
              role="button" tabIndex={0}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setPage("home")}>
              HIVE
            </span>
          )}
          {(navOpen || mobile) && " "}
          <span className="nav-menu-icon" onClick={handleToggle}
            role="button" tabIndex={0} aria-label={navOpen ? "Collapse sidebar" : "Expand sidebar"}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleToggle()}>
            <Icon name="panel-left-close" />
          </span>
        </div>

        {/* Main nav items */}
        <div className="nav-items" role="menubar" aria-orientation="vertical">
          {navItems.map(item => (
            <NavButton key={item.id} page={page} item={item}
              navOpen={mobile ? mobileMenuOpen : navOpen}
              setPage={id => { setPage(id); if (mobile) setMobileMenuOpen(false); }}
              layoutOpen={layoutOpen} setLayoutOpen={setLayoutOpen}
              onKeyNav={handleKeyNav} />
          ))}
        </div>

        {/* Bottom pinned section — add utility items here */}
        <div className="nav-bottom" role="menubar" aria-orientation="vertical" />

      </nav>
    </div>
  );
}
