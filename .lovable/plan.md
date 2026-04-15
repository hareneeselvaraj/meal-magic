

## Healthy Indian Meal Planner & Grocery Tracker — PWA UI

### Design System
- **Background**: Animated floating gradient blobs (soft greens, oranges, purples) with glassmorphism cards (`backdrop-blur`, semi-transparent white bg)
- **Cards**: 16px+ border-radius, soft box-shadows, glass effect
- **Status colors**: Green `#22C55E` (available), Yellow `#EAB308` (low stock), Red `#EF4444` (missing)
- **Typography**: Inter/system font, clean hierarchy
- **PWA**: Simple `manifest.json` for installability (no service worker needed since no offline requirement)

### Screens & Components

**1. Bottom Navigation Bar** — Fixed bottom bar with 5 icons (Home, Meals, Grocery, Upload, History). Active tab highlighted. Controls which screen is shown via local state.

**2. Home Dashboard**
- Greeting: "Hi Harenee 👋" with date
- 4 meal cards (Breakfast, Lunch, Snack, Dinner) showing dish name, flavor tags (Spicy/Sweet/Light as colored chips), ingredient preview
- Quick Grocery Status section with 3 colored count badges

**3. Meal Planner**
- Filter chips: Spicy / Sweet / Light / Balanced (toggle selection)
- Grid of meal option cards filtered by selection
- "Select Meal" button per card; selected cards get highlighted border/glow
- All dummy Indian dishes (Poha, Idli, Dal Rice, Khichdi, etc.)

**4. Grocery Inventory**
- Search bar at top
- List of grocery items as cards with name, quantity, unit, and colored status dot
- Tap to edit quantity (inline or modal)
- Floating "+" FAB button
- Add item dialog

**5. Upload Invoice**
- Drag-and-drop upload zone with file picker fallback
- After "upload", show mock bill preview image placeholder
- "Detected Items" list with editable name/quantity fields (pre-filled mock OCR data)
- "Update Inventory" button

**6. History**
- Timeline-style list grouped by date
- Each entry shows items bought and quantity changes
- Clean list with date headers and item rows

### Data & State
- All dummy data (Indian meals, grocery items, history entries) defined in a shared data file
- React state for: active tab, selected meals, grocery quantities/statuses, search filter, meal filter chips
- Color-coded status dynamically reflects quantity thresholds

### Files to Create
- `src/data/mockData.ts` — All placeholder data
- `src/components/BottomNav.tsx`
- `src/components/FloatingBackground.tsx` — Animated gradient blobs
- `src/components/GlassCard.tsx` — Reusable glassmorphism card
- `src/components/StatusBadge.tsx` — Color-coded status indicator
- `src/components/MealCard.tsx`
- `src/components/GroceryItem.tsx`
- `src/pages/Home.tsx`
- `src/pages/MealPlanner.tsx`
- `src/pages/GroceryInventory.tsx`
- `src/pages/UploadInvoice.tsx`
- `src/pages/History.tsx`
- Update `src/pages/Index.tsx` — Main app shell with bottom nav and screen switching
- Update `src/index.css` — Custom glassmorphism utilities and floating blob animations
- `public/manifest.json` + update `index.html` — PWA installability (manifest only, no service worker)

