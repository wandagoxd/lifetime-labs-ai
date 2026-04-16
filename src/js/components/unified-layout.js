import { CardBase } from "./design-system.js";

export function Header({
    title = "Lifetime Labs",
    statusId = "",
    statusText = "",
    authId = "",
    authText = "",
    badgeText = "",
    headerActions = []
} = {}) {
    const actionsMarkup = Array.isArray(headerActions) && headerActions.length
        ? `
            <div class="ll-header__actions">
                ${headerActions
        .map(
            (action) => `
                    <a
                        href="${action.href || "#"}"
                        class="ll-header__action ${action.variant === "secondary" ? "is-secondary" : "is-primary"}"
                    >
                        ${action.label || ""}
                    </a>
                `
        )
        .join("")}
            </div>
        `
        : "";

    const rightMeta = statusId || authId || badgeText
        ? `
            <div class="ll-header__meta">
                ${statusId ? `<p id="${statusId}" class="ll-header__status">${statusText || "Listo"}</p>` : ""}
                ${authId ? `<p id="${authId}" class="ll-header__auth">${authText || "Sesion: invitado"}</p>` : ""}
                ${!statusId && !authId && badgeText ? `<p class="ll-header__status">${badgeText}</p>` : ""}
            </div>
        `
        : "";

    return `
        <header id="ll-unified-header" class="ll-header">
            <a href="index.html" class="ll-header__brand">
                <img src="assets/website-icon-standing-up.png" class="ll-header__logo" alt="Lifetime Labs" />
                <h1 class="ll-header__title">${title}</h1>
            </a>
            <div id="ll-header-right" class="ll-header__right">
                ${actionsMarkup || rightMeta}
            </div>
        </header>
    `;
}

export function BottomNav({ active = "home" } = {}) {
    const navItems = [
        { id: "home", href: "index.html", icon: "home", label: "Inicio" },
        { id: "career-bank", href: "career-bank.html", icon: "auto_stories", label: "Banco" },
        { id: "labs", href: "labs.html", icon: "science", label: "Labs" },
        { id: "profile", href: "profile.html", icon: "person", label: "Perfil" },
        { id: "why-us", href: "why-us.html", icon: "info", label: "Info" }
    ];

    const navMarkup = navItems
        .map((item) => {
            if (item.id === "labs") {
                const isActive = active === item.id;
                return `
                    <a href="${item.href}" class="ll-bottom-nav__labs ${isActive ? "is-active" : ""}" aria-label="${item.label}">
                        <span class="material-symbols-outlined">science</span>
                    </a>
                `;
            }

            const isActive = active === item.id;
            return `
                <a href="${item.href}" class="ll-bottom-nav__item ${isActive ? "is-active" : ""}" aria-label="${item.label}">
                    <span class="material-symbols-outlined">${item.icon}</span>
                </a>
            `;
        })
        .join("");

    return `
        <nav id="ll-unified-bottom-nav" class="ll-bottom-nav">
            ${navMarkup}
        </nav>
    `;
}

export function UnifiedLayout(config = {}) {
    const {
        title = "Lifetime Labs",
        activeNav = "home",
        statusId = "",
        statusText = "",
        authId = "",
        authText = "",
        badgeText = "",
        headerActions = []
    } = config;

    return {
        header: Header({
            title,
            statusId,
            statusText,
            authId,
            authText,
            badgeText,
            headerActions
        }),
        nav: BottomNav({ active: activeNav })
    };
}

export function mountUnifiedLayout(config = {}) {
    const existingHeader = document.getElementById("ll-unified-header");
    const existingNav = document.getElementById("ll-unified-bottom-nav");
    existingHeader?.remove();
    existingNav?.remove();

    const { header, nav } = UnifiedLayout(config);
    document.body.insertAdjacentHTML("afterbegin", header);
    document.body.insertAdjacentHTML("beforeend", nav);
    document.body.classList.add("ll-unified-page", "ColorTokens", "SpacingTokens", "ShadowTokens", "RadiusTokens");
}

export function setUnifiedHeaderStatus(text, statusId = "ll-header-status") {
    const element = document.getElementById(statusId);
    if (element) {
        element.textContent = text;
    }
}

export function setUnifiedHeaderAuth(text, authId = "ll-header-auth") {
    const element = document.getElementById(authId);
    if (element) {
        element.textContent = text;
    }
}

export function setUnifiedHeaderActions(actions = []) {
    const right = document.getElementById("ll-header-right");
    if (!right) return;

    const hasActions = Array.isArray(actions) && actions.length > 0;
    if (!hasActions) {
        right.innerHTML = "";
        return;
    }

    right.innerHTML = `
        <div class="ll-header__actions">
            ${actions
        .map(
            (action) => `
                <a
                    href="${action.href || "#"}"
                    class="ll-header__action ${action.variant === "secondary" ? "is-secondary" : "is-primary"}"
                >
                    ${action.label || ""}
                </a>
            `
        )
        .join("")}
        </div>
    `;
}

export function applyCardSystem() {
    document.querySelectorAll("[data-card-base='true']").forEach((node) => {
        node.classList.add(...CardBase().split(" "));
    });
    document.querySelectorAll("[data-card-glow='true']").forEach((node) => {
        node.classList.add(...CardBase("ll-card-glow").split(" "));
    });
}
