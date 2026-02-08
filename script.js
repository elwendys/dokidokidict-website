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

// Lightbox with arrow navigation (supports both images and videos)
const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');

    // Build gallery from all clickable media (hero slideshow + feature cards)
    const allGalleryMedia = [
        ...document.querySelectorAll('.slideshow-slide'),
        ...document.querySelectorAll('.feature-gif img, .feature-gif video')
    ];
    // Dedupe by src so the same media doesn't appear twice
    const gallerySrcs = [];
    const seen = new Set();
    allGalleryMedia.forEach(el => {
        if (!seen.has(el.src)) {
            seen.add(el.src);
            gallerySrcs.push(el.src);
        }
    });

    let lightboxIndex = 0;

    function isVideo(src) {
        return src.endsWith('.mp4') || src.endsWith('.webm');
    }

    function showLightboxMedia(src) {
        if (isVideo(src)) {
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'block';
            lightboxVideo.src = src;
            lightboxVideo.play();
        } else {
            lightboxVideo.style.display = 'none';
            lightboxVideo.src = '';
            lightboxImg.style.display = 'block';
            lightboxImg.src = src;
        }
    }

    function openLightbox(src) {
        lightboxIndex = gallerySrcs.indexOf(src);
        if (lightboxIndex === -1) lightboxIndex = 0;
        showLightboxMedia(src);
        lightbox.classList.add('active');
    }

    function lightboxGo(direction) {
        lightboxIndex = (lightboxIndex + direction + gallerySrcs.length) % gallerySrcs.length;
        showLightboxMedia(gallerySrcs[lightboxIndex]);
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxVideo.src = '';
    }

    // Hero slideshow media, click to enlarge
    document.querySelectorAll('.slideshow-slide').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => openLightbox(el.src));
    });

    // Feature card media, click to enlarge
    document.querySelectorAll('.feature-gif img, .feature-gif video').forEach(el => {
        el.addEventListener('click', () => openLightbox(el.src));
    });

    // Arrow buttons
    lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxGo(-1); });
    lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxGo(1); });

    // Close on background click (not on media or arrows)
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lightboxGo(-1);
        if (e.key === 'ArrowRight') lightboxGo(1);
    });
}

// Hero slideshow
const slides = document.querySelectorAll('.slideshow-slide');
const dots = document.querySelectorAll('.slideshow-dot');
const slideshowTitle = document.getElementById('slideshow-title');
let currentSlide = 0;
let slideshowTimer = null;
const SLIDE_INTERVAL = 6000;

if (slides.length > 0 && dots.length > 0) {
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
            startAutoplay();
        });
    });

    startAutoplay();
}
