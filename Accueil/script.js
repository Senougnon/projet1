document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContent = document.getElementById('page-content');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    let isDarkMode = localStorage.getItem('darkMode') === 'true';

    // Appliquer le thème enregistré
    applyTheme();

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const pageUrl = this.dataset.page; // Utilisez data-page comme URL

            // Mettre à jour la classe active
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            loadPage(pageUrl);
        });
    });

    function loadPage(pageUrl) {
        if (!pageUrl) return;

        // Utiliser un iframe pour charger la page web
        pageContent.innerHTML = `<iframe src="${pageUrl}" width="100%" height="100%" frameborder="0"></iframe>`;
    }

    toggleThemeBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode);
        applyTheme();
    });

    function applyTheme() {
        document.body.classList.toggle('dark-mode', isDarkMode);
        toggleThemeBtn.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
});