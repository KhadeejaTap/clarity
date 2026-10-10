console.log("WAKE");
const myForm = document.querySelector('.website_form');
async function addSite(event) {
	event.preventDefault();
	const newSite = document.querySelector('#inputSite').value;
	console.log(newSite);
	const sites = await chrome.storage.local.get(["blocklist"])
	const res = sites.blocklist || [];
	const ruleId = res.length + 1;
	const siteObj = {
		url: newSite,
		id: ruleId
	};
	res.push(siteObj)
	await chrome.storage.local.set({ blocklist: res })
	console.log("site added");
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
