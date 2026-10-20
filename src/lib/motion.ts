import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Section entrance: heading word by word, then the lead, then the items one after another. */
export function revealSection(
  section: HTMLElement,
  title: HTMLElement,
  lead: HTMLElement | null,
  items: Element[],
) {
  if (reduceMotion()) return;
  const trigger = { trigger: section, start: 'top 80%', once: true };
  const words = SplitText.create(title, { type: 'words', aria: 'auto' }).words;
  gsap.from(words, {
    yPercent: 60,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.045,
    scrollTrigger: trigger,
  });
  if (lead)
    gsap.from(lead, {
      y: 14,
      opacity: 0,
      duration: 0.6,
      delay: 0.25,
      ease: 'power2.out',
      scrollTrigger: trigger,
    });
  gsap.from(items, {
    x: -24,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.12,
    scrollTrigger: { ...trigger, trigger: items[0]?.parentElement ?? section },
  });
}
