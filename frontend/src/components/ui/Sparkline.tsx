import { useEffect, useRef } from 'react';

interface Props {
  data: number[];
  color: string;
  height?: number;
}

export default function Sparkline({ data, color, height = 48 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 260;
    const h = height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (data.length < 2) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, h - 2, w, 2);
      return;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = w / (data.length - 1);
    const pad = 4;

    const toY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = toY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * stepX;
      const y = toY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const lastX = (data.length - 1) * stepX;
    const lastY = toY(data[data.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [data, color, height]);

  return <canvas ref={canvasRef} className="sparkline" />;
}
