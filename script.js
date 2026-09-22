

function attachImageFallbacks(scope = document) {
  const imgs = scope.querySelectorAll ? scope.querySelectorAll("img") : [];
  imgs.forEach((img) => {
    if (img.dataset.fableFallbackAttached === "true") return;
    img.dataset.fableFallbackAttached = "true";
    img.addEventListener("error", () => {
      const current = img.getAttribute("src") || "";
      if (!current || img.dataset.fableFallbackTried === "true") return;
      img.dataset.fableFallbackTried = "true";
      let fallback = "";
      if (current.includes("assets/celebrities/showcase/")) {
        fallback = current.replace("assets/celebrities/showcase/", "assets/celebrities/");
      } else if (current.includes("/assets/celebrities/showcase/")) {
        fallback = current.replace("/assets/celebrities/showcase/", "/assets/celebrities/");
      }
      if (fallback && fallback !== current) {
        img.src = fallback;
      } else {
        img.classList.add("image-load-failed");
      }
    });
  });
}
"use strict";

const PRODUCTS = Array.isArray(window.FABLE_PRODUCTS) ? window.FABLE_PRODUCTS : [];
const SHOWCASE_ONLY_IDS = new Set(["red-bandhej", "green-cape", "wine-kurta-dhoti", "golden-drape"]);
const isShowcaseProduct = (product) => product?.category === "celebrity" || product?.showcaseOnly === true || product?.saleable === false || SHOWCASE_ONLY_IDS.has(product?.id);
const SALE_PRODUCTS = PRODUCTS.filter((product) => !isShowcaseProduct(product));
const INSTAGRAM_URL = "https://www.instagram.com/fablebykavitaanu/";
const WHATSAPP_URL = "https://wa.me/";
const FABLE_WHATSAPP_NUMBER = "919601129762"; // Fable WhatsApp number with country code
const FABLE_API_BASE_URL = ""; // Vercel + Supabase: leave blank when the site is hosted on Vercel. If the site stays on GitHub Pages, paste your Vercel URL here, e.g. https://fable-orders.vercel.app
const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const FABLE_ADMIN_TOKEN_KEY = "fable-admin-api-token-v1";
const FABLE_OWNER_WHATSAPP_KEY = "fable-owner-whatsapp-v1";
const WHATSAPP_CONSULTATION_URL = "https://wa.me/919601129762?text=Hi%20Fable%20by%20Kavita%20Anu%2C%20I%20would%20like%20a%20free%20styling%20consultation.";
const CART_KEY = "fable-shopping-bag-v2";
const LEADS_KEY = "fable-whatsapp-update-leads-v1";
const BROADCAST_CURSOR_KEY = "fable-whatsapp-broadcast-cursor-v2";
const ORDERS_KEY = "fable-orders-local-v1";
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


const imageFallbackObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) attachImageFallbacks(node);
    });
  });
});
imageFallbackObserver.observe(document.documentElement, { childList: true, subtree: true });
attachImageFallbacks();
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
        <img src="${product.image}" alt="${escapeText(product.name)}" loading="lazy" decoding="async" />
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
  const featuredIds = ["teal-embroidered-drape-set", "silver-beaded-one-shoulder-gown", "ivory-lace-tiered-dress", "red-embellished-draped-gown", "white-botanical-asymmetric-dress", "lavender-sheer-coord-set", "plum-embroidered-cape-dress", "pastel-yellow-chiffon-set", "fuchsia-ruffle-coord-set", "mauve-lime-asymmetric-dress", "grey-red-belted-dress", "rust-ivory-panel-dress", "red-grey-ombre-shirt-dress", "grey-floral-sleeve-dress", "white-blue-floral-dress", "white-black-floral-wrap-dress", "ivory-ruffle-hem-dress", "color-block-zip-dress", "ivory-printed-ruffle-dress", "blue", "golden-tissue", "shreenathji", "black", "purple-drape", "rani-lotus-anarkali"];
  featuredRail.innerHTML = featuredIds.map(getProduct).filter((product) => product && !isShowcaseProduct(product)).map(featuredCardMarkup).join("");
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
const validCategories = ["all", "sarees", "anarkalis", "drapes", "festive", "dresses"];

const shopHeroEyebrow = document.getElementById("shopHeroEyebrow");
const shopHeroTitle = document.getElementById("shopHeroTitle");
const shopHeroDescription = document.getElementById("shopHeroDescription");
const shopHeroImageOne = document.getElementById("shopHeroImageOne");
const shopHeroImageTwo = document.getElementById("shopHeroImageTwo");

const categoryHeroContent = {
  all: {
    eyebrow: "The complete collection",
    title: "Find your<br /><em>next Fable.</em>",
    description: "Explore statement sarees, Rakhi festive wear, anarkalis, drape sets, capes and the new dress edit from the Fable lookbooks.",
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
    description: "Shop only Fable drape sets and drape saree silhouettes. Celebrity/appearance looks are excluded from this shop category.",
    imageOne: "assets/products/teal-embroidered-drape-set-main.webp",
    imageOneAlt: "Teal embroidered drape set",
    imageTwo: "assets/products/purple-drape-main.webp",
    imageTwoAlt: "Purple drape set"
  },
  festive: {
    eyebrow: "Festive wear collection",
    title: "Festive wear<br /><em>made for celebration.</em>",
    description: "Discover celebration-ready festive edits from Fable. Celebrity/appearance looks stay only on the Celebrities showcase page.",
    imageOne: "assets/products/red-embellished-draped-gown-main.webp",
    imageOneAlt: "Red embellished draped gown",
    imageTwo: "assets/products/silver-beaded-one-shoulder-gown-main.webp",
    imageTwoAlt: "Silver beaded one-shoulder gown"
  },
  dresses: {
    eyebrow: "New dress edit",
    title: "Dresses<br /><em>for everyday occasions.</em>",
    description: "Shop the new ₹7,500 and ₹9,500 Fable dress edits, including AI-styled model looks and the original product views.",
    imageOne: "assets/products/ivory-lace-tiered-dress-main.webp",
    imageOneAlt: "Ivory lace tiered dress",
    imageTwo: "assets/products/white-blue-floral-dress-main.webp",
    imageTwoAlt: "White blue floral dress"
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
        <img src="${product.image}" alt="${escapeText(product.name)}" loading="lazy" decoding="async" />
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
  const filtered = SALE_PRODUCTS.filter((product) => {
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
  if (Array.isArray(saved)) cart = saved.filter((item) => {
    const product = getProduct(item.id);
    return product && !isShowcaseProduct(product) && item.qty > 0;
  });
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
  if (isShowcaseProduct(product)) {
    showToast("This celebrity look is showcase only");
    return;
  }
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
          <img src="${quickGallery[0]}" alt="${escapeText(product.name)} view 1" data-gallery-image decoding="async" />
          ${hasGallery ? `<button class="gallery-arrow gallery-prev" type="button" data-gallery-prev aria-label="Previous product image">${ICON_CHEVRON_LEFT}</button><button class="gallery-arrow gallery-next" type="button" data-gallery-next aria-label="Next product image">${ICON_CHEVRON_RIGHT}</button><span class="gallery-counter" data-gallery-counter>1 / ${quickGallery.length}</span>` : ""}
        </div>
        ${hasGallery ? `<div class="gallery-thumbnails" aria-label="Product image thumbnails">${quickGallery.map((image, index) => `<button type="button" class="gallery-thumb ${index === 0 ? "active" : ""}" data-gallery-thumb="${index}" aria-label="Show image ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"><img src="${image}" alt="${escapeText(product.name)} thumbnail ${index + 1}" loading="lazy" decoding="async" /></button>`).join("")}</div>` : ""}
      </div>
      <div class="quick-modal-copy"><p class="eyebrow">${escapeText(product.categoryLabel)} · ${escapeText(product.badge)}</p><h2>${escapeText(product.name)}</h2><p class="quick-price">${isShowcaseProduct(product) ? "Showcase only" : formatPrice(product.price)}</p><p class="quick-description">${escapeText(product.description)}</p>${hasGallery ? `<p class="quick-gallery-hint">Use the arrows or thumbnails to view the complete look and close-up details.</p>` : ""}${isShowcaseProduct(product) ? `<p class="quick-showcase-note">This celebrity look is for showcase/inspiration only and is not available for sale through the shop.</p>` : `<p class="size-label">Select size</p><div class="size-options">${product.sizes.map((size, index) => `<button type="button" class="${index === 0 ? "active" : ""}" data-quick-size="${escapeText(size)}">${escapeText(size)}</button>`).join("")}</div><button class="button button-dark quick-add" type="button" data-quick-add>Add to shopping bag</button><p class="quick-note">Final fit, availability, shipping and payment are confirmed by the Fable team after enquiry.</p>`}</div>
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


/* Vercel + Supabase API helpers */
const hasFableApi = () => true;
const getFableApiBase = () => String(FABLE_API_BASE_URL || "").trim().replace(/\/$/, "");
const fableApi = async (path, options = {}) => {
  if (!hasFableApi()) throw new Error("Fable API URL is not configured yet.");
  const apiBase = getFableApiBase();
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok || data.ok === false) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};

const readOrderRecords = () => {
  try {
    const data = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};
const saveOrderRecords = (orders) => localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
const saveOrderLocally = (order) => {
  const orders = readOrderRecords();
  const existingIndex = orders.findIndex((item) => item.id === order.id);
  if (existingIndex >= 0) orders[existingIndex] = order;
  else orders.unshift(order);
  saveOrderRecords(orders.slice(0, 500));
};

const buildOrderPayload = (formData) => {
  const subtotal = getCartSubtotal();
  const { activeLead, discount, total } = calculateCartDiscount(subtotal);
  const items = cart.map((item) => {
    const product = getProduct(item.id);
    return product ? {
      id: product.id,
      name: product.name,
      category: product.categoryLabel || product.category || "",
      size: item.size,
      qty: item.qty,
      unitPrice: product.price,
      lineTotal: product.price * item.qty,
      image: product.image || "",
    } : null;
  }).filter(Boolean);
  return {
    id: `fable-${Date.now()}`,
    source: "website",
    status: "enquiry_received",
    paymentStatus: "not_paid",
    customer: {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      address: String(formData.get("address") || "").trim(),
    },
    note: String(formData.get("note") || "").trim(),
    items,
    subtotal,
    discount,
    total,
    discountPhone: activeLead ? activeLead.phone : "",
    discountLabel: activeLead && discount ? "5% WhatsApp updates discount" : "",
    createdAt: new Date().toISOString(),
  };
};

const sendOrderToApi = async (order) => {
  if (!hasFableApi()) return { ok: false, skipped: true, reason: "api_not_configured" };
  return fableApi("/api/orders", { method: "POST", body: JSON.stringify(order) });
};

const createRazorpayOrder = async (order) => fableApi("/api/razorpay-create-order", {
  method: "POST",
  body: JSON.stringify({
    amount: Math.round(Number(order.total || 0) * 100),
    receipt: order.id,
  }),
});

const verifyRazorpayPayment = async (payload) => fableApi("/api/razorpay-verify-payment", {
  method: "POST",
  body: JSON.stringify(payload),
});

let razorpayLoadPromise = null;
const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoadPromise) return razorpayLoadPromise;
  razorpayLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay Checkout could not load. Please check your internet connection."));
    document.head.appendChild(script);
  });
  return razorpayLoadPromise;
};

const openRazorpayCheckout = ({ keyId, razorpayOrder, order, formData, submitButton, activeLead }) => new Promise(async (resolve, reject) => {
  try {
    await loadRazorpayCheckout();
    const options = {
      key: keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || "INR",
      name: "Fable by Kavita Anu",
      description: `Order ${order.id}`,
      order_id: razorpayOrder.id,
      prefill: {
        name: order.customer.name,
        email: order.customer.email,
        contact: order.customer.phone,
      },
      notes: {
        local_order_id: order.id,
      },
      theme: {
        color: "#2b1a1d",
      },
      modal: {
        ondismiss: () => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Pay with Razorpay";
          }
          reject(new Error("Payment window closed before completion."));
        },
      },
      handler: async (response) => {
        try {
          const verifyResult = await verifyRazorpayPayment({
            ...response,
            local_order_id: order.id,
          });
          const paidOrder = {
            ...order,
            status: "paid_order_received",
            paymentStatus: "paid",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            updatedAt: new Date().toISOString(),
          };
          const finalOrder = verifyResult.order || paidOrder;
          saveOrderLocally(finalOrder);
          await copyText(buildOrderText(formData, finalOrder));
          if (activeLead) markDiscountUsed(activeLead.phone);
          cart = [];
          saveCart();
          renderCart();
          showPaymentSuccess(finalOrder, verifyResult.email);
          showToast(verifyResult.email?.sent ? "Payment successful. Order saved and email sent." : "Payment successful. Order saved.");
          resolve(verifyResult);
        } catch (verifyError) {
          reject(verifyError);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      reject(new Error(response?.error?.description || "Payment failed."));
    });
    rzp.open();
  } catch (error) {
    reject(error);
  }
});

const saveSubscriberToApi = async (lead) => {
  if (!hasFableApi()) return { ok: false, skipped: true, reason: "api_not_configured" };
  return fableApi("/api/subscribers", { method: "POST", body: JSON.stringify(lead) });
};

const fableWhatsappUrl = (text) => {
  const number = String(FABLE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!number) return "";
  return `${WHATSAPP_URL}${number}?text=${encodeURIComponent(text)}`;
};

const showPaymentSuccess = (order, emailResult = {}) => {
  if (!checkoutModal) return;
  const customerEmail = order?.customer?.email || order?.customer_email || "";
  const orderId = order?.id || "Fable order";
  const total = Number(order?.total || 0);
  checkoutModal.innerHTML = `
    <button class="modal-close" type="button" data-checkout-close aria-label="Close payment confirmation">${ICON_CLOSE}</button>
    <p class="eyebrow">Payment received</p>
    <h2>Thank you for your order</h2>
    <p class="checkout-intro">Your Razorpay payment was successful and your order has been saved to the Fable admin dashboard.</p>
    <div class="checkout-summary success-summary">
      <p><span>Order ID</span><strong>${escapeText(orderId)}</strong></p>
      <p><span>Paid total</span><strong>${formatPrice(total)}</strong></p>
      ${customerEmail ? `<p><span>Email</span><strong>${escapeText(customerEmail)}</strong></p>` : ""}
    </div>
    <p class="checkout-disclaimer">${(emailResult?.sent || emailResult?.customer?.sent) ? "A confirmation email has been sent to the customer." : "Confirmation email may take a few minutes. Your order is safely saved with us."}</p>
    <button class="button button-dark" type="button" data-checkout-close>Continue browsing</button>
  `;
  checkoutModal.classList.add("open");
  checkoutModal.setAttribute("aria-hidden", "false");
  modalBackdrop?.classList.add("open");
  updateBodyLock();
};

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

const buildOrderText = (formData, orderOverride = null) => {
  const order = orderOverride || buildOrderPayload(formData);
  const lines = [
    "FABLE BY KAVITA ANU - ORDER ENQUIRY",
    "",
    `Order ID: ${order.id}`,
    `Name: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
    `Phone: ${order.customer.phone}`,
    `City: ${order.customer.city}`,
    `Address: ${order.customer.address || "Not added"}`,
    "",
    "Selected pieces:",
  ];
  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} | Size: ${item.size} | Qty: ${item.qty} | ${formatPrice(item.lineTotal)}`);
  });
  lines.push("", `Subtotal: ${formatPrice(order.subtotal)}`);
  if (order.discount > 0) {
    lines.push(`${order.discountLabel || "Discount"}: -${formatPrice(order.discount)}`);
  }
  lines.push(`Total: ${formatPrice(order.total)}`);
  if (order.note) lines.push("", `Note: ${order.note}`);
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
    <p class="eyebrow">Complete your selection</p>
    <h2>Secure checkout</h2>
    <p class="checkout-intro">Enter the customer details below. The order will be saved to the admin dashboard and then Razorpay Checkout will open for payment.</p>
    ${(() => {
      const subtotal = getCartSubtotal();
      const { activeLead, discount, total } = calculateCartDiscount(subtotal);
      return `<form class="checkout-form" id="checkoutForm">
        <label>Full name<input type="text" name="name" required autocomplete="name" value="${activeLead ? escapeText(activeLead.name) : ""}" /></label>
        <label>Email address<input type="email" name="email" required autocomplete="email" placeholder="customer@email.com" /></label>
        <label>Phone / WhatsApp number<input type="tel" name="phone" required inputmode="tel" autocomplete="tel" value="${activeLead ? escapeText(activeLead.rawPhone || activeLead.phone) : ""}" /></label>
        <label>City<input type="text" name="city" required autocomplete="address-level2" /></label>
        <label>Full delivery address<textarea name="address" required placeholder="House / building, area, city, pincode"></textarea></label>
        <label>Styling or delivery note<textarea name="note" placeholder="Optional"></textarea></label>
        <div class="checkout-summary"><p><span>${cart.reduce((sum, item) => sum + item.qty, 0)} selected item(s)</span><strong>${formatPrice(subtotal)}</strong></p>${activeLead && discount ? `<p class="discount-applied"><span>WhatsApp updates discount</span><strong>−${formatPrice(discount)}</strong></p><p><span>Estimated total</span><strong>${formatPrice(total)}</strong></p>` : `<p><span>Estimated total</span><strong>${formatPrice(subtotal)}</strong></p>`}</div>
        <button class="button button-dark checkout-submit" type="submit">Pay with Razorpay</button>
        <p class="checkout-disclaimer">Secure payment is processed by Razorpay. Order confirmation email sends after successful payment if Resend is configured.</p>
      </form>`;
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
  const form = event.target;
  const submitButton = form.querySelector(".checkout-submit");
  const formData = new FormData(form);
  const activeLead = getActiveDiscountLead();
  const formPhone = normalizeDiscountPhone(formData.get("phone"));
  if (activeLead && formPhone !== activeLead.phone) {
    showToast("Please use the registered WhatsApp number to keep the 5% discount");
    return;
  }
  const order = buildOrderPayload(formData);
  const orderText = buildOrderText(formData, order);
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Creating payment...";
  }
  try {
    order.status = "payment_pending";
    order.paymentStatus = "payment_pending";
    const razorpayResult = await createRazorpayOrder(order);
    order.razorpayOrderId = razorpayResult.order.id;
    const pendingSave = await sendOrderToApi(order);
    const pendingOrder = pendingSave.order || order;
    saveOrderLocally(pendingOrder);
    if (submitButton) submitButton.textContent = "Opening Razorpay...";
    await openRazorpayCheckout({
      keyId: razorpayResult.keyId,
      razorpayOrder: razorpayResult.order,
      order: pendingOrder,
      formData,
      submitButton,
      activeLead,
    });
  } catch (error) {
    console.warn(error);
    showToast(error.message || "Payment could not start. Please try again.");
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Pay with Razorpay";
    }
  }
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
    if (isShowcaseProduct(product)) {
      openProductModal(product.id);
      showToast("This celebrity look is showcase only");
      return;
    }
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

document.getElementById("updatesForm")?.addEventListener("submit", async (event) => {
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
  try { await saveSubscriberToApi(lead); } catch (error) { console.warn(error); }
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

const getLeadPhone = (lead = {}) => normalizePhone(lead.phone || lead.rawPhone || lead.raw_phone || "");
const whatsappLeadUrl = (lead, message) => {
  const number = getLeadPhone(lead);
  return `https://wa.me/${number}?text=${encodeURIComponent(personalizeMessage(message, { ...lead, phone: number }))}`;
};
const getLeadKey = (lead = {}) => String(lead.id || lead.phone || lead.rawPhone || lead.raw_phone || "");

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
let latestAdminLeads = [];

const setAdminVisible = (visible) => {
  if (!adminDashboard || !adminLogin) return;
  adminDashboard.hidden = !visible;
  adminLogin.hidden = visible;
  if (visible) renderAdminLeads();
};

const fetchAdminLeads = async () => {
  const localLeads = readLeads();
  const token = sessionStorage.getItem(FABLE_ADMIN_TOKEN_KEY) || "";
  if (!token) return localLeads;
  try {
    const data = await fableApi("/api/subscribers", { headers: { "X-Admin-Token": token } });
    const remote = Array.isArray(data.subscribers) ? data.subscribers : [];
    return remote.length ? remote : localLeads;
  } catch (error) {
    console.warn(error);
    return localLeads;
  }
};

const renderAdminLeads = async () => {
  if (!adminLeadRows || !adminDashboard) return;
  const leads = await fetchAdminLeads();
  latestAdminLeads = Array.isArray(leads) ? leads : [];
  const q = adminFilter.trim().toLowerCase();
  const filtered = latestAdminLeads.filter((lead) => !q || [lead.name, lead.phone, lead.rawPhone, lead.sourcePage, lead.status].join(" ").toLowerCase().includes(q));
  if (adminLeadCount) adminLeadCount.textContent = String(latestAdminLeads.length);
  if (adminEmpty) adminEmpty.hidden = filtered.length > 0;
  adminLeadRows.innerHTML = filtered.map((lead) => {
    const phone = getLeadPhone(lead);
    const id = escapeText(getLeadKey(lead));
    return `
    <tr>
      <td data-label="Name"><strong>${escapeText(lead.name || "Subscriber")}</strong><span>${escapeText(lead.sourcePage || "Website")}</span></td>
      <td data-label="Phone">${escapeText(lead.rawPhone || lead.phone || phone)}<span>wa.me/${escapeText(phone)}</span></td>
      <td data-label="Joined">${formatLeadDate(lead.createdAt)}<span>Last sent: ${formatLeadDate(lead.lastMessageAt)}</span></td>
      <td data-label="Discount"><span class="admin-status ${lead.discountUsedAt ? "used" : ""}">${lead.discountUsedAt ? "5% used" : "5% available"}</span><span>${lead.discountUsedAt ? formatLeadDate(lead.discountUsedAt) : "First order only"}</span></td>
      <td data-label="Status"><span class="admin-status">${escapeText(lead.status || "Subscribed")}</span></td>
      <td class="admin-actions-cell" data-label="Actions">
        <button type="button" data-admin-whatsapp="${id}">WhatsApp</button>
        <button type="button" data-admin-delete="${id}">Delete local</button>
      </td>
    </tr>`;
  }).join("");
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
  const localLeads = readLeads();
  const visibleLeads = latestAdminLeads.length ? latestAdminLeads : localLeads;
  if (whatsappButton) {
    const id = whatsappButton.dataset.adminWhatsapp;
    const lead = visibleLeads.find((item) => getLeadKey(item) === id);
    if (!lead) return;
    const message = broadcastMessage?.value || "Hi {name}, Fable by Kavita Anu has a new festive update for you. Reply here for styling help or a free consultation.";
    window.open(whatsappLeadUrl(lead, message), "_blank", "noopener");
    const now = new Date().toISOString();
    latestAdminLeads = visibleLeads.map((item) => getLeadKey(item) === id ? { ...item, lastMessageAt: now, status: "Messaged" } : item);
    const updatedLocal = localLeads.map((item) => getLeadKey(item) === id ? { ...item, lastMessageAt: now, status: "Messaged" } : item);
    if (updatedLocal.some((item) => getLeadKey(item) === id)) saveLeads(updatedLocal);
    renderAdminLeads();
  }
  if (deleteButton) {
    const id = deleteButton.dataset.adminDelete;
    if (!confirm("Delete this local subscriber from this browser? Live Supabase subscribers stay saved.")) return;
    saveLeads(localLeads.filter((lead) => getLeadKey(lead) !== id));
    latestAdminLeads = latestAdminLeads.filter((lead) => getLeadKey(lead) !== id);
    renderAdminLeads();
  }
});

const getAdminLeadList = async () => {
  if (latestAdminLeads.length) return latestAdminLeads;
  const leads = await fetchAdminLeads();
  latestAdminLeads = Array.isArray(leads) ? leads : [];
  return latestAdminLeads;
};

document.getElementById("exportLeads")?.addEventListener("click", async () => {
  const leads = await getAdminLeadList();
  const rows = [["Name", "WhatsApp", "Raw Phone", "Status", "Discount Eligible", "Discount Used At", "Source Page", "Created At", "Last Message At"], ...leads.map((lead) => [lead.name, getLeadPhone(lead), lead.rawPhone, lead.status, lead.discountUsedAt ? "No" : "Yes", lead.discountUsedAt || "", lead.sourcePage, lead.createdAt, lead.lastMessageAt])];
  downloadTextFile(`fable-whatsapp-leads-${new Date().toISOString().slice(0,10)}.csv`, rows.map((row) => row.map(toCsvCell).join(",")).join("\n"), "text/csv");
});

document.getElementById("copyLeadNumbers")?.addEventListener("click", async () => {
  const leads = await getAdminLeadList();
  const numbers = leads.map(getLeadPhone).filter(Boolean).join("\n");
  await copyText(numbers);
  showToast("All WhatsApp numbers copied");
});

document.getElementById("clearLeads")?.addEventListener("click", () => {
  if (!confirm("Clear all saved subscribers from this browser?")) return;
  saveLeads([]);
  renderAdminLeads();
  showToast("Subscriber list cleared");
});

document.getElementById("openBroadcastQueue")?.addEventListener("click", async () => {
  const leads = (await getAdminLeadList()).filter((lead) => getLeadPhone(lead));
  const message = broadcastMessage?.value || "Hi {name}, Fable by Kavita Anu has a new festive update for you today. Reply here for styling help, new arrivals or a free consultation.";
  if (!leads.length) {
    showToast("No subscribers saved yet");
    return;
  }
  const currentCursor = Number(localStorage.getItem(BROADCAST_CURSOR_KEY) || "0");
  const index = Number.isFinite(currentCursor) ? currentCursor % leads.length : 0;
  const next = leads[index];
  localStorage.setItem(BROADCAST_CURSOR_KEY, String((index + 1) % leads.length));
  window.open(whatsappLeadUrl(next, message), "_blank", "noopener");
  const now = new Date().toISOString();
  const nextKey = getLeadKey(next);
  latestAdminLeads = (latestAdminLeads.length ? latestAdminLeads : leads).map((lead) => getLeadKey(lead) === nextKey ? { ...lead, lastMessageAt: now, status: "Messaged" } : lead);
  const localLeads = readLeads();
  const updatedLocal = localLeads.map((lead) => getLeadKey(lead) === nextKey ? { ...lead, lastMessageAt: now, status: "Messaged" } : lead);
  if (updatedLocal.some((lead) => getLeadKey(lead) === nextKey)) saveLeads(updatedLocal);
  renderAdminLeads();
  showToast(`Opened ${index + 1} of ${leads.length}: ${next.name || getLeadPhone(next)}`);
});

if (body.dataset.page === "admin") {
  setAdminVisible(sessionStorage.getItem("fable-admin-auth") === "true");
}


/* Supabase orders admin dashboard */
const adminOrderRows = document.getElementById("adminOrderRows");
const adminOrderEmpty = document.getElementById("adminOrderEmpty");
const adminOrderCount = document.getElementById("adminOrderCount");
const adminApiStatus = document.getElementById("adminApiStatus");
const adminTokenInput = document.getElementById("adminTokenInput");
const saveAdminTokenButton = document.getElementById("saveAdminToken");
const refreshAdminDataButton = document.getElementById("refreshAdminData");
const ownerLiveStatus = document.getElementById("ownerLiveStatus");
const ownerLiveRefresh = document.getElementById("ownerLiveRefresh");
const ownerWhatsappInput = document.getElementById("ownerWhatsappInput");
const saveOwnerWhatsappButton = document.getElementById("saveOwnerWhatsapp");
const notifyLatestOwnerButton = document.getElementById("notifyLatestOwner");
const openLatestOwnerWhatsappButton = document.getElementById("openLatestOwnerWhatsapp");

const getAdminToken = () => sessionStorage.getItem(FABLE_ADMIN_TOKEN_KEY) || "";
const setAdminToken = (token) => sessionStorage.setItem(FABLE_ADMIN_TOKEN_KEY, token || "");
const getOwnerWhatsapp = () => localStorage.getItem(FABLE_OWNER_WHATSAPP_KEY) || "";
const setOwnerWhatsapp = (value) => localStorage.setItem(FABLE_OWNER_WHATSAPP_KEY, String(value || "").replace(/\D/g, ""));
let latestAdminOrders = [];
let adminLiveTimer = null;
let knownAdminOrderIds = new Set();

const fetchAdminOrders = async () => {
  if (!hasFableApi()) return readOrderRecords();
  const data = await fableApi("/api/orders", { headers: { "X-Admin-Token": getAdminToken() } });
  return Array.isArray(data.orders) ? data.orders : [];
};

const buildAdminOrderText = (order) => {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const lines = [
    "FABLE BY KAVITA ANU - OWNER ORDER ALERT",
    "",
    `Order ID: ${order.id || ""}`,
    `Status: ${order.status || ""} / ${order.paymentStatus || ""}`,
    `Payment ID: ${order.razorpayPaymentId || "Not available"}`,
    "",
    `Customer: ${customer.name || ""}`,
    `Email: ${customer.email || ""}`,
    `Phone: ${customer.phone || ""}`,
    `City: ${customer.city || ""}`,
    `Address: ${customer.address || ""}`,
    "",
    "Items:",
    ...items.map((item, index) => `${index + 1}. ${item.name} | Size: ${item.size || "Custom"} | Qty: ${item.qty || 1} | ${formatPrice(Number(item.lineTotal || item.unitPrice || 0))}`),
    "",
    `Subtotal: ${formatPrice(Number(order.subtotal || 0))}`,
  ];
  if (Number(order.discount || 0)) lines.push(`Discount: -${formatPrice(Number(order.discount || 0))} ${order.discountLabel || ""}`);
  lines.push(`Total: ${formatPrice(Number(order.total || 0))}`);
  if (order.note) lines.push("", `Note: ${order.note}`);
  return lines.join("\n");
};

const getAdminOrderById = (id) => latestAdminOrders.find((order) => String(order.id) === String(id));

const notifyOwnerByEmail = async (orderId) => {
  if (!getAdminToken()) throw new Error("Enter and save the Admin API Token first.");
  return fableApi("/api/notify-owner", {
    method: "POST",
    headers: { "X-Admin-Token": getAdminToken() },
    body: JSON.stringify({ orderId }),
  });
};

const openOwnerWhatsappForOrder = (order) => {
  const number = getOwnerWhatsapp();
  if (!number) {
    showToast("Add and save owner WhatsApp number first");
    ownerWhatsappInput?.focus();
    return;
  }
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(buildAdminOrderText(order))}`, "_blank", "noopener");
};

const updateOwnerLiveStatus = async () => {
  if (!ownerLiveStatus) return;
  try {
    const health = hasFableApi() ? await fableApi("/api/health") : { supabase: false, ownerNotifications: false, email: false, businessEmail: false };
    const supabaseText = health.supabase ? "Supabase live" : "Supabase missing";
    const emailText = health.ownerNotifications ? "owner email alerts active" : "add RESEND_API_KEY, EMAIL_FROM and BUSINESS_EMAIL in Vercel for automatic owner emails";
    ownerLiveStatus.textContent = `${supabaseText}. ${emailText}. Admin page auto-refreshes new orders when the toggle is on.`;
  } catch (error) {
    ownerLiveStatus.textContent = `Could not check owner alert setup: ${error.message}`;
  }
};

const startAdminLiveRefresh = () => {
  window.clearInterval(adminLiveTimer);
  if (!ownerLiveRefresh?.checked || body.dataset.page !== "admin") return;
  adminLiveTimer = window.setInterval(() => renderAdminOrders({ silent: false }), 15000);
};

const renderAdminOrders = async ({ silent = false } = {}) => {
  if (!adminOrderRows) return;
  if (adminApiStatus) adminApiStatus.textContent = hasFableApi() ? "Connecting to Supabase..." : "Local demo mode: deploy on Vercel or add your Vercel API URL in script.js for central storage.";
  try {
    const orders = await fetchAdminOrders();
    const orderIds = new Set(orders.map((order) => String(order.id || "")));
    const freshOrders = orders.filter((order) => order?.id && !knownAdminOrderIds.has(String(order.id)));
    if (knownAdminOrderIds.size && freshOrders.length && !silent) {
      showToast(`${freshOrders.length} new live order received`);
    }
    knownAdminOrderIds = orderIds;
    latestAdminOrders = orders;
    if (adminOrderCount) adminOrderCount.textContent = String(orders.length);
    if (adminOrderEmpty) adminOrderEmpty.hidden = orders.length > 0;
    adminOrderRows.innerHTML = orders.map((order) => {
      const customer = order.customer || {};
      const items = Array.isArray(order.items) ? order.items : [];
      const itemText = items.map((item) => `${item.name} x ${item.qty} (${item.size || "Custom"})`).join("; ");
      const id = escapeText(order.id || "");
      return `<tr>
        <td data-label="Order"><strong>${escapeText(order.id || "Order")}</strong><span>${formatLeadDate(order.createdAt)}</span></td>
        <td data-label="Customer"><strong>${escapeText(customer.name || "")}</strong><span>${escapeText(customer.phone || "")}</span><span>${escapeText(customer.email || "")}</span></td>
        <td data-label="Items">${escapeText(itemText || "-")}</td>
        <td data-label="Total"><strong>${formatPrice(Number(order.total || 0))}</strong><span>${escapeText(order.discountLabel || "")}</span></td>
        <td data-label="Status"><span class="admin-status">${escapeText(order.status || "enquiry_received")}</span><span>${escapeText(order.paymentStatus || "not_paid")}</span></td>
        <td class="admin-actions-cell" data-label="Actions"><button type="button" data-admin-copy-order="${id}">Copy</button><button type="button" data-admin-owner-email="${id}">Email owner</button><button type="button" data-admin-owner-whatsapp="${id}">WhatsApp owner</button></td>
      </tr>`;
    }).join("");
    if (adminApiStatus) adminApiStatus.textContent = hasFableApi() ? `Connected to Supabase. Live refresh ${ownerLiveRefresh?.checked ? "on" : "off"}.` : "Showing orders saved in this browser only.";
  } catch (error) {
    adminOrderRows.innerHTML = "";
    if (adminOrderEmpty) adminOrderEmpty.hidden = false;
    if (adminApiStatus) adminApiStatus.textContent = `Admin API error: ${error.message}. Check Vercel deployment, Supabase env variables, and admin token.`;
  }
};

adminOrderRows?.addEventListener("click", async (event) => {
  const copyButton = event.target.closest("[data-admin-copy-order]");
  const emailButton = event.target.closest("[data-admin-owner-email]");
  const whatsappButton = event.target.closest("[data-admin-owner-whatsapp]");
  const orderId = copyButton?.dataset.adminCopyOrder || emailButton?.dataset.adminOwnerEmail || whatsappButton?.dataset.adminOwnerWhatsapp;
  if (!orderId) return;
  const order = getAdminOrderById(orderId);
  if (!order) return;
  if (copyButton) {
    await copyText(buildAdminOrderText(order));
    showToast("Order details copied");
  }
  if (emailButton) {
    emailButton.disabled = true;
    emailButton.textContent = "Sending...";
    try {
      const result = await notifyOwnerByEmail(orderId);
      showToast(result.ownerEmail?.sent ? "Order emailed to owner" : "Owner email was not sent");
    } catch (error) {
      showToast(error.message || "Owner email failed");
    } finally {
      emailButton.disabled = false;
      emailButton.textContent = "Email owner";
    }
  }
  if (whatsappButton) openOwnerWhatsappForOrder(order);
});

saveAdminTokenButton?.addEventListener("click", () => {
  setAdminToken(adminTokenInput?.value || "");
  showToast("Admin API token saved for this session");
  renderAdminOrders({ silent: true });
  updateOwnerLiveStatus();
});
refreshAdminDataButton?.addEventListener("click", () => {
  renderAdminOrders({ silent: true });
  renderAdminLeads();
  updateOwnerLiveStatus();
});
ownerLiveRefresh?.addEventListener("change", () => {
  startAdminLiveRefresh();
  renderAdminOrders({ silent: true });
});
saveOwnerWhatsappButton?.addEventListener("click", () => {
  setOwnerWhatsapp(ownerWhatsappInput?.value || "");
  if (ownerWhatsappInput) ownerWhatsappInput.value = getOwnerWhatsapp();
  showToast("Owner WhatsApp number saved on this device");
});
notifyLatestOwnerButton?.addEventListener("click", async () => {
  const latest = latestAdminOrders[0];
  if (!latest) return showToast("No order available yet");
  notifyLatestOwnerButton.disabled = true;
  notifyLatestOwnerButton.textContent = "Sending...";
  try {
    const result = await notifyOwnerByEmail(latest.id);
    showToast(result.ownerEmail?.sent ? "Latest order emailed to owner" : "Owner email was not sent");
  } catch (error) {
    showToast(error.message || "Owner email failed");
  } finally {
    notifyLatestOwnerButton.disabled = false;
    notifyLatestOwnerButton.textContent = "Email latest order to owner";
  }
});
openLatestOwnerWhatsappButton?.addEventListener("click", () => {
  const latest = latestAdminOrders[0];
  if (!latest) return showToast("No order available yet");
  openOwnerWhatsappForOrder(latest);
});

if (body.dataset.page === "admin") {
  if (adminTokenInput) adminTokenInput.value = getAdminToken();
  if (ownerWhatsappInput) ownerWhatsappInput.value = getOwnerWhatsapp();
  window.setTimeout(() => {
    renderAdminOrders({ silent: true });
    updateOwnerLiveStatus();
    startAdminLiveRefresh();
  }, 50);
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
