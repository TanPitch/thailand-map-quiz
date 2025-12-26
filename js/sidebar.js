import { dropdown } from ".././lib/dropdown.js";
import { focusAmphoe } from "./map.js";

export function filterStudyMap() {
    const selectedProv = document.getElementById("study-prov-filter").value;

    allAmphoeList.forEach((item) => {
        if (selectedProv === "all" || item.prov === selectedProv) {
            item.layer.setStyle({
                fillOpacity: 0.2,
                opacity: 1,
                color: "#0277BD",
            });
        } else {
            // Dim other provinces
            item.layer.setStyle({
                fillOpacity: 0,
                opacity: 0,
                color: "transparent",
            });
        }
    });
}

export function renderSidebar() {
    const accordionContainer = document.getElementById("accordion-container");
    const studySelect = document.getElementById("study-prov-filter");
    const quizList = document.getElementById("quiz-prov-list");

    accordionContainer.innerHTML = "";
    studySelect.innerHTML = '<option value="all">แสดงทั้งหมด (Show All Thailand)</option>';
    quizList.innerHTML = "";

    const sortedProvs = Object.keys(amphoeIndex).sort((a, b) => a.localeCompare(b));

    sortedProvs.forEach((prov) => {
        // 1. Populate Study View Dropdown
        const option = document.createElement("option");
        option.value = prov;
        option.innerText = prov;
        studySelect.appendChild(option);

        // 2. Populate Quiz View Checkboxes
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" class="quiz-prov-check" value="${prov}" checked> ${prov}`;
        quizList.appendChild(label);

        // 3. Populate Study Accordion (Original Logic)
        const group = document.createElement("div");
        group.className = "province-group";
        const header = document.createElement("div");
        header.className = "province-header";
        header.innerHTML = `<span>${prov}</span><i class="fas fa-chevron-right arrow"></i>`;
        header.onclick = () => toggleGroup(group);

        const ampList = document.createElement("div");
        ampList.className = "amphoe-list";
        const sortedAmps = Object.keys(amphoeIndex[prov]).sort((a, b) => a.localeCompare(b));

        sortedAmps.forEach((amp) => {
            const item = document.createElement("div");
            item.className = "amphoe-item";
            item.innerHTML = `<span>${amp}</span> <i class="fas fa-crosshairs"></i>`;
            item.onclick = (e) => {
                e.stopPropagation();
                focusAmphoe(prov, amp);
            };
            ampList.appendChild(item);
        });

        group.appendChild(header);
        group.appendChild(ampList);
        accordionContainer.appendChild(group);
    });

    const studySelectDD = new dropdown(studySelect, {
        width: "100%",
        customClass: "dropdown-theme",
        customCss: `
          .dropdown-theme {
            font-family: 'Prompt', sans-serif;
          }

          .dropdown-theme .ss-trigger {
            padding: 5px 10px;
          }
            
          .dropdown-theme .ss-option:hover {
            background-color: #def0ffff;
            color: #0d47a1;
          }

          .dropdown-theme .ss-option {
            padding: 5px;
          }

          .dropdown-theme .ss-option.selected {
            background: #b9e0ffff;
            color: #223442ff;
          }

          .dropdown-theme .ss-search-wrapper {
            padding: 4px;
          }
        `,
    });

    studySelectDD.container.addEventListener("dropdown.change", (e) => {
        document.getElementById("study-prov-filter").value = e.detail.value;
        filterStudyMap();
    });

    const event = new CustomEvent("sidebarRendered");
    document.dispatchEvent(event);
}

function toggleGroup(group) {
    group.classList.toggle("expanded");
}

function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    const groups = document.querySelectorAll(".province-group");

    const filtered_amp = allAmphoeList.filter((el) => el.name.includes(term));
    const filtered_prov = [...new Set(filtered_amp.map((el) => el.prov))];

    groups.forEach((group) => {
        const provName = group.querySelector(".province-header span").innerText.toLowerCase();
        const ampItems = [...group.querySelectorAll(".amphoe-item")].filter((el) => {
            const header = el.parentElement.parentElement.querySelector(".province-header").textContent;
            if (filtered_prov.includes(header)) return el;
        });

        group.style.display = filtered_prov.includes(provName) ? "block" : "none";

        ampItems.forEach((item) => {
            const ampName = item.querySelector("span").innerText.toLowerCase();
            item.style.display = ampName.includes(term) ? "flex" : "none";
        });
    });

    if (term === "") groups.forEach((group) => group.classList.remove("expanded"));
}

// Search Listener
document.querySelector("#search-input").addEventListener("input", handleSearch);
