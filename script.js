class GDGCApp {
  constructor() {
    this.API_BASE = "http://localhost:3001";

    this.members = [];
    this.filteredMembers = [];

    this.searchInput = document.getElementById("searchInput");
    this.roleFilter = document.getElementById("roleFilter");
    this.skillFilter = document.getElementById("skillFilter");
    this.locationFilter = document.getElementById("locationFilter");
    this.memberGrid = document.getElementById("memberGrid");

    this.loadingEl = document.getElementById("loading");
    this.errorEl = document.getElementById("error");
    this.emptyEl = document.getElementById("empty");

    this.themeToggle = document.getElementById("themeToggle");
    this.splash = document.getElementById("splash");
    this.app = document.getElementById("app");

    this.init();
  }

  async init() {
    this.initTheme();
    this.bindThemeToggle();
    this.bindFilters();

    await this.playSplash();
    await this.loadMembers();
  }

  // SPLASH 
  playSplash() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.splash.style.opacity = "0";
        setTimeout(() => {
          this.splash.classList.add("hidden");
          this.app.classList.remove("hidden");
          resolve();
        }, 600);
      }, 2200);
    });
  }

  // THEME 
  initTheme() {
    const saved = localStorage.getItem("gdgc_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    this.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  bindThemeToggle() {
    this.themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      const nextTheme = isDark ? "light" : "dark";
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(nextTheme);
      this.themeToggle.textContent = nextTheme === "dark" ? "☀️" : "🌙";
      localStorage.setItem("gdgc_theme", nextTheme);
    });
  }

  // API
  async loadMembers() {
    this.setStatus({ loading: true, error: false, empty: false });
    try {
      const response = await fetch(`${this.API_BASE}/members`);
      if (!response.ok) throw new Error("Failed to fetch members");
      this.members = await response.json();
      this.filteredMembers = [...this.members];
      this.populateFilterOptions();
      this.renderMembers(this.filteredMembers);
      this.setStatus({ loading: false, error: false, empty: this.filteredMembers.length === 0 });
    } catch (err) {
      console.error(err);
      this.setStatus({ loading: false, error: true, empty: false });
      setTimeout(() => this.loadMembers(), 3000);
    }
  }

  // STATUS HANDLING 
  setStatus({ loading, error, empty }) {
    this.loadingEl.classList.toggle("hidden", !loading);
    this.errorEl.classList.toggle("hidden", !error);
    this.emptyEl.classList.toggle("hidden", !empty);
    this.memberGrid.classList.toggle("hidden", loading || error || empty);
  }

  // FILTER + SEARCH 
  bindFilters() {
    const debouncedSearch = this.debounce(() => {
      this.applyFilters();
    }, 300);

    this.searchInput.addEventListener("input", debouncedSearch);
    this.roleFilter.addEventListener("change", () => this.applyFilters());
    this.skillFilter.addEventListener("change", () => this.applyFilters());
    this.locationFilter.addEventListener("change", () => this.applyFilters());
  }

  populateFilterOptions() {
    const uniqueRoles = Array.from(new Set(this.members.map((m) => m.role))).sort();
    const uniqueLocations = Array.from(new Set(this.members.map((m) => m.location))).sort();
    const uniqueSkills = Array.from(
      new Set(this.members.flatMap((m) => m.skills))
    ).sort();

    uniqueRoles.forEach((role) => {
      const opt = document.createElement("option");
      opt.value = role;
      opt.textContent = role;
      this.roleFilter.appendChild(opt);
    });

    uniqueSkills.forEach((skill) => {
      const opt = document.createElement("option");
      opt.value = skill;
      opt.textContent = skill;
      this.skillFilter.appendChild(opt);
    });

    uniqueLocations.forEach((loc) => {
      const opt = document.createElement("option");
      opt.value = loc;
      opt.textContent = loc;
      this.locationFilter.appendChild(opt);
    });
  }

  applyFilters() {
    const searchTerm = this.searchInput.value.trim().toLowerCase();
    const selectedRole = this.roleFilter.value;
    const selectedSkill = this.skillFilter.value;
    const selectedLocation = this.locationFilter.value;

    let result = [...this.members];

    if (searchTerm) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm) ||
          m.bio.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedRole) {
      result = result.filter((m) => m.role === selectedRole);
    }

    if (selectedSkill) {
      result = result.filter((m) =>
        m.skills.some((s) => s === selectedSkill)
      );
    }

    if (selectedLocation) {
      result = result.filter((m) => m.location === selectedLocation);
    }

    this.filteredMembers = result;
    this.renderMembers(this.filteredMembers);
    this.setStatus({
      loading: false,
      error: false,
      empty: this.filteredMembers.length === 0,
    });
  }

  // RENDER 
  renderMembers(members) {
    this.memberGrid.innerHTML = members
      .map((m) => this.memberCardTemplate(m))
      .join("");
  }

  memberCardTemplate(member) {
    const skillsHtml = member.skills
      .map((s) => `<span class="skill-chip">${s}</span>`)
      .join("");

    return `
      <article class="member-card">
        <div class="member-card-inner">
          <div class="card-top">
            <div class="member-avatar-wrap">
              <img src="${member.photo}" alt="${member.name}" class="member-avatar" />
            </div>
            <div class="member-info-main">
              <h2>${member.name}</h2>
              <div class="member-role">
                <span class="role-dot"></span>
                <span>${member.role}</span>
              </div>
            </div>
          </div>

          <div class="card-meta">
            <div class="meta-location">
              <span>📍</span>
              <span>${member.location}</span>
            </div>
            <div class="meta-id">ID #${member.id}</div>
          </div>

          <div class="skill-chips">
            ${skillsHtml}
          </div>

          <p class="member-bio">${member.bio}</p>
        </div>
      </article>
    `;
  }

  // UTIL 
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new GDGCApp();
});
