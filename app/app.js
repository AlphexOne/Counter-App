/*
 * COUNTER APP
 * Copyright (C) 2026 AlphexOne
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Counter } from "./Counter.js";

// ========================= ELEMENTE =========================
const counterInput = document.getElementById("counterInput");
const addCounterBtn = document.getElementById("addCounterBtn");
const confirmCounterBtn = document.getElementById("confirmCounterBtn");
const cancelCounterBtn = document.getElementById("cancelCounterBtn");
const optionsCounterBtn = document.getElementById("optionsCounterBtn");
const newCounterArea = document.getElementById("newCounterArea");
const counterContainer = document.getElementById("counterContainer");
// Views
const mainView = document.getElementById("mainView");
const counterView = document.getElementById("counterView");

const headerTitle = document.getElementById("headerTitle");
const counterValue = document.getElementById("counterValue");
const lastUpdated = document.getElementById("lastUpdated");
// Button
const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const resetBtn = document.getElementById("resetBtn");

// NAV BUTTONS
const homeBtn = document.getElementById("homeBtn");
const counterBtn = document.getElementById("counterBtn");

// SETTINGS ELEMENTE
// const settingsCounterSelect = document.getElementById("settingsCounterSelect");
// const enableResetCheckbox = document.getElementById("enableResetCheckbox");

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

    homeBtn.classList.remove("active");
    counterBtn.classList.remove("active");
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

// ========================= VIEW SWITCH =========================
function showMainView() {
    hideAllViews();
    headerTitle.innerText = "Counter-App";
    headerTitle.classList.remove("hidden"); // Titel wieder anzeigen falls ausgeblendet
    newCounterArea.classList.add("hidden");
    addCounterBtn.classList.remove("hidden");
    mainView.classList.remove("hidden");
    homeBtn.classList.add("active");
    renderCounter();
}

function showCounterView() {
    hideAllViews();

    if (currentCounterId) {
        const item = counter.find((c) => c.id === currentCounterId);
        headerTitle.innerText = item ? item.name : "Zähler";
    } else if (counter.length > 0) {
        headerTitle.innerText = counter[0].name;
    } else {
        headerTitle.innerText = "Zähler";
    }

    addCounterBtn.classList.add("hidden");
    confirmCounterBtn.classList.add("hidden");
    counterView.classList.remove("hidden");
    counterBtn.classList.add("active");

    if (currentCounterId) {
        openCounter(currentCounterId);
    } else if (counter.length > 0) {
        openCounter(counter[0].id);
    } else {
        counterValue.innerText = "0";
        lastUpdated.innerText = "-";
    }
}

// // ========================= COUNTER LOGIK =========================
function renderCounter() {
    counterContainer.innerHTML = "";

    if (counter.length === 0) {
        counterContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 20px;">Keine Counter vorhanden. Erstelle einen oben über das Plus!</p>`;
        return;
    }

    counter.forEach((c) => {
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

        tile.innerHTML = `
            <div class="tile-info">
                <h4>${c.name}</h4>
                <p>Update: ${formatDate(c.updatedAt)}</p>
            </div>
            <div class="tile-right">
                <span class="tile-value">${c.value}</span>
                <button class="menu-trigger"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </div>
            <div class="context-menu hidden" id="menu-${c.id}">
                <button class="rename-option">Umbenennen</button>
                <button class="delete-option">Löschen</button>
            </div>
        `;

        counterContainer.appendChild(tile);

        // Kontextmenü-Trigger
        const trigger = tile.querySelector(".menu-trigger");
        const menu = tile.querySelector(".context-menu");

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();

            // Schließe andere offene Menüs
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

                if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                    menu.style.bottom = "85%";
                } else if (spaceBelow < menuHeight && spaceAbove < menuHeight) {
                    menu.style.top = "50%";
                    menu.style.transform = "translateY(-50%)";
                } else {
                    menu.style.top = "85%";
                }

                menu.classList.remove("hidden");
            } else {
                menu.classList.add("hidden");
            }
        });

        // TODO: Umbenennen Aktion
        tile.querySelector(".rename-option").addEventListener("click", () => {
            const newName = prompt("Neuen Namen eingeben:", c.name);
            if (newName && newName.trim() !== "") {
                c.name = newName.trim();
                saveCounter();
                renderCounter();
            }
        });

        // TODO: Löschen Aktion
        tile.querySelector(".delete-option").addEventListener("click", () => {
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

    checkDailyReset(item);

    counterValue.innerText = item.value;
    lastUpdated.innerText = formatDate(item.updatedAt);
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

// // ========================= DAILY RESET LOGIK =========================

function checkDailyReset(counterItem) {
    return counterItem.checkDailyReset();
}
// function checkDailyReset(counterItem) {
//     if (counterItem.resetEnabled && counterItem.updatedAt) {
//         const lastDate = new Date(counterItem.updatedAt).setHours(0,0,0,0);
//         const today = new Date().setHours(0,0,0,0);

//         if (today > lastDate) {
//             counterItem.value = 0;
//             counterItem.updatedAt = new Date().toISOString();
//         }
//     }
// }

// // ========================= CREATE / DELETE =========================

addCounterBtn.addEventListener("click", () => {
    //    headerTitle.classList.add("hidden");
    confirmCounterBtn.classList.remove("hidden");
    addCounterBtn.classList.add("hidden");
    newCounterArea.classList.remove("hidden");
    counterInput.focus();
});

function handleConfirmCounter() {
    const name = counterInput.value.trim();

    if (!name) {
        alert("Name fehlt!");
        return;
    }

    // Neues Counter-Objekt erstellen
    const newCounter = new Counter({
        id: `id_${Date.now()}`,
        name: name,
        value: 0,
        updatedAt: null,
        resetEnabled: true,
        resetInterval: "daily",
    });

    // Counter zur Liste hinzufügen
    counter.push(newCounter);
    currentCounterId = newCounter.id;

    // Speichern
    saveCounter();

    // Eingabebereich schließen
    counterInput.value = "";
    newCounterArea.classList.add("hidden");
    headerTitle.classList.remove("hidden");
    addCounterBtn.classList.remove("hidden");

    // Oberfläche aktualisieren
    renderCounter();
    showCounterView();
}

confirmCounterBtn.addEventListener("click", handleConfirmCounter);

cancelCounterBtn.addEventListener("click", () => {
    counterInput.value = "";
    newCounterArea.classList.add("hidden");
    headerTitle.classList.remove("hidden");
    addCounterBtn.classList.remove("hidden");
    confirmCounterBtn.classList.add("hidden");
});

// // Optionaler Event-Listener für den Drei-Punkte-Button direkt bei der Erstellung
// optionsCounterBtn.addEventListener("click", () => {
//     // Hier kannst du zusätzliche Optionen (z.B. Erweitertes Menü / Einstellungen für den neuen Counter) einbauen
//     console.log("Optionen-Menü für neuen Counter geklickt");
// });

// function deleteCounter(id) {
//     counter = counter.filter(c => c.id !== id);
//     if (currentCounterId === id) {
//         currentCounterId = counter.length > 0 ? counter[0].id : null;
//     }
//     saveCounter();
//     renderCounter();

// ========================= EVENTS =========================
homeBtn.addEventListener("click", showMainView);
counterBtn.addEventListener("click", showCounterView);

plusBtn.addEventListener("click", () => {
    updateCounter("plus");
});

minusBtn.addEventListener("click", () => {
    updateCounter("minus");
});

resetBtn.addEventListener("click", () => {
    updateCounter("reset");
});

// // Klick außerhalb schließt Kontextmenüs
// document.addEventListener("click", () => {
//     document.querySelectorAll(".context-menu").forEach(m => m.classList.add("hidden"));
// });

// ========================= START =========================
window.addEventListener("load", () => {
    if (currentCounterId && counter.some((c) => c.id === currentCounterId)) {
        showCounterView();
    } else {
        showMainView();
    }
});
