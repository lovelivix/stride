// Design tokens — mirrors the CSS variables in index.css.
// Use these when you need a colour in JS (charts, inline styles).
export const T = {
  pink: '#FF5C7A',
  pinkL: '#FF8FA3',
  coral: '#FF7A5C',
  white: '#FFFFFF',
  off: '#FDF8F8',
  border: '#F0E0E4',
  text: '#1A0A10',
  muted: '#9A7A82',
  walk: '#5CB8FF',
  lime: '#5CE87A',
  amber: '#FFB347',
};

// Per-user accent (subtle personalisation without leaving the palette)
export const USER_ACCENT = {
  olivia: T.pink,
  mum: T.coral,
  husband: T.walk,
};
