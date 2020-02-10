let MOVES_STORE = [];
let CURRENT_OPENING = "";
let talker;

window.onload = () => {
  setTimeout(() => {
    talker = new Talker();
    readMoves(["a3"]);
    readMoves(["Ba3"]);
    readMoves(["Rxc4#"]);
  }, 250);

  sendMessage("getData", data => {
    isSayOpenings = data.isSayOpenings;
    openings = data.openings;

    // If openings is empty, then we should re-call a few times.. Probably should never be empty though?
    // setInterval(() => {
    //   checkForUpdates();
    // }, 250);
  });
};

function sendMessage(type, cb, data) {
  var message = {
    source: "popup",
    type: type,
    data: data
  };

  chrome.runtime.sendMessage(message, cb);
}

function checkForUpdates() {
  let latestMoveList = getMoves();
  if (latestMoveList == null) {
    return;
  }
  if (MOVES_STORE.length < latestMoveList.length) {
    let newMoves = latestMoveList.slice(MOVES_STORE.length);
    readMoves(newMoves);
    // updateCurrentOpening(latestMoveList);
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
    talker.say("castle kingside");
  } else if (move.toLowerCase() === "o-o-o" || move.toLowerCase() === "0-0-0") {
    talker.say("castle queenside");
  } else {
    let speech = "";
    for (let c of move) {
      speech += getSymbolAsWord(c) + " ";
    }

    talker.say(speech + ".");
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
    case "$":
      return "Stalemate";
    default:
      return c;
  }
}

// function updateCurrentOpening(latestMoveList) {
//   let opening = openings.find(o => areArraysEqual(o.moves, latestMoveList));

//   if (opening != null && opening.name != CURRENT_OPENING) {
//     CURRENT_OPENING = opening.name;
//     say(opening.name);
//   }
// }

// function areArraysEqual(arr, arr2) {
//   if (arr.length != arr2.length) {
//     return false;
//   }
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] !== arr2[i]) {
//       return false;
//     }
//   }
//   return true;
// }

const WORDS = [
  { word: "A", pos: 0, length: 0.3 },
  { word: "B", pos: 0.5, length: 0.3 },
  { word: "C", pos: 1, length: 0.3 },
  { word: "D", pos: 1.5, length: 0.3 },
  { word: "E", pos: 2, length: 0.3 },
  { word: "F", pos: 2.5, length: 0.3 },
  { word: "G", pos: 3, length: 0.3 },
  { word: "H", pos: 3.5, length: 0.3 },
  { word: "1", pos: 4, length: 0.3 },
  { word: "2", pos: 4.5, length: 0.3 },
  { word: "3", pos: 5, length: 0.3 },
  { word: "4", pos: 5.5, length: 0.3 },
  { word: "5", pos: 6, length: 0.3 },
  { word: "6", pos: 6.5, length: 0.3 },
  { word: "7", pos: 7, length: 0.3 },
  { word: "8", pos: 7.5, length: 0.3 },
  { word: "CAPTURES", pos: 8, length: 1 },
  { word: "CASTLES", pos: 9, length: 1 },
  { word: "KINGSIDE", pos: 10, length: 1 },
  { word: "QUEENSIDE", pos: 11, length: 1 },
  { word: "KNIGHT", pos: 12, length: 1 },
  { word: "BISHOP", pos: 13, length: 1 },
  { word: "ROOK", pos: 14, length: 1 },
  { word: "KING", pos: 15, length: 1 },
  { word: "QUEEN", pos: 16, length: 1 },
  { word: "CHECK", pos: 17, length: 1 },
  { word: "STALEMATE", pos: 18, length: 1 },
  { word: "CHECKMATE", pos: 19, length: 1 }
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
      // Let it return anssd we can process the next one on complete.
      return;
    }

    let toSay = this.playQueue[0];
    console.log("Going to say: " + toSay);

    this.currentWord = this.getAudioFromWord(toSay);
    if (!!this.currentWord) {
      this.isSpeaking = true;
      this.audio.currentTime = this.currentWord.pos;
      this.audio.play();
      console.log("playing", this.currentWord);
    } else {
      this.playQueue.splice(0, 1);
      if (toSay === ".") {
        setTimeout(x => {
          this.processQueue();
        }, 500);
      } else {
        console.log("** TRYING TO SAY BUT CANT: ", toSay);
      }
      //  else {
      //   window.speechSynthesis.speak(new SpeechSynthesisUtterance(toSay));
      // }
    }

    this.audio.ontimeupdate = e => {
      if (this.currentWord == null) {
        return;
      }
      if (
        this.audio.currentTime >=
        this.currentWord.pos + this.currentWord.length
      ) {
        console.log(
          "Just finishing saying",
          this.currentWord,
          this.playQueue[0]
        );
        this.isSpeaking = false;
        this.playQueue.splice(0, 1);
        this.audio.pause();
        this.processQueue();
      }
    };
  }
  say(text) {
    console.log("say: ", text);
    this.playQueue.push(...text.toUpperCase().split(" "));
    this.processQueue();
  }
  getAudioFromWord(word) {
    return WORDS.find(w => w.word === word);
  }
}
