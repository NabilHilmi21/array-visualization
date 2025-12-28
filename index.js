let data = [];
let seqSteps = 0;
let binSteps = 0;
let animSeq = 0;
let animBin = 0;

let runtimeData = {
    linear: [],
    binary: []
};

let currentInterval = null;

let showLinear = false;
let showBinary = false;

function getTarget() {
    return Number(document.getElementById("targetArray").value);
}

function generateArray() {
    let size = Number(document.getElementById("sizeArray").value);
    data = [];

    for (let i = 0; i < size; i++) {
        data.push(Math.floor(Math.random() * 100));
    }

    seqSteps = 0;
    binSteps = 0;
    animSeq = 0;
    animBin = 0;

    showLinear = false;
    showBinary = false;

    render();
    drawBigOGraph();
}


function render(active = -1, found = -1) {
    let html = "";
    for (let i = 0; i < data.length; i++) {
        let cls = "box";
        if (i === active) cls += " active";
        if (i === found) cls += " found";
        html += `<div class="${cls}">${data[i]}</div>`;
    }
    document.getElementById("array").innerHTML = html;
}

function startSequential() {
    if (currentInterval) clearInterval(currentInterval);

    const startTime = performance.now(); 

    showLinear = true;
    drawBigOGraph();

    let target = getTarget();
    let i = 0;
    seqSteps = 0;

    currentInterval = setInterval(() => {
        if (i >= data.length) {
            clearInterval(currentInterval);

            const endTime = performance.now(); 
            runtimeData.linear.push({
                steps: seqSteps,
                time: endTime - startTime
            });


            drawRuntimeGraph();
            drawGraph();
            return;
        }

        seqSteps++;
        render(i);
        document.getElementById("steps").innerText =
            `Sequential steps: ${seqSteps}`;

        if (data[i] === target) {
            render(-1, i);
            clearInterval(currentInterval);

            runtimeData.linear.push({
                steps: seqSteps,
                time: endTime - startTime
            });

            drawRuntimeGraph();
            drawGraph();
        }

        i++;
    }, 200);
}

function startBinary() {
    if (currentInterval) clearInterval(currentInterval);

    const startTime = performance.now(); 

    showBinary = true;
    drawBigOGraph();

    let target = getTarget();
    data.sort((a, b) => a - b);
    render();

    let left = 0;
    let right = data.length - 1;
    binSteps = 0;

    currentInterval = setInterval(() => {
        if (left > right) {
            clearInterval(currentInterval);

            const endTime = performance.now(); 
            runtimeData.binary.push({
                steps: binSteps,
                time: endTime - startTime
            });

            drawRuntimeGraph();
            drawGraph();
            return;
        }


        binSteps++;
        let mid = Math.floor((left + right) / 2);
        render(mid);
        document.getElementById("steps").innerText =
            `Binary steps: ${binSteps}`;

        if (data[mid] === target) {
            render(-1, mid);
            clearInterval(currentInterval);

            const endTime = performance.now();
            runtimeData.binary.push({
                steps: binSteps,
                time: endTime - startTime
            });


            drawRuntimeGraph();
            drawGraph();
        } else if (data[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }, 300);
}

function drawGraph() {
    let canvas = document.getElementById("graph");
    let ctx = canvas.getContext("2d");

    let startSeq = animSeq;
    let startBin = animBin;
    let endSeq = seqSteps;
    let endBin = binSteps;

    let startTime = performance.now();
    let duration = 400;

    function animate(time) {
        let t = Math.min((time - startTime) / duration, 1);
        animSeq = startSeq + (endSeq - startSeq) * t;
        animBin = startBin + (endBin - startBin) * t;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // axis
        ctx.strokeStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(50, 20);
        ctx.lineTo(50, 260);
        ctx.lineTo(460, 260);
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.fillText("Steps", 10, 30);
        ctx.fillText("Sequential", 140, 285);
        ctx.fillText("Binary", 330, 285);

        let max = Math.max(animSeq, animBin, 1);
        let scale = 200 / max;

        let seqY = 260 - animSeq * scale;
        let binY = 260 - animBin * scale;

        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(150, seqY);
        ctx.lineTo(350, binY);
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(150, seqY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(350, binY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.fillText(Math.round(animSeq) + " steps", 120, seqY - 10);
        ctx.fillText(Math.round(animBin) + " steps", 320, binY - 10);

        if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

function drawBigOGraph() {
    const canvas = document.getElementById("bigOGraph");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    const n = [1, 2, 4, 8, 16, 32, 64];
    const linear = n.map(v => v);
    const logN = n.map(v => Math.log2(v));
    const maxY = Math.max(...linear);

    // axis
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + height);
    ctx.lineTo(padding + width, padding + height);
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.fillText("Operations", 5, padding);
    ctx.fillText("n", padding + width + 5, padding + height + 5);

    function drawLine(data, color, label, offsetY) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((val, i) => {
            const x = padding + (i / (data.length - 1)) * width;
            const y = padding + height - (val / maxY) * height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();

        // label
        ctx.fillStyle = color;
        ctx.fillText(label, padding + 10, padding + offsetY);
    }

    if (showLinear) drawLine(linear, "#ef4444", "O(n) - Linear Search", 15);
    if (showBinary) drawLine(logN, "#22c55e", "O(log n) - Binary Search", 30);
}


function drawRuntimeGraph() {
    const canvas = document.getElementById("runtime");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const padding = 50;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    ctx.font = "12px sans-serif";

    ctx.strokeStyle = "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + height);
    ctx.lineTo(padding + width, padding + height);
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.fillText("Time (ms)", 10, padding + 20);
    ctx.fillText("Steps", padding + width - 30, padding + height + 30);

    const allTimes = [
        ...runtimeData.linear.map(d => d.time),
        ...runtimeData.binary.map(d => d.time),
        1
    ];

    const allSteps = [
        ...runtimeData.linear.map(d => d.steps),
        ...runtimeData.binary.map(d => d.steps),
        1
    ];

    const maxY = Math.max(...allTimes);
    const maxX = Math.max(...allSteps);

    ctx.fillStyle = "#475569";
    for (let i = 0; i <= 5; i++) {
        const value = (maxY / 5) * i;
        const y = padding + height - (i / 5) * height;

        ctx.fillText(value.toFixed(1), 10, y + 4);

        ctx.strokeStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }

    ctx.fillStyle = "#475569";
    const uniqueSteps = [...new Set(allSteps)].sort((a, b) => a - b);

    uniqueSteps.forEach(s => {
        const x = padding + (s / maxX) * width;
        ctx.fillText(s, x - 6, padding + height + 20);
    });

    function drawLine(data, color, label, offsetY) {
        if (data.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((d, i) => {
            const x = padding + (d.steps / maxX) * width;
            const y = padding + height - (d.time / maxY) * height;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);

            // titik
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // label waktu
            ctx.fillText(
                d.time.toFixed(2) + " ms",
                x + 6,
                y - 6
            );
        });

        ctx.stroke();

        // legend
        ctx.fillStyle = color;
        ctx.fillText(label, padding + 10, padding + offsetY);
    }

    drawLine(runtimeData.linear, "#ef4444", "Linear Runtime", 15);
    drawLine(runtimeData.binary, "#22c55e", "Binary Runtime", 30);
}
