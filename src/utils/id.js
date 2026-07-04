// Simple, dependency-free unique id generator (good enough for local entries).
let counter = 0;

export function makeId() {
  counter = (counter + 1) % 1000000;
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  const time = Date.now().toString(36);
  return `e_${time}_${counter.toString(36)}_${rand}`;
}

export default makeId;
