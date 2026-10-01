// Research tool: measures solvability and difficulty of level configs. Run: node tools/probe.js
const E = require('./engine');
const CONFIGS = [ // [colors, cap, spare bottles, empty at start]
  [5, 4, 2, 2], [7, 4, 2, 2], [9, 4, 2, 2], [11, 4, 2, 2],
  [7, 4, 2, 1], [9, 4, 2, 1], [11, 4, 2, 1],
  [7, 4, 1, 1], [9, 4, 1, 1],
  [6, 5, 2, 2], [8, 5, 2, 2], [10, 5, 2, 2], [8, 5, 2, 1], [10, 5, 2, 1],
  [6, 5, 1, 1], [8, 5, 1, 1],
  [6, 6, 2, 2], [8, 6, 2, 2], [8, 6, 2, 1], [6, 6, 1, 1],
];
const rand = E.rng(7);
console.log('config        solv%  casualFail  par   ms/level');
for (const [c, cap, sp, es] of CONFIGS) {
  let tried = 0, ok = 0, fail = 0, par = 0, t0 = Date.now();
  while (ok < 12 && tried < 60) {
    const st = E.deal(c, cap, sp, es, rand);
    if (!st) continue;
    tried++;
    if (E.solvable(st, cap) !== true) continue;
    ok++;
    fail += E.casualFailRate(st, cap, rand);
    par += (E.beamSolve(st, cap) || []).length;
  }
  const f = s => String(s).padEnd(6);
  console.log(`${c}c cap${cap} ${sp}sp ${es}e`.padEnd(14), f(Math.round(ok / tried * 100)), f((fail / ok).toFixed(2)), '    ', f((par / ok).toFixed(0)), Math.round((Date.now() - t0) / tried));
}
