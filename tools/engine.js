// Water-sort puzzle engine for the level tools: rules, solver, difficulty metrics. State = array of strings, one char per layer (bottom→top).
const ch = c => String.fromCharCode(97 + c);

function rng(seed) { // mulberry32
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const runLen = s => { let n = 1; while (n < s.length && s[s.length - 1 - n] === s[s.length - 1]) n++; return s.length ? n : 0; };
const uniform = s => s.length > 0 && runLen(s) === s.length;
const solved = (st, cap) => st.every(s => !s.length || (s.length === cap && uniform(s)));
const key = st => st.slice().sort().join('|');

// Legal, non-pointless moves: [from, to, amount]. Only the first empty bottle is tried (they are interchangeable).
function moves(st, cap) {
  const out = [];
  const firstEmpty = st.findIndex(s => !s.length);
  for (let i = 0; i < st.length; i++) {
    const s = st[i];
    if (!s.length) continue;
    const r = runLen(s);
    for (let j = 0; j < st.length; j++) {
      const d = st[j];
      if (i === j || d.length >= cap) continue;
      if (d.length) { if (d[d.length - 1] !== s[s.length - 1]) continue; }
      else if (j !== firstEmpty || r === s.length) continue; // mono bottle into empty = no-op
      out.push([i, j, Math.min(r, cap - d.length)]);
    }
  }
  return out;
}
function apply(st, [i, j, n]) {
  const nx = st.slice();
  nx[j] = st[j] + st[i].slice(st[i].length - n);
  nx[i] = st[i].slice(0, st[i].length - n);
  return nx;
}

// How scattered the board is: colour boundaries inside bottles + extra bottles each colour occupies.
function h(st) {
  let breaks = 0;
  const where = {};
  for (let b = 0; b < st.length; b++) {
    const s = st[b];
    for (let k = 0; k < s.length; k++) {
      if (k && s[k] !== s[k - 1]) breaks++;
      (where[s[k]] ||= new Set()).add(b);
    }
  }
  for (const c in where) breaks += where[c].size - 1;
  return breaks;
}

// ponytail: DFS existence check with a node cap; levels past the cap are discarded, not solved harder.
function solvable(start, cap, limit = 400000) {
  const seen = new Set();
  let nodes = 0;
  const dfs = st => {
    if (solved(st, cap)) return true;
    if (++nodes > limit) return null;
    const k = key(st);
    if (seen.has(k)) return false;
    seen.add(k);
    const ms = moves(st, cap).map(m => [m, apply(st, m)]).sort((a, b) => h(a[1]) - h(b[1]));
    for (const [, nx] of ms) { const r = dfs(nx); if (r !== false) return r; }
    return false;
  };
  return dfs(start);
}

// Short (near-optimal) solution by beam search; returns the move list or null.
function beamSolve(start, cap, width = 1500, maxDepth = 250) {
  let layer = [{ st: start, path: [] }];
  const seen = new Set([key(start)]);
  for (let d = 0; d < maxDepth && layer.length; d++) {
    const next = [];
    for (const { st, path } of layer) {
      for (const m of moves(st, cap)) {
        const nx = apply(st, m), k = key(nx);
        if (seen.has(k)) continue;
        seen.add(k);
        const p = path.concat([m]);
        if (solved(nx, cap)) return p;
        next.push({ st: nx, path: p, h: h(nx) });
      }
    }
    next.sort((a, b) => a.h - b.h);
    layer = next.slice(0, width);
  }
  return null;
}

// A "casual player": grabs obvious good-looking moves, no lookahead. Returns the share of playouts that get stuck.
function casualFailRate(start, cap, rand, runs = 40) {
  let fails = 0;
  for (let r = 0; r < runs; r++) {
    let st = start;
    const seen = new Set([key(st)]);
    let ok = false;
    for (let step = 0; step < 400; step++) {
      if (solved(st, cap)) { ok = true; break; }
      const cands = [];
      for (const m of moves(st, cap)) {
        const nx = apply(st, m), k = key(nx);
        if (seen.has(k)) continue;
        const [i, j, n] = m, s = st[i], d = st[j], after = nx[j];
        let score = rand() * 2;
        if (d.length) score += 4; else score -= 1;
        if (after.length === cap && uniform(after)) score += 6;
        if (!nx[i].length) score += 3; else if (uniform(nx[i])) score += 2;
        if (n < runLen(s)) score -= 3;
        cands.push([score, nx, k]);
      }
      if (!cands.length) break;
      cands.sort((a, b) => b[0] - a[0]);
      const pick = rand() < 0.15 ? cands[Math.floor(rand() * cands.length)] : cands[0];
      st = pick[1];
      seen.add(pick[2]);
    }
    if (!ok) fails++;
  }
  return fails / runs;
}

// Deal `colors`×`cap` layers into (colors+spare) bottles, leaving `emptyStart` of them empty.
function deal(colors, cap, spare, emptyStart, rand) {
  const pool = [];
  for (let c = 0; c < colors; c++) for (let k = 0; k < cap; k++) pool.push(ch(c));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const filled = colors + spare - emptyStart, base = Math.floor(pool.length / filled), rem = pool.length % filled;
  if (base + (rem ? 1 : 0) > cap) return null;
  const st = [];
  let p = 0;
  for (let b = 0; b < filled; b++) { const n = base + (b < rem ? 1 : 0); st.push(pool.slice(p, p + n).join('')); p += n; }
  for (let e = 0; e < emptyStart; e++) st.push('');
  if (st.some(s => s.length === cap && uniform(s))) return null;
  return st;
}

module.exports = { rng, moves, apply, solved, solvable, beamSolve, casualFailRate, deal, h, uniform, runLen };

if (require.main === module) { // self-check of the rules
  const a = (x, m) => { if (!x) throw new Error(m); };
  a(moves(['aab', ''], 4).some(([i, j, n]) => i === 0 && j === 1 && n === 1), 'into empty');
  a(apply(['abb', ''], [0, 1, 2]).join() === 'a,bb', 'multi-layer pour');
  a(!moves(['ab', 'a'], 4).some(([i, j]) => i === 0 && j === 1), 'mismatched top');
  a(!moves(['b', 'bbbb'], 4).some(([i, j]) => i === 0 && j === 1), 'full target');
  a(moves(['bbb', 'aab'], 4).find(([i, j]) => i === 0 && j === 1)[2] === 1, 'partial fit');
  a(!moves(['aa', ''], 4).length, 'mono into empty is pointless');
  a(solved(['aaaa', ''], 4) && !solved(['aaa', 'a'], 4), 'solved');
  a(solvable(['abab', 'baba', '', ''], 4) === true, 'solver');
  a(beamSolve(['abab', 'baba', '', ''], 4).length > 0, 'beam');
  console.log('engine ok');
}
