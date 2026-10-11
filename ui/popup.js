let seconds = 0
let totalsecs = 0
let timerId = null
const myTimer = document.querySelector('#timerDisplay');
const focusButton = document.querySelector('#startFocus');
async function tick() {
	const data = await chrome.storage.local.get(["startTime"]);
	if (data.startTime) {
		seconds = Math.floor((Date.now() - data.startTime) / 1000);
		const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
		const secs = String(seconds % 60).padStart(2, '0');
		myTimer.textContent = `${mins}:${secs}`;
	}
}

async function enableBlocking() {
	const data = await chrome.storage.local.get(["blocklist"]);
	const sites = data.blocklist || [];
	if (sites.length === 0) return;

	const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
	const oldIds = oldRules.map((r) => r.id);

	const rules = sites.map((site) => ({
		id: site.id,
		priority: 1,
		action: { type: "block" },
		condition: {
			urlFilter: site.url,
			resourceTypes: ["main_frame"]
		}
	}));

	await chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: oldIds,
		addRules: rules
	});
}

async function disableBlocking() {
	const currentRules = await chrome.declarativeNetRequest.getDynamicRules();
	const ruleIds = currentRules.map((r) => r.id);

	if (ruleIds.length > 0) {
		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: ruleIds
		});
	}
}

function updateStatsUI(level, xp) {
	const levelEl = document.querySelector('#userLevel');
	const xpEl = document.querySelector('#userXp');
	const barFill = document.querySelector('#xpBarFill');

	if (levelEl) levelEl.textContent = level;
	if (xpEl) xpEl.textContent = xp;
	if (barFill) {
		const progressPercent = (xp % 10) * 10;
		barFill.style.width = `${progressPercent}%`;
	}
}

async function saveSessionToBackend(durationInSeconds) {
	try {
		const res = await fetch('http://localhost:3000/sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ duration: durationInSeconds })
		});

		if (res.ok) {
			const data = await res.json();
			updateStatsUI(data.level, data.totalXp);
		}
	} catch (err) {
		console.error("Failed to connect to Clarity backend:", err);
	}
}

async function loadUserStats() {
	try {
		const res = await fetch('http://localhost:3000/stats');
		if (res.ok) {
			const data = await res.json();
			updateStatsUI(data.level, data.xp);
		}
	} catch (err) {
		console.error("Failed to fetch stats from backend:", err);
	}
}

focusButton.addEventListener("click", async () => {
	if (timerId == null) {
		const startTime = Date.now();
		chrome.storage.local.set({ startTime: startTime });
		focusButton.textContent = "Stop Focus";
		focusButton.classList.add("active");
		tick();
		timerId = setInterval(tick, 1000);
		await enableBlocking();
	}
	else {
		myTimer.textContent = `00:00`;
		focusButton.textContent = "Start Focus";
		focusButton.classList.remove("active");
		const elapsedSeconds = seconds;
		clearInterval(timerId);
		timerId = null;
		chrome.storage.local.remove(["startTime"]);
		await disableBlocking();
		if (elapsedSeconds > 0) {
			await saveSessionToBackend(elapsedSeconds);
		}
	}
});

loadUserStats();

chrome.storage.local.get(["startTime"]).then((data) => {
	if (data.startTime) {
		tick();
		timerId = setInterval(tick, 1000);
		focusButton.textContent = "Stop Focus";
		focusButton.classList.add("active");
	}
});
