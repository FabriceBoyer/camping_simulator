import { groundShadow, polygon, roundedRect, seeded, shade, withAlpha } from './shapes';

/**
 * Every draw function receives a context already translated so that (0,0) is
 * the sprite's ground anchor (front-center of its footprint), with -y being
 * "up" on screen. `s` is a size multiplier derived from the footprint area.
 */
type Drawer = (ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) => void;

function tent(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 30 * s;
  const h = 34 * s;
  ctx.fillStyle = withAlpha('#000000', 0.12);
  ctx.beginPath();
  ctx.ellipse(0, -2, w * 0.62, 7 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  polygon(ctx, [
    [-w / 2, -2],
    [0, -h],
    [w / 2, -2],
  ]);
  ctx.fillStyle = shade(color, 0.85);
  ctx.fill();

  polygon(ctx, [
    [-w / 2, -2],
    [0, -h],
    [0, -2],
  ]);
  ctx.fillStyle = color;
  ctx.fill();

  polygon(ctx, [
    [-6 * s, -2],
    [0, -h * 0.5],
    [6 * s, -2],
  ]);
  ctx.fillStyle = shade(color, 0.55);
  ctx.fill();

  ctx.strokeStyle = shade(color, 0.5);
  ctx.lineWidth = Math.max(1, s);
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(0, -2);
  ctx.stroke();

  ctx.strokeStyle = withAlpha('#3a3a3a', 0.6);
  ctx.beginPath();
  ctx.moveTo(-w / 2, -2);
  ctx.lineTo(-w / 2 - 6 * s, 0);
  ctx.moveTo(w / 2, -2);
  ctx.lineTo(w / 2 + 6 * s, 0);
  ctx.stroke();
}

function caravan(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 46 * s;
  const h = 22 * s;
  groundShadow(ctx, 2 * s, -1, w * 0.55, 6 * s);

  roundedRect(ctx, -w / 2, -h - 4 * s, w, h, 7 * s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  roundedRect(ctx, -w / 2 + 4 * s, -h - 4 * s, w - 8 * s, 6 * s, 3 * s);
  ctx.fillStyle = shade(color, 1.25);
  ctx.fill();

  roundedRect(ctx, -w / 2 + 8 * s, -h + 4 * s, 12 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#bfe3f0';
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.6);
  ctx.stroke();

  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath();
  ctx.arc(-w / 4, -1, 4.5 * s, 0, Math.PI * 2);
  ctx.arc(w / 4, -1, 4.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8d8d8d';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h + 6 * s);
  ctx.lineTo(-w / 2 - 8 * s, -h + 6 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-w / 2 - 9 * s, -h + 6 * s, 1.6 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#5a5a5a';
  ctx.fill();
}

function mobileHome(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 62 * s;
  const h = 32 * s;
  groundShadow(ctx, 0, -1, w * 0.52, 7 * s);

  roundedRect(ctx, -w / 2, -h, w, h - 3 * s, 4 * s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = shade(color, 1.2);
  ctx.fillRect(-w / 2 - 2 * s, -h - 4 * s, w + 4 * s, 6 * s);
  ctx.strokeStyle = shade(color, 0.6);
  ctx.strokeRect(-w / 2 - 2 * s, -h - 4 * s, w + 4 * s, 6 * s);

  for (const wx of [-w * 0.28, 0.02, w * 0.3]) {
    roundedRect(ctx, wx, -h + 6 * s, 12 * s, 10 * s, 2 * s);
    ctx.fillStyle = '#bfe3f0';
    ctx.fill();
    ctx.strokeStyle = shade(color, 0.6);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  roundedRect(ctx, w / 2 - 14 * s, -h + 8 * s, 10 * s, h - 11 * s, 1.5 * s);
  ctx.fillStyle = shade(color, 0.7);
  ctx.fill();

  ctx.fillStyle = withAlpha('#000000', 0.15);
  ctx.fillRect(-w / 2, -3 * s, w, 3 * s);
}

function chalet(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 66 * s;
  const bodyH = 30 * s;
  const roofH = 24 * s;
  groundShadow(ctx, 0, -1, w * 0.55, 8 * s);

  roundedRect(ctx, -w / 2, -bodyH, w, bodyH, 2 * s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.55);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = shade(color, 0.65);
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const yy = -bodyH + (bodyH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 2 * s, yy);
    ctx.lineTo(w / 2 - 2 * s, yy);
    ctx.stroke();
  }

  polygon(ctx, [
    [-w / 2 - 5 * s, -bodyH],
    [0, -bodyH - roofH],
    [w / 2 + 5 * s, -bodyH],
  ]);
  ctx.fillStyle = shade(color, 0.6);
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.4);
  ctx.stroke();

  ctx.fillStyle = shade(color, 0.4);
  ctx.fillRect(w * 0.18, -bodyH - roofH * 0.8, 6 * s, 12 * s);

  roundedRect(ctx, -8 * s, -bodyH * 0.55, 16 * s, bodyH * 0.55, 1.5 * s);
  ctx.fillStyle = '#5c3a21';
  ctx.fill();

  for (const wx of [-w * 0.32, w * 0.18]) {
    roundedRect(ctx, wx, -bodyH * 0.85, 13 * s, 11 * s, 1.5 * s);
    ctx.fillStyle = '#bfe3f0';
    ctx.fill();
    ctx.strokeStyle = shade(color, 0.5);
    ctx.beginPath();
    ctx.moveTo(wx + 6.5 * s, -bodyH * 0.85);
    ctx.lineTo(wx + 6.5 * s, -bodyH * 0.85 + 11 * s);
    ctx.moveTo(wx, -bodyH * 0.85 + 5.5 * s);
    ctx.lineTo(wx + 13 * s, -bodyH * 0.85 + 5.5 * s);
    ctx.stroke();
  }
}

function flatBuilding(
  ctx: CanvasRenderingContext2D,
  s: number,
  color: string,
  w: number,
  h: number,
  accent: (ctx: CanvasRenderingContext2D, w: number, h: number, s: number, color: string) => void,
) {
  groundShadow(ctx, 0, -1, w * 0.53, 7 * s);
  roundedRect(ctx, -w / 2, -h, w, h, 3 * s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.6);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = shade(color, 1.2);
  ctx.fillRect(-w / 2, -h, w, 4 * s);
  accent(ctx, w, h, s, color);
}

function reception(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 64 * s;
  const h = 34 * s;
  flatBuilding(ctx, s, color, w, h, (c, ww, hh, ss) => {
    const stripeColors = ['#ffffff', shade(color, 0.7)];
    const canopyY = -hh - 2 * ss;
    for (let i = 0; i < 6; i++) {
      const x0 = -ww / 2 + (ww / 6) * i;
      polygon(c, [
        [x0, canopyY],
        [x0 + ww / 6, canopyY],
        [x0 + ww / 6, canopyY + 8 * ss],
        [x0, canopyY + 6 * ss],
      ]);
      c.fillStyle = stripeColors[i % 2];
      c.fill();
    }
    roundedRect(c, -8 * ss, -hh * 0.6, 16 * ss, hh * 0.6, 1.5 * ss);
    c.fillStyle = '#5c3a21';
    c.fill();
    c.fillStyle = shade(color, 0.4);
    c.fillRect(-3 * ss, -hh - 16 * ss, 6 * ss, 12 * ss);
    roundedRect(c, ww * 0.12, -hh - 16 * ss, 22 * ss, 9 * ss, 1.5 * ss);
    c.fillStyle = '#fff8e7';
    c.fill();
    c.strokeStyle = shade(color, 0.5);
    c.stroke();
  });
}

function sanitary(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 46 * s;
  const h = 26 * s;
  flatBuilding(ctx, s, color, w, h, (c, ww, hh, ss) => {
    roundedRect(c, -ww * 0.3, -hh * 0.8, 12 * ss, 10 * ss, 1.5 * ss);
    c.fillStyle = '#eaf6ff';
    c.fill();
    c.strokeStyle = shade(color, 0.5);
    c.beginPath();
    c.moveTo(-ww * 0.3, -hh * 0.3);
    c.lineTo(-ww * 0.3 + 12 * ss, -hh * 0.8);
    c.moveTo(-ww * 0.3, -hh * 0.8);
    c.lineTo(-ww * 0.3 + 12 * ss, -hh * 0.3);
    c.stroke();
    roundedRect(c, ww * 0.05, -hh * 0.75, 10 * ss, hh * 0.75, 1.5 * ss);
    c.fillStyle = shade(color, 0.7);
    c.fill();
    for (const px of [ww * 0.32, ww * 0.4]) {
      c.strokeStyle = '#cfcfcf';
      c.lineWidth = 2 * ss;
      c.beginPath();
      c.moveTo(px, -hh);
      c.lineTo(px, -hh - 6 * ss);
      c.stroke();
    }
  });
}

function pool(ctx: CanvasRenderingContext2D, s: number) {
  const w = 96 * s;
  const h = 46 * s;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c9dde0';
  ctx.fill();
  ctx.restore();

  const grad = ctx.createLinearGradient(0, -h, 0, 0);
  grad.addColorStop(0, '#7fd8ea');
  grad.addColorStop(1, '#2596be');
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, w / 2 - 6 * s, h / 2 - 6 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = withAlpha('#ffffff', 0.55);
  ctx.lineWidth = 1.5 * s;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 8 * s, -h / 2, w / 3, h / 4, 0, 0.3, 1.3);
    ctx.stroke();
  }

  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 8 * s, -6 * s);
  ctx.lineTo(-w / 2 + 8 * s, -h - 6 * s);
  ctx.moveTo(-w / 2 + 8 * s, -h - 6 * s);
  ctx.lineTo(-w / 2 + 4 * s, -h - 10 * s);
  ctx.stroke();
  for (const ry of [-h * 0.25, -h * 0.6]) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 3 * s, ry);
    ctx.lineTo(-w / 2 + 13 * s, ry);
    ctx.stroke();
  }
}

function shop(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 46 * s;
  const h = 28 * s;
  flatBuilding(ctx, s, color, w, h, (c, ww, hh, ss) => {
    const canopyY = -hh - 1 * ss;
    const stripe = ['#ffffff', shade(color, 0.6)];
    for (let i = 0; i < 5; i++) {
      const x0 = -ww / 2 + (ww / 5) * i;
      polygon(c, [
        [x0, canopyY],
        [x0 + ww / 5, canopyY],
        [x0 + ww / 5, canopyY + 7 * ss],
        [x0, canopyY + 5 * ss],
      ]);
      c.fillStyle = stripe[i % 2];
      c.fill();
    }
    roundedRect(c, -ww * 0.32, -hh * 0.72, ww * 0.64, hh * 0.5, 1.5 * ss);
    c.fillStyle = '#eef6ff';
    c.fill();
    c.strokeStyle = shade(color, 0.5);
    c.stroke();
    const dots = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a'];
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.arc(-ww * 0.24 + i * (ww * 0.16), -hh * 0.45, 3 * ss, 0, Math.PI * 2);
      c.fillStyle = dots[i];
      c.fill();
    }
  });
}

function restaurant(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 58 * s;
  const h = 32 * s;
  flatBuilding(ctx, s, color, w, h, (c, ww, hh, ss) => {
    roundedRect(c, -ww * 0.15, -hh * 0.78, ww * 0.5, hh * 0.55, 1.5 * ss);
    c.fillStyle = '#fff3e6';
    c.fill();
    c.strokeStyle = shade(color, 0.5);
    c.stroke();
  });
  const tableX = w * 0.62;
  ctx.save();
  ctx.translate(tableX, 0);
  groundShadow(ctx, 0, -1, 9 * s, 3 * s);
  ctx.strokeStyle = '#8d6748';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(0, -2 * s);
  ctx.lineTo(0, -14 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -15 * s, 9 * s, 3.5 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c9a678';
  ctx.fill();
  ctx.strokeStyle = shade('#c9a678', 0.6);
  ctx.stroke();
  polygon(ctx, [
    [-9 * s, -19 * s],
    [9 * s, -19 * s],
    [0, -30 * s],
  ]);
  ctx.fillStyle = '#e07a5f';
  ctx.fill();
  ctx.restore();
}

function playground(ctx: CanvasRenderingContext2D, s: number) {
  const w = 70 * s;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, -2, w * 0.5, 12 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e9d8a6';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(-w * 0.2, 0);
  ctx.strokeStyle = '#8d6748';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-11 * s, -2 * s);
  ctx.lineTo(-6 * s, -34 * s);
  ctx.lineTo(6 * s, -34 * s);
  ctx.lineTo(11 * s, -2 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6 * s, -34 * s);
  ctx.lineTo(6 * s, -34 * s);
  ctx.stroke();
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 2 * s;
  for (const sx of [-2.5 * s, 2.5 * s]) {
    ctx.beginPath();
    ctx.moveTo(sx, -34 * s);
    ctx.lineTo(sx, -14 * s);
    ctx.stroke();
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(sx - 4 * s, -14 * s, 8 * s, 3 * s);
  }
  ctx.restore();

  ctx.save();
  ctx.translate(w * 0.22, 0);
  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(-2.5 * s, -22 * s, 5 * s, 22 * s);
  polygon(ctx, [
    [-2.5 * s, -22 * s],
    [16 * s, -3 * s],
    [11 * s, -3 * s],
    [2.5 * s, -18 * s],
  ]);
  ctx.fillStyle = '#f4d35e';
  ctx.fill();
  ctx.strokeStyle = shade('#f4d35e', 0.6);
  ctx.stroke();
  ctx.restore();
}

function laundry(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 32 * s;
  const h = 26 * s;
  flatBuilding(ctx, s, color, w, h, (c, ww, hh, ss) => {
    for (const cx of [-ww * 0.2, ww * 0.2]) {
      c.beginPath();
      c.arc(cx, -hh * 0.45, 6 * ss, 0, Math.PI * 2);
      c.fillStyle = '#e8f1f5';
      c.fill();
      c.strokeStyle = shade(color, 0.5);
      c.lineWidth = 1.5;
      c.stroke();
      c.beginPath();
      c.arc(cx, -hh * 0.45, 3.4 * ss, 0.4, 4.2);
      c.strokeStyle = shade(color, 0.55);
      c.stroke();
    }
  });
}

function bikeRental(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 50 * s;
  groundShadow(ctx, 0, -1, w * 0.45, 6 * s);
  ctx.strokeStyle = shade(color, 0.6);
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -2 * s);
  ctx.lineTo(-w / 2, -18 * s);
  ctx.lineTo(w / 2, -18 * s);
  ctx.lineTo(w / 2, -2 * s);
  ctx.stroke();
  ctx.fillStyle = withAlpha(color, 0.35);
  ctx.beginPath();
  polygon(ctx, [
    [-w / 2 - 4 * s, -18 * s],
    [w / 2 + 4 * s, -18 * s],
    [w / 2, -26 * s],
    [-w / 2, -26 * s],
  ]);
  ctx.fill();

  for (const bx of [-w * 0.22, 0, w * 0.22]) {
    ctx.strokeStyle = '#22223b';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.arc(bx - 4 * s, -4 * s, 5 * s, 0, Math.PI * 2);
    ctx.arc(bx + 4 * s, -4 * s, 5 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx - 4 * s, -4 * s);
    ctx.lineTo(bx, -13 * s);
    ctx.lineTo(bx + 4 * s, -4 * s);
    ctx.lineTo(bx - 1 * s, -13 * s);
    ctx.moveTo(bx, -13 * s);
    ctx.lineTo(bx + 3 * s, -16 * s);
    ctx.stroke();
  }
}

function minigolf(ctx: CanvasRenderingContext2D, s: number) {
  const w = 100 * s;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-w * 0.15, -2, w * 0.34, 14 * s, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#5f9151';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w * 0.2, -3, w * 0.28, 12 * s, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#6ea45d';
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#dcd6c9';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-w * 0.4, -2 * s);
  ctx.quadraticCurveTo(-w * 0.1, -20 * s, w * 0.25, -6 * s);
  ctx.stroke();

  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(w * 0.25, -6 * s);
  ctx.lineTo(w * 0.25, -30 * s);
  ctx.stroke();
  polygon(ctx, [
    [w * 0.25, -30 * s],
    [w * 0.25 + 12 * s, -26 * s],
    [w * 0.25, -22 * s],
  ]);
  ctx.fillStyle = '#e63946';
  ctx.fill();

  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.ellipse(-w * 0.4, -1 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function stage(ctx: CanvasRenderingContext2D, s: number, color: string) {
  const w = 100 * s;
  const deckH = 10 * s;
  groundShadow(ctx, 0, -1, w * 0.5, 10 * s);

  roundedRect(ctx, -w / 2, -deckH, w, deckH, 2 * s);
  ctx.fillStyle = '#8d6748';
  ctx.fill();
  ctx.strokeStyle = shade('#8d6748', 0.6);
  ctx.stroke();

  const backH = 46 * s;
  roundedRect(ctx, -w / 2 + 4 * s, -deckH - backH, w - 8 * s, backH, 3 * s);
  ctx.fillStyle = shade(color, 0.75);
  ctx.fill();
  ctx.strokeStyle = shade(color, 0.5);
  ctx.stroke();

  ctx.strokeStyle = withAlpha('#ffffff', 0.35);
  ctx.lineWidth = 2 * s;
  for (let i = 1; i < 6; i++) {
    const x = -w / 2 + 4 * s + ((w - 8 * s) / 6) * i;
    ctx.beginPath();
    ctx.moveTo(x, -deckH - backH + 4 * s);
    ctx.lineTo(x, -deckH - 4 * s);
    ctx.stroke();
  }

  for (const px of [-w / 2 - 2 * s, w / 2 + 2 * s]) {
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(px, -deckH);
    ctx.lineTo(px, -deckH - backH - 14 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(px, -deckH - backH - 16 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe8a3';
    ctx.fill();
  }
}

function tree(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
  groundShadow(ctx, 0, -1, 10 * s, 3.5 * s);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(-2.4 * s, -16 * s, 4.8 * s, 14 * s);
  const jitter = seeded(seed);
  const clusters: [number, number, number, string][] = [
    [0, -24 * s, 12 * s, shade(color, 0.85)],
    [-8 * s * (0.6 + jitter * 0.4), -18 * s, 9 * s, color],
    [8 * s * (0.6 + jitter * 0.4), -19 * s, 9.5 * s, shade(color, 1.1)],
    [0, -14 * s, 10 * s, shade(color, 0.95)],
  ];
  for (const [cx, cy, r, col] of clusters) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  }
}

function flowerBed(ctx: CanvasRenderingContext2D, s: number, _color: string, seed: number) {
  ctx.beginPath();
  ctx.ellipse(0, -2, 11 * s, 5 * s, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5c4530';
  ctx.fill();
  const petals = ['#ff6b81', '#ffd166', '#e63946', '#f4a261', '#f72585'];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + seeded(seed + i) * 0.6;
    const r = 6.5 * s;
    const px = Math.cos(a) * r;
    const py = -2 + Math.sin(a) * r * 0.45;
    ctx.beginPath();
    ctx.arc(px, py - 2 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fillStyle = petals[i % petals.length];
    ctx.fill();
    ctx.strokeStyle = '#3a7d44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 2 * s);
    ctx.stroke();
  }
}

function bench(ctx: CanvasRenderingContext2D, s: number) {
  groundShadow(ctx, 0, -1, 12 * s, 3 * s);
  ctx.fillStyle = '#8d6748';
  ctx.fillRect(-11 * s, -8 * s, 22 * s, 3 * s);
  ctx.fillRect(-11 * s, -16 * s, 22 * s, 3 * s);
  ctx.strokeStyle = '#5c4530';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.moveTo(-9 * s, -8 * s);
  ctx.lineTo(-9 * s, -1 * s);
  ctx.moveTo(9 * s, -8 * s);
  ctx.lineTo(9 * s, -1 * s);
  ctx.moveTo(-9 * s, -16 * s);
  ctx.lineTo(-9 * s, -8 * s);
  ctx.moveTo(9 * s, -16 * s);
  ctx.lineTo(9 * s, -8 * s);
  ctx.stroke();
}

function campfire(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.arc(0, -3 * s, 13 * s, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha('#ff9d3d', 0.18);
  ctx.fill();

  ctx.fillStyle = '#8d8d8d';
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 9 * s, -2 + Math.sin(a) * 4 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.moveTo(-6 * s, -1 * s);
  ctx.lineTo(6 * s, -6 * s);
  ctx.moveTo(6 * s, -1 * s);
  ctx.lineTo(-6 * s, -6 * s);
  ctx.stroke();

  const flame: [number, number][] = [
    [0, -4 * s],
    [5 * s, -14 * s],
    [1.5 * s, -13 * s],
    [3 * s, -22 * s],
    [0, -16 * s],
    [-3 * s, -22 * s],
    [-1.5 * s, -13 * s],
    [-5 * s, -14 * s],
  ];
  polygon(ctx, flame);
  ctx.fillStyle = '#ff7b00';
  ctx.fill();
  polygon(ctx, flame.map(([x, y]) => [x * 0.55, y * 0.7 - 2 * s] as [number, number]));
  ctx.fillStyle = '#ffd166';
  ctx.fill();
}

function lamppost(ctx: CanvasRenderingContext2D, s: number) {
  groundShadow(ctx, 0, -1, 5 * s, 2 * s);
  ctx.strokeStyle = '#343a40';
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(0, -1 * s);
  ctx.lineTo(0, -30 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -34 * s, 11 * s, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha('#ffe08a', 0.35);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -34 * s, 5 * s, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = '#343a40';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

const DRAWERS: Record<string, Drawer> = {
  tentPitch: (ctx, s, color) => tent(ctx, s, color),
  caravanPitch: (ctx, s, color) => caravan(ctx, s, color),
  mobileHome: (ctx, s, color) => mobileHome(ctx, s, color),
  chalet: (ctx, s, color) => chalet(ctx, s, color),
  reception: (ctx, s, color) => reception(ctx, s, color),
  sanitaryBlock: (ctx, s, color) => sanitary(ctx, s, color),
  pool: (ctx, s) => pool(ctx, s),
  shop: (ctx, s, color) => shop(ctx, s, color),
  restaurant: (ctx, s, color) => restaurant(ctx, s, color),
  playground: (ctx, s) => playground(ctx, s),
  laundry: (ctx, s, color) => laundry(ctx, s, color),
  bikeRental: (ctx, s, color) => bikeRental(ctx, s, color),
  minigolf: (ctx, s) => minigolf(ctx, s),
  stage: (ctx, s, color) => stage(ctx, s, color),
  tree: (ctx, s, color, seed) => tree(ctx, s, color, seed),
  flowerBed: (ctx, s, color, seed) => flowerBed(ctx, s, color, seed),
  bench: (ctx, s) => bench(ctx, s),
  campfire: (ctx, s) => campfire(ctx, s),
  lamppost: (ctx, s) => lamppost(ctx, s),
};

export function drawBuildingSprite(
  ctx: CanvasRenderingContext2D,
  defId: string,
  worldX: number,
  worldY: number,
  scale: number,
  color: string,
  seed: number,
) {
  const drawer = DRAWERS[defId];
  ctx.save();
  ctx.translate(worldX, worldY);
  if (drawer) {
    drawer(ctx, scale, color, seed);
  } else {
    groundShadow(ctx, 0, -1, 14 * scale, 5 * scale);
    ctx.beginPath();
    ctx.arc(0, -14 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}
