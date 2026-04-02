export const phi = (1 + Math.sqrt(5)) / 2;
export function quasiPeriodBehaviour(n) {
  return 2 - (Math.floor((n + 2) * phi) - Math.floor((n + 1) * phi));
}
export function chaoticBehaviour({ iterations, binary }) {
  let x = chaoticBehaviour.x; //valore iniziale
  for (let i = 0; i < iterations; i++) {
    x = x * x; //(chaoticBehaviour.r * x * (1 - x))//.toFixed(3)
  }
  return binary ? (x * 1000) % 2 !== 0 : x;
}

export function getLogoRatio(value) {
  return Math.round(value / 1.453);
}
chaoticBehaviour.r = 3.5; //2.532
chaoticBehaviour.x = 0.4;
