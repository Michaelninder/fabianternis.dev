const themeToggle = document.getElementById("theme-toggle");
const scrollToTopBtn = document.getElementById("scroll-to-top");
const menuToggle = document.getElementById("menu-toggle");
const closeNav = document.getElementById("close-nav");
const mobileNav = document.getElementById("mobile-nav");
const navOverlay = document.getElementById("nav-overlay");
const toastContainer = document.getElementById("toast-container");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
const htmlElement = document.documentElement;
const themeKey = "fabianternis-theme";

function showToast(message) {
    if (window.innerWidth <= 768) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

const applyTheme = (theme) => {
    htmlElement.classList.toggle("dark", theme === "dark");
};

const savedTheme = localStorage.getItem(themeKey);
const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
).matches;
applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
    const isDark = htmlElement.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem(themeKey, newTheme);

    //showToast(newTheme === "dark" ? "Dark mode enabled" : "Light mode enabled");
});

const openMobileNav = () => {
    mobileNav.classList.add("open");
    navOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
};

const closeMobileNav = () => {
    mobileNav.classList.remove("open");
    navOverlay.classList.remove("open");
    document.body.style.overflow = "";
};

menuToggle.addEventListener("click", openMobileNav);
closeNav.addEventListener("click", closeMobileNav);
navOverlay.addEventListener("click", closeMobileNav);

mobileNavLinks.forEach((link) => {
    link.addEventListener("click", closeMobileNav);
});

window.addEventListener("scroll", () => {
    scrollToTopBtn.classList.toggle("visible", window.scrollY > 400);
});

scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

const statusTexts = [
    "Open to opportunities",
    "Available for hire",
    "Open to collaborations",
    "Accepting freelance work",
    "Seeking new projects",
    "Open to full-time roles",
    "Consulting available",
    "Happy to discuss ideas",
];

let shuffled = [...statusTexts].sort(() => Math.random() - 0.5);
let currentIndex = 0;

const statusElement = document.querySelector(".status-text");

function updateStatus() {
    if (currentIndex >= shuffled.length) {
        shuffled = [...statusTexts].sort(() => Math.random() - 0.5);
        currentIndex = 0;
    }

    statusElement.style.opacity = "0";

    setTimeout(() => {
        statusElement.textContent = shuffled[currentIndex];
        statusElement.style.opacity = "1";
        currentIndex++;
    }, 300);

    const nextDelay = Math.random() * 3000 + 2000;
    setTimeout(updateStatus, nextDelay);
}

setTimeout(updateStatus, 3000);

async function fetchGitHubActivity() {
    const container = document.getElementById("activity-container");
    const username = "michaelninder";
    const tooltip = document.getElementById("tooltip");

    try {
        const response = await fetch(
            `https://api.github.com/users/${username}/events/public?per_page=100`
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const events = await response.json();

        const contributions = {};
        let totalContributions = 0;

        events.forEach((event) => {
            const date = new Date(event.created_at);
            const dateKey = date.toISOString().split("T")[0];
            contributions[dateKey] = (contributions[dateKey] || 0) + 1;
            totalContributions++;
        });

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const startDate = new Date(thirtyDaysAgo);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const weeks = [];
        let currentWeek = [];

        const currentDate = new Date(startDate);
        while (currentDate <= today) {
            const dateKey = currentDate.toISOString().split("T")[0];
            const count = contributions[dateKey] || 0;
            const isInRange =
                currentDate >= thirtyDaysAgo && currentDate <= today;

            currentWeek.push({
                date: new Date(currentDate),
                count: count,
                level: isInRange ? getLevel(count) : null,
                isInRange: isInRange,
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ empty: true });
            }
            weeks.push(currentWeek);
        }

        const sortedDates = Object.keys(contributions).sort();
        let currentStreak = 0;

        if (sortedDates.length > 0) {
            const lastDate = new Date(sortedDates[sortedDates.length - 1]);
            const daysDiff = Math.floor(
                (today - lastDate) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff <= 1) {
                for (let i = sortedDates.length - 1; i >= 0; i--) {
                    currentStreak++;
                    if (i > 0) {
                        const current = new Date(sortedDates[i]);
                        const previous = new Date(sortedDates[i - 1]);
                        const diff = Math.floor(
                            (current - previous) / (1000 * 60 * 60 * 24)
                        );
                        if (diff > 1) break;
                    }
                }
            }
        }

        const monthYear = today.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });

        const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        container.innerHTML = `
    <div class="contribution-calendar">
    <div class="calendar-header">
        <div class="calendar-month-label">${monthYear}</div>
    </div>
    <div class="calendar-grid-container">
        <div class="calendar-day-labels">
        ${dayLabels.map((day) => `<div class="calendar-day-label">${day}</div>`).join("")}
        </div>
        <div class="calendar-weeks">
        ${weeks
                .map(
                    (week) => `
            <div class="calendar-week">
            ${week
                            .map((day) => {
                                if (day.empty) {
                                    return '<div class="calendar-day empty"></div>';
                                }
                                if (!day.isInRange) {
                                    return '<div class="calendar-day empty"></div>';
                                }
                                return `
                    <div class="calendar-day" 
                        data-level="${day.level}" 
                        data-date="${day.date.toISOString().split("T")[0]}"
                        data-count="${day.count}"></div>
                `;
                            })
                            .join("")}
            </div>
        `
                )
                .join("")}
        </div>
    </div>
    <div class="calendar-legend">
        <span class="calendar-legend-label">Less</span>
        <div class="calendar-legend-items">
        <div class="calendar-legend-item" data-level="0"></div>
        <div class="calendar-legend-item" data-level="1"></div>
        <div class="calendar-legend-item" data-level="2"></div>
        <div class="calendar-legend-item" data-level="3"></div>
        <div class="calendar-legend-item" data-level="4"></div>
        </div>
        <span class="calendar-legend-label">More</span>
    </div>
    <div class="calendar-stats">
        <div class="calendar-stat">
        <strong>${totalContributions}</strong> contribution${totalContributions !== 1 ? "s" : ""} in the last 30 days
        </div>
        <div class="calendar-stat">
        Current streak: <strong>${currentStreak} ${currentStreak === 1 ? "day" : "days"}</strong>
        </div>
    </div>
    </div>
`;

        const calendarDays = document.querySelectorAll(
            ".calendar-day:not(.empty)"
        );
        calendarDays.forEach((day) => {
            day.addEventListener("mouseenter", (e) => {
                const date = new Date(day.dataset.date);
                const count = day.dataset.count;
                const dateStr = date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });

                tooltip.textContent = `${count} contribution${count !== "1" ? "s" : ""} on ${dateStr}`;
                tooltip.classList.add("visible");

                const rect = day.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 10}px`;
                tooltip.style.transform = "translate(-50%, -100%)";
            });

            day.addEventListener("mouseleave", () => {
                tooltip.classList.remove("visible");
            });
        });
    } catch (error) {
        container.innerHTML =
            '<div class="activity-error">Unable to load contribution calendar. Please try again later.</div>';
    }
}

function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
}

fetchGitHubActivity();