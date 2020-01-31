var localStorageKey = "storekey_v1.0.0";
var data = JSON.parse(localStorage.getItem(localStorageKey)) || {
  isEnabled: true,
  isSayOpenings: true,
  openings: []
};
// let talker = new Talker();

fetch("./data/openings.json")
  .then(stream => {
    openings = stream.json().then(x => {
      data.openings = Object.values(x);
    });
  })
  .catch(err => {
    console.log("Error loading openings...", err);
  });

chrome.runtime.onMessage.addListener(async function(message, sender, reply) {
  console.log("message heard", message);
  switch (message.type) {
    case "getData":
      reply(data);
      break;
    case "toggleOn":
      data.isEnabled = !data.isEnabled;
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      reply(data);
      break;
    case "toggleOpenings":
      data.isSayOpenings = !data.isSayOpenings;
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      reply(data);
      break;
    case "say":
      say(message.data);
      break;
    default:
      console.error("Unknown message received:", message);
  }
  // return Date.now();
});

function say(txt) {
  // talker.say(txt);
  // setTimeout(() => {
  //   window.speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
  // }, 0);
  // // window.speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
  // console.log(txt);
}
