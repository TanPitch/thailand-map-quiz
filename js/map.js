import { showToast } from "./utils.js";
import { filterStudyMap } from "./sidebar.js";

export function focusAmphoe(prov, amp) {
    const layer = amphoeIndex[prov][amp];
    if (layer) {
        highlightAmphoe(layer, amp, prov);
        // Find sidebar item to highlight (optional)
    }
}

export function highlightAmphoe(layer, ampName, provName, resetStyle = true) {
    // Reset others
    if (resetStyle) geoJsonLayer.resetStyle();

    filterStudyMap();

    // Highlight clicked
    layer.setStyle({
        weight: 3,
        color: "#FFD700", // Gold border
        fillColor: "#FFD700",
        fillOpacity: 0.5,
    });

    layer.bringToFront();
    var center = layer.getBounds().getCenter();
    var zoom = Math.max(map.getZoom(), 9);
    map.setView(center, zoom);
    // map.fitBounds(layer.getBounds());

    showToast(`ตำแหน่ง: ${ampName}, ${provName}`, "success");
}
