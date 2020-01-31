var btnToggle, btnToggleOpenings;

window.onload = function() {
  btnToggle = document.getElementById('btnToggleOn');
  btnToggle.onclick = () => {
    btnToggle.disabled = true;
    sendMessage('toggleOn', data => {});
  };

  btnToggleOpenings = document.getElementById('btnToggleOpenings');
  btnToggleOpenings.onclick = () => {
    btnToggleOpenings.disabled = true;
    sendMessage('toggleOpenings', data => {});
  };

  loadData();
};

function loadData() {
  btnToggle.textContent = 'loading...';
  btnToggleOpenings.textContent = 'loading...';

  sendMessage('getData', data => {
    btnToggle.disabled = false;
    console.log('response: ', data);
    btnToggle.textContent = data.isEnabled ? 'Turn Off ' : 'Turn On';
    btnToggleOpenings.textContent = data.isSayOpenings
      ? 'Turn Off Openings '
      : 'Turn On Openings';
  });
}

function sendMessage(type, cb, data) {
  var message = {
    source: 'popup',
    type: type,
    data: data
  };

  chrome.runtime.sendMessage(message, cb);
}
