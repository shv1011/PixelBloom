document.addEventListener('DOMContentLoaded', () => {
    // Unsplash API Configuration
    const UNSPLASH_API_KEY = 'vtujrqL3iVA0pgCQPhNMF8ot0taGhfnjLNQVO0x6m6c';
    const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

    const gallery = document.querySelector('.gallery');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');

    let currentImageIndex = 0;
    let filteredImages = [];
    let currentImages = [];

    // Initial search when page loads
    fetchImages('nature');

    // Search form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            await fetchImages(searchTerm);
        }
    });

    async function fetchImages(query) {
        showLoading(true);
        hideError();

        try {
            const response = await fetch(`${UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&per_page=30`, {
                headers: {
                    'Authorization': `Client-ID ${UNSPLASH_API_KEY}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.results.length === 0) {
                showError('No images found. Try a different search term.');
                return;
            }

            currentImages = data.results;
            displayImages(currentImages);
        } catch (error) {
            showError('Error fetching images. Please try again later.');
            console.error('Error:', error);
        } finally {
            showLoading(false);
        }
    }

    function displayImages(images) {
        gallery.innerHTML = '';
        images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-category', 'all');

            const img = document.createElement('img');
            img.src = image.urls.regular;
            img.alt = image.alt_description || 'Unsplash Image';
            img.loading = 'lazy';

            // Add photographer credit
            const credit = document.createElement('div');
            credit.className = 'image-credit';
            credit.innerHTML = `Photo by <a href="${image.user.links.html}" target="_blank">${image.user.name}</a>`;

            galleryItem.appendChild(img);
            galleryItem.appendChild(credit);
            gallery.appendChild(galleryItem);
        });

        updateFilteredImages();
    }

    // ... rest of your existing code ...

    function showLoading(show) {
        loadingSpinner.classList.toggle('active', show);
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('active');
    }

    function hideError() {
        errorMessage.classList.remove('active');
    }

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            filterImages(category);
        });
    });

    function filterImages(category) {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (category === 'all' || category === itemCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
        updateFilteredImages();
    }

    function updateFilteredImages() {
        filteredImages = Array.from(document.querySelectorAll('.gallery-item')).filter(item => 
            item.style.display !== 'none'
        );
    }

    // Lightbox functionality
    gallery.addEventListener('click', (e) => {
        const clickedItem = e.target.closest('.gallery-item');
        if (clickedItem) {
            const clickedImage = clickedItem.querySelector('img');
            currentImageIndex = filteredImages.indexOf(clickedItem);
            openLightbox(clickedImage.src);
        }
    });

    function openLightbox(imageSrc) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        const nextImage = filteredImages[currentImageIndex].querySelector('img');
        lightboxImg.src = nextImage.src;
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        const prevImage = filteredImages[currentImageIndex].querySelector('img');
        lightboxImg.src = prevImage.src;
    }

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'ArrowRight':
                showNextImage();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });
});