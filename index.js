const MAX_VISUAL = 200;

let data = [];
let iterSteps = 0;
let recSteps = 0;
let iterTime = 0;
let recTime = 0;
let currentInterval = null;

/* ================= UTIL ================= */

function getTarget() {
    return document.getElementById("targetArray").value.toLowerCase().trim();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ================= GENERATE DATA ================= */

async function generateArray() {
    const size = Number(document.getElementById("sizeArray").value);
    if (!size || size <= 0 || size > 1000) {
        alert("Masukkan ukuran 1–1000");
        return;
    }

    const res = await fetch(`https://randomuser.me/api/?results=${size}&nat=id`);
    const json = await res.json();

    data = json.results.map(
        u => `${u.name.first} ${u.name.last}`.toLowerCase()
    );

    render();
    drawBigOGraph();
}

/* ================= VISUAL ================= */

function render(active = -1, found = -1) {
    const c = document.getElementById("array");

    if (data.length > MAX_VISUAL) {
        c.innerHTML = `
            <p class="text-slate-500 text-center">
                Dataset ${data.length} data<br>
                Visualisasi dimatikan
            </p>`;
        return;
    }

    c.innerHTML = data.map((v, i) => {
        let cls = "px-3 py-1 rounded-lg text-sm border";
        if (i === active) cls += " bg-yellow-200";
        else if (i === found) cls += " bg-emerald-300";
        else cls += " bg-slate-50";
        return `<div class="${cls}">${v}</div>`;
    }).join("");
}

/* ================= LINEAR SEARCH ITERATIF ================= */

async function startLinearIterative() {
    if (currentInterval) currentInterval = null;

    iterSteps = 0;
    const target = getTarget();
    const start = performance.now();

    let i = 0;
    let found = false;

    while (!found && i < data.length) {
        iterSteps++;
        render(i);

        document.getElementById("steps").innerText =
            `Linear Iteratif: ${data[i]}`;

        await sleep(250);

        if (data[i] === target) {
            found = true;
            render(-1, i);
            iterTime = performance.now() - start;
            drawAllGraphs();
            return;
        }

        i++;
    }

    iterTime = performance.now() - start;
    drawAllGraphs();
}


/* ================= LINEAR SEARCH REKURSIF ================= */

function startLinearRecursive() {
    if (currentInterval) clearInterval(currentInterval);

    recSteps = 0;
    const target = getTarget();
    const start = performance.now();

    function recurse(index) {
        if (index >= data.length) {
            recTime = performance.now() - start;
            drawAllGraphs();
            return;
        }

        recSteps++;
        render(index);

        document.getElementById("steps").innerText =
            `Linear Rekursif: ${data[index]}`;

        if (data[index] === target) {
            render(-1, index);
            recTime = performance.now() - start;
            drawAllGraphs();
            return;
        }

        currentInterval = setTimeout(() => {
            recurse(index + 1);
        }, 250);
    }

    recurse(0);
}

/* ================= GRAPH ================= */

function drawAllGraphs() {
    drawStepGraph();
    drawRuntimeGraph();
}

/* ===== STEP GRAPH ===== */

function drawStepGraph() {
    const c = document.getElementById("graph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";

    const max = Math.max(iterSteps, recSteps, 1);
    const scale = 160 / max;

    // Iteratif
    ctx.fillStyle = "#6366f1";
    const iH = iterSteps * scale;
    ctx.fillRect(90, 200 - iH, 60, iH);
    ctx.fillText(iterSteps + " steps", 120, 190 - iH);
    ctx.fillText("Iteratif", 120, 220);

    // Rekursif
    ctx.fillStyle = "#22c55e";
    const rH = recSteps * scale;
    ctx.fillRect(200, 200 - rH, 60, rH);
    ctx.fillText(recSteps + " steps", 230, 190 - rH);
    ctx.fillText("Rekursif", 230, 220);
}

/* ===== RUNTIME GRAPH ===== */

function drawRuntimeGraph() {
    const c = document.getElementById("runtimeGraph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";

    const max = Math.max(iterTime, recTime, 1);
    const scale = 160 / max;

    // Iteratif
    ctx.fillStyle = "#6366f1";
    const iH = iterTime * scale;
    ctx.fillRect(90, 200 - iH, 60, iH);
    ctx.fillText(iterTime.toFixed(2) + " ms", 120, 190 - iH);
    ctx.fillText("Iteratif", 120, 220);

    // Rekursif
    ctx.fillStyle = "#22c55e";
    const rH = recTime * scale;
    ctx.fillRect(200, 200 - rH, 60, rH);
    ctx.fillText(recTime.toFixed(2) + " ms", 230, 190 - rH);
    ctx.fillText("Rekursif", 230, 220);
}

/* ================= BIG-O GRAPH (O(n)) ================= */

function drawBigOGraph() {
    const c = document.getElementById("bigOGraph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "13px sans-serif";

    const n = [5, 10, 20, 40, 80, 160];
    const linear = n.map(v => v);

    // axes
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 210);
    ctx.lineTo(330, 210);
    ctx.stroke();

    const baseY = 200;
    const scaleY = 1;

    ctx.strokeStyle = "#ef4444";
    ctx.beginPath();
    linear.forEach((v, i) => {
        const x = 50 + i * 40;
        const y = baseY - v * scaleY;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // legend
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(50, 25, 12, 12);
    ctx.fillText("O(n) – Linear Search", 70, 35);
}
