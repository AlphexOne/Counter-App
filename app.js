/*
 * COUNTER-APP
 * Copyright (C) 2026 AlphexOne
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/* =========================
    STATUSBAR UHR
========================= */

function updateClock() {

  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();

  minutes = minutes.toString().padStart(2, "0");

  document.getElementById("uhr").innerText =
    `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);


/* =========================
    COUNTER APP
========================= */

const listInput = document.getElementById("listInput");
const addListBtn = document.getElementById("addListBtn");
const listContainer = document.getElementById("listContainer");

const mainView = document.getElementById("mainView");
const listView = document.getElementById("listView");

const backBtn = document.getElementById("backBtn");
const listTitle = document.getElementById("listTitle");
const counterValue = document.getElementById("counterValue");
const lastUpdated = document.getElementById("lastUpdated");

const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const resetBtn = document.getElementById("resetBtn");

let lists = JSON.parse(localStorage.getItem("trackingLists")) || [];
let currentListId = null;


/* LISTEN RENDERN */
function renderLists() {

  listContainer.innerHTML = "";

  if (lists.length === 0) {

    listContainer.innerHTML = `
      <div class="empty-box">
        Noch keine Listen erstellt
      </div>
    `;

    return;
  }

  lists.forEach((list) => {

    const item = document.createElement("div");
    item.className = "list-card";

    item.innerHTML = `
      <div>
        <h3>${list.name}</h3>
        <p>Counter: ${list.count}</p>
      </div>
    `;

    item.addEventListener("click", () => {
      openList(list.id);
    });

    listContainer.appendChild(item);
  });
}


/* LISTE ERSTELLEN */
addListBtn.addEventListener("click", () => {

  const name = listInput.value.trim();

  if (!name) return;

  const newList = {
    id: Date.now(),
    name,
    count: 0,
    updated: null,
  };

  lists.push(newList);

  saveLists();
  renderLists();

  listInput.value = "";
});


/* LISTE ÖFFNEN */
function openList(id) {

  currentListId = id;

  const list = lists.find((item) => item.id === id);

  if (!list) return;

  listTitle.innerText = list.name;
  counterValue.innerText = list.count;

  lastUpdated.innerText =
    list.updated || "Noch nicht aktualisiert";

  mainView.classList.add("hidden");
  listView.classList.remove("hidden");
}


/* ZURÜCK */
backBtn.addEventListener("click", () => {

  listView.classList.add("hidden");
  mainView.classList.remove("hidden");
});


/* COUNTER UPDATEN */
function updateCounter(type) {

  const list = lists.find((item) => item.id === currentListId);

  if (!list) return;

  if (type === "plus") {
    list.count++;
  }

  if (type === "minus") {
    list.count--;
  }

  if (type === "reset") {
    list.count = 0;
  }

  list.updated = new Date().toLocaleString("de-DE");

  counterValue.innerText = list.count;
  lastUpdated.innerText = list.updated;

  saveLists();
  renderLists();
}

plusBtn.addEventListener("click", () => {
  updateCounter("plus");
});

minusBtn.addEventListener("click", () => {
  updateCounter("minus");
});

resetBtn.addEventListener("click", () => {
  updateCounter("reset");
});


/* LOCAL STORAGE */
function saveLists() {
  localStorage.setItem(
    "trackingLists",
    JSON.stringify(lists)
  );
}


/* START */
renderLists();