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

focusButton.addEventListener("click", () => {
	if (timerId == null) {
		const startTime = Date.now();
		chrome.storage.local.set({ startTime: startTime });
		focusButton.textContent = "Stop Focus";
		tick();
		timerId = setInterval(tick, 1000);
	}
	else {
		myTimer.textContent = `00:00`;
		focusButton.textContent = "Start Focus";
		logSecs(seconds);
		clearInterval(timerId);
		timerId = null;
		chrome.storage.local.remove(["startTime"]);
	}
});
function logSecs(seconds) {
	totalsecs += seconds;
	console.log(totalsecs);
}
chrome.storage.local.get(["startTime"]).then((data) => {
	if (data.startTime) {
		tick();
		timerId = setInterval(tick, 1000);
		focusButton.textContent = "Stop Focus";
	}
});
