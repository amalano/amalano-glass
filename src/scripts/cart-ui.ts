/**
 * Client-side cart wiring.
 *
 * All math and state transitions come from the pure, unit-tested `lib/cart`.
 * This module only touches the browser: localStorage persistence, DOM rendering,
 * and native <dialog> orchestration (which gives focus trapping, Escape-to-close,
 * and focus restore for free). Display data (names, prices, optimized thumbnails)
 * is injected as JSON by `CartRoot.astro`, so the script needs no build-time deps.
 */
import {
  CART_STORAGE_KEY,
  MAX_QUANTITY,
  addToCart,
  cartCount,
  cartSubtotalCents,
  parseCart,
  removeFromCart,
  serializeCart,
  setQuantity,
  type Cart,
  type CartLine,
} from '../lib/cart';
import { formatPrice } from '../lib/format';

interface CatalogItem {
  name: string;
  shape: string;
  unitCents: number;
  unitLabel: string;
  img: string;
  alt: string;
}
type CatalogData = Record<string, CatalogItem>;

function safeParse(text: string | null): CatalogData {
  if (!text) return {};
  try {
    return JSON.parse(text) as CatalogData;
  } catch {
    return {};
  }
}

const catalogEl = document.getElementById('cart-catalog');
const catalog: CatalogData = safeParse(catalogEl?.textContent ?? null);
const isValidId = (id: string): boolean =>
  Object.prototype.hasOwnProperty.call(catalog, id);
const priceOf = (id: string): number | undefined => catalog[id]?.unitCents;

const cssEscape = (value: string): string =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value;

/* ---- Persistence (fails soft if storage is unavailable) --------------- */
function loadCart(): Cart {
  try {
    return parseCart(localStorage.getItem(CART_STORAGE_KEY), isValidId);
  } catch {
    return [];
  }
}
function saveCart(next: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, serializeCart(next));
  } catch {
    /* private mode / quota — the in-memory cart still works this session */
  }
}

let cart: Cart = loadCart();

/* ---- DOM references --------------------------------------------------- */
const cartDialog = document.getElementById('cart-dialog') as HTMLDialogElement | null;
const boundaryDialog = document.getElementById(
  'boundary-dialog',
) as HTMLDialogElement | null;
const linesEl = document.querySelector<HTMLUListElement>('[data-cart-lines]');
const emptyEl = document.querySelector<HTMLElement>('[data-cart-empty]');
const footEl = document.querySelector<HTMLElement>('[data-cart-foot]');
const subtotalEl = document.querySelector<HTMLElement>('[data-cart-subtotal]');
const statusEl = document.querySelector<HTMLElement>('[data-cart-status]');

function announce(message: string): void {
  if (statusEl) statusEl.textContent = message;
}

function itemsLabel(n: number): string {
  return `${n} ${n === 1 ? 'item' : 'items'}`;
}

/* ---- Rendering -------------------------------------------------------- */
function buildStepper(line: CartLine, name: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'stepper';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', `Quantity for ${name}`);

  const dec = document.createElement('button');
  dec.type = 'button';
  dec.dataset.cartDec = line.id;
  dec.setAttribute('aria-label', `Decrease quantity of ${name}`);
  dec.textContent = '−'; // minus sign

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(MAX_QUANTITY);
  input.step = '1';
  input.value = String(line.quantity);
  input.inputMode = 'numeric';
  input.dataset.cartQty = line.id;
  input.setAttribute('aria-label', `Quantity of ${name}`);

  const inc = document.createElement('button');
  inc.type = 'button';
  inc.dataset.cartInc = line.id;
  inc.setAttribute('aria-label', `Increase quantity of ${name}`);
  inc.textContent = '+';

  wrap.append(dec, input, inc);
  return wrap;
}

function renderLine(line: CartLine): HTMLLIElement {
  const item = catalog[line.id];
  const name = item?.name ?? line.id;

  const li = document.createElement('li');
  li.className = 'cart-line';
  li.dataset.lineId = line.id;

  const media = document.createElement('div');
  media.className = 'cart-line__media';
  if (item?.img) {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);
  }

  const main = document.createElement('div');
  main.className = 'cart-line__main';

  const top = document.createElement('div');
  top.className = 'cart-line__top';

  const nameWrap = document.createElement('div');
  const nameEl = document.createElement('p');
  nameEl.className = 'cart-line__name';
  nameEl.textContent = name;
  const unitEl = document.createElement('p');
  unitEl.className = 'cart-line__unit';
  unitEl.textContent = `${item?.unitLabel ?? ''} each · draft price`;
  nameWrap.append(nameEl, unitEl);

  const priceEl = document.createElement('span');
  priceEl.className = 'cart-line__price';
  priceEl.textContent = formatPrice((item?.unitCents ?? 0) * line.quantity);

  top.append(nameWrap, priceEl);

  const controls = document.createElement('div');
  controls.className = 'cart-line__controls';
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'cart-line__remove';
  remove.dataset.cartRemove = line.id;
  remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove ${name} from cart`);
  controls.append(buildStepper(line, name), remove);

  main.append(top, controls);
  li.append(media, main);
  return li;
}

function render(): void {
  const count = cartCount(cart);

  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.dataset.empty = count === 0 ? 'true' : 'false';
  });
  document.querySelectorAll<HTMLElement>('[data-cart-open]').forEach((btn) => {
    btn.setAttribute('aria-label', `Open cart, ${itemsLabel(count)}`);
  });

  if (!linesEl || !emptyEl || !footEl) return;

  if (cart.length === 0) {
    linesEl.hidden = true;
    linesEl.replaceChildren();
    emptyEl.hidden = false;
    footEl.hidden = true;
  } else {
    emptyEl.hidden = true;
    footEl.hidden = false;
    linesEl.hidden = false;
    linesEl.replaceChildren(...cart.map(renderLine));
  }

  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(cartSubtotalCents(cart, priceOf));
  }
}

/* ---- State updates ---------------------------------------------------- */
function commit(next: Cart, focusSelector?: string): void {
  cart = next;
  saveCart(cart);
  render();
  if (focusSelector) {
    const focusTarget = document.querySelector<HTMLElement>(focusSelector);
    if (focusTarget) {
      focusTarget.focus();
      if (focusTarget instanceof HTMLInputElement) focusTarget.select();
    } else if (cartDialog?.open) {
      // A typed zero removes its own quantity input. Keep focus in the open
      // modal instead of allowing it to fall back to the document body.
      cartDialog.querySelector<HTMLElement>('[data-cart-close]')?.focus();
    }
  }
}

function quantityOf(id: string): number {
  return cart.find((line) => line.id === id)?.quantity ?? 0;
}

/* ---- Dialog helpers (native <dialog> handles focus + Escape) ---------- */
function openCart(): void {
  if (cartDialog && !cartDialog.open) cartDialog.showModal();
}

function topmostDialog(): HTMLDialogElement | null {
  const openDialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')];
  return openDialogs.at(-1) ?? null;
}

/**
 * Chromium normally constrains focus inside a modal dialog, but its native
 * Tab wrapping can briefly move focus to <body> at the end of the sequence.
 * Keep the active modal's keyboard loop deterministic, including when the
 * checkout-boundary dialog is stacked over the cart.
 */
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const dialog = topmostDialog();
  if (!dialog) return;

  const focusable = [...dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hidden && element.getClientRects().length > 0);

  if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable.at(-1)!;
  const active = document.activeElement;
  const isInside = active instanceof Node && dialog.contains(active);

  if (event.shiftKey && (!isInside || active === first)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (!isInside || active === last)) {
    event.preventDefault();
    first.focus();
  }
});

for (const dialog of [cartDialog, boundaryDialog]) {
  // Native <dialog> reports a backdrop click with the dialog itself as the
  // target. Check coordinates as well so clicks on visible dialog padding do
  // not accidentally dismiss the panel.
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isBackdrop =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (isBackdrop) dialog.close();
  });
}

/* ---- Event delegation ------------------------------------------------- */
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.closest('[data-cart-open]')) {
    openCart();
    return;
  }
  if (target.closest('[data-cart-close]')) {
    cartDialog?.close();
    return;
  }
  if (target.closest('[data-boundary-open]')) {
    if (boundaryDialog && !boundaryDialog.open) boundaryDialog.showModal();
    return;
  }
  if (target.closest('[data-boundary-close]')) {
    boundaryDialog?.close();
    return;
  }

  const addBtn = target.closest<HTMLElement>('[data-add-to-cart]');
  if (addBtn) {
    const id = addBtn.dataset.addToCart ?? '';
    if (!isValidId(id)) return;
    commit(addToCart(cart, id, 1));
    announce(
      `Added ${catalog[id]?.name ?? 'item'} to your cart. Cart now has ${itemsLabel(
        cartCount(cart),
      )}.`,
    );
    openCart();
    return;
  }

  const incBtn = target.closest<HTMLElement>('[data-cart-inc]');
  if (incBtn) {
    const id = incBtn.dataset.cartInc ?? '';
    commit(setQuantity(cart, id, quantityOf(id) + 1), `[data-cart-inc="${cssEscape(id)}"]`);
    return;
  }

  const decBtn = target.closest<HTMLElement>('[data-cart-dec]');
  if (decBtn) {
    const id = decBtn.dataset.cartDec ?? '';
    const nextQty = quantityOf(id) - 1;
    commit(
      setQuantity(cart, id, nextQty),
      nextQty > 0 ? `[data-cart-dec="${cssEscape(id)}"]` : '[data-cart-close]',
    );
    return;
  }

  const removeBtn = target.closest<HTMLElement>('[data-cart-remove]');
  if (removeBtn) {
    const id = removeBtn.dataset.cartRemove ?? '';
    const name = catalog[id]?.name ?? 'item';
    commit(removeFromCart(cart, id), '[data-cart-close]');
    announce(`Removed ${name} from your cart.`);
    return;
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const input = target.closest<HTMLInputElement>('[data-cart-qty]');
  if (!input) return;
  const id = input.dataset.cartQty ?? '';
  const parsed = Number.parseInt(input.value, 10);
  commit(
    setQuantity(cart, id, Number.isFinite(parsed) ? parsed : 0),
    `[data-cart-qty="${cssEscape(id)}"]`,
  );
});

// Keep multiple tabs in sync.
window.addEventListener('storage', (event) => {
  if (event.key === CART_STORAGE_KEY) {
    cart = loadCart();
    render();
  }
});

render();
