import { filterStudyMap } from "./sidebar.js";
import { highlightAmphoe } from "./map.js";
import { showToast } from "./utils.js";

const config = {
    anstolerate: 3,
};
let quizState = {
    score: 0,
    timer: 0,
    targetName: null,
    targetProv: null,
    answered: 0,
};
let questionPool;
let game_timer = null;

export function switchMode(mode) {
    currentMode = mode;

    // UI Toggles
    document.getElementById("btn-study").classList.toggle("active", mode === "study");
    document.getElementById("btn-quiz").classList.toggle("active", mode === "quiz");

    document.querySelector("#view-study").classList.toggle("hidden", mode === "quiz");
    document.getElementById("view-quiz").classList.toggle("hidden", mode !== "quiz");

    // Map Logic
    geoJsonLayer.resetStyle();
    map.flyTo([13.5, 100.5], 6);

    // TOOLTIP LOGIC: Hide in Quiz, Show in Study
    allAmphoeList.forEach((item) => {
        if (mode === "quiz") {
            item.layer.unbindTooltip(); // Hide labels
        } else {
            // Re-bind labels (sticky)
            item.layer.bindTooltip(item.name, { sticky: true, direction: "top" });
            // Reset "Study Filter" visual effect if any
        }
    });

    if (mode === "quiz") {
        resetQuizState();
        nextQuestion();
    }
}

function resetQuizState() {
    quizState.score = 0;
    document.getElementById("q-score").innerText = "0";
}

function mapOnlySelect() {
    const selectedProv = [...new Set(questionPool.map((el) => el.prov))];
    allAmphoeList.forEach((item) => {
        if (selectedProv.includes(item.prov)) {
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

export function nextQuestion() {
    // Reset
    quizState.answered = 0;
    quizState.timer = 0;
    document.getElementById("q-next-btn").style.display = "none";
    document.getElementById("q-hint").innerText = "";
    geoJsonLayer.resetStyle();

    // Get selected provinces from checkboxes
    const checkboxes = document.querySelectorAll(".quiz-prov-check:checked");
    let selectedProvs = Array.from(checkboxes).map((cb) => cb.value);

    // Filter the pool of questions
    questionPool = allAmphoeList;
    if (selectedProvs.length > 0) {
        questionPool = allAmphoeList.filter((item) => selectedProvs.includes(item.prov));
    }

    if (questionPool.length === 0) {
        // Fallback if nothing selected
        questionPool = allAmphoeList;
        showToast("ไม่ได้เลือกจังหวัด จะเลือกทุกจังหวัดให้", "error");
    }

    mapOnlySelect();

    // Pick Random
    const randomIdx = Math.floor(Math.random() * questionPool.length);
    const target = questionPool[randomIdx];

    quizState.targetName = target.name;
    quizState.targetProv = target.prov;

    // Render Question
    document.getElementById("q-text").innerText = target.name;

    // Timer
    game_timer = setInterval(() => {
        quizState.timer += 100;
        document.querySelector("#q-timer").textContent = `${(quizState.timer / 1000).toFixed(1)} sec`;
    }, 100);
}

export function checkQuizAnswer(clickedName, clickedProv, layer) {
    if (quizState.answered > config.anstolerate) return;

    const score = ((300000 - quizState.timer) * Math.max(0, config.anstolerate - quizState.answered + 1) / 10000).toFixed(1);

    if (clickedName === quizState.targetName) {
        // Correct!
        layer.setStyle({ color: "white", weight: 2, fillColor: "var(--success)", fillOpacity: 0.8 });
        quizState.score += Number(score);
        clearInterval(game_timer)
        document.getElementById("q-score").innerText = quizState.score;
        showToast(`ถูกต้อง! +${score}`, "success");

        // Zoom in to confirm
        map.fitBounds(layer.getBounds());
    } else {
        // Wrong
        layer.setStyle({ fillColor: "var(--error)", fillOpacity: 0.8, color: "white", weight: 2 });
        showToast(`ผิด! นี่คือ ${clickedName} ${clickedProv}`, "error");

        // Show Hint after 1 second
        setTimeout(() => {
            document.getElementById("q-hint").innerText = `คำใบ้: จังหวัด ${quizState.targetProv}`;
        }, 1000);
    }

    quizState.answered++;
    document.getElementById("q-next-btn").style.display = "inline-block";

    if (quizState.answered > config.anstolerate) {
        const targetLayer = allAmphoeList
            .filter((el) => el.name === quizState.targetName && el.prov === quizState.targetProv)
            .map((el) => el.layer)[0];
        highlightAmphoe(targetLayer, quizState.targetName, quizState.targetProv, false);
        mapOnlySelect();
        showToast(`นี่คือ ${quizState.targetName} ${quizState.targetProv}`, "success");
        clearInterval(game_timer)
    }
}

document.addEventListener("sidebarRendered", () => {
    // check all
    document.getElementById("check-all-prov").addEventListener("change", function (e) {
        const isChecked = e.target.checked;
        document.querySelectorAll(".quiz-prov-check").forEach((cb) => {
            cb.checked = isChecked;
        });
    });

    // update quiz option
    document.querySelectorAll(".quiz-prov-check").forEach((cb) => {
        cb.addEventListener("input", () => {
            resetQuizState();
            nextQuestion();
        });
    });
});
