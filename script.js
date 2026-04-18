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


// Feature cards, steps, download cards, philosophy stats — no fade-in animations.
// Content is immediately visible on scroll.

// Lazy-load feature card videos: only play when visible, pause when not
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            video.play();
        } else {
            video.pause();
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.feature-gif video').forEach(video => {
    video.pause(); // Pause all feature videos initially
    videoObserver.observe(video);
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
        // Pause the old slide's video
        if (slides[currentSlide].tagName === 'VIDEO') {
            slides[currentSlide].pause();
        }
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        // Play the new slide's video
        if (slides[currentSlide].tagName === 'VIDEO') {
            slides[currentSlide].play();
        }
        if (slideshowTitle) {
            slideshowTitle.textContent = dots[currentSlide].dataset.title;
        }
    }

    // Pause all non-active slideshow videos on load
    slides.forEach((slide, i) => {
        if (i !== 0 && slide.tagName === 'VIDEO') {
            slide.pause();
        }
    });

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
