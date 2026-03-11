# Content Visuals Mapping Guide

## Output Destination
`src/assets/generated-creatives/` 

This mapping specifies exactly which of the newly generated "Reusable Asset Library" images should be rendered on specific pages.

---

## 1. Core Commerce

### `/` (Homepage)
- **Hero:** `asset_packshot_hero_water_1772750435342.png` 
- **Support 1:** `asset_environment_sink_1772750764156.png`
- **Graphic:** `asset_graphic_benefit_chips_1772750940425.png`

### `/face-cream`
- **Hero:** `asset_packshot_angled_scale_1772750463250.png`
- **Support 1:** `asset_texture_smear_stone_1772750541116.png`
- **Support 2:** `asset_texture_absorbed_skin_1772750556117.png`

### `/about`
- **Hero:** `asset_founder_mountain_1772750599903.png`
- **Support 1:** `asset_founder_testing_1772750822888.png`

---

## 2. Article Hub (`/articles/*`)

### Default Fallback Heros
- `asset_environment_sink_1772750764156.png`
- `asset_environment_commute_1772750787920.png` (For cold-weather/outdoor context)

### Specific Article Needs
- **"Why Men Quit Multi-Step Routines"**: Needs `asset_packshot_shelf_context_1772750479858.png` to show the 'clean slate' shelf.
- **"The 15-Second Morning Routine"**: Needs `asset_packshot_hand_held_1772750504601.png` showing active use.
- **"Skincare for Athletes / Altitude"**: Needs `asset_founder_mountain_1772750599903.png` as a lifestyle hero.

---

## 3. Ingredient Pages (`/ingredients/*`)

### Hyaluronic Acid (Hydration focus)
- **Texture:** (Use previous liquid crystal drop) `ingredient_texture_hyaluronic_1772743658803.png`

### Squalane (Weightless Moisture)
- **Texture:** (Use previous squalane drop) `ingredient_texture_squalane_1772743684424.png`

### General Ingredients (Texture Evidence)
- To show how lightweight BASE LAYER is generally, use:
  - `asset_texture_pump_dispensing_1772750527399.png`
  - `asset_texture_absorbed_skin_1772750556117.png`

---

## 4. Skin Concerns (`/skin-concerns/*`)

### Oily Skin / Shine Control
- **Hero:** `asset_skin_oily_tzone_1772750833743.png`
- **Support:** `asset_environment_desk_drawer_1772750775737.png` (Mid-day office context)
- **Proof:** `asset_texture_absorbed_skin_1772750556117.png`

### Dry / Dehydrated / Stressed
- **Hero:** `asset_skin_dry_tight_1772750846168.png`
- **Support:** `asset_environment_commute_1772750787920.png`

### Fatigue / Under-eye
- **Hero:** `asset_skin_tired_undereye_1772750857898.png`

### Sensitivity / Post-Shave
- **Hero:** `asset_skin_mild_redness_1772750869168.png`

### Anti-Aging / General Texture
- **Hero:** `asset_skin_35_texture_1772750881164.png`

---

## 5. Comparisons (`/comparisons/*`)

### Base Layer vs 5-Step Regimens
- **Hero Lineup:** `asset_comparison_lineup_1772750914688.png`
- **Texture Compare:** `asset_comparison_textures_1772750928241.png`

### Base Layer vs Generic Lotions
- **Texture Compare:** `asset_comparison_textures_1772750928241.png` (To prove matte finish vs "thick heavy cream")
