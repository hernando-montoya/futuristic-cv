document.addEventListener('DOMContentLoaded', async () => {
    const data = await Storage.load();
    const langSelector = document.getElementById('lang-selector');

    // Auto-detect language
    const detectLanguage = () => {
        const browserLang = navigator.language.split('-')[0];
        if (['es', 'fr'].includes(browserLang)) {
            return browserLang;
        }
        return 'en';
    };

    let currentLang = detectLanguage();

    // Set selector to detected language
    if (langSelector) {
        langSelector.value = currentLang;

        // Listen for changes
        langSelector.addEventListener('change', (e) => {
            currentLang = e.target.value;
            if (data) Renderer.render(data, currentLang);
        });
    }

    if (data) {
        Renderer.render(data, currentLang);
    } else {
        document.getElementById('app').innerHTML = '<div class="text-red-500 text-center mt-20">CRITICAL ERROR: DATA NOT FOUND</div>';
    }

    // Listen for updates from Admin panel
    window.addEventListener('cv-data-updated', (e) => {
        Renderer.render(e.detail, currentLang);
    });
});
