// ═══════════════════════════════════════
// PRODUCT DATA DEFINITIONS
// ═══════════════════════════════════════

const allProducts = [
  // ── Flagship Category ──
  {
    name: "MaxPanel Indoor LED Display Series",
    category: "flagship",
    series: "Flagship Indoor",
    description: "Premium fine-pitch indoor panels engineered for corporate lobbies, boardrooms, TV studios, and security control centers. Seamless splicing and high refresh rate.",
    images: ["assets/images/indoor_led_screen_1783144344057.jpg", "assets/active_led_module.png"],
    specs: { "Pixel Pitch": "1.25 - 2.5mm", "Brightness": "800 nits", "Refresh Rate": "3840Hz", "Lifespan": "100,000 hrs" },
    env: "indoor"
  },
  {
    name: "DuraPanel Pro 960 Outdoor Screen",
    category: "flagship",
    series: "Flagship Outdoor",
    description: "Rugged die-cast aluminum cabinet built for massive billboards, stadiums, highways, and digital out-of-home advertising. IP65 waterproof with excellent cooling.",
    images: ["assets/images/outdoor_led_screen_1783144365434.jpg", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "3.91 - 10mm", "Brightness": "5500+ nits", "IP Rating": "IP65 Waterproof", "Lifespan": "100,000 hrs" },
    env: "outdoor"
  },
  {
    name: "CrystalFilm Transparent LED Display",
    category: "flagship",
    series: "Transparent Series",
    description: "Revolutionary transparent digital signage that maintains up to 80% visibility through window glass. Perfect for luxury retail storefronts and facade ads.",
    images: ["assets/images/transparent_led_screen_1783144399219.jpg", "assets/lcd_display_panel.png"],
    specs: { "Pixel Pitch": "3.91 - 7.81mm", "Transparency": "80% Clear", "Brightness": "4000 nits", "Lifespan": "100,000 hrs" },
    env: "both"
  },
  {
    name: "Zorko Event Rental LED Cabinet",
    category: "flagship",
    series: "Rental Series",
    description: "Ultra-lightweight die-cast cabinet featuring high-precision quick locks and modular handle design. Ideal for quick stage setup, concerts, and AV companies.",
    images: ["assets/hero_led_wall.png", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "2.6 - 3.91mm", "Weight": "7.5 kg / Cab", "Refresh Rate": "3840Hz", "Locks": "Fast Quick-Lock" },
    env: "both"
  },

  // ── Indoor Panels Category ──
  {
    name: "MaxPanel P1.25 Ultra Fine Pitch",
    category: "indoor",
    series: "Indoor Panel",
    description: "Ultra-high resolution LED wall designed for close-viewing distances. Gold-wire SMD technology delivers absolute color accuracy and deep contrast.",
    images: ["assets/images/indoor_led_screen_1783144344057.jpg", "assets/active_led_module.png"],
    specs: { "Pixel Pitch": "1.25mm", "Brightness": "600-800 nits", "Refresh Rate": "3840Hz", "Cabinet": "Die-Cast Alum" },
    env: "indoor"
  },
  {
    name: "MaxPanel P1.86 Control Room Series",
    category: "indoor",
    series: "Indoor Panel",
    description: "The ideal standard for corporate reception desks, command centers, and TV sets. Flicker-free calibration prevents scanning lines on camera.",
    images: ["assets/lcd_display_panel.png", "assets/images/indoor_led_screen_1783144344057.jpg"],
    specs: { "Pixel Pitch": "1.86mm", "Brightness": "800 nits", "Refresh Rate": "3840Hz", "Contrast Ratio": "5000:1" },
    env: "indoor"
  },
  {
    name: "MaxPanel P2.5 Commercial Display",
    category: "indoor",
    series: "Indoor Panel",
    description: "Cost-effective, high-brightness commercial indoor display. Perfect for shopping mall directories, restaurants, and retail spaces.",
    images: ["assets/images/indoor_led_screen_1783144344057.jpg", "assets/hero_led_wall.png"],
    specs: { "Pixel Pitch": "2.5mm", "Brightness": "800 nits", "Refresh Rate": "1920-3840Hz", "Lifespan": "100,000 hrs" },
    env: "indoor"
  },

  // ── Outdoor Screens Category ──
  {
    name: "DuraPanel Pro P3.91 High-Res Outdoor",
    category: "outdoor",
    series: "Outdoor Screen",
    description: "High pixel density outdoor screen offering vivid visual details. Designed for storefront entries and close-proximity public signage.",
    images: ["assets/images/outdoor_led_screen_1783144365434.jpg", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "3.91mm", "Brightness": "5000 nits", "IP Rating": "IP65 front/rear", "Refresh Rate": "3840Hz" },
    env: "outdoor"
  },
  {
    name: "DuraPanel Pro P5 Highway Billboard",
    category: "outdoor",
    series: "Outdoor Screen",
    description: "Premium large-format billboard screen built to withstand extreme monsoon and dusty summer environments in India.",
    images: ["assets/images/outdoor_led_screen_1783144365434.jpg", "assets/hero_led_wall.png"],
    specs: { "Pixel Pitch": "5.0mm", "Brightness": "5800 nits", "IP Rating": "IP65 Waterproof", "Cooling": "Dual Fan System" },
    env: "outdoor"
  },
  {
    name: "DuraPanel Pro P10 Giant Facade",
    category: "outdoor",
    series: "Outdoor Screen",
    description: "Heavy-duty giant advertising screen with superior brightness. Highly cost-effective for long viewing distance installations.",
    images: ["assets/images/outdoor_led_screen_1783144365434.jpg", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "10.0mm", "Brightness": "6500+ nits", "IP Rating": "IP65 Rated", "Scan Mode": "Static Drive" },
    env: "outdoor"
  },

  // ── Transparent LED Category ──
  {
    name: "CrystalFilm Glass Sticker Series",
    category: "transparent",
    series: "Transparent Film",
    description: "Ultra-thin and lightweight adhesive film display that sticks directly onto existing windows. Over 80% transparency.",
    images: ["assets/images/transparent_led_screen_1783144399219.jpg", "assets/lcd_display_panel.png"],
    specs: { "Pixel Pitch": "3.91mm", "Transparency": "80% Clear", "Weight": "2.8 kg / sqm", "Install": "Self-Adhesive" },
    env: "both"
  },
  {
    name: "HoloMesh Architectural Facade",
    category: "transparent",
    series: "Transparent Mesh",
    description: "Semi-transparent LED strip mesh structure for building exterior wraps. Allows air and daylight to pass through naturally.",
    images: ["assets/images/transparent_led_screen_1783144399219.jpg", "assets/hero_led_wall.png"],
    specs: { "Pixel Pitch": "10.4 - 15.6mm", "Transparency": "65% Clear", "Wind Load": "Low Resistance", "Maintenance": "Front/Rear Access" },
    env: "outdoor"
  },

  // ── Mobile LED Ads Category ──
  {
    name: "AdPack LED Smart Delivery Bag",
    category: "mobile",
    series: "Mobile Ad Pack",
    description: "Wearable, ultra-light delivery backpack screen. GPS targeted ads powered by rechargeable power banks with remote app support.",
    images: ["assets/images/flexible_led_screen_1783144385351.jpg", "assets/active_led_module.png"],
    specs: { "Pixel Pitch": "4.0mm", "Connection": "4G / Cloud App", "Battery": "8-10 hrs run", "Weight": "1.2 kg" },
    env: "both"
  },
  {
    name: "AdBox Mobile Van Advertising Screen",
    category: "mobile",
    series: "Mobile Van Ad",
    description: "Shock-resistant high-brightness screen built for advertising trucks and vans. Equipped with sound system mounting brackets.",
    images: ["assets/images/flexible_led_screen_1783144385351.jpg", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "5.0mm", "Brightness": "5500 nits", "Shockproof": "Military-grade", "Power": "GenSet Compatible" },
    env: "outdoor"
  },
  {
    name: "T-X Car Top LED Display",
    category: "mobile",
    series: "Mobile Top Ad",
    description: "Aero-dynamic double sided taxi top display. Automatically switches ads based on real-time GPS locations.",
    images: ["assets/images/flexible_led_screen_1783144385351.jpg", "assets/lcd_display_panel.png"],
    specs: { "Pixel Pitch": "3.0mm", "Sides": "Dual Display", "Power": "Car battery 12V", "Control": "Cloud 4G CMS" },
    env: "outdoor"
  },

  // ── Poster Category ──
  {
    name: "VersaPoster 640 Digital Display",
    category: "poster",
    series: "Smart Poster",
    description: "Slim, plug-and-play standing digital poster. Equipped with heavy wheels for easy placement in hotel lobbies, banks, and mall hallways.",
    images: ["assets/images/flexible_led_screen_1783144385351.jpg", "assets/lcd_display_panel.png"],
    specs: { "Pixel Pitch": "1.86 - 2.5mm", "Stand": "Included Wheels", "Control": "USB / WiFi / App", "Splicing": "Cascade Linkable" },
    env: "indoor"
  },
  {
    name: "StreetView Smart Plaza Poster",
    category: "poster",
    series: "Outdoor Poster",
    description: "Weather-proof double-sided outdoor poster display. Features automatic brightness sensors and vandal-resistant tempered front glass.",
    images: ["assets/images/outdoor_led_screen_1783144365434.jpg", "assets/images/flexible_led_screen_1783144385351.jpg"],
    specs: { "Pixel Pitch": "4.0mm", "Brightness": "5000+ nits", "IP Rating": "IP65 Enclosure", "Glass": "Anti-Glare Tempered" },
    env: "outdoor"
  },

  // ── Rental Category ──
  {
    name: "Stage Rental P2.6 Cabinet",
    category: "rental",
    series: "Stage Rental",
    description: "High resolution cabinet built for high-profile TV stages, conferences, and wedding backdrops. Seamless curved locking mechanisms.",
    images: ["assets/hero_led_wall.png", "assets/led_cabinet.png"],
    specs: { "Pixel Pitch": "2.6mm", "Refresh Rate": "3840Hz", "Curving": "-5° to +5° lock", "Weight": "7.5 kg" },
    env: "indoor"
  },
  {
    name: "Event Rental P3.91 Cabinet",
    category: "rental",
    series: "Event Rental",
    description: "Versatile indoor/outdoor workhorse cabinet. Highly durable corner guards prevent module damage during frequent transit and setup.",
    images: ["assets/led_cabinet.png", "assets/hero_led_wall.png"],
    specs: { "Pixel Pitch": "3.91mm", "Brightness": "5000 nits (Out)", "IP Rating": "IP65 Weatherproof", "Maintenance": "Magnetic Modules" },
    env: "both"
  }
];

// ═══════════════════════════════════════
// INITIALIZATION ON LOAD
// ═══════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initial Product Render
  renderProductGrid("flagship");
  
  // 2. Initialize Form Dropdowns
  updatePitchOptions("indoor");

  // 3. Theme Toggle Logic
  initThemeToggle();

  // 4. Smooth Scrolling Setup
  initSmoothScrolling();

  // 5. Scroll Animation Observer
  initScrollObserver();
});

// ═══════════════════════════════════════
// PRODUCT RENDERING ENGINE
// ═══════════════════════════════════════

function renderProductGrid(category) {
  const grids = {
    flagship: document.getElementById("flagshipGrid"),
    indoor: document.getElementById("indoorGrid"),
    outdoor: document.getElementById("outdoorGrid"),
    transparent: document.getElementById("transparentGrid"),
    mobile: document.getElementById("mobileGrid"),
    poster: document.getElementById("posterGrid"),
    rental: document.getElementById("rentalGrid")
  };

  const activeGrid = grids[category];
  if (!activeGrid) return;

  // Clear previous grid contents
  activeGrid.innerHTML = "";

  // Filter products by category
  const filtered = allProducts.map((prod, globalIdx) => ({ ...prod, globalIdx })).filter(p => p.category === category);

  filtered.forEach(p => {
    // Generate Environment Tag Class
    let envClass = "env-both";
    let envLabel = "Indoor & Outdoor";
    if (p.env === "indoor") {
      envClass = "env-indoor";
      envLabel = "Indoor Panel";
    } else if (p.env === "outdoor") {
      envClass = "env-outdoor";
      envLabel = "Outdoor Screen";
    }

    // Build specs HTML
    let specsHtml = "";
    for (const [key, val] of Object.entries(p.specs)) {
      specsHtml += `
        <div class="spec-item">
          <div class="spec-k">${key}</div>
          <div class="spec-v">${val}</div>
        </div>
      `;
    }

    // Generate dots navigation indicator HTML
    let dotsHtml = "";
    p.images.forEach((img, imgIdx) => {
      dotsHtml += `
        <button class="gallery-dot ${imgIdx === 0 ? 'active' : ''}" 
                onclick="setCardImage(this, ${imgIdx})" 
                aria-label="View product slide ${imgIdx + 1}">
        </button>
      `;
    });

    // Build complete card HTML
    const cardHtml = `
      <div class="prod-card" data-prod-idx="${p.globalIdx}" data-img-idx="0">
        <!-- Environmental tag -->
        <span class="pc-env ${envClass}">${envLabel}</span>
        
        <!-- Interactive slide gallery -->
        <div class="product-gallery">
          <div class="gallery-main">
            <img class="gallery-main-img" loading="lazy" decoding="async" src="${p.images[0]}" alt="${p.name} primary photo">
          </div>
          ${p.images.length > 1 ? `
            <button class="gallery-arrow arrow-left" onclick="changeCardImage(this, -1)" aria-label="Previous slide">‹</button>
            <button class="gallery-arrow arrow-right" onclick="changeCardImage(this, 1)" aria-label="Next slide">›</button>
          ` : ''}
          <div class="gallery-dots">
            ${dotsHtml}
          </div>
        </div>

        <!-- Product details body -->
        <div class="pc-body">
          <div class="pc-series">${p.series}</div>
          <h3 class="pc-name">${p.name}</h3>
          <p class="pc-desc">${p.description}</p>
          
          <div class="pc-specs">
            ${specsHtml}
          </div>
          
          <button class="pc-cta" onclick="requestProductQuote('${p.name}')">REQUEST QUOTE →</button>
        </div>
      </div>
    `;

    activeGrid.insertAdjacentHTML("beforeend", cardHtml);
  });
}

// ═══════════════════════════════════════
// CAROUSEL INTERACTIONS
// ═══════════════════════════════════════

window.changeCardImage = function(cardBtn, direction) {
  const card = cardBtn.closest('.prod-card');
  const prodIdx = parseInt(card.getAttribute('data-prod-idx'));
  const prod = allProducts[prodIdx];
  let currentImgIdx = parseInt(card.getAttribute('data-img-idx'));

  // Calculate wrapped index
  currentImgIdx = (currentImgIdx + direction + prod.images.length) % prod.images.length;
  card.setAttribute('data-img-idx', currentImgIdx);

  // Update card image and active dots
  const img = card.querySelector('.gallery-main-img');
  img.src = prod.images[currentImgIdx];

  const dots = card.querySelectorAll('.gallery-dot');
  dots.forEach((dot, idx) => {
    if (idx === currentImgIdx) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
};

window.setCardImage = function(dotBtn, targetImgIdx) {
  const card = dotBtn.closest('.prod-card');
  card.setAttribute('data-img-idx', targetImgIdx);

  const prodIdx = parseInt(card.getAttribute('data-prod-idx'));
  const prod = allProducts[prodIdx];

  const img = card.querySelector('.gallery-main-img');
  img.src = prod.images[targetImgIdx];

  const dots = card.querySelectorAll('.gallery-dot');
  dots.forEach((dot, idx) => {
    if (idx === targetImgIdx) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
};

// ═══════════════════════════════════════
// PRODUCT TABS TOGGLING
// ═══════════════════════════════════════

window.showSeries = function(category, tabButton) {
  // Update Tab buttons styles
  const buttons = tabButton.parentNode.querySelectorAll(".sn-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });
  tabButton.classList.add("active");
  tabButton.setAttribute("aria-selected", "true");

  // Show corresponding grid panel
  const panels = document.querySelectorAll(".series-panel");
  panels.forEach(panel => panel.classList.remove("active"));

  const targetPanel = document.getElementById(`sp-${category}`);
  if (targetPanel) {
    targetPanel.classList.add("active");
    renderProductGrid(category);
  }
};

// ═══════════════════════════════════════
// DYNAMIC DROPDOWN FOR QUOTE FORM
// ═══════════════════════════════════════

window.updatePitchOptions = function(category) {
  const pitchSelect = document.getElementById("c-pitch");
  if (!pitchSelect) return;

  pitchSelect.innerHTML = "";

  const optionsMap = {
    indoor: [
      { val: "P1.25", label: "MaxPanel P1.25 Fine Pitch (1.25mm)" },
      { val: "P1.53", label: "MaxPanel P1.53 Standard (1.53mm)" },
      { val: "P1.86", label: "MaxPanel P1.86 Lobby Series (1.86mm)" },
      { val: "P2.0", label: "MaxPanel P2.0 High-End Commercial (2.0mm)" },
      { val: "P2.5", label: "MaxPanel P2.5 Commercial Display (2.5mm)" },
      { val: "P3.0", label: "MaxPanel P3.0 Presentation Wall (3.0mm)" }
    ],
    outdoor: [
      { val: "P3.91", label: "DuraPanel Pro P3.91 Outdoor (3.91mm)" },
      { val: "P4.81", label: "DuraPanel Pro P4.81 Mobile (4.81mm)" },
      { val: "P5.0", label: "DuraPanel Pro P5.0 Billboard (5.0mm)" },
      { val: "P6.0", label: "DuraPanel Pro P6.0 Plaza Sign (6.0mm)" },
      { val: "P8.0", label: "DuraPanel Pro P8.0 Expressway (8.0mm)" },
      { val: "P10.0", label: "DuraPanel Pro P10.0 Giant Billboard (10.0mm)" }
    ],
    transparent: [
      { val: "Crystal-3.91", label: "CrystalFilm Window Film (3.91mm)" },
      { val: "Crystal-5.2", label: "CrystalFilm Storefront Film (5.2mm)" },
      { val: "HoloMesh-10.4", label: "HoloMesh Architectural Grid (10.4mm)" },
      { val: "HoloMesh-16", label: "HoloMesh High Facade Grid (16.0mm)" }
    ],
    mobile: [
      { val: "AdPack-4.0", label: "AdPack Smart Delivery Backpack (4.0mm)" },
      { val: "AdBox-5.0", label: "AdBox Mobile Truck Display (5.0mm)" },
      { val: "T-X-3.0", label: "T-X Car Top Dual Display (3.0mm)" }
    ],
    rental: [
      { val: "Rental-2.6", label: "Stage Rental Cabinets (2.6mm)" },
      { val: "Rental-3.91", label: "Event High-Def Cabinets (3.91mm)" },
      { val: "Rental-4.81", label: "Concert Touring Cabinets (4.81mm)" }
    ]
  };

  const list = optionsMap[category] || [];
  list.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt.val;
    o.textContent = opt.label;
    pitchSelect.appendChild(o);
  });
};

// Handle redirection from product card CTA to form
window.requestProductQuote = function(productName) {
  const categorySelect = document.getElementById("c-type");
  const detailsField = document.getElementById("c-desc");

  // Determine category dropdown matching
  if (productName.includes("Indoor") || productName.includes("MaxPanel")) {
    categorySelect.value = "indoor";
  } else if (productName.includes("Outdoor") || productName.includes("DuraPanel")) {
    categorySelect.value = "outdoor";
  } else if (productName.includes("Transparent") || productName.includes("CrystalFilm") || productName.includes("HoloMesh")) {
    categorySelect.value = "transparent";
  } else if (productName.includes("Mobile") || productName.includes("AdPack") || productName.includes("AdBox") || productName.includes("T-X")) {
    categorySelect.value = "mobile";
  } else if (productName.includes("Rental")) {
    categorySelect.value = "rental";
  }

  // Populate dynamic pitch options based on selected category
  updatePitchOptions(categorySelect.value);

  // Focus details field
  detailsField.value = `I am interested in getting a technical specifications sheet and price quote for the "${productName}". Please provide pricing options for size...`;

  // Scroll smoothly to contact form
  scrollToSection("contact");
  detailsField.focus();
};

// ═══════════════════════════════════════
// PROJECT PORTFOLIO GALLERY CONTROLLER
// ═══════════════════════════════════════

// Static Gallery Items mapping
const galleryItems = [
  { src: "assets/images/outdoor_led_screen_1783144365434.jpg", title: "Outdoor Billboard", name: "Delhi-Noida Expressway Highway Billboard", cat: "outdoor" },
  { src: "assets/images/indoor_led_screen_1783144344057.jpg", title: "Corporate Lobby", name: "Mumbai Financial Center Lobby MaxPanel Wall", cat: "indoor" },
  { src: "assets/images/transparent_led_screen_1783144399219.jpg", title: "Retail Storefront", name: "Bangalore Luxury Mall Glass Window Display", cat: "transparent" },
  { src: "assets/images/flexible_led_screen_1783144385351.jpg", title: "Mobile Advertising", name: "Pune City Campaign Mobile Ad Screen", cat: "mobile" },
  { src: "assets/hero_led_wall.png", title: "Stage Event", name: "Hyderabad Music Festival Curved Rental Backdrop", cat: "rental" },
  { src: "assets/lcd_display_panel.png", title: "Command Center", name: "Chennai Safe City Security Control Room Wall", cat: "indoor" }
];

let activeFilteredGallery = [...galleryItems];
let activeLightboxIndex = 0;

window.filterGallery = function(category, filterButton) {
  // Update filter buttons styling
  const buttons = document.querySelectorAll(".gf-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });
  filterButton.classList.add("active");
  filterButton.setAttribute("aria-selected", "true");

  // Show/Hide DOM items based on category attribute
  const items = document.querySelectorAll(".zg-item");
  items.forEach(item => {
    const itemCat = item.getAttribute("data-cat");
    if (category === "all" || itemCat === category) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  // Keep track of active indices for lightbox slide navigations
  activeFilteredGallery = galleryItems.filter(item => category === "all" || item.cat === category);
};

// ═══════════════════════════════════════
// LIGHTBOX CONTROLLER
// ═══════════════════════════════════════

window.openLightbox = function(itemIdx) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");

  // Determine current active item from full list
  const clickedItem = galleryItems[itemIdx];
  // Match inside active filtered list index
  activeLightboxIndex = activeFilteredGallery.findIndex(item => item.name === clickedItem.name);
  if (activeLightboxIndex === -1) activeLightboxIndex = 0;

  const currentItem = activeFilteredGallery[activeLightboxIndex];

  lightboxImg.src = currentItem.src;
  lightboxCaption.textContent = `${currentItem.title} — ${currentItem.name}`;

  // Open modal
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden"; // Freeze scroll

  // Attach keypress listeners
  document.addEventListener("keydown", handleLightboxKeyPress);
};

window.closeLightbox = function() {
  const lightbox = document.getElementById("lightbox");
  lightbox.classList.remove("open");
  document.body.style.overflow = ""; // Restore scroll

  document.removeEventListener("keydown", handleLightboxKeyPress);
};

window.prevLightbox = function() {
  if (activeFilteredGallery.length === 0) return;
  activeLightboxIndex = (activeLightboxIndex - 1 + activeFilteredGallery.length) % activeFilteredGallery.length;
  updateLightboxContent();
};

window.nextLightbox = function() {
  if (activeFilteredGallery.length === 0) return;
  activeLightboxIndex = (activeLightboxIndex + 1) % activeFilteredGallery.length;
  updateLightboxContent();
};

function updateLightboxContent() {
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const item = activeFilteredGallery[activeLightboxIndex];

  lightboxImg.src = item.src;
  lightboxCaption.textContent = `${item.title} — ${item.name}`;
}

function handleLightboxKeyPress(e) {
  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    prevLightbox();
  } else if (e.key === "ArrowRight") {
    nextLightbox();
  }
}

// ═══════════════════════════════════════
// INQUIRY FORM SUBMISSION HANDLER
// ═══════════════════════════════════════

window.handleFormSubmit = function(e) {
  e.preventDefault();

  const form = document.getElementById("quoteForm");
  const successBox = document.getElementById("formSuccessMessage");

  // Fetch form entries
  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    screentype: formData.get("screentype"),
    pixelpitch: formData.get("pixelpitch"),
    details: formData.get("details")
  };

  console.log("Inquiry Submitted successfully:", data);

  // Transition form elements to Success screen
  form.classList.add("hide");
  successBox.classList.add("show");

  // Auto scroll slightly to alignment
  scrollToSection("contact");
};

// ═══════════════════════════════════════
// NAVIGATION & THEME SYSTEM UTILITIES
// ═══════════════════════════════════════

function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");
  const htmlElement = document.documentElement;
  const icon = themeToggle.querySelector("i");

  // Read preferences
  const savedTheme = localStorage.getItem("theme") || "light";
  htmlElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = htmlElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    htmlElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === "dark") {
      icon.className = "fa-solid fa-sun";
      icon.style.color = "#FFD700"; // gold color for sun
    } else {
      icon.className = "fa-solid fa-moon";
      icon.style.color = "var(--text)"; // matching text theme
    }
  }
}

window.scrollToSection = function(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const navHeight = 64;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - navHeight;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
};

// Mobile Navigation Drawer actions
window.toggleDrawer = function() {
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("nav-drawer");
  const isOpen = hamburger.classList.contains("open");

  if (isOpen) {
    hamburger.classList.remove("open");
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  } else {
    hamburger.classList.add("open");
    drawer.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
  }
};

window.closeDrawer = function() {
  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("nav-drawer");

  hamburger.classList.remove("open");
  drawer.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
};

// ═══════════════════════════════════════
// ANIMATIONS & SCROLL OBSERVERS
// ═══════════════════════════════════════

function initSmoothScrolling() {
  // Catch standard anchor tags
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      if (href === "#") return;
      
      const targetId = href.substring(1);
      scrollToSection(targetId);
    });
  });
}

function initScrollObserver() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Apply to all animation elements
  document.querySelectorAll(".step, .why-item, .uc-item, .prod-card, .testi-card, .trust-item").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
    observer.observe(el);
  });

  // Adding visual transition class selector dynamically
  const style = document.createElement("style");
  style.textContent = `
    .step.visible, .why-item.visible, .uc-item.visible, .prod-card.visible, .testi-card.visible, .trust-item.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);
}
