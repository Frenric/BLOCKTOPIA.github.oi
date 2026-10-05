const board = document.getElementById('gameBoard');
const movesElement = document.getElementById('moves');
const matchesElement = document.getElementById('matches');
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startButton = document.getElementById('startBtn');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatNotice = document.getElementById('chatNotice');

const symbols = ['⛏️', '💎', '🧱', '🪨', '🌳', '🥕', '🐷', '🧟'];

const blockedWords = [
  'asshole', 'bastard', 'bitch', 'crap', 'damn', 'fuck', 'shit',
  'tite', 'tangina', 'bobo', 'gago', 'tarantado', 'kike', 'pekpek', 'kepkep', 'etit', 'etits'
];

let comments = [];
let cards = [];
let firstCard = null;
let secondCard = null;
let boardIsLocked = false;
let moves = 0;
let matches = 0;
let hideCardsTimer = null;

function shuffleCards(items) {
  let shuffledItems = [];

  for (let i = 0; i < items.length; i++) {
    shuffledItems.push(items[i]);
  }

  for (let i = shuffledItems.length - 1; i > 0; i--) {
    let randomIndex = Math.floor(Math.random() * (i + 1));
    let savedCard = shuffledItems[i];
    shuffledItems[i] = shuffledItems[randomIndex];
    shuffledItems[randomIndex] = savedCard;
  }

  return shuffledItems;
}

function updateStats() {
  movesElement.textContent = moves;
  matchesElement.textContent = matches + ' / ' + symbols.length;
}

function setMessage(text) {
  messageElement.textContent = text;
}

function showComments() {
  chatMessages.innerHTML = '';

  if (comments.length === 0) {
    let emptyMessage = document.createElement('p');
    emptyMessage.className = 'chat-empty';
    emptyMessage.textContent = 'No comments yet. Be kind and keep it family-friendly!';
    chatMessages.appendChild(emptyMessage);
    return;
  }

  for (let i = 0; i < comments.length; i++) {
    let row = document.createElement('div');
    row.className = 'chat-row self';

    let bubble = document.createElement('div');
    bubble.className = 'chat-bubble self';

    let sender = document.createElement('div');
    sender.className = 'chat-sender';
    sender.textContent = 'You';

    let commentText = document.createElement('div');
    commentText.className = 'chat-text';
    commentText.textContent = comments[i];

    bubble.appendChild(sender);
    bubble.appendChild(commentText);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addComment(text) {
  comments.push(text);
  showComments();
}

function isBlockedWord(word) {
  for (let i = 0; i < blockedWords.length; i++) {
    if (word === blockedWords[i]) {
      return true;
    }
  }

  return false;
}

function hasBlockedWord(text) {
  let lowerCaseText = text.toLowerCase();
  let currentWord = '';

  for (let i = 0; i < lowerCaseText.length; i++) {
    let character = lowerCaseText[i];

    if (character >= 'a' && character <= 'z') {
      currentWord = currentWord + character;
    } else {
      if (currentWord !== '' && isBlockedWord(currentWord)) {
        return true;
      }
      currentWord = '';
    }
  }

  if (currentWord !== '' && isBlockedWord(currentWord)) {
    return true;
  }

  return false;
}

function buildBoard() {
  board.innerHTML = '';
  cards = [];

  for (let i = 0; i < symbols.length; i++) {
    cards.push(symbols[i]);
    cards.push(symbols[i]);
  }

  cards = shuffleCards(cards);

  for (let i = 0; i < cards.length; i++) {
    let card = document.createElement('button');
    card.type = 'button';
    card.className = 'memory-card';
    card.dataset.symbol = cards[i];
    card.setAttribute('aria-label', 'Hidden card');

    let frontFace = document.createElement('span');
    frontFace.className = 'card-face card-front';
    frontFace.textContent = '?';

    let backFace = document.createElement('span');
    backFace.className = 'card-face card-back';
    backFace.textContent = cards[i];

    card.appendChild(frontFace);
    card.appendChild(backFace);
    card.addEventListener('click', handleCardClick);
    board.appendChild(card);
  }
}

function hideCards() {
  if (firstCard !== null) {
    firstCard.classList.remove('flipped');
  }

  if (secondCard !== null) {
    secondCard.classList.remove('flipped');
  }

  firstCard = null;
  secondCard = null;
  boardIsLocked = false;
  hideCardsTimer = null;
  setMessage('Keep going!');
}

function handleCardClick(event) {
  let card = event.currentTarget;

  if (boardIsLocked) {
    return;
  }

  if (
    card === firstCard ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) {
    return;
  }

  card.classList.add('flipped');

  if (firstCard === null) {
    firstCard = card;
    setMessage('Pick one more card.');
    return;
  }

  secondCard = card;
  moves = moves + 1;
  updateStats();

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.disabled = true;
    secondCard.disabled = true;
    matches = matches + 1;
    updateStats();
    setMessage('Nice match!');

    firstCard = null;
    secondCard = null;

    if (matches === symbols.length) {
      setMessage('You won! Press New Game to play again.');
    }

    return;
  }

  boardIsLocked = true;
  setMessage('Not a match — try again.');
  hideCardsTimer = setTimeout(hideCards, 750);
}

function resetGame() {
  if (hideCardsTimer !== null) {
    clearTimeout(hideCardsTimer);
    hideCardsTimer = null;
  }

  firstCard = null;
  secondCard = null;
  boardIsLocked = false;
  moves = 0;
  matches = 0;
  updateStats();
  setMessage('Find all the matching pairs.');
  buildBoard();
}

function startGame() {
  startScreen.hidden = true;
  gameScreen.hidden = false;
}

function postComment(event) {
  event.preventDefault();
  let text = chatInput.value.trim();

  if (text === '') {
    return;
  }

  if (hasBlockedWord(text)) {
    chatNotice.textContent = 'Please keep comments kind and family-friendly.';
    return;
  }

  chatNotice.textContent = '';
  addComment(text);
  chatInput.value = '';
}

chatForm.addEventListener('submit', postComment);
resetButton.addEventListener('click', resetGame);
startButton.addEventListener('click', startGame);

showComments();
resetGame();
