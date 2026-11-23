# tiny-stack-vm

A tiny stack virtual machine for the make.fun bounty `tiny-stack-vm-01-run-20261122`. It runs the competition's 32-bit stack ISA: a 256-value data stack, a 64-entry call stack, 256 words of memory, input and output, and the eleven trap codes.

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/golden-tapir-28/tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/golden-tapir-28/tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

## Run

`main.ts` runs one set of 40 instances: it reads `program.bin` and `input.bin` for each instance from `MAKEFUN_INPUT_DIR` (default `/input`) and writes `stdout.bin` and `exit.txt` for each under `MAKEFUN_OUTPUT_DIR` (default `/output`).

```sh
node main.ts
```

Node 22, standard library only, no dependencies. Deterministic: two runs on the same set produce byte-identical output.

## Traps

Exit code is the trap code: 2 underflow, 3 overflow, 4 div by zero, 5 bad opcode, 6 bad memory address, 7 call overflow, 8 empty return, 9 bad pc, 10 step limit (1M), 11 output limit (64KiB). Output before a trap is kept.
