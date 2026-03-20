# PadPlanner UI Redesign Plan

## Vision
Create a modern, polished app-like experience that guides users through the route generation flow. The map is the hero; UI should feel lightweight and intuitive. Design inspiration: Komoot, AllTrails, Google Maps.

---

## Color & Design Tokens (Enhanced)

### Primary Palette
- **Background:** `#faf8f3` (warm white)
- **Card Surface:** `#ffffff` (pure white)
- **Primary Brand:** `#c97d47` (warm brown)
- **Primary Light:** `#d99a66` (light brown)
- **Text Dark:** `#3d2c1e` (very dark brown/charcoal)
- **Text Medium:** `#7a5c3e` (medium brown/taupe)
- **Border/Divider:** `#e8d5c0` (soft warm grey)
- **Accent:** `#e8b89f` (warm sand)

### Tailwind Mapping
Update `globals.css` to add new utility classes:
```css
.card { @apply bg-white rounded-xl shadow-sm border border-amber-100; }
.card-lg { @apply bg-white rounded-2xl shadow-md border border-amber-100; }
.btn-primary { @apply bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95; }
.btn-secondary { @apply bg-white hover:bg-amber-50 text-amber-900 font-semibold py-2 px-4 rounded-lg border border-amber-200 transition-all; }
.section-title { @apply text-lg font-bold text-amber-900; }
.body-text { @apply text-sm text-amber-800; }
```

---

## Layout Architecture

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────┐
│ [Header Bar: PadPlanner Logo | EN/NL | About Link]       │
├─────────────────────┬──────────────────────────────────────┤
│                     │                                      │
│  Sidebar            │         MAP (hero)                  │
│  (360px fixed)      │         - Blue route polyline       │
│                     │         - Numbered waypoint pins    │
│  ┌─────────────────┐│         - Pulsing GPS dot           │
│  │📍 Location      ││         - Distance badge (top)      │
│  │[Search...   📱] ││         ┌──────────────────────────┐ │
│  ├─────────────────┤│         │ Download [↓]  Share [↗]  │ │
│  │⚙️ Route Prefs   ││         │ (appear when accepted)    │ │
│  │[Distance][Time] ││         └──────────────────────────┘ │
│  │Distance: 5 km   ││                                      │
│  │Pace: 🚶 Walking ││                                      │
│  ├─────────────────┤│                                      │
│  │ [✨ Generate] ││                                      │
│  │ (or Accept/Reset)│                                      │
│  ├─────────────────┤│                                      │
│  │ About PadPlanner││                                      │
│  │ [footer text]   ││                                      │
│  └─────────────────┘│                                      │
│                     │                                      │
└─────────────────────┴──────────────────────────────────────┘
```

**Sidebar Details:**
- Fixed left column, 360px wide
- Glass-morphism effect (subtle blur, semi-transparent background)
- Clear card-based sections with rounded corners and soft shadows
- Bold section headings with icons
- Consistent spacing and visual hierarchy
- Footer sticks to bottom of sidebar

**Map Interaction:**
- Top-right corner: Download/Share buttons (only when route accepted)
- Top-center: Distance badge (Distance: X.XX km | Time: Y min)
- Floating buttons repositioned to top-right or bottom-right (clean layout)

---

### Mobile (< 1024px)
```
┌────────────────────────────┐
│ PadPlanner  [☰] [📍] [⛶]  │  ← Compact Header
│ (40px fixed top)           │
├────────────────────────────┤
│                            │
│        MAP (full screen)   │
│     (controlled by header) │
│    Download/Share buttons  │
│    (sticky top-right)      │
│                            │
│                            │
│                            │
│    ┌────────────────────┐  │
│    │ ──────  (drag)     │  │ ← Bottom Sheet
│    │                    │  │   (collapsed: 160px)
│    │ 📍 Location: None  │  │
│    │ Distance: 5 km     │  │
│    │ [Generate Route →] │  │
│    └────────────────────┘  │
│                            │
└────────────────────────────┘
```

**Bottom Sheet (Mobile):**
- **Collapsed state (default):** 160px height from bottom, shows drag handle + quick summary
  - Shows current location status or "Tap to set location"
  - Shows distance/time selection pill
  - Shows "Generate" CTA button
  - Click anywhere to expand

- **Expanded state:** Full form (up to 80% screen height), drag handle at top
  - Location input with GPS button
  - Mode toggle (Distance/Time)
  - Distance or time+pace inputs
  - Generate/Accept/Reset buttons
  - Smooth bounce animation on expand/collapse

**Header Bar (Mobile):**
- 40px fixed top with amber background
- Left: App name + icon (clickable to scroll to top)
- Right: Hamburger menu (settings/about) + GPS button + Fullscreen toggle
- Language switcher in menu

---

## Component Changes

### 1. `app/page.tsx` — Root Layout Refactor
**Changes:**
- Update main layout: add header bar for mobile
- Reorganize floating buttons (top-right aligned)
- Change desktop sidebar width to 360px
- Update responsive breakpoints for new bottom sheet height
- Move distance badge styling

**Pseudo-code:**
```tsx
<main className="flex flex-col h-screen bg-amber-50">
  {/* Mobile Header */}
  <header className="lg:hidden bg-amber-700 text-white h-10 px-4 flex items-center justify-between">
    <div className="flex items-center gap-2">🥾 PadPlanner</div>
    <div className="flex gap-3">
      <button>📍</button>
      <button>⛶</button>
      <button>☰</button>
    </div>
  </header>

  {/* Main Layout */}
  <div className="flex flex-1 overflow-hidden">
    {/* Sidebar: Desktop only */}
    <Sidebar className="w-90 lg:w-[360px] flex-shrink-0" />

    {/* Map */}
    <MapWrapper className="flex-1" />
  </div>

  {/* Mobile Bottom Sheet */}
  <MobileBottomSheet className="lg:hidden" />

  {/* Floating Buttons: Repositioned */}
  <FloatingButtonsPanel />
</main>
```

---

### 2. `Sidebar.tsx` — Complete Visual Overhaul
**Changes:**
- Replace flat layout with card-based sections
- Add section icons and bold titles
- Improve visual hierarchy and spacing
- Better responsive padding

**Structure:**
```tsx
<div className="flex flex-col h-full bg-white lg:bg-gradient-to-b lg:from-white/95 lg:to-white rounded-t-3xl lg:rounded-none p-6 gap-6">
  {/* Header */}
  <header className="border-b border-amber-100 pb-4">
    <div className="flex justify-between items-start mb-2">
      <h1 className="text-2xl font-bold text-amber-900">🥾 PadPlanner</h1>
      <LanguageSelector />
    </div>
    <p className="text-sm text-amber-700">Plan your perfect walk</p>
  </header>

  {/* Location Card */}
  <section className="card p-5 space-y-3">
    <h2 className="section-title flex items-center gap-2">📍 Starting Point</h2>
    <LocationSearch />
    <div className="flex gap-2">
      <GPSButton />
    </div>
  </section>

  {/* Settings Card */}
  <section className="card p-5 space-y-4">
    <h2 className="section-title flex items-center gap-2">⚙️ Route Preferences</h2>
    <ToggleModeButtons />
    {/* Distance/Time + Pace inputs here */}
  </section>

  {/* Spacer */}
  <div className="flex-1" />

  {/* Action Button */}
  <button className="btn-primary w-full">✨ Generate Route</button>
  {/* Or Accept/Reset buttons */}

  {/* Footer */}
  <footer className="border-t border-amber-100 pt-4 text-xs text-amber-700 space-y-2">
    <p><strong>About PadPlanner</strong></p>
    <p>Create amazing walking routes...</p>
  </footer>
</div>
```

**Key CSS Updates:**
- Remove dark background colors; use white + subtle shadows
- Add rounded corners (xl, 2xl) to cards
- Improve spacing between sections (gap-6)
- Bold section titles with emoji icons
- Softer borders (amber-100 instead of amber-200)

---

### 3. `SidebarForm.tsx` — Form Refinement
**Changes:**
- Keep structure but improve styling
- Better input field styling (rounded, larger padding)
- Improve toggle button styling
- Better labels and spacing

**Styling:**
- Input fields: `rounded-lg` (not `rounded-md`), padding `py-3`, border `border-amber-200`
- Toggle buttons: larger, more pronounced selected state
- Labels: `text-amber-900` bold, better margin below
- Mode selector: use segmented control style (select one of two)

---

### 4. `MobileBottomBar.tsx` → `MobileBottomSheet.tsx` (Rename & Redesign)
**Completely new component architecture:**

**Collapsed State (Fixed bottom 160px):**
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-amber-100 p-4">
  {/* Drag Handle */}
  <div className="flex justify-center mb-3">
    <div className="w-12 h-1 rounded-full bg-amber-200" />
  </div>

  {/* Quick Summary */}
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <p className="text-xs text-amber-600">Route Setup</p>
      <p className="text-sm font-semibold text-amber-900">5 km Walking Route</p>
    </div>
    <button className="btn-primary text-sm py-2 px-4">Generate →</button>
  </div>
</div>
```

**Expanded State (Dragged up):**
- Full form visible
- Smooth snap-to-top animation
- Swipe-down to collapse
- Transition handled with Framer Motion or CSS animation

---

### 5. `MapLoading.tsx` — Updated Branding
**Changes:**
- Update from "Route Random" to "PadPlanner"
- Keep animation but update color scheme to warm browns
- Improve typography hierarchy

```tsx
<div className="flex flex-col items-center justify-center gap-4">
  <div className="text-6xl">🥾</div>
  <h2 className="text-3xl font-bold text-amber-900">PadPlanner</h2>
  <p className="text-amber-700">Loading your adventure...</p>
  <div className="flex gap-2">
    <div className="w-3 h-3 rounded-full bg-amber-700 animate-bounce" />
    <div className="w-3 h-3 rounded-full bg-amber-600 animate-bounce" style={{animationDelay: '0.1s'}} />
    <div className="w-3 h-3 rounded-full bg-amber-500 animate-bounce" style={{animationDelay: '0.2s'}} />
  </div>
</div>
```

---

### 6. `MapLoadingOverlay.tsx` — Enhanced Loading State
**Changes:**
- Better visual design with more prominent messaging
- Smooth animation
- Better contrast

```tsx
<div className="fixed inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
  <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-xs text-center">
    <div className="mb-4">
      <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
    </div>
    <p className="text-amber-900 font-semibold">Generating route...</p>
    <p className="text-xs text-amber-600 mt-2">Finding the perfect path for you</p>
  </div>
</div>
```

---

### 7. Button Components — Polish
**All button components** should be updated to use the new design tokens:
- `btn-primary` for main CTAs: `bg-amber-700 hover:bg-amber-800`
- Larger padding: `py-3 px-6`
- Rounded: `rounded-xl`
- Add active state: `active:scale-95` (subtle press feedback)
- Better hover transitions

**Examples:**
- `GenerateRouteButton.tsx`: Use `btn-primary` class
- `AcceptRouteButton.tsx`: Use `btn-primary`
- `ResetRouteButton.tsx`: Use secondary style
- `ToggleModeButton.tsx`: Segmented control style

---

### 8. `globals.css` — Enhanced Design System
**Add new utilities:**
```css
/* Card system */
.card {
  @apply bg-white rounded-xl shadow-sm border border-amber-100;
}
.card-lg {
  @apply bg-white rounded-2xl shadow-md border border-amber-100;
}

/* Button system */
.btn-primary {
  @apply bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply bg-white hover:bg-amber-50 text-amber-900 font-semibold py-2 px-4 rounded-lg border border-amber-200 transition-all;
}

/* Typography */
.section-title {
  @apply text-lg font-bold text-amber-900 flex items-center gap-2;
}
.body-text {
  @apply text-sm text-amber-800;
}

/* Inputs */
input:is([type="number"]),
input:is([type="text"]),
select {
  @apply py-3 px-4 rounded-lg border border-amber-200 bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent;
}
```

---

## Implementation Order

1. **Phase 1:** Design tokens in `globals.css` (minimal changes, additive)
2. **Phase 2:** Redesign `Sidebar.tsx` with card-based layout
3. **Phase 3:** Update `SidebarForm.tsx` with new styling
4. **Phase 4:** Refactor `page.tsx` layout and floating buttons
5. **Phase 5:** Create new `MobileBottomSheet.tsx` component
6. **Phase 6:** Update `MapLoading.tsx` and `MapLoadingOverlay.tsx`
7. **Phase 7:** Polish button components
8. **Phase 8:** Testing and refinement

---

## Mobile Responsiveness Checklist

- ✓ Bottom sheet expands/collapses smoothly
- ✓ Header bar is compact and usable on small screens
- ✓ Floating buttons positioned clearly (not overlapping map controls)
- ✓ Touch targets are ≥44px (accessibility)
- ✓ Form inputs are large enough for touch (≥40px height)
- ✓ Cards have adequate padding on mobile
- ✓ Text is readable (min 16px on mobile)
- ✓ No content hidden under notch/safe areas

---

## Preserved Functionality

✓ Location input (search + GPS + map click)
✓ Distance vs Time mode toggle
✓ Pace selector (walking/running/cycling)
✓ Route generation and API integration
✓ Waypoint dragging for route adjustment
✓ Route acceptance and database persistence
✓ GPX download and URL sharing
✓ Live GPS tracking with pulsing dot
✓ Fullscreen map mode
✓ Language switching (EN/NL)
✓ Route overlap detection (blue/red polylines)
✓ URL-based route loading (`?route=UUID`)
✓ All Umami analytics tracking

---

## Visual Examples (Text Descriptions)

**Desktop Sidebar Cards:**
```
┌─────────────────────────────────┐
│ 🥾 PadPlanner          [EN] [NL]│  ← Header
│ Plan your perfect walk          │
├─────────────────────────────────┤
│ 📍 Starting Point               │  ← Card
│ ┌─────────────────────────────┐ │
│ │ [Search Amsterdam...      📱]│ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ⚙️ Route Preferences            │  ← Card
│ [Distance] [Time]               │
│ Distance: 5 km                  │
│ ┌─────────────────────────────┐ │
│ │ [────────●─────────]       │ │  ← Slider
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│                                 │
│ [    ✨ Generate Route       → ]│  ← CTA Button
│                                 │
├─────────────────────────────────┤
│ About PadPlanner                │  ← Footer
│ Create amazing walking routes...│
└─────────────────────────────────┘
```

---

## Success Criteria

- [ ] All functionality preserved (no feature loss)
- [ ] Mobile-first responsive design (works perfectly on iPhone)
- [ ] Modern, polished, app-like aesthetic
- [ ] Clear visual hierarchy guiding users through flow
- [ ] Warm amber/beige color palette used sophisticatedly
- [ ] All buttons and inputs are properly styled and accessible
- [ ] Performance is maintained (no slowdowns)
- [ ] User can complete full flow: Location → Settings → Generate → Accept → Download/Share
