/* ========== Helpers ========== */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
const debounce = (fn, ms = 200) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* ========== Smooth scrolling ========== */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ========== Sparkle hover ========== */
$$('.sparkle').forEach(card => {
  card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
  card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
});

/* ========== Carrusel: “Nuevos Ingresos” ========== */
const carousel = $('#carousel');
const dots = $$('.carousel-dot');
let currentIndex = 0;

function visiblePerView() {
  // md breakpoint ~768px: en desktop queremos mostrar 3 por vista, en mobile 1
  return window.matchMedia('(min-width: 768px)').matches ? 3 : 1;
}

function slideTo(index) {
  if (!carousel) return;
  const items = $$('.carousel-item', carousel);
  if (items.length === 0) return;

  const perView = visiblePerView();
  const maxIndex = Math.max(0, items.length - perView);

  currentIndex = Math.max(0, Math.min(index, maxIndex));

  // ancho real del primer item (incluye padding horizontal de px-4)
  const itemWidth = items[0].getBoundingClientRect().width;
  const offset = -(currentIndex * itemWidth);

  carousel.style.transform = `translateX(${offset}px)`;
  carousel.style.transition = 'transform 500ms ease-in-out';

  // Dots activos por “página”, no por item
  dots.forEach((d, i) => {
    const active = i === currentIndex;
    d.classList.toggle('bg-sage', active);
    d.classList.toggle('bg-sage/30', !active);
  });
}

// Dots → ir a esa “página”
dots.forEach((d, i) => d.addEventListener('click', () => slideTo(i)));

// Auto-advance por “página”
let autoTimer = null;
function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => {
    const items = $$('.carousel-item', carousel);
    if (items.length === 0) return;
    const perView = visiblePerView();
    const maxIndex = Math.max(0, items.length - perView);
    const next = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    slideTo(next);
  }, 3000);
}
function stopAuto() { if (autoTimer) clearInterval(autoTimer); }

window.addEventListener('resize', () => slideTo(currentIndex));
requestAnimationFrame(() => { slideTo(0); startAuto(); });

/* ========== Menú mobile ========== */
const mobileMenuButton = $('#mobile-menu-button');
const mobileMenu = $('#mobile-menu');
if (mobileMenuButton && mobileMenu) {
  mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  // cerrar al elegir link
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));
}

/* ========== Modal de búsqueda ========== */
const searchModal = $('#searchModal');
const closeSearch = $('#closeSearch');
const searchInput = $('#searchInput');
const searchResults = $('#searchResults');
const openSearchBtns = $$('.open-search');

function openSearch() {
  if (!searchModal) return;
  searchModal.classList.remove('hidden');
  setTimeout(() => searchInput && searchInput.focus(), 50);
}
function hideSearch() {
  if (!searchModal) return;
  searchModal.classList.add('hidden');
  if (searchInput) searchInput.value = '';
  if (searchResults) searchResults.innerHTML = '';
}

openSearchBtns.forEach(btn => btn.addEventListener('click', openSearch));
closeSearch && closeSearch.addEventListener('click', hideSearch);

// cerrar si clickeás el overlay (el propio modal es el overlay)
searchModal && searchModal.addEventListener('click', (e) => {
  if (e.target === searchModal) hideSearch();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideSearch(); });

/* ========== Indexado de productos (nuevos + favoritos) ========== */
// Toma tarjetas del grid de “Productos” y del carrusel “Nuevos”
function collectProducts() {
  const list = [];

  // Productos (grid)
  $$('#productos .grid > div').forEach(card => {
    const h4 = $('h4', card);
    const p = $('p', card);
    const price = $('span.text-xl', card);
    const img = $('img', card);
    if (h4 && p && price && img) {
      list.push({
        name: h4.textContent.trim(),
        description: p.textContent.trim(),
        price: price.textContent.trim(),
        image: img.getAttribute('src') || ''
      });
    }
  });

  // Nuevos (carrusel)
  $$('#nuevos .carousel-item').forEach(card => {
    const h4 = $('h4', card);
    const p = $('p', card);
    const price = $('span.text-xl', card);
    const img = $('img', card);
    if (h4 && p && price && img) {
      list.push({
        name: h4.textContent.trim(),
        description: p.textContent.trim(),
        price: price.textContent.trim(),
        image: img.getAttribute('src') || ''
      });
    }
  });

  return list;
}
let products = collectProducts();

/* ========== Búsqueda local con debounce ========== */
const renderResults = (arr) => {
  if (!searchResults) return;
  if (arr.length === 0) {
    searchResults.innerHTML = `<p class="text-center text-moss/90 text-sm py-4">No se encontraron resultados.</p>`;
    return;
    }
  searchResults.innerHTML = arr.map(prod => `
    <div class="flex items-center py-4 border-b border-sage/10">
      <img src="${prod.image}" alt="${prod.name}" class="w-16 h-16 rounded-full mr-4">
      <div class="flex-1">
        <p class="text-forest font-light">${prod.name}</p>
        <p class="text-moss/90 text-sm">${prod.description}</p>
        <p class="text-forest mt-1">${prod.price}</p>
      </div>
      <button class="bg-sage hover:bg-moss text-cream px-4 py-2 rounded-full transition-all text-sm">Consultar</button>
    </div>
  `).join('');
};

if (searchInput) {
  const onSearch = debounce(() => {
    const q = (searchInput.value || '').toLowerCase().trim();
    if (q.length <= 2) { searchResults.innerHTML = ''; return; }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
    renderResults(filtered);
  }, 180);
  searchInput.addEventListener('input', onSearch);
}

/* ========== Recolectar de nuevo al redimensionar (por si cambia el DOM) ========== */
window.addEventListener('resize', () => { products = collectProducts(); });
