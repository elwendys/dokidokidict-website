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

function playVideo(video) {
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(() => {
            // Playback can be interrupted normally when the slideshow advances
            // or an observed video leaves the viewport.
        });
    }
}

// Lazy-load feature card videos: only play when visible, pause when not
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            playVideo(video);
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

    // Build gallery from all clickable media
    const allGalleryMedia = [
        ...document.querySelectorAll('.slideshow-slide'),
        ...document.querySelectorAll('.recommender-preview img'),
        ...document.querySelectorAll('.feature-gif img, .feature-gif video'),
        ...document.querySelectorAll('.article-figure img')
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

    function resetLightboxZoom() {
        lightbox.classList.remove('zoomed');
        lightbox.scrollLeft = 0;
        lightbox.scrollTop = 0;
        lightboxImg.setAttribute('aria-label', 'View figure at full resolution');
    }

    function showLightboxMedia(src) {
        resetLightboxZoom();
        if (isVideo(src)) {
            lightboxImg.style.display = 'none';
            lightboxVideo.style.display = 'block';
            lightboxVideo.src = src;
            playVideo(lightboxVideo);
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
        resetLightboxZoom();
        lightboxVideo.src = '';
    }

    function toggleLightboxZoom(event) {
        if (lightboxImg.style.display === 'none') return;

        if (lightbox.classList.contains('zoomed')) {
            resetLightboxZoom();
            return;
        }

        const fittedRect = lightboxImg.getBoundingClientRect();
        const focusX = event.clientX || fittedRect.left + fittedRect.width / 2;
        const focusY = event.clientY || fittedRect.top + fittedRect.height / 2;
        const ratioX = Math.max(0, Math.min(1, (focusX - fittedRect.left) / fittedRect.width));
        const ratioY = Math.max(0, Math.min(1, (focusY - fittedRect.top) / fittedRect.height));

        lightbox.classList.add('zoomed');
        lightboxImg.setAttribute('aria-label', 'Fit figure to screen');
        requestAnimationFrame(() => {
            lightbox.scrollLeft = lightboxImg.offsetLeft
                + ratioX * lightboxImg.offsetWidth
                - focusX;
            lightbox.scrollTop = lightboxImg.offsetTop
                + ratioY * lightboxImg.offsetHeight
                - focusY;
        });
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

    // Analysis figures, click or press Enter/Space to enlarge
    document.querySelectorAll('.article-figure img').forEach(el => {
        el.tabIndex = 0;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Enlarge figure: ${el.alt}`);
        el.addEventListener('click', () => openLightbox(el.src));
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(el.src);
            }
        });
    });

    document.querySelectorAll('.recommender-preview').forEach(button => {
        const preview = button.querySelector('img');
        if (preview) {
            button.addEventListener('click', () => openLightbox(preview.src));
        }
    });

    lightboxImg.tabIndex = 0;
    lightboxImg.setAttribute('role', 'button');
    lightboxImg.addEventListener('click', toggleLightboxZoom);
    lightboxImg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleLightboxZoom(e);
        }
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
            playVideo(slides[currentSlide]);
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
