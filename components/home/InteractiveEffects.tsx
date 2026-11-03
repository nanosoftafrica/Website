"use client";

import { useEffect } from "react";

/**
 * Ports public/assets/interactive.js's DOM-level effects into a mounted
 * client component — same logic, not re-architected as React state, since
 * these are pure cosmetic DOM effects with no data dependency. Renders
 * nothing itself; it just wires up listeners/observers on mount.
 *
 * One consolidation vs. the original: the old page had TWO parallel
 * scroll-reveal systems ([data-reveal] here, plus a separate .fade-up
 * IntersectionObserver inline in index.html). This component only
 * implements [data-reveal] — every ported section uses that attribute,
 * not .fade-up, so there's a single reveal mechanism.
 */
export default function InteractiveEffects() {
  useEffect(() => {
    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cleanups: Array<() => void> = [];

    // ── Custom cursor ──
    if (canHover && !reduceMotion) {
      const dot = document.createElement("div");
      dot.className = "custom-cursor-dot";
      const ring = document.createElement("div");
      ring.className = "custom-cursor-ring";
      document.body.appendChild(dot);
      document.body.appendChild(ring);
      document.documentElement.classList.add("has-custom-cursor");

      let targetX = 0,
        targetY = 0,
        ringX = 0,
        ringY = 0,
        started = false,
        raf = 0;

      const onMove = (e: MouseEvent) => {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.style.transform = `translate(${targetX}px,${targetY}px) translate(-50%,-50%)`;
        if (!started) {
          ringX = targetX;
          ringY = targetY;
          started = true;
        }
      };
      window.addEventListener("mousemove", onMove, { passive: true });

      const tick = () => {
        ringX += (targetX - ringX) * 0.18;
        ringY += (targetY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      const hoverSelector = 'a, button, .btn-circle, input, textarea, select, [role="button"]';
      const onOver = (e: Event) => {
        const t = e.target as HTMLElement;
        if (t.closest && t.closest(hoverSelector)) document.documentElement.classList.add("cursor-hover");
      };
      const onOut = (e: Event) => {
        const t = e.target as HTMLElement;
        if (t.closest && t.closest(hoverSelector)) document.documentElement.classList.remove("cursor-hover");
      };
      const onLeave = () => {
        dot.style.opacity = "0";
        ring.style.opacity = "0";
      };
      const onEnter = () => {
        dot.style.opacity = "1";
        ring.style.opacity = "";
      };
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);
      document.addEventListener("mouseleave", onLeave);
      document.addEventListener("mouseenter", onEnter);

      // ── Magnetic buttons ──
      const magSelector = ".btn-circle, .btn-hero, .btn-primary-sm, .btn-cta, .btn-demo-submit, [data-magnetic]";
      const magEls = Array.from(document.querySelectorAll<HTMLElement>(magSelector));
      const magHandlers: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];
      magEls.forEach((el) => {
        const strength = el.classList.contains("btn-circle") ? 0.35 : 0.18;
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          el.style.transform = `translate(${mx * strength}px,${my * strength}px)`;
        };
        const leave = () => {
          el.style.transition = "transform .4s cubic-bezier(.2,.9,.3,1.4)";
          el.style.transform = "";
          setTimeout(() => {
            el.style.transition = "";
          }, 400);
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        magHandlers.push({ el, move, leave });
      });

      cleanups.push(() => {
        window.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(raf);
        document.removeEventListener("mouseover", onOver);
        document.removeEventListener("mouseout", onOut);
        document.removeEventListener("mouseleave", onLeave);
        document.removeEventListener("mouseenter", onEnter);
        magHandlers.forEach(({ el, move, leave }) => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
        dot.remove();
        ring.remove();
        document.documentElement.classList.remove("has-custom-cursor");
      });
    }

    // ── Connector lines ──
    const lines = document.querySelectorAll<SVGElement>(".connector-line:not(.in-view)");
    if (lines.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        lines.forEach((l) => l.classList.add("in-view"));
      } else {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.3 }
        );
        lines.forEach((l) => io.observe(l));
        cleanups.push(() => io.disconnect());
      }
    }

    // ── Scroll reveal ([data-reveal] only — the one consolidated system) ──
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.revealed)");
    if (revealItems.length) {
      const revealCounters = new WeakMap<Element, number>();
      revealItems.forEach((el) => {
        const parent = el.parentElement;
        const idx = (parent && revealCounters.get(parent)) || 0;
        if (parent) revealCounters.set(parent, idx + 1);
        el.style.transitionDelay = Math.min(idx * 80, 480) + "ms";
      });
      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach((el) => el.classList.add("revealed"));
      } else {
        // Only now hide not-yet-revealed sections (see globals.css).
        document.documentElement.classList.add("reveal-ready");
        cleanups.push(() => document.documentElement.classList.remove("reveal-ready"));
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12 }
        );
        revealItems.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }
    }

    // ── Reactive hero parallax ──
    if (!reduceMotion) {
      const hero = document.querySelector<HTMLElement>(".hero");
      const dots = hero?.querySelector<HTMLElement>(".hero-dots");
      const glow1 = hero?.querySelector<HTMLElement>(".hero-glow-1");
      const glow2 = hero?.querySelector<HTMLElement>(".hero-glow-2");
      if (hero && dots && glow1 && glow2) {
        let mx = 0,
          my = 0,
          targetMx = 0,
          targetMy = 0,
          pulse = 0,
          t = 0,
          running = false,
          raf = 0;

        const onHeroMove = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          targetMx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          targetMy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        const onHeroLeave = () => {
          targetMx = 0;
          targetMy = 0;
        };
        const onHeroClick = () => {
          pulse = 1;
        };
        if (canHover) {
          hero.addEventListener("mousemove", onHeroMove, { passive: true });
          hero.addEventListener("mouseleave", onHeroLeave);
        }
        hero.addEventListener("click", onHeroClick);

        const frame = () => {
          if (!running) return;
          t += 0.01;
          mx += (targetMx - mx) * 0.04;
          my += (targetMy - my) * 0.04;
          pulse *= 0.94;
          const scrollT = Math.min(window.scrollY / (window.innerHeight || 1), 1);
          const driftX = Math.sin(t) * 14;
          const driftY = Math.cos(t * 0.8) * 10;
          dots.style.transform = `translate(${mx * 10}px,${my * 10 - scrollT * 30}px)`;
          glow1.style.transform = `translate(${driftX + mx * -18}px,${driftY + my * -14 + scrollT * 40}px) scale(${1 + pulse * 0.12})`;
          glow2.style.transform = `translate(${driftX * -0.6 + mx * 22}px,${driftY * -0.6 + my * 18 - scrollT * 25}px) scale(${1 + pulse * 0.18})`;
          raf = requestAnimationFrame(frame);
        };

        let io: IntersectionObserver | undefined;
        if ("IntersectionObserver" in window) {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && !running) {
                  running = true;
                  raf = requestAnimationFrame(frame);
                } else if (!entry.isIntersecting) {
                  running = false;
                }
              });
            },
            { threshold: 0 }
          );
          io.observe(hero);
        } else {
          running = true;
          raf = requestAnimationFrame(frame);
        }

        cleanups.push(() => {
          hero.removeEventListener("mousemove", onHeroMove);
          hero.removeEventListener("mouseleave", onHeroLeave);
          hero.removeEventListener("click", onHeroClick);
          io?.disconnect();
          cancelAnimationFrame(raf);
        });
      }
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
