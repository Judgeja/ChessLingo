let MOVES_STORE = [];
let CURRENT_OPENING = "";
let talker;

window.onload = () => {
  talker = new Talker();
  say("A");
  sendMessage("getData", data => {
    isSayOpenings = data.isSayOpenings;
    openings = data.openings;
    // If openings is empty, then we should re-call a few times.. Should never be empty though..
    setInterval(() => {
      checkForUpdates();
    }, 250);
  });
};

function checkForUpdates() {
  let latestMoveList = getMoves();
  if (latestMoveList == null) {
    return;
  }
  if (MOVES_STORE.length < latestMoveList.length) {
    let newMoves = latestMoveList.slice(MOVES_STORE.length);
    //readMoves(newMoves);
    updateCurrentOpening(latestMoveList);
    MOVES_STORE = latestMoveList;
  } else if (MOVES_STORE.length > latestMoveList.length) {
    console.log("its a new round");
    // Then its a new round
    MOVES_STORE = latestMoveList;
    CURRENT_OPENING = "";
  }
}

// Replace this function to correctly find the moves from the DOM.
function getMoves() {
  // let moveDiv = document.getElementById('testData');
  let moveDiv = document.getElementsByClassName("moves")[0];
  if (moveDiv == null) {
    return;
  }
  let movesList = moveDiv.getElementsByTagName("m2");
  if (movesList == null) {
    return;
  }

  let moves = [];
  for (let i = 0; i < movesList.length; i++) {
    moves.push(movesList[i].innerText);
  }
  return moves;

  // if (moveDiv == null) {
  //   return;
  // }
  // let moves = moveDiv.value;
  // return moves
  //   .split(';')
  //   .map(m => m.trim())
  //   .filter(x => x != '');
}

function readMoves(moves) {
  for (let move of moves) {
    moveToSpeech(move);
  }
}
function moveToSpeech(move) {
  if (move.toLowerCase() === "o-o" || move.toLowerCase() === "0-0") {
    say("kingside castle");
  } else if (move.toLowerCase() === "o-o-o" || move.toLowerCase() === "0-0-0") {
    say("Queenside castle");
  } else {
    let speech = "";
    for (let c of move) {
      speech += getSymbolAsWord(c) + " ";
    }

    say(speech);
  }
}

function getSymbolAsWord(c) {
  switch (c) {
    case "K":
      return "King";
    case "Q":
      return "Queen";
    case "B":
      return "Bishop";
    case "N":
      return "Knight";
    case "R":
      return "Rook";
    case "x":
      return "Captures";
    case "+":
      return "Check";
    case "#":
      return "Checkmate";
    default:
      return c + ".";
  }
}

function say(txt) {
  talker.say(txt);
  // sendMessage("say", null, txt);
  // setTimeout(() => {
  //   window.speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
  // }, 0);
  // // window.speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
  // console.log(txt);
}

function updateCurrentOpening(latestMoveList) {
  let opening = openings.find(o => areArraysEqual(o.moves, latestMoveList));

  if (opening != null && opening.name != CURRENT_OPENING) {
    CURRENT_OPENING = opening.name;
    say(opening.name);
  }
}

function areArraysEqual(arr, arr2) {
  if (arr.length != arr2.length) {
    return false;
  }
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
function sendMessage(type, cb, data) {
  var message = {
    source: "popup",
    type: type,
    data: data
  };

  chrome.runtime.sendMessage(message, cb);
}

const WORDS = [
  { word: "A", pos: 1 },
  { word: "B", pos: 2 },
  { word: "C", pos: 3 },
  { word: "D", pos: 4 },
  { word: "E", pos: 5 },
  { word: "F", pos: 6 },
  { word: "G", pos: 7 },
  { word: "H", pos: 8 },
  { word: "1", pos: 9 },
  { word: "2", pos: 10 },
  { word: "3", pos: 11 },
  { word: "4", pos: 12 },
  { word: "5", pos: 13 },
  { word: "6", pos: 14 },
  { word: "7", pos: 15 },
  { word: "8", pos: 16 },
  { word: "CAPTURES", pos: 17 },
  { word: "CASTLES", pos: 18 },
  { word: "KINGSIDE", pos: 19 },
  { word: "QUEENSIDE", pos: 20 },
  { word: "KNIGHT", pos: 21 },
  { word: "BISHOP", pos: 22 },
  { word: "ROOK", pos: 23 },
  { word: "KING", pos: 24 },
  { word: "QUEEN", pos: 25 },
  { word: "CHECK", pos: 26 },
  { word: "CHECKMATE", pos: 27 },
  { word: "STALEMATE", pos: 28 }
];

class Talker {
  audio;
  playQueue = [];
  isSpeaking = false;
  currentWord = null;
  constructor() {
    let url = chrome.runtime.getURL("/sounds/moves.mp3");
    // load the file
    this.audio = new Audio();
    this.audio.src = url; // or whatever
    this.audio.load();
  }

  processQueue() {
    if (this.isSpeaking || this.playQueue.length == 0) {
      // Let it return and we can process the next one on complete.
      return;
    }
    this.currentWord = this.getAudioFromWord(this.playQueue[0]);
    if (!!this.currentWord) {
      this.isSpeaking = true;
      this.audio.currentTime = this.currentWord.pos;
      this.audio.play();
    } else {
      window.speechSynthesis.speak(
        new SpeechSynthesisUtterance(this.playQueue[0])
      );
    }
    this.audio.ontimeupdate = e => {
      // console.log(e);
      if (this.currentWord == null) {
        console.warn("NO CURRENT WORD WHUUUT");
        console.log("this.audio.currentTime", this.audio.currentTime);
        console.log("e.currentTime", e.currentTime);
        console.log("this.playQueue", this.playQueue);
        return;
      }
      if (this.audio.currentTime >= this.currentWord.pos + 0.5) {
        this.isSpeaking = false;
        this.playQueue.splice(0, 1);
        this.audio.pause();
        this.processQueue();
      }
    };
  }
  say(text) {
    console.log("say: ", text);
    this.playQueue.push(text.toUpperCase());
    this.processQueue();
  }
  getAudioFromWord(word) {
    return WORDS.find(w => w.word === word);
  }
}
