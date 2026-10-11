let seconds = 0;
let timerId = null;

const myTimer = document.querySelector('#timerDisplay');
const focusButton = document.querySelector('#startFocus');
const timerView = document.querySelector('#timerView');
const blocklistView = document.querySelector('#blocklistView');
const openBlocklistBtn = document.querySelector('#openBlocklist');
const backToTimerBtn = document.querySelector('#backToTimer');
const websiteForm = document.querySelector('.website_form');

// View Switching
openBlocklistBtn.addEventListener('click', () => {
	timerView.classList.add('hidden');
	blocklistView.classList.remove('hidden');
	showItems();
});

backToTimerBtn.addEventListener('click', () => {
	blocklistView.classList.add('hidden');
	timerView.classList.remove('hidden');
});

// Stopwatch Tick
async function tick() {
	const data = await chrome.storage.local.get(["startTime"]);
	if (data.startTime) {
		seconds = Math.floor((Date.now() - data.startTime) / 1000);
		const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
		const secs = String(seconds % 60).padStart(2, '0');
		myTimer.textContent = `${mins}:${secs}`;
	}
}

// DeclarativeNetRequest Dynamic Blocking
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

// Blocklist Management
function cleanUrl(input) {
	let url = input.trim().toLowerCase();
	url = url.replace(/^https?:\/\//i, '');
	url = url.replace(/^www\./i, '');
	url = url.split('/')[0].split('?')[0].split('#')[0];
	return url;
}

async function addSite(event) {
	event.preventDefault();
	const inputEl = document.querySelector('#inputSite');
	const rawSite = inputEl.value;
	const sanitized = cleanUrl(rawSite);

	if (!sanitized) return;

	const sites = await chrome.storage.local.get(["blocklist"]);
	const res = sites.blocklist || [];

	const alreadyExists = res.some((site) => site.url === sanitized);
	if (alreadyExists) {
		inputEl.value = "";
		return;
	}

	const nextId = res.length > 0 ? Math.max(...res.map((s) => s.id)) + 1 : 1;
	const siteObj = {
		url: sanitized,
		id: nextId
	};

	res.push(siteObj);
	await chrome.storage.local.set({ blocklist: res });
	inputEl.value = "";
	showItems();

	// If timer is running, update blocking rules immediately
	if (timerId !== null) {
		await enableBlocking();
	}
}

async function deleteSite(siteObj) {
	const sites = await chrome.storage.local.get(["blocklist"]);
	const res = sites.blocklist || [];
	const filtered = res.filter((site) => site.id !== siteObj.id);

	await chrome.storage.local.set({ blocklist: filtered });
	showItems();

	// If timer is running, refresh blocking rules
	if (timerId !== null) {
		await enableBlocking();
	}
}

async function showItems() {
	const listContainer = document.getElementById("siteList");
	listContainer.innerHTML = "";

	const sites = await chrome.storage.local.get(["blocklist"]);
	const sitesList = sites.blocklist || [];

	if (sitesList.length === 0) {
		const emptyMsg = document.createElement("p");
		emptyMsg.className = "empty-state";
		emptyMsg.textContent = "No blocked sites yet.";
		listContainer.appendChild(emptyMsg);
		return;
	}

	for (const item of sitesList) {
		const listItem = document.createElement("li");
		listItem.textContent = item.url;

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "✕";
		deleteButton.addEventListener("click", () => {
			deleteSite(item);
		});

		listItem.appendChild(deleteButton);
		listContainer.appendChild(listItem);
	}
}

websiteForm.addEventListener('submit', addSite);

// UI & Backend Stats Sync
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

// Timer Controls
focusButton.addEventListener("click", async () => {
	if (timerId == null) {
		const startTime = Date.now();
		chrome.storage.local.set({ startTime: startTime });
		focusButton.textContent = "Stop Focus";
		focusButton.classList.add("active");
		tick();
		timerId = setInterval(tick, 1000);
		await enableBlocking();
	} else {
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

// Initialization
loadUserStats();

chrome.storage.local.get(["startTime"]).then((data) => {
	if (data.startTime) {
		tick();
		timerId = setInterval(tick, 1000);
		focusButton.textContent = "Stop Focus";
		focusButton.classList.add("active");
	}
});
