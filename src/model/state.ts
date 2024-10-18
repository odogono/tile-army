export const state = {
  tiles: [
    { position: [0, 0], colour: '#70d6ff' },
    { position: [0, 100], colour: '#ff70a6' },
    { position: [0, 200], colour: '#ff9770' },
    { position: [0, 300], colour: '#ffd670' },
    { position: [0, 400], colour: '#e9ff70' },
    { position: [0, 500], colour: '#70ff97' },
    { position: [0, 600], colour: '#70d6ff' },
    { position: [0, 700], colour: '#a670ff' },
    { position: [0, 800], colour: '#d670ff' },
    { position: [0, 900], colour: '#ff70a6' },
    { position: [100, 900], colour: '#70d6ff' },
  ],
};

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
