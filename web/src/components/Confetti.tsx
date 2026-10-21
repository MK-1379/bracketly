import { useEffect, useRef } from "react";

const DURATION = 2800;
const BASE_COLORS = ["#FFD23F", "#F4F1E8", "#FF6B6B"];

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    rotation: number;
    spin: number;
    color: string;
}

export function Confetti({ teamColor, delay = 0 }: { teamColor: string; delay?: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!canvas || !context || reducedMotion || !canvas.checkVisibility()) {
            return;
        }

        let frame = 0;
        const timeout = window.setTimeout(() => {
            const colors = [...BASE_COLORS, teamColor];
            const ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * ratio;
            canvas.height = window.innerHeight * ratio;
            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            const particles: Particle[] = Array.from({ length: 160 }, () => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 9;
                return {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 3,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 6,
                    width: 6 + Math.random() * 6,
                    height: 3 + Math.random() * 4,
                    rotation: Math.random() * 6,
                    spin: (Math.random() - 0.5) * 0.4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                };
            });

            const start = performance.now();
            const draw = (now: number) => {
                const elapsed = now - start;
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                context.globalAlpha = Math.max(0, 1 - elapsed / DURATION);
                for (const particle of particles) {
                    particle.vy += 0.28;
                    particle.vx *= 0.985;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.rotation += particle.spin;
                    context.save();
                    context.translate(particle.x, particle.y);
                    context.rotate(particle.rotation);
                    context.fillStyle = particle.color;
                    context.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
                    context.restore();
                }
                if (elapsed < DURATION) {
                    frame = requestAnimationFrame(draw);
                } else {
                    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                }
            };
            frame = requestAnimationFrame(draw);
        }, delay);

        return () => {
            window.clearTimeout(timeout);
            cancelAnimationFrame(frame);
        };
    }, [teamColor, delay]);

    return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50 size-full" />;
}
