import { Counter } from "./Counter.js";

// ========================= ELEMENTE =========================
// const counterInput = document.getElementById("counterInput");
const addCounterBtn = document.getElementById("addCounterBtn");
// const confirmCounterBtn = document.getElementById("confirmCounterBtn");
// const cancelCounterBtn = document.getElementById("cancelCounterBtn");
const newCounterArea = document.getElementById("newCounterArea");
const counterContainer = document.getElementById("counterContainer");

// Views
const mainView = document.getElementById("mainView");
const counterView = document.getElementById("counterView");

const headerTitle = document.getElementById("headerTitle");
const counterValue = document.getElementById("counterValue");
const lastUpdated = document.getElementById("lastUpdated");
const dailyResetToggle = document.getElementById("dailyResetToggle");

// Buttons
const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const resetBtn = document.getElementById("resetBtn");

// NAV BUTTONS
const mainViewBtn = document.getElementById("mainViewBtn");
const counterViewBtn = document.getElementById("counterViewBtn");

// ========================= STATE =========================
let counter = (JSON.parse(localStorage.getItem("trackingCounters")) || []).map(
    (data) => Counter.fromJSON(data)
);
let currentCounterId = localStorage.getItem("currentCounterId") || null;

// ========================= HELPERS =========================
function saveCounter() {
    localStorage.setItem("trackingCounters", JSON.stringify(counter));
    if (currentCounterId) {
        localStorage.setItem("currentCounterId", currentCounterId);
    } else {
        localStorage.removeItem("currentCounterId");
    }
}

function hideAllViews() {
    mainView.classList.add("hidden");
    counterView.classList.add("hidden");
    mainViewBtn.classList.remove("active");
    counterViewBtn.classList.remove("active");
    headerTitle.classList.remove("editable");
}

function formatDate(dateString) {
    if (!dateString) return "Noch nicht aktualisiert";
    const d = new Date(dateString);
    return d.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Erzeugt automatische Namen wie "neuer Counter", "neuer Counter 1", etc.
function generateDefaultName() {
    const baseName = "neuer Counter";
    if (!counter.some((c) => c.name === baseName)) {
        return baseName;
    }
    let count = 1;
    while (counter.some((c) => c.name === `${baseName} ${count}`)) {
        count++;
    }
    return `${baseName} ${count}`;
}

function deleteCounter(id) {
    counter = counter.filter((c) => c.id !== id);
    if (currentCounterId === id) {
        currentCounterId = counter.length > 0 ? counter[0].id : null;
    }
    saveCounter();
    renderCounter();
    if (counter.length === 0) {
        showMainView();
    }
}

// ========================= VIEW SWITCH =========================
function showMainView() {
    hideAllViews();
    headerTitle.innerText = "Counter-App";
    headerTitle.classList.remove("hidden");
    newCounterArea.classList.add("hidden");
    addCounterBtn.classList.remove("hidden");
    mainView.classList.remove("hidden");
    mainViewBtn.classList.add("active");
    renderCounter();
}

function showCounterView() {
    hideAllViews();

    let item = counter.find((c) => c.id === currentCounterId);
    if (!item && counter.length > 0) {
        item = counter[0];
        currentCounterId = item.id;
    }

    if (item) {
        headerTitle.innerText = item.name;
        headerTitle.classList.add("editable");
        openCounter(item.id);
    } else {
        headerTitle.innerText = "Zähler";
        counterValue.innerText = "0";
        lastUpdated.innerText = "-";
        dailyResetToggle.checked = false;
    }

    addCounterBtn.classList.add("hidden");
    // confirmCounterBtn.classList.add("hidden");
    counterView.classList.remove("hidden");
    counterViewBtn.classList.add("active");
}

// ========================= COUNTER LOGIK =========================
function renderCounter() {
    counterContainer.innerHTML = "";

    // Button-Status basierend auf vorhandenen Countern aktualisieren
    if (counter.length === 0) {
        counterViewBtn.classList.add("disabled");
        counterContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Keine Counter vorhanden. Erstelle einen oben über das Plus!</p>`;
        return;
    } else {
        counterViewBtn.classList.remove("disabled");
    }

    counter.forEach((c) => {
        // Daily-Reset direkt vor dem Rendering prüfen
        c.checkDailyReset();

        const tile = document.createElement("div");
        tile.className = "counter-tile";
        tile.addEventListener("click", (e) => {
            if (
                e.target.closest(".menu-trigger") ||
                e.target.closest(".context-menu")
            )
                return;
            openCounter(c.id);
            showCounterView();
        });

        const resetStatusText = c.resetEnabled
            ? "Tägl. Reset: AN"
            : "Tägl. Reset: AUS";
        const resetStatusClass = c.resetEnabled ? "active" : "inactive";

        tile.innerHTML = `
            <div class="tile-info">
                <h4>${c.name}</h4>
                <p>Update: ${formatDate(c.updatedAt)}</p>
                <span class="reset-badge ${resetStatusClass}">${resetStatusText}</span>
            </div>
            <div class="tile-right" style="">
                <span class="tile-value" style="font-size:20px; font-weight:600; padding:10px 20px; background:var(--bg-input); border-radius:10px;">${c.value}</span>
                <button class="menu-trigger" style="width:30px; font-size:30px; padding:10px; background:none; border:none; color:var(--text-muted);"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </div>
            <div class="context-menu hidden" id="menu-${c.id}">
                <button class="rename-option"><i class="fa-solid fa-pen"></i> Umbenennen</button>
                <button class="toggle-reset-option"><i class="fa-solid fa-rotate-left"></i> ${c.resetEnabled ? "Reset deaktivieren" : "Reset aktivieren"}</button>
                <button class="delete-option"><i class="fa-solid fa-trash"></i> Löschen</button>
            </div>
        `;

        counterContainer.appendChild(tile);

        const trigger = tile.querySelector(".menu-trigger");
        const menu = tile.querySelector(".context-menu");

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();

            document.querySelectorAll(".context-menu").forEach((m) => {
                if (m !== menu) m.classList.add("hidden");
            });

            const isHidden = menu.classList.contains("hidden");

            if (isHidden) {
                menu.style.visibility = "hidden";
                menu.classList.remove("hidden");
                const menuHeight = menu.offsetHeight;
                menu.classList.add("hidden");
                menu.style.visibility = "";

                const contentContainer = document.querySelector("#content");
                const containerHeight = contentContainer.clientHeight;
                const tileTop = tile.offsetTop - contentContainer.scrollTop;
                const tileHeight = tile.offsetHeight;

                const spaceBelow = containerHeight - (tileTop + tileHeight);
                const spaceAbove = tileTop;

                menu.style.top = "auto";
                menu.style.bottom = "auto";
                menu.style.transform = "none";

                // Wenn oben nicht genug Platz ist, öffne das Menü IMMER nach unten
                if (spaceAbove < menuHeight && spaceBelow >= menuHeight) {
                    menu.style.top = "85%";
                }
                // Wenn unten nicht genug Platz ist, aber oben schon
                else if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                    menu.style.bottom = "85%";
                }
                // Wenn beides knapp ist, zentrieren
                else if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
                    menu.style.top = "50%";
                    menu.style.transform = "translateY(-50%)";
                }
                // Standardmäßig (wenn genug Platz unten ist) nach unten öffnen
                else {
                    menu.style.top = "85%";
                }

                menu.classList.remove("hidden");
            } else {
                menu.classList.add("hidden");
            }
        });
        // TODO: Issue #21
        // Kontextmenü: Umbenennen
        tile.querySelector(".rename-option").addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.add("hidden");
            const newName = prompt("Neuen Namen eingeben:", c.name);
            if (newName && newName.trim() !== "") {
                c.name = newName.trim();
                saveCounter();
                renderCounter();
                if (currentCounterId === c.id) {
                    headerTitle.innerText = c.name;
                }
            }
        });

        // Kontextmenü: Tägl. Reset umschalten
        tile.querySelector(".toggle-reset-option").addEventListener(
            "click",
            (e) => {
                e.stopPropagation();
                menu.classList.add("hidden");
                c.resetEnabled = !c.resetEnabled;
                saveCounter();
                renderCounter();
                if (currentCounterId === c.id) {
                    dailyResetToggle.checked = c.resetEnabled;
                }
            }
        );

        // Kontextmenü: Löschen
        tile.querySelector(".delete-option").addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.add("hidden");
            if (confirm(`Möchtest du "${c.name}" wirklich löschen?`)) {
                deleteCounter(c.id);
            }
        });
    });
}

function openCounter(id) {
    currentCounterId = id;
    const item = counter.find((c) => c.id === id);
    if (!item) return;

    item.checkDailyReset();

    counterValue.innerText = item.value;
    lastUpdated.innerText = formatDate(item.updatedAt);
    dailyResetToggle.checked = item.resetEnabled;
    saveCounter();
}

function updateCounter(type) {
    if (!currentCounterId) return;
    const item = counter.find((c) => c.id === currentCounterId);
    if (!item) return;

    if (type === "plus") {
        item.increment();
    } else if (type === "minus") {
        item.decrement();
    } else if (type === "reset") {
        item.reset();
    }

    counterValue.innerText = item.value;
    lastUpdated.innerText = formatDate(item.updatedAt);

    saveCounter();
    renderCounter();
}

// ========================= EVENT HANDLER =========================

// Direktes Erstellen eines Standard-Counters beim Klick auf Plus
addCounterBtn.addEventListener("click", () => {
    const name = generateDefaultName();
    const newCounter = new Counter({
        id: `id_${Date.now()}`,
        name: name,
        value: 0,
        updatedAt: null,
        resetEnabled: true,
        resetInterval: "daily",
    });

    counter.push(newCounter);
    currentCounterId = newCounter.id;

    saveCounter();
    renderCounter();
    showCounterView();
});

// Titel im Header anklicken zum Umbenennen (im Counter-View)
headerTitle.addEventListener("click", () => {
    if (!counterView.classList.contains("hidden") && currentCounterId) {
        const item = counter.find((c) => c.id === currentCounterId);
        if (item) {
            const newName = prompt("Neuen Namen eingeben:", item.name);
            if (newName && newName.trim() !== "") {
                item.name = newName.trim();
                headerTitle.innerText = item.name;
                saveCounter();
                renderCounter();
            }
        }
    }
});

// Daily Reset Toggle-Switch Event
dailyResetToggle.addEventListener("change", (e) => {
    if (!currentCounterId) return;
    const item = counter.find((c) => c.id === currentCounterId);
    if (item) {
        item.resetEnabled = e.target.checked;
        saveCounter();
        renderCounter();
    }
});

// Klick außerhalb schließt offene Kontextmenüs
document.addEventListener("click", (e) => {
    if (
        !e.target.closest(".context-menu") &&
        !e.target.closest(".menu-trigger")
    ) {
        document
            .querySelectorAll(".context-menu")
            .forEach((m) => m.classList.add("hidden"));
    }
});

mainViewBtn.addEventListener("click", showMainView);
counterViewBtn.addEventListener("click", showCounterView);

plusBtn.addEventListener("click", () => updateCounter("plus"));
minusBtn.addEventListener("click", () => updateCounter("minus"));
resetBtn.addEventListener("click", () => updateCounter("reset"));

// Start der App
window.addEventListener("load", () => {
    if (counter.length === 0) {
        counterViewBtn.classList.add("disabled");
    }

    if (currentCounterId && counter.some((c) => c.id === currentCounterId)) {
        showCounterView();
    } else {
        showMainView();
    }
});
