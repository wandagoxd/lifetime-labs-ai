(function () {
  const PAGE_FILES = {
    home: "index.html",
    whyUs: "why-us.html",
    login: "login.html",
    signup: "sign-up.html",
    forgotPassword: "forgot-password.html",
    resetPassword: "reset-password.html",
    notifications: "notifications.html",
    labs: "labs.html",
    status: "status.html",
    capsules: "time-capsules.html",
    profile: "profile.html",
    settings: "settings.html",
    wardrobe: "wardrobe.html",
  };

  const SCREEN_ROUTE_MAP = {
    SCREEN_4: "notifications",
    SCREEN_13: "labs",
    SCREEN_18: "whyUs",
    SCREEN_25: "wardrobe",
    SCREEN_26: "settings",
    SCREEN_30: "status",
    SCREEN_36: "login",
    SCREEN_37: "home",
    SCREEN_38: "profile",
    SCREEN_40: "capsules",
  };

  const ABSOLUTE_ROUTE_MAP = {
    "/login": "login",
    "/signup": "signup",
  };

  const NAV_ITEMS = [
    { key: "home", label: "Home", icon: "home" },
    { key: "capsules", label: "Capsules", icon: "shelves" },
    { key: "labs", label: "Labs", icon: "experiment" },
    { key: "status", label: "Status", icon: "query_stats" },
    { key: "profile", label: "Profile", icon: "person" },
  ];

  const MENU_SECTIONS = [
    {
      title: "Main",
      items: [
        { key: "home", icon: "home", title: "Home", copy: "Return to your dashboard" },
        { key: "whyUs", icon: "auto_stories", title: "Why Us", copy: "Read the mission and story" },
        { key: "labs", icon: "experiment", title: "Daily Lab", copy: "Continue your guided discovery" },
        { key: "capsules", icon: "inventory_2", title: "Time Capsules", copy: "Browse saved reflections" },
        { key: "status", icon: "query_stats", title: "Status", copy: "Review your growth signals" },
      ],
    },
    {
      title: "Account",
      items: [
        { key: "notifications", icon: "notifications", title: "Notifications", copy: "Check your latest updates" },
        { key: "profile", icon: "person", title: "Profile", copy: "View identity and progress" },
        { key: "settings", icon: "settings", title: "Settings", copy: "Adjust preferences and security" },
        { key: "wardrobe", icon: "checkroom", title: "Wardrobe", copy: "Customize Coreon" },
      ],
    },
  ];

  const body = document.body;
  if (!body) {
    return;
  }

  const pageKey = body.dataset.page || "";
  const shell = body.dataset.shell || "focused";
  const root = body.dataset.root || "";

  function routePath(routeKey) {
    const file = PAGE_FILES[routeKey];
    return file ? `${root}${file}` : "#";
  }

  function navigate(routeKey) {
    const path = routePath(routeKey);
    if (path !== "#") {
      window.location.href = path;
    }
  }

  function findScreenToken(value) {
    return value ? value.match(/SCREEN_\d+/)?.[0] : null;
  }

  function applyPrototypeRoutes() {
    document.querySelectorAll("[onclick]").forEach((element) => {
      const raw = element.getAttribute("onclick");
      const screenToken = findScreenToken(raw);
      if (!screenToken) {
        return;
      }
      const routeKey = SCREEN_ROUTE_MAP[screenToken];
      if (!routeKey) {
        return;
      }
      element.removeAttribute("onclick");
      element.dataset.route = routeKey;
    });

    document.querySelectorAll("a[href], area[href]").forEach((element) => {
      const raw = element.getAttribute("href");
      const screenToken = findScreenToken(raw);
      if (screenToken && SCREEN_ROUTE_MAP[screenToken]) {
        element.setAttribute("href", routePath(SCREEN_ROUTE_MAP[screenToken]));
        return;
      }

      if (raw && ABSOLUTE_ROUTE_MAP[raw]) {
        element.setAttribute("href", routePath(ABSOLUTE_ROUTE_MAP[raw]));
      }
    });
  }

  function bindRouteTargets() {
    document.querySelectorAll("[data-route]").forEach((element) => {
      const routeKey = element.dataset.route;
      if (!routeKey || !PAGE_FILES[routeKey]) {
        return;
      }

      if (element.tagName === "A" || element.tagName === "AREA") {
        element.setAttribute("href", routePath(routeKey));
        return;
      }

      element.addEventListener("click", (event) => {
        event.preventDefault();
        navigate(routeKey);
      });
    });

    document.querySelectorAll("form[data-submit-route]").forEach((form) => {
      const routeKey = form.dataset.submitRoute;
      if (!routeKey || !PAGE_FILES[routeKey]) {
        return;
      }

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        navigate(routeKey);
      });
    });
  }

  function removeLegacyBottomNav() {
    document.querySelectorAll("body > nav").forEach((nav) => nav.remove());
  }

  function injectGlobalNav() {
    if (shell === "marketing") {
      removeLegacyBottomNav();
      return;
    }

    if (shell !== "app") {
      return;
    }

    removeLegacyBottomNav();
    body.classList.add("ll-has-global-nav");

    const activeKey = body.dataset.activeNav || pageKey;
    const nav = document.createElement("nav");
    nav.className = "ll-global-nav";
    nav.setAttribute("aria-label", "Primary");

    nav.innerHTML = NAV_ITEMS.map((item) => {
      const activeClass = item.key === activeKey ? " is-active" : "";
      const current = item.key === activeKey ? ' aria-current="page"' : "";
      return `
        <a class="ll-global-nav__item${activeClass}" href="${routePath(item.key)}"${current}>
          <span class="material-symbols-outlined">${item.icon}</span>
          <span class="ll-global-nav__label">${item.label}</span>
        </a>
      `;
    }).join("");

    body.appendChild(nav);
  }

  function buildMenuMarkup() {
    const sections = MENU_SECTIONS.map((section) => {
      const items = section.items
        .map((item) => {
          const activeClass = item.key === pageKey ? " is-active" : "";
          return `
            <a class="ll-global-menu__link${activeClass}" href="${routePath(item.key)}">
              <span class="ll-global-menu__link-main">
                <span class="ll-global-menu__link-icon material-symbols-outlined">${item.icon}</span>
                <span>
                  <span class="ll-global-menu__link-title">${item.title}</span>
                  <span class="ll-global-menu__link-copy">${item.copy}</span>
                </span>
              </span>
              <span class="material-symbols-outlined">chevron_right</span>
            </a>
          `;
        })
        .join("");

      return `
        <section class="ll-global-menu__section">
          <h3 class="ll-global-menu__section-title">${section.title}</h3>
          ${items}
        </section>
      `;
    }).join("");

    return `
      <div class="ll-global-menu__backdrop" data-menu-close="true"></div>
      <aside class="ll-global-menu__panel" aria-modal="true" aria-label="Global menu" role="dialog">
        <div class="ll-global-menu__header">
          <div>
            <p class="ll-global-menu__eyebrow">Lifetime Labs</p>
            <h2 class="ll-global-menu__title">Navigation</h2>
          </div>
          <button class="ll-global-menu__close" type="button" aria-label="Close navigation" data-menu-close="true">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        ${sections}
        <div class="ll-global-menu__footer">
          Move between the public story, your app dashboard, and the profile tools from one shared menu.
        </div>
      </aside>
    `;
  }

  function injectGlobalMenu() {
    if (!["app", "marketing"].includes(shell)) {
      return;
    }

    const menu = document.createElement("div");
    menu.className = "ll-global-menu";
    menu.innerHTML = buildMenuMarkup();
    body.appendChild(menu);

    const toggleTargets = Array.from(document.querySelectorAll("[data-global-menu-toggle]"));
    let floatingToggle = null;

    if (!toggleTargets.length) {
      floatingToggle = document.createElement("button");
      floatingToggle.type = "button";
      floatingToggle.className = "ll-global-menu-toggle";
      floatingToggle.setAttribute("aria-label", "Open navigation");
      floatingToggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      body.appendChild(floatingToggle);
      toggleTargets.push(floatingToggle);
    }

    function openMenu() {
      body.classList.add("ll-menu-open");
      menu.classList.add("is-open");
    }

    function closeMenu() {
      body.classList.remove("ll-menu-open");
      menu.classList.remove("is-open");
    }

    toggleTargets.forEach((target) => {
      target.addEventListener("click", (event) => {
        event.preventDefault();
        openMenu();
      });
    });

    menu.querySelectorAll("[data-menu-close]").forEach((target) => {
      target.addEventListener("click", closeMenu);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  applyPrototypeRoutes();
  bindRouteTargets();
  injectGlobalNav();
  injectGlobalMenu();
})();
