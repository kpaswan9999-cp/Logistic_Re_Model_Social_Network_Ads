const BACKEND_URL = "http://127.0.0.1:5000"; // Update this after deploying to Render

// Update salary display
const salaryInput = document.getElementById('salary');
const salaryVal = document.getElementById('salaryVal');

salaryInput.addEventListener('input', (e) => {
    salaryVal.textContent = `$${parseInt(e.target.value).toLocaleString()}`;
});

// Check system status
async function checkStatus() {
    try {
        const res = await fetch(`${BACKEND_URL}/status`);
        const data = await res.json();
        if (data.status === 'SYSTEM ONLINE') {
            document.getElementById('systemStatus').innerHTML = '<div class="status-dot"></div> ANALYTICS CORE ONLINE';
            document.getElementById('systemStatus').style.color = '#00f2fe';
        }
    } catch (err) {
        document.getElementById('systemStatus').innerHTML = '<div style="background-color: #ff00e5; box-shadow: 0 0 10px #ff00e5;" class="status-dot"></div> CORE OFFLINE';
        document.getElementById('systemStatus').style.color = '#ff00e5';
    }
}

checkStatus();

// Prediction Logic
const predictBtn = document.getElementById('predictBtn');
const resultZone = document.getElementById('resultZone');
const glassCard = document.querySelector('.glass-card');

predictBtn.addEventListener('click', async () => {
    const age = document.getElementById('age').value;
    const salary = document.getElementById('salary').value;

    predictBtn.innerText = 'PROCESSING VECTORS...';
    predictBtn.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ age, salary })
        });

        const data = await response.json();

        if (data.success) {
            displayResult(data);
        } else {
            alert('Analysis failed. Check your connection to the Analytics Core.');
            predictBtn.innerText = 'Execute Inference';
            predictBtn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert('Could not reach the server at ' + BACKEND_URL);
        predictBtn.innerText = 'Execute Inference';
        predictBtn.disabled = false;
    }
});

function displayResult(data) {
    glassCard.style.display = 'none';
    resultZone.style.display = 'block';

    const orb = document.getElementById('orb');
    const title = document.getElementById('resultTitle');
    const label = document.getElementById('resultLabel');
    const confidence = document.getElementById('confidenceVal');
    const impact = document.getElementById('conversionImpact');

    // Probability of Purchase
    const probPurchase = data.probability[1];
    const confScore = Math.max(data.probability[0], data.probability[1]) * 100;

    if (data.prediction === 1) {
        orb.className = 'result-orb converted';
        orb.innerHTML = '⚡';
        title.innerText = 'CONVERSION DETECTED';
        title.style.color = 'var(--accent-blue)';
        label.innerText = 'HIGH PURCHASE INTENT VIBRATION';
    } else {
        orb.className = 'result-orb not-converted';
        orb.innerHTML = '✕';
        title.innerText = 'SESSION DISSIPATION';
        title.style.color = 'var(--accent-magenta)';
        label.innerText = 'LOW CONSUMER RESONANCE';
    }

    confidence.innerText = `${confScore.toFixed(2)}%`;
    impact.innerText = `${(probPurchase * 100).toFixed(2)}%`;

    // Animate bars
    setTimeout(() => {
        document.getElementById('confBar').style.width = `${confScore}%`;
        document.getElementById('impactBar').style.width = `${probPurchase * 100}%`;
    }, 100);
}
