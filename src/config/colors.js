// Palette del sito, unica fonte di verità.
// Usata da src/App.jsx (rendering lato client) e da
// scripts/ssr-pages-entry.jsx (prerender lato server): tenerle allineate
// evita che le pagine prerenderizzate escano con colori diversi.
export const COLORS = {
  NAVY: "#0A1F3D",
  NAVY_DEEP: "#061229",
  GOLD: "#C19A5B",
  GOLD_BRIGHT: "#D4B27A",
  CREAM: "#F5EFE4",
};

export default COLORS;
