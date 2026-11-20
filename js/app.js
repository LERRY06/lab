
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
