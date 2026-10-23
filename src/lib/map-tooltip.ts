/** Space between the pointer and the tooltip, in px. */
const GAP = 14;

/**
 * The name of an area, from its SVG `<title>`. The first time, the title moves to `aria-label`,
 * so the browser does not show its own tooltip over ours and screen readers still read it.
 */
function labelOf(path: SVGPathElement): string | undefined {
  const title = path.querySelector(':scope > title');
  if (title) {
    const text = title.textContent ?? '';
    path.dataset.label = text;
    (path.closest('a') ?? path).setAttribute('aria-label', text);
    title.remove();
  }
  return path.dataset.label;
}

/**
 * Shows the name of a map area on hover and on keyboard focus, for every map inside an element
 * with `data-tooltips`. Maps drawn later, such as on the map page, work too.
 */
export function initMapTooltips(): void {
  const tip = document.createElement('div');
  tip.className =
    'pointer-events-none fixed top-0 left-0 z-50 whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-sm text-white opacity-0 transition-opacity duration-100 motion-reduce:transition-none';
  tip.setAttribute('aria-hidden', 'true');
  document.body.append(tip);

  const areaAt = (target: EventTarget | null) => {
    const el = target instanceof Element ? target : null;
    const path = el?.closest('[data-tooltips] a, [data-tooltips] path');
    const area = path?.matches('a') ? path.querySelector('path') : path;
    return area instanceof SVGPathElement && area.closest('[data-tooltips]') ? area : null;
  };

  const place = (x: number, y: number) => {
    const { width, height } = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, x + GAP), window.innerWidth - width - 8);
    const top = y - height - GAP < 8 ? y + GAP : y - height - GAP;
    tip.style.transform = `translate(${left}px, ${top}px)`;
  };

  const show = (area: SVGPathElement) => {
    // The map's own <title> would show as the browser's tooltip over ours. aria-label keeps it.
    area.ownerSVGElement?.querySelector(':scope > title')?.remove();
    const label = labelOf(area);
    if (!label) return false;
    tip.textContent = label;
    tip.classList.replace('opacity-0', 'opacity-100');
    return true;
  };
  const hide = () => tip.classList.replace('opacity-100', 'opacity-0');

  // The browser shows an svg <title> as a grey tooltip of its own, so a map carries none.
  // Its name stays in aria-label. Areas keep their titles until first hover, as the no-JS path.
  for (const map of document.querySelectorAll('[data-tooltips] svg')) {
    map.querySelector(':scope > title')?.remove();
  }
  new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n instanceof SVGSVGElement) n.querySelector(':scope > title')?.remove();
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  document.addEventListener('pointermove', (e) => {
    const area = areaAt(e.target);
    if (area && show(area)) place(e.clientX, e.clientY);
    else hide();
  });
  document.addEventListener('focusin', (e) => {
    const area = areaAt(e.target);
    if (!area || !show(area)) return;
    const box = area.getBoundingClientRect();
    place(box.left + box.width / 2 - GAP, box.top);
  });
  document.addEventListener('focusout', hide);
  window.addEventListener('scroll', hide, { passive: true });
}
