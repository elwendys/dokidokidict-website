// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add subtle parallax effect to hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step, .download-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add animate-in class styles dynamically
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Stagger animation for grid items
document.querySelectorAll('.features-grid, .download-cards').forEach(grid => {
    const items = grid.querySelectorAll('.feature-card, .download-card');
    items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});

// Add hover effect sounds (optional, disabled by default)
const enableSounds = false;
if (enableSounds) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            // Could add a subtle hover sound here
        });
    });
}

// Lightbox with arrow navigation
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');

// Build gallery from all clickable images (hero slideshow + feature cards)
const allGalleryImages = [
    ...document.querySelectorAll('.slideshow-slide'),
    ...document.querySelectorAll('.feature-gif img')
];
// Dedupe by src so the same GIF doesn't appear twice
const gallerySrcs = [];
const seen = new Set();
allGalleryImages.forEach(img => {
    if (!seen.has(img.src)) {
        seen.add(img.src);
        gallerySrcs.push(img.src);
    }
});

let lightboxIndex = 0;

function openLightbox(src) {
    lightboxIndex = gallerySrcs.indexOf(src);
    if (lightboxIndex === -1) lightboxIndex = 0;
    lightboxImg.src = src;
    lightbox.classList.add('active');
}

function lightboxGo(direction) {
    lightboxIndex = (lightboxIndex + direction + gallerySrcs.length) % gallerySrcs.length;
    lightboxImg.src = gallerySrcs[lightboxIndex];
}

function closeLightbox() {
    lightbox.classList.remove('active');
}

// Hero slideshow images — click to enlarge
document.querySelectorAll('.slideshow-slide').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => openLightbox(img.src));
});

// Feature card images — click to enlarge
document.querySelectorAll('.feature-gif img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src));
});

// Arrow buttons
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxGo(-1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxGo(1); });

// Close on background click (not on image or arrows)
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxGo(-1);
    if (e.key === 'ArrowRight') lightboxGo(1);
});

// Hero slideshow
const slides = document.querySelectorAll('.slideshow-slide');
const dots = document.querySelectorAll('.slideshow-dot');
const slideshowTitle = document.getElementById('slideshow-title');
let currentSlide = 0;
let slideshowTimer = null;
const SLIDE_INTERVAL = 6000;

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    if (slideshowTitle) {
        slideshowTitle.textContent = dots[currentSlide].dataset.title;
    }
}

function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
}

function startAutoplay() {
    stopAutoplay();
    slideshowTimer = setInterval(nextSlide, SLIDE_INTERVAL);
}

function stopAutoplay() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
    }
}

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.index));
        startAutoplay(); // restart timer so it doesn't jump right after click
    });
});

if (slides.length > 0) {
    startAutoplay();
}

// Console easter egg
console.log('%c🎌 DokiDokiDict', 'font-size: 24px; font-weight: bold; color: #ff6b9d;');
console.log('%cBuilt for immersion learners who want speed and accuracy.', 'font-size: 14px; color: #9090a0;');
console.log('%cCheck out the source: https://github.com/rtr46/dokidoki-dict', 'font-size: 12px; color: #60a5fa;');
