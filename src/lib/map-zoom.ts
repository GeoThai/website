const MAX = 8;
const STEP = 1.6;
const WHEEL = 1.2;
/** Pointer travel in px after which a press is a drag, not a click on a link. */
const DRAG = 4;

type View = { x: number; y: number; w: number; h: number };

const BUTTON =
  'grid size-10 place-items-center rounded-full border border-line bg-white text-lg text-black transition-colors hover:bg-mist';

function button(label: string, text: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = BUTTON;
  b.setAttribute('aria-label', label);
  b.textContent = text;
  return b;
}

/**
 * Adds zoom and pan to one map. It changes the SVG viewBox, so lines stay sharp and stroke widths
 * stay the same. The wheel zooms only with Ctrl or ⌘, so the page still scrolls over the map.
 */
/** The map of a frame. A frame can hold a small locator map too, which does not zoom. */
function mapIn(frame: HTMLElement): SVGSVGElement | null {
  return frame.querySelector('[data-zoom-map] svg') ?? frame.querySelector('svg');
}

function attach(frame: HTMLElement): void {
  const svg = mapIn(frame);
  if (!svg || frame.dataset.zoomReady) return;
  frame.dataset.zoomReady = 'true';
  const [x0 = 0, y0 = 0, w0 = 1, h0 = 1] = (svg.getAttribute('viewBox') ?? '')
    .split(' ')
    .map(Number);
  const full: View = { x: x0, y: y0, w: w0, h: h0 };
  let view = { ...full };
  /** Zoom level: 1 is the map as the page shows it, each step multiplies it by STEP. */
  let level = 1;
  /** Screen px per map unit at level 1, read when the first zoom starts. */
  let base = 0;

  // Zoomed in, the map fills the whole frame instead of its own narrow box, so it is not cut
  // into a rectangle, and runs to the rounded edge of the frame.
  const holder = svg.parentElement ?? frame;
  const expand = (on: boolean) => {
    if (on === svg.hasAttribute('data-zoomed')) return;
    const caption = frame.querySelector('figcaption')?.getBoundingClientRect().height ?? 0;
    const height = frame.getBoundingClientRect().height - caption;
    svg.toggleAttribute('data-zoomed', on);
    frame.style.padding = on ? '0' : '';
    frame.style.overflow = on ? 'hidden' : '';
    holder.style.maxWidth = on ? 'none' : '';
    svg.style.width = on ? '100%' : '';
    svg.style.height = on ? `${height}px` : '';
    svg.style.maxHeight = on ? 'none' : '';
  };
  const isZoomed = () => level > 1;

  /** Shows the map at a level, with a map point at a screen point. Level 1 goes back to normal. */
  const show = (next: number, map: { x: number; y: number }, screen: { x: number; y: number }) => {
    level = Math.min(MAX, next);
    if (level <= 1.0001) {
      level = 1;
      expand(false);
      view = { ...full };
    } else {
      expand(true);
      const box = svg.getBoundingClientRect();
      const scale = base * level;
      const w = box.width / scale;
      const h = box.height / scale;
      // Keep the middle of the view over the map, so it cannot be dragged away.
      const cx = Math.min(
        full.x + full.w,
        Math.max(full.x, map.x - (screen.x - box.left) / scale + w / 2),
      );
      const cy = Math.min(
        full.y + full.h,
        Math.max(full.y, map.y - (screen.y - box.top) / scale + h / 2),
      );
      view = { w, h, x: cx - w / 2, y: cy - h / 2 };
    }
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    svg.style.cursor = isZoomed() ? 'grab' : '';
    reset.hidden = !isZoomed();
  };

  /** Zooms by a factor around a screen point, or the middle of the map. */
  const zoom = (factor: number, cx?: number, cy?: number) => {
    if (!isZoomed() && factor <= 1) return;
    const box = svg.getBoundingClientRect();
    if (!isZoomed()) base = box.width / full.w;
    const screen = { x: cx ?? box.left + box.width / 2, y: cy ?? box.top + box.height / 2 };
    const map = {
      x: view.x + ((screen.x - box.left) / box.width) * view.w,
      y: view.y + ((screen.y - box.top) / box.height) * view.h,
    };
    show(level * factor, map, screen);
  };
  /** Moves the view by screen px. */
  const pan = (dx: number, dy: number) => {
    const box = svg.getBoundingClientRect();
    const scale = base * level;
    const screen = { x: box.left, y: box.top };
    show(level, { x: view.x - dx / scale, y: view.y - dy / scale }, screen);
  };

  const controls = document.createElement('div');
  controls.className = 'absolute right-4 bottom-4 flex gap-2 md:right-6 md:bottom-6';
  controls.dataset.zoomControls = '';
  const zoomIn = button('Zoom in', '+');
  const zoomOut = button('Zoom out', '−');
  const reset = button('Show the whole map', '⤢');
  reset.hidden = true;
  zoomIn.addEventListener('click', () => zoom(STEP));
  zoomOut.addEventListener('click', () => zoom(1 / STEP));
  reset.addEventListener('click', () => show(1, full, { x: 0, y: 0 }));
  controls.append(reset, zoomOut, zoomIn);
  frame.classList.add('relative');
  frame.append(controls);

  svg.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoom(e.deltaY < 0 ? WHEEL : 1 / WHEEL, e.clientX, e.clientY);
    },
    { passive: false },
  );

  // Pan with one pointer, pinch with two.
  const pointers = new Map<number, { x: number; y: number }>();
  let moved = 0;
  let pinch = 0;
  svg.style.touchAction = 'pan-y';
  svg.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
      svg.style.touchAction = 'none';
    }
  });
  svg.addEventListener('pointermove', (e) => {
    const last = pointers.get(e.pointerId);
    if (!last) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, next);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      if (!a || !b) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) zoom(d / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch = d;
      moved += DRAG;
      return;
    }
    if (!isZoomed()) return;
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > DRAG) svg.setPointerCapture(e.pointerId);
    pan(dx, dy);
  });
  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) {
      pinch = 0;
      svg.style.touchAction = isZoomed() ? 'none' : 'pan-y';
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  // A drag that ends on an area must not open its page.
  svg.addEventListener(
    'click',
    (e) => {
      if (moved > DRAG) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );
}

/** Adds zoom to every map inside an element with `data-zoom`, now and when a map is drawn later. */
export function initMapZoom(): void {
  const scan = () => {
    for (const frame of document.querySelectorAll<HTMLElement>('[data-zoom]')) {
      const svg = mapIn(frame);
      // A new <svg> means the map was drawn again: drop the old controls and attach once more.
      if (svg && svg !== zoomed.get(frame)) {
        frame.querySelector(':scope > [data-zoom-controls]')?.remove();
        if (svg.hasAttribute('data-zoomed')) {
          svg.removeAttribute('data-zoomed');
          frame.style.padding = '';
          frame.style.overflow = '';
          const holder = svg.parentElement;
          if (holder) holder.style.maxWidth = '';
          svg.style.width = '';
          svg.style.height = '';
          svg.style.maxHeight = '';
        }
        delete frame.dataset.zoomReady;
        zoomed.set(frame, svg);
        attach(frame);
      }
    }
  };
  scan();
  // Watch only for a new <svg>, so the controls this adds do not wake the observer again.
  new MutationObserver((records) => {
    if (records.some((r) => [...r.addedNodes].some((n) => n.nodeName.toLowerCase() === 'svg')))
      scan();
  }).observe(document.body, { childList: true, subtree: true });
}

const zoomed = new WeakMap<HTMLElement, SVGSVGElement>();
