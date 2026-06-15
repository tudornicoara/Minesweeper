import type p5 from 'p5';
import { state } from './state';

export interface Confetto {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: p5.Color;
  angle: number;
  spin: number;
}

const COLORS = [
  [255, 89, 94],
  [255, 202, 58],
  [138, 201, 38],
  [25, 130, 196],
  [106, 76, 147],
  [255, 255, 255],
];

export function spawnConfetti(): void {
  const count = 160;
  state.confetti = [];
  for (let i = 0; i < count; i++) {
    state.confetti.push({
      x: random(width),
      y: random(-height * 0.5, 0), // start above the canvas, drift in
      vx: random(-1.5, 1.5),
      vy: random(2, 5),
      size: random(6, 12),
      color: color(...random(COLORS)),
      angle: random(Math.PI * 2),
      spin: random(-0.2, 0.2),
    });
  }
}

export function drawConfetti(): void {
  if (state.confetti.length === 0) return;

  push();
  noStroke();
  rectMode(CENTER);
  state.confetti.forEach((c) => {
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.08; // gravity
    c.vx += random(-0.1, 0.1); // flutter
    c.angle += c.spin;

    push();
    translate(c.x, c.y);
    rotate(c.angle);
    fill(c.color);
    rect(0, 0, c.size, c.size * 0.5);
    pop();
  });
  pop();

  // Drop particles that have fallen off the bottom.
  state.confetti = state.confetti.filter((c) => c.y < height + 20);
}
