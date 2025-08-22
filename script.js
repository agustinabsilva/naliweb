// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add sparkle effect on hover
document.querySelectorAll('.sparkle').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Carousel functionality
let currentSlide = 0;
const carousel = document.getElementById('carousel');
const dots = document.querySelectorAll('.carousel-dot');
const totalSlides = 6;

function updateCarousel() {
    const isDesktop = window.innerWidth >= 768;
    let translateX;
    
    if (isDesktop) {
        translateX = -currentSlide * 33.33;
    } else {
        translateX = -currentSlide * 100;
    }
    
    carousel.style.transform = `translateX(${translateX}%)`;
    
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove('bg-sage/50');
            dot.classList.add('bg-sage');
        } else {
            dot.classList.remove('bg-sage');
            dot.classList.add('bg-sage/50');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

// Auto-advance carousel
setInterval(nextSlide, 3000);

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
    });
});

// Initialize carousel
updateCarousel();

// Update carousel on window resize
window.addEventListener('resize', updateCarousel);

// Mobile menu functionality
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking a link
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Search functionality
const searchModal = document.getElementById('searchModal');
const closeSearch = document.getElementById('closeSearch');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Get all products when page loads
const products = Array.from(document.querySelectorAll('#productos .grid > div')).map(card => ({
    name: card.querySelector('h4').textContent,
    description: card.querySelector('p').textContent,
    price: card.querySelector('span').textContent,
    image: card.querySelector('img').src
}));

// Open search modal on search icon click
document.querySelectorAll('.text-forest svg').forEach(icon => {
    icon.addEventListener('click', () => {
        searchModal.classList.remove('hidden');
        setTimeout(() => {
            searchInput.focus();
        }, 300);
    });
});

// Close search modal
closeSearch.addEventListener('click', () => {
    searchModal.classList.add('hidden');
});

// Close search modal on outside click
window.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.classList.add('hidden');
    }
});

// Search functionality
searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    searchResults.innerHTML = '';

    if (query.length > 2) {
        const filteredResults = products.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.description.toLowerCase().includes(query)
        );

        if (filteredResults.length === 0) {
            searchResults.innerHTML = `
                <p class="text-center text-moss/90 text-sm py-4">No se encontraron resultados.</p>
            `;
            return;
        }

        filteredResults.forEach(product => {
            const div = document.createElement('div');
            div.classList.add('flex', 'items-center', 'py-4', 'border-b', 'border-sage/10');
            div.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 rounded-full mr-4">
                <div class="flex-1">
                    <p class="text-forest font-light">${product.name}</p>
                    <p class="text-moss/90 text-sm">${product.description}</p>
                    <p class="text-forest mt-1">${product.price}</p>
                </div>
                <button class="bg-sage hover:bg-moss text-cream px-4 py-2 rounded-full transition-all text-sm">
                    Consultar
                </button>
            `;
            searchResults.appendChild(div);
        });
    }
});