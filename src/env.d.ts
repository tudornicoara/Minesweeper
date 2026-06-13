import type p5 from 'p5';

// p5 runs in GLOBAL mode (loaded from CDN). It calls our setup/draw/etc off
// `window` and exposes drawing functions as globals. Declare the subset the
// sketch uses so the rest of the code can stay strictly typed.
declare global {
  function createCanvas(w: number, h: number): p5.Renderer;
  function resizeCanvas(w: number, h: number): void;
  function background(...args: any[]): void;
  function fill(...args: any[]): void;
  function noFill(): void;
  function stroke(...args: any[]): void;
  function noStroke(): void;
  function strokeWeight(w: number): void;
  function rect(x: number, y: number, w: number, h: number, r?: number): void;
  function text(str: string | number, x: number, y: number): void;
  function textAlign(horiz: any, vert?: any): void;
  function textSize(size: number): void;
  function textStyle(style: any): void;
  function push(): void;
  function pop(): void;
  function translate(x: number, y: number): void;
  function rotate(angle: number): void;
  function rectMode(mode: any): void;
  function color(...args: any[]): p5.Color;
  function random(): number;
  function random(max: number): number;
  function random(min: number, max: number): number;
  function random<T>(arr: T[]): T;
  function constrain(n: number, low: number, high: number): number;
  function millis(): number;

  var width: number;
  var height: number;
  var mouseX: number;
  var mouseY: number;
  var mouseButton: string;
  var drawingContext: CanvasRenderingContext2D;

  const CENTER: any;
  const BOLD: any;
  const NORMAL: any;
  const RIGHT: string;
  const LEFT: string;

  interface Window {
    // p5 lifecycle hooks
    setup: () => void;
    draw: () => void;
    windowResized: () => void;
    mousePressed: () => boolean | void;
    // inline HTML handlers
    resetGame: () => void;
    hint: () => void;
    revealAllBombs: () => void;
    revealAllCells: () => void;
    win: () => void;
    toggleTheme: () => void;
    stepField: (id: string, delta: number) => void;
    initTheme: () => void;
    openSheet: () => void;
    closeSheet: () => void;
  }
}
