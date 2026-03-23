// Theme
document.getElementById("darkModeBtn")?.addEventListener("click", toggleDarkMode);

function applyTheme(theme) {
    const html = document.documentElement;
    const icon = document.getElementById("darkModeBtn")?.querySelector('i');

    html.dataset.bsTheme = theme;

    if (theme === "dark") {
        if (icon) icon.classList.replace("bi-sun-fill", "bi-moon-fill");
    } else {
        if (icon) icon.classList.replace("bi-moon-fill", "bi-sun-fill");
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.dataset.bsTheme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
}

// Language
function getBasePath() {
    if (window.location.pathname.includes("/portfolio/")) {
        return "../../";
    }
    return "./";
}

let currentTranslations = {};
const savedLang = localStorage.getItem("lang") || "en";

async function loadLanguage(lang) {
    const response = await fetch("../../lang/" + lang + ".json");
    const data = await response.json();
    currentTranslations = data;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const keys = element.dataset.i18n.split(".");
        let value = data;

        keys.forEach(key => {
            value = value[key];
        });

        if (element.tagName.toLowerCase() === "title") {
            document.title = value;
        } else {
            element.textContent = value;
        }
    });

    // Paragraph array support
    document.querySelectorAll("[data-i18n-paragraphs]").forEach(container => {
        const keys = container.dataset.i18nParagraphs.split(".");
        let value = data;

        keys.forEach(key => {
            value = value[key];
        });

        if (Array.isArray(value)) {
            container.innerHTML = "";

            value.forEach(text => {
                const p = document.createElement("p");
                p.className = "text-indent";
                p.textContent = text;
                container.appendChild(p);
            });
        }
    });

    // List array support
    document.querySelectorAll("[data-i18n-list]").forEach(container => {
        const keys = container.dataset.i18nList.split(".");
        let value = data;

        keys.forEach(key => {
            value = value[key];
        });

        if (Array.isArray(value)) {
            container.innerHTML = "";

            const ul = document.createElement("ul");
            ul.classList.add("list-unstyled");
            value.forEach(text => {
                const li = document.createElement("li");
                li.textContent = text;
                ul.appendChild(li);
            });

            container.appendChild(ul);
        }
    });

    if (portfolioSortText) {
        portfolioSortText.textContent = portfolioNewestFirst
            ? data.portfolio.sortNewest
            : data.portfolio.sortOldest;
    }

    if (articleSortText) {
        articleSortText.textContent = articleNewestFirst
            ? data.articles.sortNewest
            : data.articles.sortOldest;
    }

    // Date localization
    document.querySelectorAll(".date").forEach(el => {
        const rawDate = el.dataset.date;
        if (!rawDate) return;

        let dateObj;
        let formatted;

        // YYYY-MM
        if (/^\d{4}-\d{2}$/.test(rawDate)) {

            const [year, month] = rawDate.split("-");
            dateObj = new Date(year, month - 1);

            formatted = dateObj.toLocaleDateString(lang, {
                year: "numeric",
                month: "short"
            });

        }
        // YYYY-MM-DD
        else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {

            dateObj = new Date(rawDate);

            formatted = dateObj.toLocaleDateString(lang, {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        }

        el.textContent = formatted;
    });

    localStorage.setItem("lang", lang);
}

document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = button.dataset.lang;
        loadLanguage(lang);
    });
});

loadLanguage(savedLang);

// Portfolio Sort
const portfolioSortBtn = document.getElementById("portfolioSortBtn");
const portfolioSortIcon = document.getElementById("portfolioSortIcon");
const portfolioSortText = document.getElementById("portfolioSortText");
const portfolioRow = document.querySelector("#portfolio .row");

let portfolioNewestFirst = true;

if (portfolioSortBtn && portfolioRow) {
    const portfolioItems = Array.from(portfolioRow.children);

    portfolioSortBtn.addEventListener("click", () => {
        portfolioNewestFirst = !portfolioNewestFirst;
        portfolioItems.forEach(item => item.classList.add("content-fade"));

        setTimeout(() => {
            portfolioItems.sort((a, b) => {
                const dateA = new Date(a.dataset.date);
                const dateB = new Date(b.dataset.date);
                return portfolioNewestFirst ? dateB - dateA : dateA - dateB;
            });

            portfolioItems.forEach(item => {
                portfolioRow.appendChild(item);
                item.classList.remove("content-fade");
            });
        }, 250);

        portfolioSortIcon.className = portfolioNewestFirst ? "bi bi-arrow-down" : "bi bi-arrow-up";
        portfolioSortText.textContent = portfolioNewestFirst
            ? currentTranslations.portfolio.sortNewest
            : currentTranslations.portfolio.sortOldest;
    });
}

// Article Sort
const articleSortBtn = document.getElementById("articleSortBtn");
const articleSortIcon = document.getElementById("articleSortIcon");
const articleSortText = document.getElementById("articleSortText");
const articleRow = document.querySelector("#articles .row");

let articleNewestFirst = true;

if (articleSortBtn && articleRow) {
    const articleItems = Array.from(articleRow.children);

    articleSortBtn.addEventListener("click", () => {
        articleNewestFirst = !articleNewestFirst;
        articleItems.forEach(item => item.classList.add("content-fade"));

        setTimeout(() => {
            articleItems.sort((a, b) => {
                const dateA = new Date(a.dataset.date);
                const dateB = new Date(b.dataset.date);
                return articleNewestFirst ? dateB - dateA : dateA - dateB;
            });

            articleItems.forEach(item => {
                articleRow.appendChild(item);
                item.classList.remove("content-fade");
            });
        }, 250);

        articleSortIcon.className = articleNewestFirst ? "bi bi-arrow-down" : "bi bi-arrow-up";
        articleSortText.textContent = articleNewestFirst
            ? currentTranslations.articles.sortNewest
            : currentTranslations.articles.sortOldest;
    });
}

// Main Navigation & Page Transitions
document.addEventListener("DOMContentLoaded", () => {

    // Init Theme
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    const isHomePage = document.getElementById("home") !== null;
    const mainElement = document.querySelector("main");

    if (isHomePage) {
        // SPA Logic
        const sectionOrder = ['home', 'about', 'portfolio', 'articles', 'contact'];
        const sections = document.querySelectorAll("main section");
        const navLinks = document.querySelectorAll(".nav-link[href^='#']");
        let isAnimating = false;

        const initialId = location.hash.replace("#", "") || "home";

        sections.forEach(s => s.classList.remove("active"));

        const startSection = document.getElementById(initialId);
        if (startSection) {
            startSection.classList.add("active", "animate-fade-in");
            updateNavLinks(initialId);

            startSection.addEventListener('animationend', () => {
                startSection.classList.remove("animate-fade-in");
            }, { once: true });
        }
        // -------------------------------

        function updateNavLinks(id) {
            navLinks.forEach(link => {
                const linkId = link.getAttribute("href").substring(1);
                if (linkId === id) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                    link.style.fontWeight = "";
                }
            });
        }

        function navigateTo(targetId) {
            const activeSection = document.querySelector("main section.active");
            // Safety check: if no active section exists, just activate the target
            if (!activeSection) {
                document.getElementById(targetId)?.classList.add("active");
                return;
            }

            if (isAnimating || activeSection.id === targetId) return;

            const targetSection = document.getElementById(targetId);
            if (!targetSection) return;

            isAnimating = true;
            const currentId = activeSection.id;
            const currentIndex = sectionOrder.indexOf(currentId);
            const targetIndex = sectionOrder.indexOf(targetId);
            const isMovingForward = targetIndex > currentIndex;

            const exitClass = isMovingForward ? "animate-slide-out-left" : "animate-slide-out-right";
            const enterClass = isMovingForward ? "animate-slide-in-right" : "animate-slide-in-left";

            activeSection.classList.add("animating", exitClass);

            targetSection.classList.add("animating", enterClass, "active");
            targetSection.addEventListener('animationend', () => {
                activeSection.classList.remove("animating", exitClass, "active");
                targetSection.classList.remove("animating", enterClass);
                isAnimating = false;
            }, { once: true });

            updateNavLinks(targetId);
            history.pushState({ section: targetId }, "", `#${targetId}`);
        }

        navLinks.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const id = link.getAttribute("href").substring(1);
                navigateTo(id);
            });
        });

        window.addEventListener("popstate", () => {
            const id = location.hash.replace("#", "") || "home";
            const activeSection = document.querySelector("main section.active");
            if (activeSection && activeSection.id !== id) {
                navigateTo(id);
            }
        });

    } else {
        // Project Page Logic (Fade In)
        if (mainElement) {
            mainElement.classList.add("animate-fade-in");
        }
    }

    // Global Link Transitions (Fade Out)
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        link.addEventListener('click', e => {
            if (link.id === "darkModeBtn" || link.id === "dropdownId") return;

            const hrefAttr = link.getAttribute('href');
            if (!hrefAttr) return;

            if (hrefAttr.startsWith('#')) return;

            const targetUrl = link.href;

            if (targetUrl === window.location.href) return;
            if (targetUrl.startsWith('mailto:')) return;

            if (link.target !== "_blank") {
                e.preventDefault();
                document.body.classList.add('fade-out');

                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500);
            }
        });
    });
});