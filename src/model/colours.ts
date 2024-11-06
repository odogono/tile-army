export const colours = [
  '#FF6B6B', // Soft Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7B267', // Mellow Apricot
  '#A06CD5', // Soft Purple
  '#7FBC8C', // Sage Green
  '#F67280', // Pastel Red
  '#6A0572', // Deep Purple
];

export const getRandomColour = () => {
  return colours[Math.floor(Math.random() * colours.length)];
};
