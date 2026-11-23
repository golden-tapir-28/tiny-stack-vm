import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Tiny stack VM, ISA v1: 32-bit wrapping ints, 256-value data stack,
// 64-entry call stack, 256 words of memory. Limits: 1,000,000 steps
// (trap 10), 65,536 output bytes (trap 11). Traps 2-11; output written
// before a trap is kept.

const IND = process.env.MAKEFUN_INPUT_DIR || "/input";
const OUTD = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Run one program. Returns {o: stdout bytes, e: exit code}.
function run(prog, inp) {
  const mem = new Int32Array(256);
  const st = [], cs = [], out = [];
  let pc = 0, steps = 0, ip = 0;
  const end = (e) => ({ o: Buffer.from(out), e });
  for (;;) {
    if (steps >= 1000000) return end(10);
    if (pc < 0 || pc >= prog.length) return end(9);
    const op = prog[pc];
    const il = op === 1 ? 1 : op === 2 ? 4 : op >= 0x30 && op <= 0x33 ? 2 : 0;
    let np, nq;
    if (op === 1 || op === 2 || op === 0x52) { np = 0; nq = 1; }
    else if (op === 3 || op === 0x31 || op === 0x32 || op === 0x50 || op === 0x51 || op === 0x53) { np = 1; nq = 0; }
    else if (op === 0x17 || op === 0x1b || op === 0x40) { np = 1; nq = 1; }
    else if (op === 4) { np = 1; nq = 2; }
    else if (op === 0x41) { np = 2; nq = 0; }
    else if (op === 5) { np = 2; nq = 2; }
    else if (op === 6) { np = 2; nq = 3; }
    else if (op === 7) { np = 3; nq = 3; }
    else if ((op >= 0x10 && op <= 0x16) || op === 0x18 || op === 0x19 || op === 0x1a || (op >= 0x1c && op <= 0x1e) || (op >= 0x20 && op <= 0x22)) { np = 2; nq = 1; }
    else if (op === 0 || op === 0x30 || op === 0x33 || op === 0x34) { np = 0; nq = 0; }
    else return end(5);
    if (pc + 1 + il > prog.length) return end(9);
    if (st.length < np) return end(2);
    if (st.length - np + nq > 256) return end(3);
    steps++;
    const nx = pc + 1 + il;
    switch (op) {
      case 0: return end(0);
      case 1: st.push((prog[pc + 1] << 24) >> 24); pc = nx; break;
      case 2: st.push(prog.readInt32LE(pc + 1)); pc = nx; break;
      case 3: st.pop(); pc = nx; break;
      case 4: st.push(st[st.length - 1]); pc = nx; break;
      case 5: { const t = st[st.length - 1]; st[st.length - 1] = st[st.length - 2]; st[st.length - 2] = t; pc = nx; break; }
      case 6: st.push(st[st.length - 2]); pc = nx; break;
      case 7: { const a = st[st.length - 3], b = st[st.length - 2], c = st[st.length - 1]; st[st.length - 3] = b; st[st.length - 2] = c; st[st.length - 1] = a; pc = nx; break; }
      case 0x17: st[st.length - 1] = (-st[st.length - 1]) | 0; pc = nx; break;
      case 0x1b: st[st.length - 1] = ~st[st.length - 1]; pc = nx; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16:
      case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e:
      case 0x20: case 0x21: case 0x22: {
        const b = st.pop(), a = st.pop();
        let r;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (b === 0) return end(4); r = (a / b) | 0; }
        else if (op === 0x14) { if (b === 0) return end(4); r = (a % b) | 0; }
        else if (op === 0x15) { if (b === 0) return end(4); r = Number(BigInt(a >>> 0) / BigInt(b >>> 0)) | 0; }
        else if (op === 0x16) { if (b === 0) return end(4); r = Number(BigInt(a >>> 0) % BigInt(b >>> 0)) | 0; }
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << (b & 31);
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        st.push(r); pc = nx; break;
      }
      case 0x30: pc = nx + prog.readInt16LE(pc + 1); break;
      case 0x31: { const v = st.pop(); pc = v === 0 ? nx + prog.readInt16LE(pc + 1) : nx; break; }
      case 0x32: { const v = st.pop(); pc = v !== 0 ? nx + prog.readInt16LE(pc + 1) : nx; break; }
      case 0x33: if (cs.length >= 64) return end(7); cs.push(nx); pc = prog.readUInt16LE(pc + 1); break;
      case 0x34: if (cs.length === 0) return end(8); pc = cs.pop(); break;
      case 0x40: { const a = st.pop(); if (a < 0 || a > 255) return end(6); st.push(mem[a]); pc = nx; break; }
      case 0x41: { const a = st.pop(), v = st.pop(); if (a < 0 || a > 255) return end(6); mem[a] = v; pc = nx; break; }
      case 0x50: { const v = st.pop(), s = String(v); if (out.length + s.length > 65536) return end(11); for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i)); pc = nx; break; }
      case 0x51: { const v = st.pop(); if (out.length + 1 > 65536) return end(11); out.push(v & 255); pc = nx; break; }
      case 0x52: st.push(ip < inp.length ? inp[ip++] : -1); pc = nx; break;
      case 0x53: { const v = st.pop(); return end(v & 255); }
    }
  }
}

const ids = readdirSync(IND, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
for (const id of ids) {
  const r = run(readFileSync(join(IND, id, "program.bin")), readFileSync(join(IND, id, "input.bin")));
  const od = join(OUTD, id);
  mkdirSync(od, { recursive: true });
  writeFileSync(join(od, "stdout.bin"), r.o);
  writeFileSync(join(od, "exit.txt"), String(r.e) + "\n");
}
