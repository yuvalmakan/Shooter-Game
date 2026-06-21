# 🎯 2D Canvas Top-Down Shooter

A dynamic, top-down 2D shooter built entirely with vanilla JavaScript and the HTML5 Canvas API. This game features procedural room generation, various enemy archetypes, dynamic biomes with unique environmental effects, and a raycasted field-of-view system that hides enemies out of your line of sight.

## 🧠 Architecture & State Management

The game relies on lightweight, vanilla JavaScript structures to maintain state and handle entities without the overhead of external frameworks.

* **Global Entities:** Active game objects are stored in dedicated arrays (`roomArr`, `enemyArr`, `bulletArr`, `coinArr`) which are iterated over during each frame.
* **The Player Object:** A central `player` class stores essential properties (health, score, money, active potions, damage multipliers) and updates dynamically.
* **Environment State:** Global variables track the current `biome` (which modifies canvas styles and gameplay mechanics) and user inputs via a `keys` dictionary.

## 🔄 Game Loop & Rendering Flow

The core of the engine is driven by the `animate()` function, utilizing `requestAnimationFrame` for smooth rendering. The rendering pipeline strictly follows this order to ensure proper layering:

1.  **Clear Context:** The canvas is completely cleared at the start of the frame.
2.  **Draw Environment:** Rooms and walls are rendered first.
3.  **Draw Entities:** Enemies (if not cloaked/hidden) and dropped coins are drawn.
4.  **Draw Projectiles:** Active bullets are rendered as they traverse the screen.
5.  **Calculate & Render Field of View:** A radial vision cone is generated using raycasting, applying a shadow mask to areas the player cannot see.
6.  **Draw Player:** Rendered on top of the FOV mask to ensure visibility.
7.  **Draw HUD:** The Heads-Up Display (Score, Health, Money, Potions, and Biome) is drawn on the top-most layer.
8.  **Evaluate State:** The loop calculates position updates, resolves collisions, and checks win/loss conditions before requesting the next frame.

## 💥 Collision Detection

The game utilizes three distinct collision and intersection methods depending on the context:

* **Circle-Circle Collision:** Used for entity-to-entity interactions (e.g., bullets hitting enemies, the player picking up coins). It calculates the distance between two centers and checks if it is less than or equal to the sum of their radii.
* **Axis-Aligned Bounding Box (AABB):** Used for world geometry. Ensures the player and bullets correctly collide with, slide against, or bounce off rectangular walls and doors.
* **Ray-Casting:** Deployed for the player's radial vision and enemy line-of-sight checks. It projects rays to find the closest line-segment intersections with room walls, determining what is visible and alerting enemies only when the player is unblocked.

## 🗺️ Procedural Generation

The map and its hazards are generated dynamically at the start of each floor.

* **Room Layouts:** Rooms are instantiated on a grid using nested `for` loops (stepping by `2` intervals). 
* **Door Carving:** Inside the `Room` constructor, a random integer (`0` to `3`) determines which of the four surrounding walls will be carved out to create a doorway.
* **Biome Modifiers:** A random roll assigns one of `6` biomes (e.g., *Gas Chamber*, *Ice*, *Overgrown*), altering player speed, visibility, enemy health, and environmental hazards.
