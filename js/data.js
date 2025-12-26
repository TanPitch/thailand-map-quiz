import { renderSidebar } from "./sidebar.js";
import { highlightAmphoe } from "./map.js";
import { checkQuizAnswer } from "./quiz.js";

export function loadData() {
    const DATA_URL =
        "https://raw.githubusercontent.com/chingchai/OpenGISData-Thailand/master/districts.geojson";

    fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) throw new Error("Network error");
            return response.json();
        })
        .then((data) => {
            document.getElementById("loader").style.display = "none";
            processGeoJSON(data);
        })
        .catch((err) => {
            console.error(err);
            document.getElementById("loader").innerHTML = `
                        <div style="color:red; text-align:center; padding:20px;">
                            <i class="fas fa-exclamation-triangle fa-2x"></i><br><br>
                            เกิดข้อผิดพลาดในการโหลดแผนที่<br>
                            Failed to load map data.<br>
                            <small>Please check your internet connection.</small>
                        </div>`;
        });
}

function processGeoJSON(data) {
    geoJsonLayer = L.geoJSON(data, {
        style: {
            color: "#0277BD",
            weight: 1,
            fillOpacity: 0.2,
            fillColor: "#B3E5FC",
        },
        onEachFeature: function (feature, layer) {
            // Extract Names
            // Using specific keys from chingchai repo, falling back to generic if missing
            const props = feature.properties;
            const ampName = props.amp_th || props.amp_en || "Unknown";
            const provName = props.pro_th || props.pro_en || "Unknown";

            // 1. Add Tooltip (Hover)
            layer.bindTooltip(ampName, { sticky: true, direction: "top" });

            // 2. Store Reference for Logic
            if (!amphoeIndex[provName]) amphoeIndex[provName] = {};
            amphoeIndex[provName][ampName] = layer;

            allAmphoeList.push({
                name: ampName,
                prov: provName,
                layer: layer,
            });

            // 3. Click Handler
            layer.on("click", function (e) {
                if (currentMode === "study") {
                    highlightAmphoe(layer, ampName, provName);
                } else if (currentMode === "quiz") {
                    checkQuizAnswer(ampName, provName, layer);
                }
            });
        },
    }).addTo(map);

    renderSidebar();
}
