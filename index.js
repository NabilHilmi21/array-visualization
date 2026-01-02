const MAX_VISUAL = 200;

let data = [];
let seqSteps = 0;
let binSteps = 0;
let seqTime = 0;
let binTime = 0;
let currentInterval = null;

function getTarget() {
    return document.getElementById("targetArray").value.toLowerCase().trim();
}

async function generateArray() {
    const size = Number(document.getElementById("sizeArray").value);
    if (!size || size <= 0 || size > 1000) {
        alert("Masukkan ukuran 1–1000");
        return;
    }

    const res = await fetch(`https://randomuser.me/api/?results=${size}&nat=id`);
    const json = await res.json();

    data = json.results.map(u =>
        `${u.name.first} ${u.name.last}`.toLowerCase()
    );

    render();
    drawBigOGraph();
}

function render(active = -1, found = -1) {
    const container = document.getElementById("array");

    if (data.length > MAX_VISUAL) {
        container.innerHTML =
            `<p class="text-slate-500 text-center">
            Dataset ${data.length} data<br>Visualisasi dimatikan
            </p>`;
        return;
    }

    container.innerHTML = data.map((v, i) => {
        let cls = "px-3 py-1 rounded-lg text-sm border";
        if (i === active) cls += " bg-yellow-200";
        else if (i === found) cls += " bg-emerald-300";
        else cls += " bg-slate-50";
        return `<div class="${cls}">${v}</div>`;
    }).join("");
}

function startSequential() {
    if (currentInterval) clearInterval(currentInterval);
    const target = getTarget();
    let i = 0;
    seqSteps = 0;
    const start = performance.now();

    currentInterval = setInterval(() => {
        if (i >= data.length) {
            seqTime = performance.now() - start;
            clearInterval(currentInterval);
            drawAllGraphs();
            return;
        }

        seqSteps++;
        render(i);
        document.getElementById("steps").innerText =
            `Linear: ${data[i]}`;

        if (data[i] === target) {
            seqTime = performance.now() - start;
            render(-1, i);
            clearInterval(currentInterval);
            drawAllGraphs();
        }
        i++;
    }, 120);
}

function startBinary() {
    if (currentInterval) clearInterval(currentInterval);
    data.sort();
    const target = getTarget();
    let left = 0, right = data.length - 1;
    binSteps = 0;
    const start = performance.now();

    currentInterval = setInterval(() => {
        if (left > right) {
            binTime = performance.now() - start;
            clearInterval(currentInterval);
            drawAllGraphs();
            return;
        }

        binSteps++;
        const mid = Math.floor((left + right) / 2);
        render(mid);
        document.getElementById("steps").innerText =
            `Binary: ${data[mid]}`;

        if (data[mid] === target) {
            binTime = performance.now() - start;
            render(-1, mid);
            clearInterval(currentInterval);
            drawAllGraphs();
        } else if (data[mid] < target) left = mid + 1;
        else right = mid - 1;
    }, 220);
}

/* ================= GRAPH ================= */

function drawAllGraphs() {
    drawStepGraph();
    drawRuntimeGraph();
}

function drawStepGraph() {
    const c = document.getElementById("graph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";

    const max = Math.max(seqSteps, binSteps, 1);
    const scale = 160 / max;

    // Linear
    ctx.fillStyle = "#ef4444";
    const linearH = seqSteps * scale;
    ctx.fillRect(90, 200 - linearH, 60, linearH);
    ctx.fillText(seqSteps + " steps", 120, 190 - linearH);
    ctx.fillText("Linear", 120, 220);

    // Binary
    ctx.fillStyle = "#6366f1";
    const binaryH = binSteps * scale;
    ctx.fillRect(200, 200 - binaryH, 60, binaryH);
    ctx.fillText(binSteps + " steps", 230, 190 - binaryH);
    ctx.fillText("Binary", 230, 220);
}

function drawBigOGraph() {
    const c = document.getElementById("bigOGraph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "13px sans-serif";

    const n = [1, 2, 4, 8, 16, 32, 64];
    const linear = n.map(v => v);
    const logN = n.map(v => Math.log2(v));

    const max = Math.max(...linear);

    function drawLine(data, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = 50 + i * 40;
            const y = 200 - (v / max) * 140;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(40, 210);
    ctx.lineTo(330, 210);
    ctx.stroke();

    drawLine(linear, "#ef4444"); // O(n)
    drawLine(logN, "#22c55e");   // O(log n)

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(230, 30, 12, 12);
    ctx.fillText("O(n) – Linear Search", 250, 40);

    ctx.fillStyle = "#22c55e";
    ctx.fillRect(230, 55, 12, 12);
    ctx.fillText("O(log n) – Binary Search", 250, 65);
}

function drawRuntimeGraph() {
    const c = document.getElementById("runtimeGraph");
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";

    const max = Math.max(seqTime, binTime, 1);
    const scale = 160 / max;

    // Linear
    ctx.fillStyle = "#ef4444";
    const lH = seqTime * scale;
    ctx.fillRect(90, 200 - lH, 60, lH);
    ctx.fillText(seqTime.toFixed(2) + " ms", 120, 190 - lH);
    ctx.fillText("Linear", 120, 220);

    // Binary
    ctx.fillStyle = "#6366f1";
    const bH = binTime * scale;
    ctx.fillRect(200, 200 - bH, 60, bH);
    ctx.fillText(binTime.toFixed(2) + " ms", 230, 190 - bH);
    ctx.fillText("Binary", 230, 220);
}
