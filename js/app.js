
const wrapper = document.querySelector(".wrapper");
const toggleButton = document.getElementById("toggleSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

// Sidebar collapse / expand
toggleButton.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
        wrapper.classList.toggle("mobile-open");
    } else {
        wrapper.classList.toggle("collapsed");
    }
});

// Close mobile sidebar
sidebarOverlay.addEventListener("click", () => {
    wrapper.classList.remove("mobile-open");
});

// Submenus
document.querySelectorAll(".has-submenu > a").forEach(link => {

    link.addEventListener("click", event => {
        event.preventDefault();

        link.parentElement.classList.toggle("open");
    });

});

// Active menu and iframe navigation
document.querySelectorAll(
    '.sidebar-menu a[target="contentFrame"]'
).forEach(link => {

    link.addEventListener("click", () => {

        // Remove previous active state
        document.querySelectorAll(".menu-item").forEach(item => {
            item.classList.remove("active");
        });

        // Activate clicked menu item
        const parent = link.closest(".menu-item");

        if (parent) {
            parent.classList.add("active");

            // Keep parent submenu open
            const submenuParent = parent.closest(".has-submenu");

            if (submenuParent) {
                submenuParent.classList.add("open");
            }
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            wrapper.classList.remove("mobile-open");
        }

    });

});

// Search menu
const searchInput = document.querySelector(".sidebar-search input");

searchInput.addEventListener("input", () => {

    const search = searchInput.value.toLowerCase().trim();

    document.querySelectorAll(".menu-item").forEach(item => {

        const matches = item.textContent.toLowerCase().includes(search);

        item.style.display = matches ? "" : "none";

        if (item.classList.contains("has-submenu")) {
            if (search && matches) {
                item.classList.add("open");
            } else if (!search) {
                item.classList.remove("open");
            }
        }

    });

});


// =====================================
// URL ROUTING FOR IFRAME APPLICATIONS
// =====================================

const contentFrame = document.getElementById('contentFrame');

const routeMap = {
    '/dashboard': 'pages/dashboard.html',
    '/tasks': 'apps/to-do-list/index.html',
    '/excel-to-word': 'apps/excel-to-word/index.html',
    '/employees': 'apps/word-register/dist/employees.html',
    '/add-employee': 'apps/word-register/dist/add-employee.html',
    '/educations': 'apps/word-register/dist/additional-data.html',
    '/training-type': 'apps/word-register/dist/training-type.html',
    '/word-register': 'apps/word-register/dist/word-register.html',
    '/bulls-and-cows': 'apps/bulls-and-cows/index.html',
};

// Зареждане на приложение
function loadRoute(route, updateHistory = true) {

    const file = routeMap[route];

    if (!file) return;

    contentFrame.src = file;

    if (updateHistory) {
        history.pushState({ route }, '', route);
    }

    // Активно меню
    document.querySelectorAll('[data-route]').forEach(link => {
        link.classList.toggle(
            'active',
            link.dataset.route === route
        );
    });
}

// Клик върху меню
document.querySelectorAll('[data-route]').forEach(link => {

    link.addEventListener('click', function(event) {

        event.preventDefault();

        const route = this.dataset.route;

        loadRoute(route);

    });

});

// Back / Forward в браузъра
window.addEventListener('popstate', function() {

    const route = location.pathname;

    loadRoute(route, false);

});

// Директно отваряне на URL
const initialRoute = routeMap[location.pathname]
    ? location.pathname
    : '/dashboard';

loadRoute(initialRoute, false);