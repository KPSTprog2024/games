/**
 * Project: "Gear" - Color Database Integrator
 * Combines all split database parts (colors_part1.js to colors_part5.js)
 * into a single unified COLOR_DATABASE array.
 */

const COLOR_DATABASE = (window.COLOR_DATABASE_PARTS || []).flat();

// Export for both Browser and CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = COLOR_DATABASE;
} else {
  window.COLOR_DATABASE = COLOR_DATABASE;
}
