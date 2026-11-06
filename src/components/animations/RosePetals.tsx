"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Petal {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  flip: number;
  sway: number;
  color: string;
}

const COLORS = ["#7c2138", "#9a2f4a", "#b4485f", "#5e1a2c", "#c8778a"];

interface RosePetalsProps {
  /** How many petals keep falling at once. */
  amount: number;
  /** Raise this number to throw a fresh wave of petals from the center. */
  burst?: number;
}

/** Falling rose petals drawn on a canvas. Off when reduced motion is requested. */
export function RosePetals({ amount, burst = 0 }: RosePetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const amountRef = useRef(amount);
  const addBurst = useRef<(() => void) | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    if (burst > 0) addBurst.current?.();
  }, [burst]);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const scale = width < 768 ? 0.65 : 1;
    const spawn = (fromCenter: boolean): Petal => {
      const angle = Math.random() * Math.PI * 2;
      const force = 1.5 + Math.random() * 5;
      return {
        x: fromCenter ? width / 2 : Math.random() * width,
        y: fromCenter ? height * 0.32 : -30 - Math.random() * height * 0.6,
        size: 9 + Math.random() * 11,
        vx: fromCenter ? Math.cos(angle) * force : (Math.random() - 0.5) * 0.5,
        vy: fromCenter ? Math.sin(angle) * force - 1.5 : 0.7 + Math.random() * 1.1,
        spin: (Math.random() - 0.5) * 0.04,
        angle: Math.random() * Math.PI * 2,
        flip: Math.random() * Math.PI * 2,
        sway: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    };

    const falling: Petal[] = [];
    const thrown: Petal[] = [];
    addBurst.current = () => {
      for (let i = 0; i < 70 * scale; i += 1) thrown.push(spawn(true));
    };

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(Math.cos(p.flip) * 0.75 + 0.25, 1);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, -p.size / 2);
      ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.45, p.size * 0.5, p.size * 0.4, 0, p.size / 2);
      ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.4, -p.size * 0.6, -p.size * 0.45, 0, -p.size / 2);
      ctx.fill();
      ctx.restore();
    };

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (falling.length < amountRef.current * scale && Math.random() < 0.18) {
        falling.push(spawn(false));
      }
      for (let i = falling.length - 1; i >= 0; i -= 1) {
        const p = falling[i];
        p.sway += 0.018;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.y += p.vy;
        p.angle += p.spin;
        p.flip += 0.03;
        if (p.y > height + 30) {
          if (falling.length > amountRef.current * scale) falling.splice(i, 1);
          else Object.assign(p, spawn(false));
        }
        drawPetal(p);
      }

      for (let i = thrown.length - 1; i >= 0; i -= 1) {
        const p = thrown[i];
        p.vx *= 0.985;
        p.vy = Math.min(p.vy + 0.035, 1.6);
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin * 2;
        p.flip += 0.05;
        if (p.y > height + 30) thrown.splice(i, 1);
        else drawPetal(p);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      addBurst.current = null;
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-20" />;
}
