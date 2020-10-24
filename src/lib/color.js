// Interpolates between two colors.
// colorA and colorB should be objects with keys {r, g, b, a}.
// interpolationFactor should be a number between 0 and 1 representing how far from colorA to
// colorB it should interpolate.
// An object with keys {r, g, b, a} will be returned.
export const interpolateColors = (colorA, colorB, interpolationFactor) => {
  return {
    r: parseInt((colorB.r - colorA.r) * interpolationFactor + colorA.r, 10),
    g: parseInt((colorB.g - colorA.g) * interpolationFactor + colorA.g, 10),
    b: parseInt((colorB.b - colorA.b) * interpolationFactor + colorA.b, 10),
    a: (colorB.a - colorA.a) * interpolationFactor + colorA.a,
  };
};

export const rgbaObject = (r, g, b, a) => {
  return { r, g, b, a };
};

export const rgbaString = (rgba) => {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
};

export const solarizedDark = () => {
  const root = document.documentElement;
  // backgrounds
  root.style.setProperty('--base03', '#fdf6e3');
  root.style.setProperty('--base02', '#eee8d5');
  root.style.setProperty('--base01', '#93a1a1');
  root.style.setProperty('--base00', '#839496');
  // highlights
  root.style.setProperty('--base0', '#657b83');
  root.style.setProperty('--base1', '#586e75');
  root.style.setProperty('--base2', '#073642');
  root.style.setProperty('--base3', '#002b36');
  // shadows
  root.style.setProperty('--base0-soft', 'rgba(101, 123, 131, 0.75)');
  // highlighted backgrounds
  root.style.setProperty('--base1-soft', 'rgba(88, 110, 117, 0.4)');
  // header colors
  root.style.setProperty('--blue', '#268bd2');
  root.style.setProperty('--green', '#859900');
  root.style.setProperty('--cyan', '#2aa198');
  root.style.setProperty('--yellow', '#b58900');
  // additional colors
  root.style.setProperty('--orange', '#cb4b16');
  root.style.setProperty('--red', '#dc322f');
  root.style.setProperty('--magenta', '#6c71c4');
  root.style.setProperty('--violet', '#d33682');
  // table highlight
  root.style.setProperty('--green-soft', 'rgba(133, 153, 0, 0.28)');
};
export const solarizedLight = () => {
  const root = document.documentElement;
  // backgrounds
  root.style.setProperty('--base3', '#fdf6e3');
  root.style.setProperty('--base2', '#eee8d5');
  root.style.setProperty('--base1', '#93a1a1');
  root.style.setProperty('--base0', '#839496');
  // highlights
  root.style.setProperty('--base00', '#657b83');
  root.style.setProperty('--base01', '#586e75');
  root.style.setProperty('--base02', '#073642');
  root.style.setProperty('--base03', '#002b36');
  // shadows
  root.style.setProperty('--base0-soft', 'rgba(131, 148, 150, 0.75)');
  // highlighted backgrounds
  root.style.setProperty('--base1-soft', 'rgba(147, 161, 161, 0.4)');
  // header colors
  root.style.setProperty('--blue', '#268bd2');
  root.style.setProperty('--green', '#859900');
  root.style.setProperty('--cyan', '#2aa198');
  root.style.setProperty('--yellow', '#b58900');
  // additional colors
  root.style.setProperty('--orange', '#cb4b16');
  root.style.setProperty('--red', '#dc322f');
  root.style.setProperty('--magenta', '#d33682');
  root.style.setProperty('--violet', '#6c71c4');
  // table highlight
  root.style.setProperty('--green-soft', 'rgba(133, 153, 0, 0.28)');
};

export const gruvboxDark = () => {
  /*
   gruvbox dark
   see https://github.com/morhetz/gruvbox for palette
   this theme uses the 'neutral' version of the color palette
 */
  const root = document.documentElement;
  // background and highlights
  root.style.setProperty('--base3', '#282828'); // bg0
  root.style.setProperty('--base2', '#504945'); // bg2
  root.style.setProperty('--base1', '#665c54'); // bg3
  root.style.setProperty('--base0', '#7c6f64'); // bg4
  root.style.setProperty('--base00', '#a89984'); // fg4
  root.style.setProperty('--base01', '#bdae93'); // fg3
  root.style.setProperty('--base02', '#d5c4a1'); // fg2
  root.style.setProperty('--base03', '#fbf1c7'); // fg0
  // transparent versions
  root.style.setProperty('--base0-soft', 'rgba(124, 111, 100, 0.75)');
  root.style.setProperty('--base1-soft', 'rgba(102, 92, 84, 0.4)');
  // header colors
  root.style.setProperty('--blue', '#458588');
  root.style.setProperty('--green', '#98971a');
  root.style.setProperty('--cyan', '#689d6a');
  root.style.setProperty('--yellow', '#d79921');
  // additional colors
  root.style.setProperty('--orange', '#d65d0e');
  root.style.setProperty('--red', '#cc241d');
  root.style.setProperty('--magenta', '#b16286'); // neutral purple
  root.style.setProperty('--violet', '#d3869b'); // bright purple
  // table highlight
  root.style.setProperty('--green-soft', 'rgba(133, 153, 0, 0.28)');
};
