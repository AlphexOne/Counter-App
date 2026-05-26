/*
  - COUNTER-APP
  - Copyright (C) 2026 AlphexOne
  - SPDX-License-Identifier: GPL-3.0-or-later
*/

// ========================= STATUSBAR UHR =========================
function updateClock() {
    const clockElement = document.getElementById("uhr");
    if (clockElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
    }
}
updateClock();
setInterval(updateClock, 1000);

// ========================= COUNTER APP LOGIK =========================
const CounterInput = document.getElementById("CounterInput");
const addCounterBtn = document.getElementById("addCounterBtn");
const CounterContainer = document.getElementById("CounterContainer");

const mainView = document.getElementById("mainView");
const CounterView = document.getElementById("CounterView");
const backBtn = document.getElementById("backBtn");
const CounterTitle = document.getElementById("CounterTitle");
const CounterValue = document.getElementById("CounterValue");
const lastUpdated = document.getElementById("lastUpdated");

const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const resetBtn = document.getElementById("resetBtn");

// Datenstruktur laden
let Counter = JSON.parse(localStorage.getItem("trackingCounters")) || [];
let currentCounterId = null;

/* COUNTER RENDERN */
function renderCounter() {
    CounterContainer.innerHTML = "";
    
    if (Counter.length === 0) {
        CounterContainer.innerHTML = `<div class="empty-box"><p style="text-align:center; padding: 20px; color: var(--text-muted);">Keine Counter vorhanden. Lege oben einen an!</p></div>`;
        return;
    }

    Counter.forEach(item => {
        const card = document.createElement("div");
        card.className = "Counter-card";
        card.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <p>Wert: <strong>${item.value}</strong></p>
                <small style="color: var(--text-muted); font-size: 11px;">Update: ${item.updatedAt || 'Nie'}</small>
            </div>
            <button class="delete-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        `;
        
        // Klick auf die Karte öffnet den Counter (außer man klickt auf Löschen)
        card.addEventListener("click", (e) => {
            if (!e.target.closest(".delete-btn")) {
                openCounter(item.id);
            }
        });

        // Lösch-Button Logik
        const delBtn = card.querySelector(".delete-btn");
        delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteCounter(item.id);
        });

        CounterContainer.appendChild(card);
    });
}

/* COUNTER ERSTELLEN */
addCounterBtn.addEventListener("click", () => {
    const name = CounterInput.value.trim();
    if (!name) {
        alert("Bitte gib einen Namen für den Counter ein!");
        return;
    }

    const newCounter = {
        id: Date.now().toString(),
        name: name,
        value: 0,
        updatedAt: "Noch nicht aktualisiert"
    };

    Counter.push(newCounter);
    saveCounter();
    renderCounter();
    CounterInput.value = ""; // Input leeren
});

/* COUNTER ÖFFNEN */
function openCounter(id) {
    currentCounterId = id;
    const item = Counter.find(c => c.id === id);
    if (!item) return;

    CounterTitle.textContent = item.name;
    CounterValue.textContent = item.value;
    lastUpdated.textContent = item.updatedAt;

    // Views wechseln
    mainView.classList.add("hidden");
    CounterView.classList.remove("hidden");
    
    // Nav-Buttons im Footer aktualisieren
    updateFooterActive(1); // Index 1 ist der Chart/Counter-View
}

/* ZURÜCK ZUM MAIN VIEW */
backBtn.addEventListener("click", () => {
    switchViewToMain();
});

function switchViewToMain() {
    CounterView.classList.add("hidden");
    mainView.classList.remove("hidden");
    currentCounterId = null;
    updateFooterActive(0); // Index 0 ist Home/Main
}

/* COUNTER UPDATEN */
function updateCounter(type) {
    if (!currentCounterId) return;
    const item = Counter.find(c => c.id === currentCounterId);
    if (!item) return;

    if (type === "plus") {
        item.value++;
    } else if (type === "minus") {
        item.value--;
    } else if (type === "reset") {
        item.value = 0;
    }

    // Zeitstempel generieren
    const now = new Date();
    item.updatedAt = now.toLocaleDateString("de-DE") + " " + now.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });

    // UI & Speicher updaten
    CounterValue.textContent = item.value;
    lastUpdated.textContent = item.updatedAt;
    
    saveCounter();
    renderCounter(); // Liste im Hintergrund aktuell halten
}

plusBtn.addEventListener("click", () => { updateCounter("plus"); });
minusBtn.addEventListener("click", () => { updateCounter("minus"); });
resetBtn.addEventListener("click", () => { updateCounter("reset"); });

/* COUNTER LÖSCHEN */
function deleteCounter(id) {
    Counter = Counter.filter(c => c.id !== id);
    saveCounter();
    renderCounter();
    if (currentCounterId === id) {
        switchViewToMain();
    }
}

/* LOCAL STORAGE */
function saveCounter() {
    localStorage.setItem("trackingCounters", JSON.stringify(Counter));
}

// ========================= FOOTER NAVIGATION =========================
const navButtons = document.querySelectorAll(".footer .nav-btn");

navButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (index === 0) {
            switchViewToMain();
        } else if (index === 1) {
            // Wenn ein Counter existiert, öffne den ersten, sonst bleib im Main
            if (Counter.length > 0) {
                openCounter(Counter[0].id);
            } else {
                alert("Erstelle zuerst einen Counter!");
            }
        } else if (index === 2) {
            // Der Plus-Button unten scrollt zum Input im Main View
            switchViewToMain();
            CounterInput.focus();
        } else if (index === 3) {
            alert("Einstellungsview (Hell/Dunkel & Auto-Reset) kommt im nächsten Update!");
        }
    });
});

function updateFooterActive(activeIndex) {
    navButtons.forEach((btn, idx) => {
        if (idx === activeIndex) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Start der App
renderCounter();