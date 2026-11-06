"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  heart: boolean;
}

const MAX_PARTICLES = 70;

function makeSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const c = sprite.getContext("2d")!;
  const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,232,196,1)");
  g.addColorStop(0.3, "rgba(214,170,130,.55)");
  g.addColorStop(1, "rgba(167,123,99,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 32, 32);
  return sprite;
}

function makeHeartSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const c = sprite.getContext("2d")!;
  c.fillStyle = "#f0b9c4";
  c.shadowColor = "rgba(240,185,196,.7)";
  c.shadowBlur = 8;
  c.beginPath();
  c.moveTo(32, 54);
  c.bezierCurveTo(4, 34, 8, 12, 22, 12);
  c.bezierCurveTo(28, 12, 31, 16, 32, 20);
  c.bezierCurveTo(33, 16, 36, 12, 42, 12);
  c.bezierCurveTo(56, 12, 60, 34, 32, 54);
  c.fill();
  return sprite;
}

/** Gold dust and small hearts drifting upward behind every scene. */
export function ParticleBackground({ density }: { density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const densityRef = useRef(density);
  const reduced = useReducedMotion();

  useEffect(() => {
    densityRef.current = density;
  }, [density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const sprite = makeSprite();
    const heartSprite = makeHeartSprite();
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

    const count = width < 768 ? Math.round(MAX_PARTICLES * 0.6) : MAX_PARTICLES;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const heart = i % 3 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: heart ? 6 + Math.random() * 9 : 1.5 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: heart ? -(0.2 + Math.random() * 0.35) : -(0.05 + Math.random() * 0.22),
        phase: Math.random() * Math.PI * 2,
        heart,
      };
    });

    let shownDensity = densityRef.current;
    let frame = 0;

    const draw = (time: number) => {
      shownDensity += (densityRef.current - shownDensity) * 0.02;
      ctx.clearRect(0, 0, width, height);
      const visible = Math.floor(particles.length * shownDensity);
      for (let i = 0; i < visible; i += 1) {
        const p = particles[i];
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -20) p.y = height + 20;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }
        ctx.globalAlpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(time * 0.001 + p.phase));
        ctx.drawImage(p.heart ? heartSprite : sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}
