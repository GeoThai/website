import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

import { reduceMotion } from '@/lib/motion';

/** Smooth wheel scrolling on GSAP's ticker, so ScrollTrigger reads the same scroll position. */
export function initSmoothScroll() {
  if (reduceMotion()) return;
  const header = document.getElementById('site-header')?.offsetHeight ?? 0;
  const lenis = new Lenis({ anchors: { offset: -(header + 24) } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
