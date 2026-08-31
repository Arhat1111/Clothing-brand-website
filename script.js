"use strict";

const PRODUCTS = Array.isArray(window.FABLE_PRODUCTS) ? window.FABLE_PRODUCTS : [];
const INSTAGRAM_URL = "https://www.instagram.com/fablebykavitaanu/";
const WHATSAPP_URL = "https://wa.me/";
const WHATSAPP_CONSULTATION_URL = "https://wa.me/?text=Hi%20Fable%20by%20Kavita%20Anu%2C%20I%20would%20like%20a%20free%20styling%20consultation.";
const CART_KEY = "fable-shopping-bag-v2";
const LEADS_KEY = "fable-whatsapp-update-leads-v1";
const UPDATES_JOINED_KEY = "fable-updates-joined-v1";
const UPDATES_DISMISSED_KEY = "fable-updates-dismissed-session-v1";
const DISCOUNT_PHONE_KEY = "fable-active-discount-phone-v1";
const DISCOUNT_USED_PHONES_KEY = "fable-discount-used-phones-v1";
const DISCOUNT_LEDGER_KEY = "fable-discount-phone-ledger-v2";
const DISCOUNT_RATE = 0.05;
const ADMIN_PIN = "FABLE2026";
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
const celebrityLightbox = document.getElementById("celebrityLightbox");
const updatesPopup = document.getElementById("updatesPopup");
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


const ICON_EXTERNAL = `<svg class="icon icon-external" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
const ICON_CHEVRON_LEFT = `<svg class="icon icon-chevron-left" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>`;
const ICON_CHEVRON_RIGHT = `<svg class="icon icon-chevron-right" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
const ICON_CLOSE = `<svg class="icon icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const ICON_ONLY_OPEN = `<span class="icon-only">Open</span>${ICON_EXTERNAL}`;

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
  const open = cartDrawer?.classList.contains("open") || quickModal?.classList.contains("open") || checkoutModal?.classList.contains("open") || celebrityLightbox?.classList.contains("open") || updatesPopup?.classList.contains("open") || mobileMenu?.classList.contains("open");
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
  const featuredIds = ["blue", "golden-tissue", "shreenathji", "black", "purple-drape", "rani-lotus-anarkali", "green-cape", "wine-kurta-dhoti"];
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
const validCategories = ["all", "sarees", "anarkalis", "drapes", "festive"];

const shopHeroEyebrow = document.getElementById("shopHeroEyebrow");
const shopHeroTitle = document.getElementById("shopHeroTitle");
const shopHeroDescription = document.getElementById("shopHeroDescription");
const shopHeroImageOne = document.getElementById("shopHeroImageOne");
const shopHeroImageTwo = document.getElementById("shopHeroImageTwo");

const categoryHeroContent = {
  all: {
    eyebrow: "The complete collection",
    title: "Find your<br /><em>next Fable.</em>",
    description: "Explore statement sarees, Rakhi festive wear, anarkalis, drape sets and capes from the Fable lookbooks.",
    imageOne: "assets/products/lavender-main.webp",
    imageOneAlt: "Lavender jewel saree",
    imageTwo: "assets/products/rani-lotus-anarkali-main.webp",
    imageTwoAlt: "Rani lotus anarkali"
  },
  sarees: {
    eyebrow: "Saree collection",
    title: "Sarees,<br /><em>only sarees.</em>",
    description: "Browse Fable’s signature sarees, tissue sarees, heritage art sarees and festive saree edits without mixed-category imagery.",
    imageOne: "assets/products/blue-main.webp",
    imageOneAlt: "Blue signature saree",
    imageTwo: "assets/products/lavender-main.webp",
    imageTwoAlt: "Lavender jewel saree"
  },
  anarkalis: {
    eyebrow: "Anarkali collection",
    title: "Anarkalis<br /><em>with graceful movement.</em>",
    description: "Explore only Fable anarkali silhouettes, from Rani lotus tones to jacketed and neutral festive pieces.",
    imageOne: "assets/products/rani-lotus-anarkali-main.webp",
    imageOneAlt: "Rani lotus anarkali",
    imageTwo: "assets/products/grey-anarkali-main.webp",
    imageTwoAlt: "Grey anarkali"
  },
  drapes: {
    eyebrow: "Drape set collection",
    title: "Modern drapes,<br /><em>styled with ease.</em>",
    description: "Shop only Fable drape sets and drape saree silhouettes, matched with the right imagery for the category.",
    imageOne: "assets/products/purple-drape-main.webp",
    imageOneAlt: "Purple drape set",
    imageTwo: "assets/products/golden-drape-main.webp",
    imageTwoAlt: "Golden drape set"
  },
  festive: {
    eyebrow: "Festive wear collection",
    title: "Festive wear<br /><em>made for celebration.</em>",
    description: "Discover shararas, capes, bandhej and kurta-dhoti sets from Fable’s celebration-ready edit.",
    imageOne: "assets/products/green-cape-main.webp",
    imageOneAlt: "Green cape set",
    imageTwo: "assets/products/red-bandhej-main.webp",
    imageTwoAlt: "Red Bandhej set"
  }
};

const updateCategoryHero = (category) => {
  const hero = categoryHeroContent[category] || categoryHeroContent.all;
  if (shopHeroEyebrow) shopHeroEyebrow.textContent = hero.eyebrow;
  if (shopHeroTitle) shopHeroTitle.innerHTML = hero.title;
  if (shopHeroDescription) shopHeroDescription.textContent = hero.description;
  if (shopHeroImageOne) {
    shopHeroImageOne.src = hero.imageOne;
    shopHeroImageOne.alt = hero.imageOneAlt;
  }
  if (shopHeroImageTwo) {
    shopHeroImageTwo.src = hero.imageTwo;
    shopHeroImageTwo.alt = hero.imageTwoAlt;
  }
};

let activeCategory = "all";
let activeSearch = "";

const catalogCardMarkup = (product, index) => `
  <article class="catalog-card catalog-in" style="--tone:${product.tone};--delay:${Math.min(index * 35, 280)}ms">
    <div class="catalog-image">
      <button class="product-image-button" type="button" data-quick-view="${product.id}" aria-label="View ${escapeText(product.name)}">
        <img src="${product.image}" alt="${escapeText(product.name)}" loading="lazy" />
      </button>
      <span class="catalog-badge">${escapeText(product.badge)}</span>
      <button class="catalog-quick" type="button" data-quick-view="${product.id}" aria-label="Quick view ${escapeText(product.name)}">${ICON_ONLY_OPEN}</button>
      <button class="catalog-add" type="button" data-add-product="${product.id}">${product.sizes.length > 1 ? "Choose size" : "Add to bag"}</button>
    </div>
    <div class="catalog-info">
      <h3>${escapeText(product.name)}</h3><p class="catalog-price">${formatPrice(product.price)}</p><p class="catalog-category">${escapeText(product.categoryLabel)}</p>
    </div>
  </article>`;

const setCategory = (category, updateUrl = true) => {
  activeCategory = validCategories.includes(category) ? category : "all";
  categoryTabs?.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.category === activeCategory));
  updateCategoryHero(activeCategory);
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


/* WhatsApp update discount helpers */
const normalizeDiscountPhone = (value = "") => {
  let digits = String(value).replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
};

const readLeadRecords = () => {
  try {
    const data = JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveLeadRecords = (leads) => localStorage.setItem(LEADS_KEY, JSON.stringify(leads));

const readUsedDiscountPhones = () => {
  try {
    const data = JSON.parse(localStorage.getItem(DISCOUNT_USED_PHONES_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveUsedDiscountPhones = (phones) => localStorage.setItem(DISCOUNT_USED_PHONES_KEY, JSON.stringify([...new Set(phones.map(normalizeDiscountPhone).filter(Boolean))]));

const readDiscountLedger = () => {
  try {
    const data = JSON.parse(localStorage.getItem(DISCOUNT_LEDGER_KEY) || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
};

const saveDiscountLedger = (ledger) => localStorage.setItem(DISCOUNT_LEDGER_KEY, JSON.stringify(ledger));

const getDiscountLedgerEntry = (phone) => {
  const normalized = normalizeDiscountPhone(phone);
  if (!normalized) return null;
  const ledger = readDiscountLedger();
  return ledger[normalized] || null;
};

const setDiscountLedgerEntry = (phone, patch) => {
  const normalized = normalizeDiscountPhone(phone);
  if (!normalized) return null;
  const ledger = readDiscountLedger();
  const current = ledger[normalized] || {};
  ledger[normalized] = {
    phone: normalized,
    discountRate: DISCOUNT_RATE,
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveDiscountLedger(ledger);
  return ledger[normalized];
};

const isDiscountUsedForPhone = (phone) => {
  const normalized = normalizeDiscountPhone(phone);
  if (!normalized) return true;
  const ledgerEntry = getDiscountLedgerEntry(normalized);
  if (ledgerEntry?.status === "used" || ledgerEntry?.usedAt) return true;
  if (readUsedDiscountPhones().includes(normalized)) return true;
  const lead = readLeadRecords().find((item) => item.phone === normalized);
  return Boolean(lead?.discountUsedAt);
};

const getActiveDiscountLead = () => {
  const phone = normalizeDiscountPhone(localStorage.getItem(DISCOUNT_PHONE_KEY) || "");
  if (!phone || isDiscountUsedForPhone(phone)) return null;
  return readLeadRecords().find((lead) => lead.phone === phone && lead.consent !== false) || null;
};

const calculateCartDiscount = (subtotal) => {
  const activeLead = getActiveDiscountLead();
  if (!activeLead || subtotal <= 0) return { activeLead: null, discount: 0, total: subtotal };
  const discount = Math.round(subtotal * DISCOUNT_RATE);
  return { activeLead, discount, total: Math.max(subtotal - discount, 0) };
};

const markDiscountUsed = (phone) => {
  const normalized = normalizeDiscountPhone(phone);
  if (!normalized) return;
  const usedAt = new Date().toISOString();
  const used = readUsedDiscountPhones();
  if (!used.includes(normalized)) used.push(normalized);
  saveUsedDiscountPhones(used);
  setDiscountLedgerEntry(normalized, { status: "used", usedAt, eligible: false });
  const leads = readLeadRecords().map((lead) => lead.phone === normalized ? {
    ...lead,
    discountEligible: false,
    discountUsedAt: lead.discountUsedAt || usedAt,
    status: lead.status === "Subscribed" ? "Discount used" : lead.status
  } : lead);
  saveLeadRecords(leads);
  if (localStorage.getItem(DISCOUNT_PHONE_KEY) !== normalized) localStorage.setItem(DISCOUNT_PHONE_KEY, normalized);
};

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
const cartDiscountElement = document.getElementById("cartDiscount");
const cartDiscountPanel = document.getElementById("cartDiscountPanel");
const cartDiscountNote = document.getElementById("cartDiscountNote");
const cartTotal = document.getElementById("cartTotal");

const renderCart = () => {
  const detailed = cart.map((item) => ({ ...item, product: getProduct(item.id) })).filter((item) => item.product);
  const totalQty = detailed.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = detailed.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const { activeLead, discount, total } = calculateCartDiscount(subtotal);
  document.querySelectorAll("[data-cart-count]").forEach((element) => { element.textContent = String(totalQty); });
  if (cartSubtotal) cartSubtotal.textContent = formatPrice(subtotal);
  if (cartDiscountElement) cartDiscountElement.textContent = discount ? `−${formatPrice(discount)}` : "−₹0";
  if (cartTotal) cartTotal.textContent = formatPrice(total);
  if (cartDiscountPanel) cartDiscountPanel.classList.toggle("active", Boolean(activeLead && discount));
  if (cartDiscountNote) {
    if (activeLead && discount) cartDiscountNote.textContent = `5% first-order discount applied for ${activeLead.name}. This offer is linked to ${activeLead.rawPhone || activeLead.phone}.`;
    else if (normalizeDiscountPhone(localStorage.getItem(DISCOUNT_PHONE_KEY) || "") && !activeLead) cartDiscountNote.textContent = "The 5% updates discount for this WhatsApp number has already been used.";
    else cartDiscountNote.textContent = "Enter your phone number in the updates popup to unlock 5% off your first order.";
  }
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
let quickGallery = [];
let quickGalleryIndex = 0;
const closeProductModal = () => {
  quickModal?.classList.remove("open");
  quickModal?.setAttribute("aria-hidden", "true");
  if (!checkoutModal?.classList.contains("open")) modalBackdrop?.classList.remove("open");
  quickProductId = null;
  quickSize = null;
  quickGallery = [];
  quickGalleryIndex = 0;
  updateBodyLock();
};

const setQuickGalleryImage = (index) => {
  if (!quickGallery.length || !quickModal) return;
  quickGalleryIndex = (index + quickGallery.length) % quickGallery.length;
  const product = getProduct(quickProductId);
  const image = quickModal.querySelector("[data-gallery-image]");
  const counter = quickModal.querySelector("[data-gallery-counter]");
  if (image) {
    image.src = quickGallery[quickGalleryIndex];
    image.alt = `${product ? product.name : "Fable product"} view ${quickGalleryIndex + 1}`;
  }
  if (counter) counter.textContent = `${quickGalleryIndex + 1} / ${quickGallery.length}`;
  quickModal.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.galleryThumb) === quickGalleryIndex);
    button.setAttribute("aria-current", Number(button.dataset.galleryThumb) === quickGalleryIndex ? "true" : "false");
  });
};

const openProductModal = (id) => {
  const product = getProduct(id);
  if (!product || !quickModal) return;
  closeCart();
  quickProductId = id;
  quickSize = product.sizes[0];
  quickGallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image];
  quickGalleryIndex = 0;
  const hasGallery = quickGallery.length > 1;
  quickModal.innerHTML = `
    <div class="quick-modal-inner">
      <button class="modal-close" type="button" data-modal-close aria-label="Close product details">${ICON_CLOSE}</button>
      <div class="quick-gallery" style="--tone:${product.tone}">
        <div class="quick-modal-image" style="background:${product.tone}">
          <img src="${quickGallery[0]}" alt="${escapeText(product.name)} view 1" data-gallery-image />
          ${hasGallery ? `<button class="gallery-arrow gallery-prev" type="button" data-gallery-prev aria-label="Previous product image">${ICON_CHEVRON_LEFT}</button><button class="gallery-arrow gallery-next" type="button" data-gallery-next aria-label="Next product image">${ICON_CHEVRON_RIGHT}</button><span class="gallery-counter" data-gallery-counter>1 / ${quickGallery.length}</span>` : ""}
        </div>
        ${hasGallery ? `<div class="gallery-thumbnails" aria-label="Product image thumbnails">${quickGallery.map((image, index) => `<button type="button" class="gallery-thumb ${index === 0 ? "active" : ""}" data-gallery-thumb="${index}" aria-label="Show image ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"><img src="${image}" alt="${escapeText(product.name)} thumbnail ${index + 1}" /></button>`).join("")}</div>` : ""}
      </div>
      <div class="quick-modal-copy"><p class="eyebrow">${escapeText(product.categoryLabel)} · ${escapeText(product.badge)}</p><h2>${escapeText(product.name)}</h2><p class="quick-price">${formatPrice(product.price)}</p><p class="quick-description">${escapeText(product.description)}</p>${hasGallery ? `<p class="quick-gallery-hint">Use the arrows or thumbnails to view the complete look and close-up details.</p>` : ""}<p class="size-label">Select size</p><div class="size-options">${product.sizes.map((size, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-quick-size="${escapeText(size)}">${escapeText(size)}</button>`).join("")}</div><button class="button button-dark quick-add" type="button" data-quick-add>Add to shopping bag</button><p class="quick-note">Final fit, availability, shipping and payment are confirmed by the Fable team after enquiry.</p></div>
    </div>`;
  quickModal.classList.add("open");
  quickModal.setAttribute("aria-hidden", "false");
  modalBackdrop?.classList.add("open");
  updateBodyLock();
};

quickModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-modal-close]")) closeProductModal();
  if (event.target.closest("[data-gallery-prev]")) setQuickGalleryImage(quickGalleryIndex - 1);
  if (event.target.closest("[data-gallery-next]")) setQuickGalleryImage(quickGalleryIndex + 1);
  const thumbButton = event.target.closest("[data-gallery-thumb]");
  if (thumbButton) setQuickGalleryImage(Number(thumbButton.dataset.galleryThumb));
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

window.addEventListener("keydown", (event) => {
  if (!quickModal?.classList.contains("open")) return;
  if (event.key === "ArrowLeft") setQuickGalleryImage(quickGalleryIndex - 1);
  if (event.key === "ArrowRight") setQuickGalleryImage(quickGalleryIndex + 1);
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
  const subtotal = getCartSubtotal();
  const { activeLead, discount, total } = calculateCartDiscount(subtotal);
  lines.push("", `Estimated subtotal: ${formatPrice(subtotal)}`);
  if (activeLead && discount) {
    lines.push(`WhatsApp updates discount (5%): -${formatPrice(discount)}`);
    lines.push(`Estimated total after discount: ${formatPrice(total)}`);
    lines.push(`Discount linked to: ${activeLead.rawPhone || activeLead.phone}`);
  }
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
    <button class="modal-close" type="button" data-checkout-close aria-label="Close checkout enquiry">${ICON_CLOSE}</button>
    <p class="eyebrow">Complete your selection</p><h2>Order enquiry</h2><p class="checkout-intro">Enter your details below. Your complete order summary will be copied, then WhatsApp will open so you can send it directly to the Fable team.</p>
    ${(() => {
      const subtotal = getCartSubtotal();
      const { activeLead, discount, total } = calculateCartDiscount(subtotal);
      return `<form class="checkout-form" id="checkoutForm"><label>Full name<input type="text" name="name" required autocomplete="name" value="${activeLead ? escapeText(activeLead.name) : ""}" /></label><label>Phone number<input type="tel" name="phone" required inputmode="tel" autocomplete="tel" value="${activeLead ? escapeText(activeLead.rawPhone || activeLead.phone) : ""}" /></label><label>City<input type="text" name="city" required autocomplete="address-level2" /></label><label>Styling or delivery note<textarea name="note" placeholder="Optional"></textarea></label><div class="checkout-summary"><p><span>${cart.reduce((sum, item) => sum + item.qty, 0)} selected item(s)</span><strong>${formatPrice(subtotal)}</strong></p>${activeLead && discount ? `<p class="discount-applied"><span>WhatsApp updates discount</span><strong>−${formatPrice(discount)}</strong></p><p><span>Estimated total</span><strong>${formatPrice(total)}</strong></p>` : `<p><span>Estimated total</span><strong>${formatPrice(subtotal)}</strong></p>`}</div><button class="button button-dark checkout-submit" type="submit">Copy order & open WhatsApp</button><p class="checkout-disclaimer">This creates an enquiry only. No online payment is collected on this website. The 5% updates discount is linked to the registered WhatsApp number and is valid once.</p></form>`;
    })()}`;
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
  const formData = new FormData(event.target);
  const activeLead = getActiveDiscountLead();
  const formPhone = normalizeDiscountPhone(formData.get("phone"));
  if (activeLead && formPhone !== activeLead.phone) {
    showToast("Please use the registered WhatsApp number to keep the 5% discount");
    return;
  }
  const orderText = buildOrderText(formData);
  await copyText(orderText);
  if (activeLead) markDiscountUsed(activeLead.phone);
  renderCart();
  showToast(activeLead ? "Order copied and 5% discount marked as used" : "Order summary copied - paste it into WhatsApp");
  window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(orderText)}`, "_blank", "noopener");
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
  closeCelebrityLightbox();
  closeUpdatesPopup();
});


/* WhatsApp updates popup and admin dashboard */
const readLeads = readLeadRecords;
const saveLeads = saveLeadRecords;
const normalizePhone = normalizeDiscountPhone;

const formatLeadDate = (value) => {
  if (!value) return "-";
  try { return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
  catch { return value; }
};

const closeUpdatesPopup = () => {
  if (!updatesPopup) return;
  updatesPopup.classList.remove("open");
  updatesPopup.setAttribute("aria-hidden", "true");
  sessionStorage.setItem(UPDATES_DISMISSED_KEY, "true");
  updateBodyLock();
};

const openUpdatesPopup = () => {
  if (!updatesPopup || body.dataset.page === "admin") return;
  if (localStorage.getItem(UPDATES_JOINED_KEY) === "true") return;
  if (sessionStorage.getItem(UPDATES_DISMISSED_KEY) === "true") return;
  updatesPopup.classList.add("open");
  updatesPopup.setAttribute("aria-hidden", "false");
  updateBodyLock();
};

window.addEventListener("load", () => {
  window.setTimeout(openUpdatesPopup, 1450);
});

updatesPopup?.addEventListener("click", (event) => {
  if (event.target.closest("[data-updates-close]")) closeUpdatesPopup();
});

document.getElementById("updatesForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const rawPhone = String(form.get("phone") || "").trim();
  const phone = normalizePhone(rawPhone);
  if (!name || phone.length < 11) {
    showToast("Please enter a valid name and WhatsApp number");
    return;
  }
  const leads = readLeads();
  const existingIndex = leads.findIndex((lead) => lead.phone === phone);
  const alreadyUsed = isDiscountUsedForPhone(phone);
  const existing = existingIndex >= 0 ? leads[existingIndex] : {};
  const ledgerEntry = getDiscountLedgerEntry(phone);
  const lead = {
    id: existingIndex >= 0 ? existing.id : `lead-${Date.now()}`,
    name,
    rawPhone,
    phone,
    consent: true,
    sourcePage: document.title || body.dataset.page || "Website",
    createdAt: existingIndex >= 0 ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: alreadyUsed ? (existing.status || "Discount used") : "Subscribed",
    lastMessageAt: existingIndex >= 0 ? existing.lastMessageAt || "" : "",
    discountEligible: !alreadyUsed,
    discountRate: DISCOUNT_RATE,
    discountUsedAt: existing.discountUsedAt || ledgerEntry?.usedAt || ""
  };
  if (existingIndex >= 0) leads[existingIndex] = { ...existing, ...lead };
  else leads.unshift(lead);
  saveLeads(leads);
  if (alreadyUsed) {
    setDiscountLedgerEntry(phone, { status: "used", eligible: false, usedAt: lead.discountUsedAt || ledgerEntry?.usedAt || "used-before" });
  } else {
    setDiscountLedgerEntry(phone, {
      status: "available",
      eligible: true,
      registeredAt: ledgerEntry?.registeredAt || lead.createdAt,
      name,
      rawPhone,
      sourcePage: lead.sourcePage,
    });
    localStorage.setItem(DISCOUNT_PHONE_KEY, phone);
  }
  localStorage.setItem(UPDATES_JOINED_KEY, "true");
  closeUpdatesPopup();
  renderCart();
  showToast(alreadyUsed ? "Updates saved. This number has already used the 5% discount." : "Updates saved - 5% discount applied to your bag");
});

const personalizeMessage = (template, lead) => String(template || "")
  .replaceAll("{name}", lead.name || "there")
  .replaceAll("{phone}", lead.phone || "");

const whatsappLeadUrl = (lead, message) => `https://wa.me/${lead.phone}?text=${encodeURIComponent(personalizeMessage(message, lead))}`;

const toCsvCell = (value = "") => `"${String(value).replaceAll('"', '""')}"`;
const downloadTextFile = (filename, content, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const adminDashboard = document.getElementById("adminDashboard");
const adminLogin = document.getElementById("adminLogin");
const adminLeadRows = document.getElementById("adminLeadRows");
const adminEmpty = document.getElementById("adminEmpty");
const adminLeadCount = document.getElementById("adminLeadCount");
const adminSearch = document.getElementById("adminSearch");
const broadcastMessage = document.getElementById("broadcastMessage");
let adminFilter = "";

const setAdminVisible = (visible) => {
  if (!adminDashboard || !adminLogin) return;
  adminDashboard.hidden = !visible;
  adminLogin.hidden = visible;
  if (visible) renderAdminLeads();
};

const renderAdminLeads = () => {
  if (!adminLeadRows || !adminDashboard) return;
  const leads = readLeads();
  const q = adminFilter.trim().toLowerCase();
  const filtered = leads.filter((lead) => !q || [lead.name, lead.phone, lead.rawPhone, lead.sourcePage, lead.status].join(" ").toLowerCase().includes(q));
  if (adminLeadCount) adminLeadCount.textContent = String(leads.length);
  if (adminEmpty) adminEmpty.hidden = filtered.length > 0;
  adminLeadRows.innerHTML = filtered.map((lead) => `
    <tr>
      <td><strong>${escapeText(lead.name)}</strong><span>${escapeText(lead.sourcePage || "Website")}</span></td>
      <td>${escapeText(lead.rawPhone || lead.phone)}<span>wa.me/${escapeText(lead.phone)}</span></td>
      <td>${formatLeadDate(lead.createdAt)}<span>Last sent: ${formatLeadDate(lead.lastMessageAt)}</span></td>
      <td><span class="admin-status ${lead.discountUsedAt ? "used" : ""}">${lead.discountUsedAt ? "5% used" : "5% available"}</span><span>${lead.discountUsedAt ? formatLeadDate(lead.discountUsedAt) : "First order only"}</span></td>
      <td><span class="admin-status">${escapeText(lead.status || "Subscribed")}</span></td>
      <td class="admin-actions-cell">
        <button type="button" data-admin-whatsapp="${escapeText(lead.id)}">WhatsApp</button>
        <button type="button" data-admin-delete="${escapeText(lead.id)}">Delete</button>
      </td>
    </tr>
  `).join("");
};

document.getElementById("adminLoginForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const pin = new FormData(event.currentTarget).get("pin");
  if (pin === ADMIN_PIN) {
    sessionStorage.setItem("fable-admin-auth", "true");
    setAdminVisible(true);
    showToast("Admin dashboard unlocked");
  } else {
    showToast("Incorrect admin passcode");
  }
});

adminSearch?.addEventListener("input", (event) => {
  adminFilter = event.target.value;
  renderAdminLeads();
});

adminLeadRows?.addEventListener("click", (event) => {
  const whatsappButton = event.target.closest("[data-admin-whatsapp]");
  const deleteButton = event.target.closest("[data-admin-delete]");
  const leads = readLeads();
  if (whatsappButton) {
    const id = whatsappButton.dataset.adminWhatsapp;
    const lead = leads.find((item) => item.id === id);
    if (!lead) return;
    const message = broadcastMessage?.value || "Hi {name}, Fable by Kavita Anu has a new festive update for you. Reply here for styling help or a free consultation.";
    window.open(whatsappLeadUrl(lead, message), "_blank", "noopener");
    const updated = leads.map((item) => item.id === id ? { ...item, lastMessageAt: new Date().toISOString(), status: "Messaged" } : item);
    saveLeads(updated);
    renderAdminLeads();
  }
  if (deleteButton) {
    const id = deleteButton.dataset.adminDelete;
    if (!confirm("Delete this subscriber?")) return;
    saveLeads(leads.filter((lead) => lead.id !== id));
    renderAdminLeads();
  }
});

document.getElementById("exportLeads")?.addEventListener("click", () => {
  const leads = readLeads();
  const rows = [["Name", "WhatsApp", "Raw Phone", "Status", "Discount Eligible", "Discount Used At", "Source Page", "Created At", "Last Message At"], ...leads.map((lead) => [lead.name, lead.phone, lead.rawPhone, lead.status, lead.discountUsedAt ? "No" : "Yes", lead.discountUsedAt || "", lead.sourcePage, lead.createdAt, lead.lastMessageAt])];
  downloadTextFile(`fable-whatsapp-leads-${new Date().toISOString().slice(0,10)}.csv`, rows.map((row) => row.map(toCsvCell).join(",")).join("\n"), "text/csv");
});

document.getElementById("copyLeadNumbers")?.addEventListener("click", async () => {
  const numbers = readLeads().map((lead) => lead.phone).join("\n");
  await copyText(numbers);
  showToast("All WhatsApp numbers copied");
});

document.getElementById("clearLeads")?.addEventListener("click", () => {
  if (!confirm("Clear all saved subscribers from this browser?")) return;
  saveLeads([]);
  renderAdminLeads();
  showToast("Subscriber list cleared");
});

document.getElementById("openBroadcastQueue")?.addEventListener("click", () => {
  const leads = readLeads();
  const message = broadcastMessage?.value || "Hi {name}, Fable by Kavita Anu has a new festive update for you. Reply here for styling help or a free consultation.";
  const next = leads.find((lead) => lead.status !== "Messaged") || leads[0];
  if (!next) {
    showToast("No subscribers saved yet");
    return;
  }
  window.open(whatsappLeadUrl(next, message), "_blank", "noopener");
  const updated = leads.map((lead) => lead.id === next.id ? { ...lead, lastMessageAt: new Date().toISOString(), status: "Messaged" } : lead);
  saveLeads(updated);
  renderAdminLeads();
  showToast(`Opened WhatsApp for ${next.name}`);
});

if (body.dataset.page === "admin") {
  setAdminVisible(sessionStorage.getItem("fable-admin-auth") === "true");
}

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
  document.addEventListener("mouseover", (event) => { if (event.target.closest("a,button,.catalog-card,.product-card,.celebrity-story-card,.celebrity-person-card,.celebrity-frame")) ring?.classList.add("hover"); });
  document.addEventListener("mouseout", (event) => { if (event.target.closest("a,button,.catalog-card,.product-card,.celebrity-story-card,.celebrity-person-card,.celebrity-frame")) ring?.classList.remove("hover"); });
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


/* Celebrity story lightbox */
const celebrityCards = Array.from(document.querySelectorAll("[data-celebrity-card]"));
const celebrityLightboxImage = document.getElementById("celebrityLightboxImage");
const celebrityLightboxCredit = document.getElementById("celebrityLightboxCredit");
const celebrityLightboxTitle = document.getElementById("celebrityLightboxTitle");
const celebrityLightboxNote = document.getElementById("celebrityLightboxNote");
const celebrityLightboxQuickView = document.getElementById("celebrityLightboxQuickView");
let celebrityIndex = 0;

const renderCelebrityLightbox = () => {
  const card = celebrityCards[celebrityIndex];
  if (!card || !celebrityLightboxImage) return;
  celebrityLightboxImage.src = card.dataset.image || "";
  celebrityLightboxImage.alt = card.querySelector("img")?.alt || card.dataset.title || "Featured Fable look";
  if (celebrityLightboxCredit) celebrityLightboxCredit.textContent = card.dataset.credit || "Featured appearance";
  if (celebrityLightboxTitle) celebrityLightboxTitle.textContent = card.dataset.title || "Fable Feature";
  if (celebrityLightboxNote) celebrityLightboxNote.textContent = card.dataset.note || "Editorial image from the celebrity page.";
  if (celebrityLightboxQuickView) celebrityLightboxQuickView.dataset.quickViewProduct = card.dataset.product || "";
};

const openCelebrityLightbox = (index) => {
  if (!celebrityLightbox || !celebrityCards.length) return;
  celebrityIndex = (index + celebrityCards.length) % celebrityCards.length;
  renderCelebrityLightbox();
  celebrityLightbox.classList.add("open");
  celebrityLightbox.setAttribute("aria-hidden", "false");
  updateBodyLock();
};

const closeCelebrityLightbox = () => {
  if (!celebrityLightbox) return;
  celebrityLightbox.classList.remove("open");
  celebrityLightbox.setAttribute("aria-hidden", "true");
  updateBodyLock();
};

const stepCelebrityLightbox = (delta) => {
  if (!celebrityCards.length) return;
  celebrityIndex = (celebrityIndex + delta + celebrityCards.length) % celebrityCards.length;
  renderCelebrityLightbox();
};

celebrityCards.forEach((card, index) => card.addEventListener("click", () => openCelebrityLightbox(index)));

celebrityLightbox?.addEventListener("click", (event) => {
  if (event.target.closest("[data-celebrity-close]")) closeCelebrityLightbox();
  if (event.target.closest("[data-celebrity-prev]")) stepCelebrityLightbox(-1);
  if (event.target.closest("[data-celebrity-next]")) stepCelebrityLightbox(1);
  const quickButton = event.target.closest("#celebrityLightboxQuickView");
  if (quickButton) {
    const productId = quickButton.dataset.quickViewProduct;
    closeCelebrityLightbox();
    if (productId) {
      const sourceButton = document.querySelector(`[data-quick-view="${productId}"]`) || document.querySelector(`[data-add-product="${productId}"]`);
      sourceButton?.click();
    }
  }
});

window.addEventListener("keydown", (event) => {
  if (!celebrityLightbox?.classList.contains("open")) return;
  if (event.key === "ArrowLeft") stepCelebrityLightbox(-1);
  if (event.key === "ArrowRight") stepCelebrityLightbox(1);
});


/* Mini sliders for celebrity cards */
document.querySelectorAll("[data-celebrity-mini-slider]").forEach((slider) => {
  const track = slider.querySelector(".celebrity-person-track");
  const frames = Array.from(slider.querySelectorAll(".celebrity-frame"));
  const prev = slider.querySelector("[data-celebrity-mini-prev]");
  const next = slider.querySelector("[data-celebrity-mini-next]");
  const dots = Array.from(slider.querySelectorAll(".celebrity-mini-dots span"));
  if (!track || frames.length < 2) return;
  let index = 0;
  const updateDots = () => dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  const goTo = (nextIndex) => {
    index = (nextIndex + frames.length) % frames.length;
    track.scrollTo({ left: frames[index].offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
    updateDots();
  };
  prev?.addEventListener("click", (event) => { event.stopPropagation(); goTo(index - 1); });
  next?.addEventListener("click", (event) => { event.stopPropagation(); goTo(index + 1); });
  track.addEventListener("scroll", () => {
    const width = track.clientWidth || 1;
    index = Math.round(track.scrollLeft / width);
    updateDots();
  }, { passive: true });
  updateDots();
});
