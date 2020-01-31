var eleResults;

window.onload = function() {
	eleResults = document.getElementById('results');
	loadData();
};
document.getElementById('header').onclick = () => {
	goBack();
};

function loadData() {
	document.getElementById('title').textContent = 'loading...';

	sendMessage('getPopupData', data => {
		let urlParams = new URLSearchParams(window.location.search);
		let idx = urlParams.get('idx');
		updateView(data.sites[idx]);
	});
}

function updateView(data) {
	document.getElementById('title').textContent = data.name;
	updateElement('webapp', data.emulatorUrl);
	updateElement('imslink', data.url);
	updateElement('maximsdb', data.db);
	updateElement('maximsdbserver', data.dbserver);
	updateElement('maximsapp', data.maximsUrl);

	document.getElementById('btnDelete').onclick = () => {
		let api = data.url;
		if (
			confirm(
				'Are you sure you want to remove: ' +
					data.name +
					' (' +
					api +
					')'
			)
		) {
			sendMessage(
				'removeAPI',
				data => {
					goBack();
				},
				api
			);
		}
	};
}

function goBack() {
	window.location.href = '../popup/popup.html';
}

function updateElement(name, value) {
	let ele = document.getElementById(name);
	ele.textContent = value;
	addClickHandler(ele);
}

function addClickHandler(ele) {
	ele.onclick = e => {
		let savedName = ele.textContent;
		copyToClipboard(savedName);
		ele.textContent = 'Copied!';
		setTimeout(() => {
			ele.textContent = savedName;
		}, 1000);
	};
}

const copyToClipboard = str => {
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
};

function sendMessage(type, cb, data) {
	var message = {
		source: 'popup',
		type: type,
		data: data
	};

	chrome.runtime.sendMessage(message, cb);
}
