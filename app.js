/*
 * TRACKING-APP
 * Copyright (C) 2026 AlphexOne
 * SPDX-License-Identifier: GPL-3.0-or-later
 */







/* Uhrzeit im Statusbar */
function updateClock() {

  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Führende Null
  minutes = minutes.toString().padStart(2, "0");

  document.getElementById("uhr").innerText =
    `${hours}:${minutes}`;
}

/* sofort anzeigen */
updateClock();

/* jede Sekunde aktualisieren */
setInterval(updateClock, 1000);
