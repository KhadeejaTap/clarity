console.log("WAKE");
const myForm = document.querySelector('.website_form');
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
}

async function deleteSite(siteObj) {
	console.log("Deleting: ", siteObj.url);
	const sites = await chrome.storage.local.get(["blocklist"])
	const res = sites.blocklist || [];
	const filtered = res.filter((site) =>
		site.id != siteObj.id
	);
	await chrome.storage.local.set({ blocklist: filtered });

	showItems();
}
async function showItems() {
	const listContainer = document.getElementById("siteList");
	listContainer.innerHTML = "";
	const sites = await chrome.storage.local.get(["blocklist"])
	const sitesList = sites.blocklist || [];
	for (const item of sitesList) {
		const listItem = document.createElement("li");
		listItem.textContent = item.url;
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.addEventListener("click", () => {
			deleteSite(item);
		});
		listItem.appendChild(deleteButton);
		listContainer.appendChild(listItem);
	}
}


showItems();
myForm.addEventListener('submit', addSite);
