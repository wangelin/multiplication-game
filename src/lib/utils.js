export function random(arr) {
  if (!arr || arr.length === 0) arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return arr[(Math.random() * arr.length) | 0];
}

export function fifty_fifty() {
  return Math.random() < 0.5;
}

// https://stackoverflow.com/questions/37568712/making-a-range-function-in-javascript
export function range(x, y) {
  return x > y ? [] : [x, ...range(x + 1, y)];
}
