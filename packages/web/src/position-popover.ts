const GAP = 4;
const MARGIN = 8;

/**
 * Place a popover in the viewport next to an anchor. Flips above when there is
 * no room below, and clamps so the box stays on screen.
 */
export function positionPopover(anchor: HTMLElement, popover: HTMLElement): void {
  popover.dataset.positioned = '';
  popover.style.position = 'fixed';
  popover.style.marginTop = '0';
  popover.style.left = '0';
  popover.style.top = '0';

  const ar = anchor.getBoundingClientRect();
  const pr = popover.getBoundingClientRect();

  let top = ar.bottom + GAP;
  if (top + pr.height > window.innerHeight - MARGIN && ar.top - GAP - pr.height >= MARGIN) {
    top = ar.top - GAP - pr.height;
  }
  top = Math.min(Math.max(top, MARGIN), Math.max(MARGIN, window.innerHeight - MARGIN - pr.height));

  let left = ar.left;
  if (left + pr.width > window.innerWidth - MARGIN) {
    left = window.innerWidth - MARGIN - pr.width;
  }
  left = Math.max(MARGIN, left);

  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
}
