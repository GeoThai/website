const MAX = 8;
const STEP = 1.6;
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
function attach(frame: HTMLElement): void {
  const svg = frame.querySelector('svg');
  if (!svg || frame.dataset.zoomReady) return;
  frame.dataset.zoomReady = 'true';
  const [x0 = 0, y0 = 0, w0 = 1, h0 = 1] = (svg.getAttribute('viewBox') ?? '')
    .split(' ')
    .map(Number);
  const full: View = { x: x0, y: y0, w: w0, h: h0 };
  let view = { ...full };

  // Zoomed in, the map fills the whole frame instead of its own narrow box, so it is not cut
  // into a rectangle. The viewBox then takes the frame's shape, not the map's.
  const holder = svg.parentElement ?? frame;
  let aspect = full.h / full.w;
  const expand = (on: boolean) => {
    if (on === svg.hasAttribute('data-zoomed')) return;
    // Zoomed in, the map runs to the rounded edge of the frame, with no straight cut inside it.
    const caption = frame.querySelector('figcaption')?.getBoundingClientRect().height ?? 0;
    const height = frame.getBoundingClientRect().height - caption;
    svg.toggleAttribute('data-zoomed', on);
    frame.style.padding = on ? '0' : '';
    frame.style.overflow = on ? 'hidden' : '';
    holder.style.maxWidth = on ? 'none' : '';
    svg.style.width = on ? '100%' : '';
    svg.style.height = on ? `${height}px` : '';
    svg.style.maxHeight = on ? 'none' : '';
    const box = svg.getBoundingClientRect();
    aspect = on ? box.height / box.width : full.h / full.w;
  };
  /** The widest view: the whole map fits, at the frame's shape. */
  const widest = () => Math.max(full.w, full.h / aspect);
  const clamp = (v: View): View => {
    const w = Math.min(widest(), Math.max(full.w / MAX, v.w));
    const h = w * aspect;
    // Keep the middle of the view over the map, so it cannot be dragged away.
    const cx = Math.min(full.x + full.w, Math.max(full.x, v.x + v.w / 2));
    const cy = Math.min(full.y + full.h, Math.max(full.y, v.y + v.h / 2));
    return { w, h, x: cx - w / 2, y: cy - h / 2 };
  };
  const apply = (v: View) => {
    const zoomedIn = v.w < widest() - 0.5;
    expand(zoomedIn);
    view = zoomedIn ? clamp(v) : { ...full };
    svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`);
    svg.style.cursor = zoomedIn ? 'grab' : '';
    reset.hidden = !zoomedIn;
  };
  /** Zooms by a factor around a point given in screen px. */
  const zoom = (factor: number, cx?: number, cy?: number) => {
    // The map point under the pointer, before the frame changes shape.
    const box = svg.getBoundingClientRect();
    const fx = cx === undefined ? 0.5 : (cx - box.left) / box.width;
    const fy = cy === undefined ? 0.5 : (cy - box.top) / box.height;
    const px = view.x + view.w * fx;
    const py = view.y + view.h * fy;
    const w = Math.min(view.w, widest()) / factor;
    expand(w < widest() - 0.5);
    const h = w * aspect;
    apply({ w, h, x: px - w * fx, y: py - h * fy });
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
  reset.addEventListener('click', () => apply({ ...full, w: Number.POSITIVE_INFINITY }));
  controls.append(reset, zoomOut, zoomIn);
  frame.classList.add('relative');
  frame.append(controls);

  svg.addEventListener(
    'wheel',
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY);
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
    if (view.w >= full.w) return;
    const box = svg.getBoundingClientRect();
    const dx = next.x - last.x;
    const dy = next.y - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > DRAG) svg.setPointerCapture(e.pointerId);
    apply({
      ...view,
      x: view.x - (dx / box.width) * view.w,
      y: view.y - (dy / box.height) * view.h,
    });
  });
  const end = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) {
      pinch = 0;
      svg.style.touchAction = view.w < full.w ? 'none' : 'pan-y';
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
      const svg = frame.querySelector('svg');
      // A new <svg> means the map was drawn again: drop the old controls and attach once more.
      if (svg && svg !== zoomed.get(frame)) {
        frame.querySelector(':scope > [data-zoom-controls]')?.remove();
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
