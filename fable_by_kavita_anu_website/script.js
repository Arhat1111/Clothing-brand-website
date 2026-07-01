"use strict";

const PRODUCTS = Array.isArray(window.FABLE_PRODUCTS) ? window.FABLE_PRODUCTS : [];
const INSTAGRAM_URL = "https://www.instagram.com/fablebykavitaanu/";
const CART_KEY = "fable-shopping-bag-v2";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const body = document.body;
const header = document.getElementById("siteHeader");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.getElementById("mobileMenu");
const backToTop = document.querySelector(".back-to-top");
const loader = document.querySelector(".page-loader");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const modalBackdrop = document.getElementById("modalBackdrop");
const quickModal = document.getElementById("quickModal");
const checkoutModal = document.getElementById("checkoutModal");
const toast = document.getElementById("toast");

const formatPrice = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value);

const getProduct = (id) => PRODUCTS.find((product) => product.id === id);

const escapeText = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

let toastTimer;
const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
};

window.addEventListener("load", () => {
  window.setTimeout(() => loader?.classList.add("is-hidden"), 260);
});

const updateBodyLock = () => {
  const open = cartDrawer?.classList.contains("open") || quickModal?.classList.contains("open") || checkoutModal?.classList.contains("open") || mobileMenu?.classList.contains("open");
  body.classList.toggle("overlay-open", Boolean(open));
};

const setMenuState = (open) => {
  menuButton?.classList.toggle("active", open);
  menuButton?.setAttribute("aria-expanded", String(open));
  mobileMenu?.classList.toggle("open", open);
  mobileMenu?.setAttribute("aria-hidden", String(!open));
  updateBodyLock();
};

menuButton?.addEventListener("click", () => setMenuState(!mobileMenu?.classList.contains("open")));
mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuState(false)));

const updateOnScroll = () => {
  const y = window.scrollY;
  header?.classList.toggle("scrolled", y > 28);
  backToTop?.classList.toggle("visible", y > 650);

  if (!reducedMotion) {
    document.querySelectorAll(".parallax-image").forEach((element) => {
      const speed = Number(element.dataset.speed || 0.05);
      const rect = element.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
      const image = element.querySelector("img");
      if (image) image.style.transform = `translate3d(0, ${offset}px, 0) scale(1.055)`;
    });
  }
};
window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();
backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

const revealElements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-card");
if ("IntersectionObserver" in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min((index % 4) * 85, 255)}ms`;
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("revealed"));
}

const featuredCardMarkup = (product) => `
  <article class="product-card commerce-card" style="--tone:${product.tone}">
    <div class="product-image">
      <button class="product-image-button" type="button" data-quick-view="${product.id}" aria-label="View ${escapeText(product.name)}">
        <img src="${product.image}" alt="${escapeText(product.name)}" loading="lazy" />
      </button>
      <span class="product-tag">${escapeText(product.badge)}</span>
      <button class="product-quick-action" type="button" data-quick-view="${product.id}">View & choose size</button>
    </div>
    <div class="product-card-info">
      <div><h3>${escapeText(product.name)}</h3><p class="category-name">${escapeText(product.categoryLabel)}</p></div>
      <p class="price">${formatPrice(product.price)}</p>
      <button class="mini-add" type="button" data-add-product="${product.id}" aria-label="Add ${escapeText(product.name)} to bag">+</button>
    </div>
  </article>`;

const featuredRail = document.getElementById("featuredRail");
if (featuredRail) {
  const featuredIds = ["crimson-drape-jacket", "sage-floral-saree", "emerald-bandhani-lehenga", "noir-jacket-saree", "rani-embroidered-kurta", "mocha-drape-jacket"];
  featuredRail.innerHTML = featuredIds.map(getProduct).filter(Boolean).map(featuredCardMarkup).join("");
}

const productRail = featuredRail;
const railPrev = document.getElementById("railPrev");
const railNext = document.getElementById("railNext");
const railProgress = document.getElementById("railProgress");
const getRailStep = () => (productRail?.querySelector(".product-card")?.getBoundingClientRect().width || 320) + 24;
const updateRailProgress = () => {
  if (!productRail || !railProgress) return;
  const maxScroll = productRail.scrollWidth - productRail.clientWidth;
  const progress = maxScroll > 0 ? productRail.scrollLeft / maxScroll : 0;
  const visibleFraction = productRail.clientWidth / productRail.scrollWidth;
  const width = Math.max(visibleFraction * 100, 24);
  railProgress.style.width = `${width}%`;
  railProgress.style.transform = `translateX(${progress * ((100 - width) / width) * 100}%)`;
};
railPrev?.addEventListener("click", () => productRail?.scrollBy({ left: -getRailStep(), behavior: reducedMotion ? "auto" : "smooth" }));
railNext?.addEventListener("click", () => productRail?.scrollBy({ left: getRailStep(), behavior: reducedMotion ? "auto" : "smooth" }));
productRail?.addEventListener("scroll", updateRailProgress, { passive: true });
window.addEventListener("resize", updateRailProgress);
window.setTimeout(updateRailProgress, 50);

/* Product catalogue */
const catalogGrid = document.getElementById("catalogGrid");
const categoryTabs = document.getElementById("categoryTabs");
const productSearch = document.getElementById("productSearch");
const productCount = document.getElementById("productCount");
const noResults = document.getElementById("noResults");
const clearFilters = document.getElementById("clearFilters");
const resetCatalog = document.getElementById("resetCatalog");
const validCategories = ["all", "sarees", "lehengas", "kurta-sets", "fusion"];
let activeCategory = "all";
let activeSearch = "";

const catalogCardMarkup = (product, index) => `
  <article class="catalog-card catalog-in" style="--tone:${product.tone};--delay:${Math.min(index * 35, 280)}ms">
    <div class="catalog-image">
      <button class="product-image-button" type="button" data-quick-view="${product.id}" aria-label="View ${escapeText(product.name)}">
        <img src="${product.image}" alt="${escapeText(product.name)}" loading="lazy" />
      </button>
      <span class="catalog-badge">${escapeText(product.badge)}</span>
      <button class="catalog-quick" type="button" data-quick-view="${product.id}" aria-label="Quick view ${escapeText(product.name)}">↗</button>
      <button class="catalog-add" type="button" data-add-product="${product.id}">${product.sizes.length > 1 ? "Choose size" : "Add to bag"}</button>
    </div>
    <div class="catalog-info">
      <h3>${escapeText(product.name)}</h3><p class="catalog-price">${formatPrice(product.price)}</p><p class="catalog-category">${escapeText(product.categoryLabel)}</p>
    </div>
  </article>`;

const setCategory = (category, updateUrl = true) => {
  activeCategory = validCategories.includes(category) ? category : "all";
  categoryTabs?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.category === activeCategory));
  if (updateUrl && window.history?.replaceState) {
    const url = new URL(window.location.href);
    if (activeCategory === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", activeCategory);
    window.history.replaceState({}, "", url);
  }
  renderCatalog();
};

const renderCatalog = () => {
  if (!catalogGrid) return;
  const query = activeSearch.trim().toLowerCase();
  const filtered = PRODUCTS.filter((product) => {
    const categoryMatch = activeCategory === "all" || product.category === activeCategory;
    const searchMatch = !query || `${product.name} ${product.categoryLabel} ${product.description}`.toLowerCase().includes(query);
    return categoryMatch && searchMatch;
  });
  catalogGrid.innerHTML = filtered.map(catalogCardMarkup).join("");
  if (productCount) productCount.textContent = String(filtered.length);
  if (noResults) noResults.hidden = filtered.length !== 0;
  catalogGrid.hidden = filtered.length === 0;
  if (clearFilters) clearFilters.hidden = activeCategory === "all" && !activeSearch;
};

if (catalogGrid) {
  const queryCategory = new URLSearchParams(window.location.search).get("category") || "all";
  activeCategory = validCategories.includes(queryCategory) ? queryCategory : "all";
  setCategory(activeCategory, false);
  categoryTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (button) setCategory(button.dataset.category);
  });
  productSearch?.addEventListener("input", () => {
    activeSearch = productSearch.value;
    renderCatalog();
  });
  const reset = () => {
    activeSearch = "";
    if (productSearch) productSearch.value = "";
    setCategory("all");
  };
  clearFilters?.addEventListener("click", reset);
  resetCatalog?.addEventListener("click", reset);
}

/* Cart */
let cart = [];
try {
  const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  if (Array.isArray(saved)) cart = saved.filter((item) => getProduct(item.id) && item.qty > 0);
} catch (error) {
  cart = [];
}

const saveCart = () => {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (error) { /* storage may be unavailable */ }
};

const cartKey = (id, size) => `${id}::${size}`;
const addToCart = (id, size) => {
  const product = getProduct(id);
  if (!product) return;
  const chosenSize = size || product.sizes[0];
  const existing = cart.find((item) => cartKey(item.id, item.size) === cartKey(id, chosenSize));
  if (existing) existing.qty += 1;
  else cart.push({ id, size: chosenSize, qty: 1 });
  saveCart();
  renderCart();
  showToast(`${product.name} added to your bag`);
};

const changeCartQuantity = (id, size, delta) => {
  const item = cart.find((entry) => cartKey(entry.id, entry.size) === cartKey(id, size));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((entry) => cartKey(entry.id, entry.size) !== cartKey(id, size));
  saveCart();
  renderCart();
};

const removeCartItem = (id, size) => {
  cart = cart.filter((entry) => cartKey(entry.id, entry.size) !== cartKey(id, size));
  saveCart();
  renderCart();
};

const cartItemsElement = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartFoot = document.getElementById("cartFoot");
const cartSubtotal = document.getElementById("cartSubtotal");

const renderCart = () => {
  const detailed = cart.map((item) => ({ ...item, product: getProduct(item.id) })).filter((item) => item.product);
  const totalQty = detailed.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => { element.textContent = String(totalQty); });
  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
  if (cartEmpty) cartEmpty.classList.toggle("visible", detailed.length === 0);
  cartFoot?.classList.toggle("hidden", detailed.length === 0);
  if (!cartItemsElement) return;
  cartItemsElement.innerHTML = detailed.map(({ product, size, qty }) => `
    <article class="cart-item">
      <div class="cart-item-image"><img src="${product.image}" alt="${escapeText(product.name)}" /></div>
      <div class="cart-item-info"><h3>${escapeText(product.name)}</h3><p>Size: ${escapeText(size)}</p><div class="cart-qty"><button type="button" data-cart-delta="-1" data-id="${product.id}" data-size="${escapeText(size)}" aria-label="Decrease quantity">−</button><span>${qty}</span><button type="button" data-cart-delta="1" data-id="${product.id}" data-size="${escapeText(size)}" aria-label="Increase quantity">+</button></div></div>
      <div class="cart-item-side"><strong>${formatPrice(product.price * qty)}</strong><button class="cart-remove" type="button" data-cart-remove data-id="${product.id}" data-size="${escapeText(size)}">Remove</button></div>
    </article>`).join("");
};
renderCart();

const openCart = () => {
  closeProductModal();
  closeCheckout();
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
  drawerBackdrop?.classList.add("open");
  updateBodyLock();
};
const closeCart = () => {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
  drawerBackdrop?.classList.remove("open");
  updateBodyLock();
};
document.querySelectorAll("[data-cart-open]").forEach((button) => button.addEventListener("click", openCart));
document.querySelectorAll("[data-cart-close]").forEach((element) => element.addEventListener("click", closeCart));

cartItemsElement?.addEventListener("click", (event) => {
  const deltaButton = event.target.closest("[data-cart-delta]");
  if (deltaButton) changeCartQuantity(deltaButton.dataset.id, deltaButton.dataset.size, Number(deltaButton.dataset.cartDelta));
  const removeButton = event.target.closest("[data-cart-remove]");
  if (removeButton) removeCartItem(removeButton.dataset.id, removeButton.dataset.size);
});

/* Product quick view */
let quickProductId = null;
let quickSize = null;
const closeProductModal = () => {
  quickModal?.classList.remove("open");
  quickModal?.setAttribute("aria-hidden", "true");
  if (!checkoutModal?.classList.contains("open")) modalBackdrop?.classList.remove("open");
  quickProductId = null;
  quickSize = null;
  updateBodyLock();
};

const openProductModal = (id) => {
  const product = getProduct(id);
  if (!product || !quickModal) return;
  closeCart();
  quickProductId = id;
  quickSize = product.sizes[0];
  quickModal.innerHTML = `
    <div class="quick-modal-inner">
      <button class="modal-close" type="button" data-modal-close aria-label="Close product details">×</button>
      <div class="quick-modal-image" style="background:${product.tone}"><img src="${product.image}" alt="${escapeText(product.name)}" /></div>
      <div class="quick-modal-copy"><p class="eyebrow">${escapeText(product.categoryLabel)} · ${escapeText(product.badge)}</p><h2>${escapeText(product.name)}</h2><p class="quick-price">${formatPrice(product.price)}</p><p class="quick-description">${escapeText(product.description)}</p><p class="size-label">Select size</p><div class="size-options">${product.sizes.map((size, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-quick-size="${escapeText(size)}">${escapeText(size)}</button>`).join("")}</div><button class="button button-dark quick-add" type="button" data-quick-add>Add to shopping bag</button><p class="quick-note">Final fit, availability, shipping and payment are confirmed by the Fable team after enquiry.</p></div>
    </div>`;
  quickModal.classList.add("open");
  quickModal.setAttribute("aria-hidden", "false");
  modalBackdrop?.classList.add("open");
  updateBodyLock();
};

quickModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-modal-close]")) closeProductModal();
  const sizeButton = event.target.closest("[data-quick-size]");
  if (sizeButton) {
    quickSize = sizeButton.dataset.quickSize;
    quickModal.querySelectorAll("[data-quick-size]").forEach((button) => button.classList.toggle("active", button === sizeButton));
  }
  if (event.target.closest("[data-quick-add]") && quickProductId) {
    addToCart(quickProductId, quickSize);
    closeProductModal();
    openCart();
  }
});

/* Checkout enquiry */
const closeCheckout = () => {
  checkoutModal?.classList.remove("open");
  checkoutModal?.setAttribute("aria-hidden", "true");
  if (!quickModal?.classList.contains("open")) modalBackdrop?.classList.remove("open");
  updateBodyLock();
};

const getCartSubtotal = () => cart.reduce((sum, item) => {
  const product = getProduct(item.id);
  return sum + (product ? product.price * item.qty : 0);
}, 0);

const buildOrderText = (formData) => {
  const lines = [
    "FABLE BY KAVITA ANU - ORDER ENQUIRY",
    "",
    `Name: ${formData.get("name")}`,
    `Phone: ${formData.get("phone")}`,
    `City: ${formData.get("city")}`,
    "",
    "Selected pieces:",
  ];
  cart.forEach((item, index) => {
    const product = getProduct(item.id);
    if (product) lines.push(`${index + 1}. ${product.name} | Size: ${item.size} | Qty: ${item.qty} | ${formatPrice(product.price * item.qty)}`);
  });
  lines.push("", `Estimated subtotal: ${formatPrice(getCartSubtotal())}`);
  const note = String(formData.get("note") || "").trim();
  if (note) lines.push("", `Note: ${note}`);
  lines.push("", "Please confirm availability, final price, shipping and payment details.");
  return lines.join("\n");
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
};

const openCheckout = () => {
  if (!cart.length || !checkoutModal) return;
  closeCart();
  checkoutModal.innerHTML = `
    <button class="modal-close" type="button" data-checkout-close aria-label="Close checkout enquiry">×</button>
    <p class="eyebrow">Complete your selection</p><h2>Order enquiry</h2><p class="checkout-intro">Enter your details below. Your complete order summary will be copied, then Instagram will open so you can send it directly to the Fable team.</p>
    <form class="checkout-form" id="checkoutForm"><label>Full name<input type="text" name="name" required autocomplete="name" /></label><label>Phone number<input type="tel" name="phone" required inputmode="tel" autocomplete="tel" /></label><label>City<input type="text" name="city" required autocomplete="address-level2" /></label><label>Styling or delivery note<textarea name="note" placeholder="Optional"></textarea></label><div class="checkout-summary"><p><span>${cart.reduce((sum, item) => sum + item.qty, 0)} selected item(s)</span><strong>${formatPrice(getCartSubtotal())}</strong></p></div><button class="button button-dark checkout-submit" type="submit">Copy order & open Instagram</button><p class="checkout-disclaimer">This creates an enquiry only. No online payment is collected on this website.</p></form>`;
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  modalBackdrop?.classList.add("open");
  updateBodyLock();
};

document.getElementById("checkoutButton")?.addEventListener("click", openCheckout);
checkoutModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-checkout-close]")) closeCheckout();
});
checkoutModal?.addEventListener("submit", async (event) => {
  if (event.target.id !== "checkoutForm") return;
  event.preventDefault();
  const orderText = buildOrderText(new FormData(event.target));
  await copyText(orderText);
  showToast("Order summary copied - paste it into Instagram");
  window.open(INSTAGRAM_URL, "_blank", "noopener");
});

modalBackdrop?.addEventListener("click", () => {
  closeProductModal();
  closeCheckout();
});

document.addEventListener("click", (event) => {
  const quickButton = event.target.closest("[data-quick-view]");
  if (quickButton) openProductModal(quickButton.dataset.quickView);
  const addButton = event.target.closest("[data-add-product]");
  if (addButton) {
    const product = getProduct(addButton.dataset.addProduct);
    if (!product) return;
    if (product.sizes.length > 1) openProductModal(product.id);
    else {
      addToCart(product.id, product.sizes[0]);
      openCart();
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  setMenuState(false);
  closeCart();
  closeProductModal();
  closeCheckout();
});

/* Cursor and magnetic hover */
if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let ringX = 0; let ringY = 0; let mouseX = 0; let mouseY = 0;
  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX; mouseY = event.clientY;
    if (dot) { dot.style.left = `${mouseX}px`; dot.style.top = `${mouseY}px`; }
  });
  const animateCursor = () => {
    ringX += (mouseX - ringX) * 0.16; ringY += (mouseY - ringY) * 0.16;
    if (ring) { ring.style.left = `${ringX}px`; ring.style.top = `${ringY}px`; }
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
  document.addEventListener("mouseover", (event) => { if (event.target.closest("a,button,.catalog-card,.product-card")) ring?.classList.add("hover"); });
  document.addEventListener("mouseout", (event) => { if (event.target.closest("a,button,.catalog-card,.product-card")) ring?.classList.remove("hover"); });
  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      element.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.075}px, ${(event.clientY - rect.top - rect.height / 2) * 0.075}px)`;
    });
    element.addEventListener("mouseleave", () => { element.style.transform = ""; });
  });
}

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());
