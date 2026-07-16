const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

// Check localStorage for saved theme, default to light
const savedTheme = localStorage.getItem('zorko-theme') || 'white';
htmlEl.setAttribute('data-theme', savedTheme);

if(themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('zorko-theme', newTheme);
  });
}

// --- Navigation & Scroll ---
function scrollToSection(id){
  const el=document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

function toggleDrawer(){
  document.getElementById('nav-drawer').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}
function closeDrawer(){
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}
document.addEventListener('click',function(e){
  const drawer=document.getElementById('nav-drawer');
  const burger=document.getElementById('hamburger');
  if(drawer&&drawer.classList.contains('open')&&!drawer.contains(e.target)&&!burger.contains(e.target)) closeDrawer();
});

// --- Product Database ---
const productDB = {
  flagship:[
    {name:"DIE-CASTING Cabinet LED Display Screen",series:"FLAGSHIP DIE-CAST",desc:"All-in-one indoor LED poster with die-cast aluminum cabinet. Plug-and-play, rear service, ultra-slim bezel.",env:"indoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558313/DIE-CASTING_Cabinet_LED_Display_Screen_zagwpg.webp","https://res.cloudinary.com/deb6oiddj/image/upload/v1778486940/ChatGPT_Image_May_11_2026_01_38_49_PM_vk2ubv.png"],
    specs:[
["Cabinet Material","Die-Cast Aluminum"],
["Cabinet Size","576 × 576 mm"],
["Supported Pixel Pitch","P1.25 / P1.53 / P1.86 / P2 / P2.5"],
["Maintenance","Front & Rear Service"],
]
    
    },
    {name:"640x640mm Indoor Die Cast Cabinet",series:"FLAGSHIP DIE-CAST",desc:"Premium die-cast cabinet for seamless indoor video walls. Ultra-high refresh rate, flicker-free performance.",env:"indoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780557987/640x640mm_Indoor_Die_Cast_LED_Cabinet_spgvlv.webp","https://5.imimg.com/data5/YZ/MA/VM/SELLER-72742084/p3-91-p3-p4-10ft-x-12ft-500x500.jpg"],
    specs:[
["Cabinet Material","Die-Cast Aluminum"],
["Cabinet Size","640 × 640 mm"],
["Supported Pixel Pitch","P2.5 / P3 / P4 / P5 / P6"],
["Maintenance","Front & Rear Service"],
]
    },
    {name:"960x960 mm Outdoor Die Cast Cabinet",series:"FLAGSHIP OUTDOOR",desc:"Rugged outdoor die-cast cabinet, IP65 rated. Exceptional heat dissipation and all-weather reliability.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558088/960x960_mm_LED_video_wall_Die_Cast_Cabinets_zufppq.webp","https://s.alicdn.com/@sc04/kf/H2c41a16ce2a54f359dd749434cd1938aa/Factory-Wholesale-Price-of-Die-cast-Magnesium-Alloy-960-960-Led-Display-Cabinet-for-P1.8-P2-P2.5-P3-P4-P5-P6-P8-P10-Led-Module.jpg_300x300.jpg"],
  specs:[
["Cabinet Material","Die-Cast Aluminum"],
["Cabinet Size","960 × 960 mm"],
["Supported Pixel Pitch","P2.5 / P3 / P3.076 / P4 / P5 / P6 / P6.67 / P8 / P10"],
["Maintenance","Rear Service"],
]
},
    {name:"Outdoor P4.44 4K LED Display",series:"ULTRA BRIGHT",desc:"8000 nits, IP67, 16-bit color depth. Sunlight readable, perfect for high-impact outdoor advertising.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558596/Outdoor_Fixed_Installation_P4.44_4K_LED_Display_5500-8000nits_High_Brightness_IP66_Waterproof_16-Bit_Color_Sunlight_Readable_tcv14w.avif","https://tiimg.tistatic.com/fp/1/002/451/outdoor-p6-25-led-display-screen-die-casting-cabinet-879.jpg"],
    specs:[
["Pixel Pitch","P4.44"],
["Cabinet Material","Die-Cast Aluminum"],
["Brightness","≥7000 nits"],
["Refresh Rate","≥3840 Hz"],
["Protection Rating","IP66"],
["Life Span","100,000 hrs"]
]
  },
    {name:"960x960 mm Iron Cabinet",series:"FLAGSHIP OUTDOOR",desc:"Rugged outdoor iron cabinet built for heavy-duty billboard and stadium deployments.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1779340158/Iron_Cabinet_zsjulo.webp","https://res.cloudinary.com/deb6oiddj/image/upload/v1779340462/Irno-2_wxaxop.webp"],specs:[["Pixel Pitch","P2.5 / P3 / P4 / P6.67 / P8 / P10"],["Brightness","≥5500 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"], ["Cabinet Material","Iron"]]}
  ],
  indoor:[
    {name:"MaxPanel Series",series:"HX-IFMP",desc:"Ideal for large indoor screens. Die-cast aluminum cabinet, rear service, 3840Hz refresh.",env:"indoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558564/MAXPANEL_SERIES_ha8wbs.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778485784/ChatGPT_Image_May_11_2026_01_19_33_PM_nwagbl.png"],specs:[["Pixel Pitch","P2.5 / P3 / P4"],["Brightness","≥800 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"LatticeStrip Series",series:"HX-TPLS",desc:"Cost-effective transparent strip display. Perfect for retail facades.",env:"both",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558528/LATTICESTRIP_uvaswb.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778480643/ChatGPT_Image_May_11_2026_11_53_46_AM_thvbdn.png"],specs:[["Pixel Pitch","P3.91 / P7.82 / P10.4 / P15.6"],["Brightness","2000–4500 nits"],["Refresh Rate","≥1920 Hz"],["Life Span","100,000 hrs"]]},
    {name:"VersaPoster 640",series:"ALL-IN-ONE",desc:"Plug-and-play indoor LED poster. Control via phone/PC, solo or video wall.",env:"indoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558722/VersaPoster_640_600_zqffrd.png","https://sightled.com/wp-content/uploads/2025/03/LED-poster-3.jpg"],specs:[["Pixel Pitch","P1.86 / P2 / P2.5"],["Brightness","≥600 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]}
  ],
  outdoor:[
    {name:"DuraPanel Pro 960 outdoor LED display screen",series:"HX-OFDP",desc:"Premium fan-less outdoor display, IP66, 5500+ nits. Built for billboards & stadiums.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558465/DuraPanel_q2ezuj.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778481918/ChatGPT_Image_May_11_2026_12_11_33_PM_mc0oph.png"],specs:[["Pixel Pitch","P3 / P4 / P5 / P6 / P8 / P10"],["Brightness","≥5500 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"DuraMini Series",series:"FLIP CHIP",desc:"Ultra-fine pitch outdoor display using Flip Chip LED technology. 160° viewing angle.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558417/DuraMini_Series_sedxmn.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778483553/ChatGPT_Image_May_11_2026_12_42_18_PM_mtigpo.png"],specs:[["Pixel Pitch","P1.25 / P1.56 / P1.87"],["Brightness","≥3000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"StreetView Series",series:"OUTDOOR POSTER",desc:"Fine-pitch outdoor LED poster. Superior to LCD in brightness & color.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558649/StreetView_d6aqp7.png","https://www.staietech.com/wp-content/uploads/2024/11/Digital-Standee-on-Rent-1-1024x1024.jpg"],specs:[["Pixel Pitch","P1.38 / P1.56 / P1.86 / P2.5 / P3.07"],["Brightness","≥4000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]}
  ],
  transparent:[
    {name:"CrystalFilm transparent LED display for glass facades",series:"GLASS FILM",desc:"Applied directly onto glass. Chip-on-board, ultra-low power ≤45W/m².",env:"both",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558259/CrystalFilm_Series_mmezuv.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778482276/ChatGPT_Image_May_11_2026_12_21_06_PM_1_lxydgo.png"],specs:[["Pixel Pitch","P3.75 / P5 / P6.25 / P10"],["Brightness","≥3000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"HoloMesh Series",series:"3D TRANSPARENT",desc:"95% transparency, stunning 3D visual effects. 7000+ nits brightness.",env:"both",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780559198/HoloMesh_Series_dabsyw.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778481298/Screenshot_2026-05-11_120445_nwqkfw.png"],specs:[["Pixel Pitch","P3.91 / P7.82 / P10.4 / P15.6"],["Brightness","≥7000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"GlassView Series",series:"GLASS SCREEN",desc:"Transparent glass screen with 8GB storage + 4G connectivity.",env:"both",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558500/Glassview_xr7es7.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1778484228/ChatGPT_Image_May_11_2026_12_53_00_PM_bxc6iu.png"],specs:[["Pixel Pitch","P3.91 / P6.25"],["Brightness","≥4000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]}
  ],
  mobile:[
    {name:"AdPack Series",series:"DELIVERY BAG",desc:"World's first full-color delivery bag LED display. 4G GPS + Bluetooth.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1778484785/ChatGPT_Image_May_11_2026_01_02_53_PM_xknuiq.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1780558194/AdPack_lqpyhk.png"],specs:[["Pixel Pitch","P2.5 / P4 / P4.17"],["Brightness","≥6000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"AdBox Series",series:"3-SIDED BOX",desc:"Three-sided delivery box display. Remote content management.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1778484421/Screenshot_2026-05-11_125653_akk6ie.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1780558158/AdBox_sg7s0q.png"],specs:[["Pixel Pitch","P2.5 / P4 / P4.17"],["Brightness","≥6000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"T-X Car Top Series",series:"CAR TOP",desc:"World's first fine-pitch car top LED display. Double-sided, 170° view.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1778485231/ChatGPT_Image_May_11_2026_01_10_20_PM_lirzg3.png","https://res.cloudinary.com/deb6oiddj/image/upload/v1780558649/StreetView_d6aqp7.png"],specs:[["Pixel Pitch","P1.86 / P2.5 / P3.07"],["Brightness","≥4000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]}
  ],
  poster:[
    {name:"VersaPoster 640",series:"INDOOR POSTER",desc:"Plug-and-play LED poster, iron cabinet, rear service.",env:"indoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558722/VersaPoster_640_600_zqffrd.png","https://sightled.com/wp-content/uploads/2025/03/LED-poster-3.jpg"],specs:[["Pixel Pitch","P1.86 / P2 / P2.5"],["Brightness","≥600 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]},
    {name:"StreetView Series",series:"OUTDOOR POSTER",desc:"All-weather outdoor LED poster, IP65 rated, 4000 nits.",env:"outdoor",images:["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558649/StreetView_d6aqp7.png","https://www.staietech.com/wp-content/uploads/2024/11/Digital-Standee-on-Rent-1-1024x1024.jpg"],specs:[["Pixel Pitch","P1.38 / P1.56 / P1.86 / P2.5 / P3.07"],["Brightness","≥4000 nits"],["Refresh Rate","≥3840 Hz"],["Life Span","100,000 hrs"]]}
  ]
};

// --- Product Rendering ---
function buildGalleryCard(product,idx,categoryId){
  const envClass=product.env==='indoor'?'env-indoor':(product.env==='outdoor'?'env-outdoor':'env-both');
  const envLabel=product.env==='indoor'?'Indoor':(product.env==='outdoor'?'Outdoor':'Indoor / Outdoor');
  const images=product.images||["https://res.cloudinary.com/deb6oiddj/image/upload/v1780558564/MAXPANEL_SERIES_ha8wbs.png"];
  let specsHtml='';
  product.specs.forEach(s=>{specsHtml+=`<div class="spec-item"><div class="spec-k">${s[0]}</div><div class="spec-v">${s[1]}</div></div>`;});
  const cardId=`prod_${categoryId}_${idx}`;
  return `<div class="prod-card" data-cardid="${cardId}">
    <span class="pc-env ${envClass}">${envLabel}</span>
    <div class="product-gallery" id="gallery-${cardId}">
      <button class="gallery-arrow arrow-left" data-gallery="${cardId}">‹</button>
      <div class="gallery-main"><img class="gallery-main-img" src="${images[0]}" alt="${product.name}" loading="lazy"></div>
      <button class="gallery-arrow arrow-right" data-gallery="${cardId}">›</button>
      <div class="gallery-dots" id="dots-${cardId}"></div>
    </div>
    <div class="pc-body">
      <div class="pc-series">${product.series}</div>
      <div class="pc-name">${product.name}</div>
      <div class="pc-desc">${product.desc}</div>
      <div class="pc-specs">${specsHtml}</div>
      <button class="pc-cta" onclick="scrollToSection('contact')">Enquire Now</button>
    </div>
  </div>`;
}

function renderCategory(containerId,productsArray,categoryId){
  const container=document.getElementById(containerId);
  if(!container)return;
  let html='';
  productsArray.forEach((prod,idx)=>{html+=buildGalleryCard(prod,idx,categoryId);});
  container.innerHTML=html;
  productsArray.forEach((prod,idx)=>{
    const cardId=`prod_${categoryId}_${idx}`;
    const images=prod.images||[];
    if(images.length<=1)return;
    const galleryDiv=document.getElementById(`gallery-${cardId}`);
    if(!galleryDiv)return;
    const mainImg=galleryDiv.querySelector('.gallery-main-img');
    const leftBtn=galleryDiv.querySelector('.arrow-left');
    const rightBtn=galleryDiv.querySelector('.arrow-right');
    const dotsContainer=document.getElementById(`dots-${cardId}`);
    if(!mainImg||!leftBtn||!rightBtn)return;
    let currentIndex=0;
    if(dotsContainer){
      dotsContainer.innerHTML='';
      for(let i=0;i<images.length;i++){
        const dot=document.createElement('button');
        dot.classList.add('gallery-dot');
        if(i===0)dot.classList.add('active');
        dot.addEventListener('click',(e)=>{e.stopPropagation();currentIndex=i;mainImg.src=images[currentIndex];updateDotsActive(dotsContainer,currentIndex);});
        dotsContainer.appendChild(dot);
      }
    }
    const updateDotsActive=(c,a)=>{c.querySelectorAll('.gallery-dot').forEach((d,i)=>{if(i===a)d.classList.add('active');else d.classList.remove('active');});};
    leftBtn.addEventListener('click',(e)=>{e.stopPropagation();currentIndex=(currentIndex-1+images.length)%images.length;mainImg.src=images[currentIndex];if(dotsContainer)updateDotsActive(dotsContainer,currentIndex);});
    rightBtn.addEventListener('click',(e)=>{e.stopPropagation();currentIndex=(currentIndex+1)%images.length;mainImg.src=images[currentIndex];if(dotsContainer)updateDotsActive(dotsContainer,currentIndex);});
    /* Touch swipe support */
    let touchStartX=0;
    galleryDiv.addEventListener('touchstart',(e)=>{touchStartX=e.touches[0].clientX;},{passive:true});
    galleryDiv.addEventListener('touchend',(e)=>{
      const diff=touchStartX-e.changedTouches[0].clientX;
      if(Math.abs(diff)>40){
        currentIndex=diff>0?(currentIndex+1)%images.length:(currentIndex-1+images.length)%images.length;
        mainImg.src=images[currentIndex];
        if(dotsContainer)updateDotsActive(dotsContainer,currentIndex);
      }
    },{passive:true});
  });
}

function initAllProducts(){
  renderCategory('flagshipGrid',productDB.flagship,'flagship');
  renderCategory('indoorGrid',productDB.indoor,'indoor');
  renderCategory('outdoorGrid',productDB.outdoor,'outdoor');
  renderCategory('transparentGrid',productDB.transparent,'transparent');
  renderCategory('mobileGrid',productDB.mobile,'mobile');
  renderCategory('posterGrid',productDB.poster,'poster');
}

function showSeries(id,btn){
  document.querySelectorAll('.series-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sn-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('sp-'+id).classList.add('active');
  btn.classList.add('active');
}

/* ── ZORKO GALLERY ── */
const galleryItems=[
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1784196161/b239wlligi3vebttoqyo.jpg",cat:"Outdoor",label:"Outdoor · DOOH",name:"Die-Cast Cabinet Series",wide:true},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1784196326/sjelfpugyv3nzhzjpeta.jpg",cat:"outdoor",label:"Outdoor · DOOH",name:"960×960 Die-Cast"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1784196388/aww9tviijlzprum3c2rw.jpg",cat:"outdoor",label:"outdoor · Cafe",name:"HoloMesh 3D"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778482276/ChatGPT_Image_May_11_2026_12_21_06_PM_1_lxydgo.png",cat:"transparent",label:"Transparent · Glass",name:"CrystalFilm",wide:true},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778481235/Screenshot_2026-05-11_120345_advqru.png",cat:"mobile",label:"Mobile · Delivery",name:"AdPack Delivery Bag"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778482388/ChatGPT_Image_May_11_2026_12_22_57_PM_adlyta.png",cat:"mobile",label:"Mobile · Car Top",name:"T-X Car Top"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778481918/ChatGPT_Image_May_11_2026_12_11_33_PM_mc0oph.png",cat:"outdoor",label:"Outdoor · Billboard",name:"DuraPanel Pro 960 outdoor LED display screen for billboards",wide:true},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778482098/ChatGPT_Image_May_11_2026_12_18_01_PM_sqktbv.png",cat:"mobile",label:"Mobile · Box",name:"AdBox 3-Sided"},
  {src:"https://sightled.com/wp-content/uploads/2025/03/LED-poster-3.jpg",cat:"indoor",label:"Indoor · Poster",name:"VersaPoster 640"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778483553/ChatGPT_Image_May_11_2026_12_42_18_PM_mtigpo.png",cat:"outdoor",label:"Outdoor · Fine-Pitch",name:"DuraMini Series"},
  {src:"https://res.cloudinary.com/deb6oiddj/image/upload/v1778480643/ChatGPT_Image_May_11_2026_11_53_46_AM_thvbdn.png",cat:"indoor",label:"Indoor · Strip",name:"LatticeStrip Series"}
];

let lbCurrent=0,lbFiltered=[];

function buildGalleryGrid(filter='all'){
  const grid=document.getElementById('zorkoGalleryGrid');
  lbFiltered=filter==='all'?galleryItems:galleryItems.filter(i=>i.cat===filter);
  const isMobile=window.innerWidth<=600;
  let html='';
  lbFiltered.forEach((item,idx)=>{
    const wideCls=(!isMobile&&item.wide)?' wide':'';
    const tallCls=(!isMobile&&item.tall)?' tall':'';
    html+=`<div class="zg-item${wideCls}${tallCls}" onclick="openLb(${idx})">
      <img src="${item.src}" alt="${item.name}" loading="lazy">
      <div class="zg-overlay">
        <div class="zg-label">${item.label}</div>
        <div class="zg-name">${item.name}</div>
      </div>
    </div>`;
  });
  grid.innerHTML=html;
}

function filterGallery(cat,btn){
  document.querySelectorAll('.gf-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  buildGalleryGrid(cat);
}

function openLb(idx){
  lbCurrent=idx;
  document.getElementById('lb-img').src=lbFiltered[idx].src;
  document.getElementById('lb-caption').textContent=lbFiltered[idx].name+' · '+lbFiltered[idx].label;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow='hidden';
}

function closeLb(){
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow='';
}

function closeLightbox(e){
  if(e.target===document.getElementById('lightbox')) closeLb();
}

function lbNav(dir){
  lbCurrent=(lbCurrent+dir+lbFiltered.length)%lbFiltered.length;
  document.getElementById('lb-img').src=lbFiltered[lbCurrent].src;
  document.getElementById('lb-caption').textContent=lbFiltered[lbCurrent].name+' · '+lbFiltered[lbCurrent].label;
}

/* Lightbox swipe */
let lbTouchX=0;
const lightboxEl = document.getElementById('lightbox');
if (lightboxEl) {
  lightboxEl.addEventListener('touchstart',e=>{lbTouchX=e.touches[0].clientX;},{passive:true});
  lightboxEl.addEventListener('touchend',e=>{
    const diff=lbTouchX-e.changedTouches[0].clientX;
    if(Math.abs(diff)>50) lbNav(diff>0?1:-1);
  },{passive:true});
}

document.addEventListener('keydown',function(e){
  const lb=document.getElementById('lightbox');
  if(!lb || !lb.classList.contains('open'))return;
  if(e.key==='Escape') closeLb();
  if(e.key==='ArrowRight') lbNav(1);
  if(e.key==='ArrowLeft') lbNav(-1);
});

/* Rebuild gallery on resize to fix wide spans on mobile */
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    const activeFilter=document.querySelector('.gf-btn.active');
    if(activeFilter) buildGalleryGrid(activeFilter.textContent.toLowerCase().trim()==='all'?'all':activeFilter.dataset.cat||'all');
  },200);
});

/* ── FORM ── */
function submitZorko(){
  const name=document.getElementById('f-name').value.trim();
  const phone=document.getElementById('f-phone').value.trim();
  const interest=document.getElementById('f-interest').value;
  if(!name){alert('Please enter your name.');return;}
  if(!phone){alert('Please enter your phone number.');return;}
  if(!interest){alert("Please select what you're interested in.");return;}
  document.getElementById('zorko-form').style.display='none';
  document.getElementById('form-success').classList.add('show');
}

/* ── INIT ── */
window.addEventListener('DOMContentLoaded',()=>{
  initAllProducts();
  buildGalleryGrid('all');
});