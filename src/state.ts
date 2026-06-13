import type p5 from 'p5';
import type { Cell } from './cell';
import type { Confetto } from './confetti';

export interface TouchInfo {
  index: number;
  x: number;
  y: number;
  moved: boolean;
  acted: boolean;
}

// Shared mutable game state. In the original each file declared these as loose
// globals; under ES modules they live on one object every module imports.
export const state = {
  CANVASWIDTH: 1000,
  CANVASHEIGHT: 1000,
  CELLWIDTH: 40, // configured/max cell size
  CELLHEIGHT: 40,
  CELLW: 40, // actual rendered cell size (after fit scaling)
  CELLH: 40,
  CELLSONROW: 20,
  CELLSONCOLUMN: 20,
  BOMBSNUMBER: 100,
  GAMEOVER: false,
  gameoverAt: null as number | null,
  cnv: null as p5.Renderer | null,
  lastTouch: 0, // millis() of last touch, to ignore emulated mouse
  touchInfo: null as TouchInfo | null,
  longPressTimer: null as number | null,
  cells: [] as Cell[],
  confetti: [] as Confetto[],
};
