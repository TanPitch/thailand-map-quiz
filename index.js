import { loadData } from "./js/data.js";
import { switchMode, nextQuestion } from "./js/quiz.js";

// --- GLOBALS ---
window.map = null;
window.geoJsonLayer = null;

// Data Structure: { "Chiang Mai": { "Mueang Chiang Mai": layer, "Mae Rim": layer }, "Bangkok": {...} }
window.amphoeIndex = {};
window.allAmphoeList = []; // [ {name: "Mueang Chiang Mai", prov: "Chiang Mai", layer: layerRef} ]

window.currentMode = "study";

function initMap() {
    map = L.map("map").setView([13.5, 100.5], 6);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
    }).addTo(map);
}

// --- INIT ---
window.onload = function () {
    initMap();
    loadData();

    document.querySelector("#btn-study").addEventListener("click", () => switchMode("study"))
    document.querySelector("#btn-quiz").addEventListener("click", () => switchMode("quiz"))
    document.querySelector("#q-next-btn").addEventListener("click", nextQuestion);
};