# Mobile View/Behavior Optimization Analysis

## 📊 Current State Assessment

### What's Working ✅
- **Responsive breakpoint (768px)** properly defined
- **Mobile-first approach** to navigation (mobileMenuOpen state)
- **Touch-friendly button sizing** (44px min height on mobile)
- **Safe area support** using `env(safe-area-inset-bottom)` for notches
- **Proper viewport meta tag** with `width=device-width, initial-scale=1.0`
- **Scrollbar theming** works on both desktop & mobile (Firefox/Chrome)
- **Semantic HTML & ARIA labels** for navigation accessibility

---

## 🎯 Key Optimization Opportunities

### 1. **Dynamic Viewport Height Issue** (HIGH PRIORITY)
**Problem:** Using `height: 100dvh` on `.app` can cause layout shift when mobile browser UI appears/disappears

**Current Code (app.css):**
```css
.app {
    height: 100dvh;  /* Dynamic viewport height - causes jank */
}
```

**Impact:** Mobile users see content jump up/down when address bar toggles

**Recommendation:** Use stable viewport fallback
```css
.app {
    height: 100svh;  /* Stable viewport - doesn't change with UI */
    height: 100dvh;  /* Fallback for older mobile browsers */
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
}
```

---

### 2. **Navigation Menu Doesn't Close on Navigation** (MEDIUM)
**Problem:** Users must manually close menu after selecting nav item in mobile

**Current Code (Nav.jsx):**
```jsx
setPage(id => { 
    setPage(id); 
    if (mobile) setMobileMenuOpen(false);  // ✅ Already implemented!
})
```
✓ Actually this IS implemented correctly.

---

### 3. **Max-Height Constraint on Mobile Nav** (MEDIUM)
**Problem:** Navigation limited to 56vh, but when menu opens it covers content

**Current Code (app.css):**
```css
.nav {
    max-height: 56vh;
    overflow-y: auto;
}
```

**Issues:**
- Nav can't scroll properly on small devices (375px width)
- Content underneath is unreachable while nav open
- No overlay/backdrop to indicate modal state

**Recommendations:**
```css
/* Option A: Fixed overlay on mobile */
.nav.nav-mobile-open {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    max-height: none;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom);
}

/* Option B: Half-screen drawer (Modern approach) */
.nav.nav-mobile-open {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 70vh;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.3);
}

/* Add semi-transparent backdrop */
.app-page::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 999;
}

.app-page.nav-open::before {
    opacity: 1;
    pointer-events: auto;
}
```

---

### 4. **Missing Touch Gesture Support** (MEDIUM)
**Problem:** No swipe-to-close or pull-to-open gestures

**Recommendation:** Add simple swipe handlers
```jsx
// In AppNav component
React.useEffect(() => {
    let startY = 0;
    const nav = navRef.current;
    
    const handleTouchStart = (e) => {
        startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e) => {
        const endY = e.changedTouches[0].clientY;
        const diff = endY - startY;
        
        // Swipe down to close
        if (mobileMenuOpen && diff > 50 && startY < 100) {
            setMobileMenuOpen(false);
        }
    };
    
    if (mobile && mobileMenuOpen && nav) {
        nav.addEventListener('touchstart', handleTouchStart);
        nav.addEventListener('touchend', handleTouchEnd);
        return () => {
            nav.removeEventListener('touchstart', handleTouchStart);
            nav.removeEventListener('touchend', handleTouchEnd);
        };
    }
}, [mobile, mobileMenuOpen]);
```

---

### 5. **Keyboard Navigation Missing on Mobile** (MEDIUM)
**Problem:** Arrow key navigation works on desktop nav but feels clunky on touch devices

**Current:** `onKeyDown` handlers for arrow keys in NavButton

**Issue:** Mobile users don't have keyboard, so these events never trigger

**Recommendation:** Already have focus management, just ensure it's not required on mobile
```jsx
// Disable keyboard nav visual hints on touch devices
const handleKeyNav = direction => {
    // Only activate if device is not touch
    if (!('ontouchstart' in window)) {
        // existing keyboard nav code
    }
};
```

---

### 6. **Data Preview Columns Don't Wrap Well** (MEDIUM)
**Problem:** Charts/visualizations not optimized for narrow screens

**Current CSS:**
```css
.sys-rows {
    border: 1px solid #233342;
}
```

**Issue:** Long segment labels truncate instead of wrapping on <320px phones

**Recommendation:**
```css
@media (max-width: 480px) {
    .panel-seg-lbl,
    .strip-seg-lbl {
        font-size: var(--fs-xs);
        writing-mode: horizontal-tb;
        word-break: break-word;
    }
    
    .sys-row {
        min-height: 48px;
    }
    
    /* Stack badges/labels on tiny screens */
    .sys-head {
        flex-direction: column;
        gap: 4px;
    }
}
```

---

### 7. **Input Fields Not Optimized for Touch** (LOW-MEDIUM)
**Problem:** Number inputs and range sliders too small for mobile fingers

**Current Code (Controls.jsx):**
```jsx
<NumInput label="Room width (mm)" value={state.roomWidth} />
<input type="range" />
```

**Issues:**
- NumInput doesn't have mobile-optimized touch targets
- Range slider hard to drag with fat fingers
- No clear visual feedback on mobile

**Recommendations:**
```css
/* Mobile input optimization */
@media (max-width: 768px) {
    input[type="number"],
    input[type="range"],
    .num-input {
        min-height: 44px;
        font-size: 16px;  /* Prevents auto-zoom on iOS */
        padding: 12px;
    }
    
    input[type="range"] {
        height: 12px;  /* Easier to grab */
        appearance: slider-horizontal;
    }
    
    input[type="number"] {
        padding: 12px 16px;
        border-radius: 8px;
    }
}
```

---

### 8. **Missing Fixed Header on Scroll** (LOW-MEDIUM)
**Problem:** Page title scrolls away when viewing results

**Recommendation:** Sticky header for data pages
```css
@media (max-width: 768px) {
    .main-head {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--color-darkblue);
        padding: 8px var(--sp-3);
        border-bottom: 1px solid var(--color-gray-light);
    }
}
```

---

### 9. **Performance: Reduce Animation Duration on Mobile** (LOW)
**Problem:** Button animations add perceived slowness on mobile

**Current Code:**
```css
button {
    transition: transform 0.12s ease, filter 0.12s ease;
}
```

**Recommendation:**
```css
@media (max-width: 768px) {
    button,
    .nav-btn,
    .nav-parent-chevron {
        transition-duration: 0.08s;  /* Shorter = snappier */
    }
}

/* Or disable animations entirely on slow devices */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

### 10. **Font Size on Ultra-Small Devices** (LOW)
**Problem:** Text still too small on <320px phones (old iPhone SE)

**Current:**
```css
:root {
    --fs-xs: 11px;
    --fs-sm: 10px;
}
```

**Recommendation:**
```css
@media (max-width: 360px) {
    :root {
        --fs-xs: 12px;
        --fs-sm: 11px;
        --fs-md: 14px;
    }
}
```

---

## 📋 Priority Roadmap

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 HIGH | Dynamic viewport height jank | 5min | High |
| 🟠 MEDIUM | Mobile nav overlay/backdrop | 15min | High |
| 🟠 MEDIUM | Swipe gesture support | 20min | Medium |
| 🟠 MEDIUM | Touch-friendly inputs | 10min | Medium |
| 🟡 LOW | Sticky header | 5min | Low-Medium |
| 🟡 LOW | Animation performance | 5min | Low |
| 🟡 LOW | Ultra-small device support | 5min | Low |

---

## 🚀 Quick Win Checklist

- [ ] Change `100dvh` to `100svh` + fallback
- [ ] Add backdrop when mobile menu open
- [ ] Increase min-height of touch targets to 44px (already done!)
- [ ] Add `font-size: 16px` to mobile inputs (prevents iOS zoom)
- [ ] Test on iPhone SE, Samsung Galaxy S20, iPad Mini
- [ ] Test on slow 4G network (DevTools throttling)
- [ ] Test on Chrome, Safari, Firefox mobile

---

## 🧪 Testing Recommendations

1. **Device Testing:**
   - iPhone 12 mini (375px)
   - iPhone SE (375px)
   - Galaxy S20 (360px)
   - Pixel 6 (412px)
   - iPad (768px)

2. **Browser Testing:**
   - Safari iOS (check notch/safe area)
   - Chrome Android
   - Firefox Android
   - Samsung Internet

3. **Network Testing:**
   - Slow 4G throttling in DevTools
   - Test on real 4G connection

4. **Gesture Testing:**
   - Swipe to navigate
   - Double-tap to zoom (should still work)
   - Pull-to-refresh (iOS)

