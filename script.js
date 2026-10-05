const board = document.getElementById('gameBoard');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatNotice = document.getElementById('chatNotice');

const symbols = ['⛏️', '💎', '🧱', '🪨', '🌳', '🥕', '🐷', '🧟'];
const blockedWords = [
  'asshole', 'bastard', 'bitch', 'crap', 'damn', 'fuck', 'shit',
  'tite', 'tangina', 'bobo', 'gago', 'tarantado', 'kike', 'pekpek', 'kepkep', 'etit', 'etits',
];
let conversation = [];

let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function shuffle(items) {
  const copy = items.slice();

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const oldItem = copy[i];
    copy[i] = copy[randomIndex];
    copy[randomIndex] = oldItem;
  }

  return copy;
}

function updateStats() {
  movesEl.textContent = String(moves);
  matchesEl.textContent = matches + ' / ' + symbols.length;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function renderMessages() {
  chatMessages.innerHTML = '';

  if (conversation.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'chat-empty';
    emptyState.textContent = 'No comments yet. Be kind and keep it family-friendly!';
    chatMessages.appendChild(emptyState);
    return;
  }

  for (let i = 0; i < conversation.length; i++) {
    const entry = conversation[i];
    const row = document.createElement('div');
    row.className = 'chat-row self';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble self';

    const sender = document.createElement('div');
    sender.className = 'chat-sender';
    sender.textContent = entry.sender;

    const text = document.createElement('div');
    text.className = 'chat-text';
    text.textContent = entry.text;

    bubble.appendChild(sender);
    bubble.appendChild(text);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addChatMessage(text) {
  conversation.push({ sender: 'You', text });
  renderMessages();
}

function hasBlockedWord(text) {
  const words = text.toLowerCase().match(/[a-z]+/g) || [];

  for (let i = 0; i < words.length; i++) {
    if (blockedWords.includes(words[i])) {
      return true;
    }
  }

  return false;
}

function buildBoard() {
  board.innerHTML = '';

  deck = [];
  // Add each symbol twice so every card has a matching pair.
  for (let i = 0; i < symbols.length; i++) {
    deck.push({ symbol: symbols[i] });
    deck.push({ symbol: symbols[i] });
  }
  deck = shuffle(deck);

  for (let i = 0; i < deck.length; i++) {
    const card = deck[i];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-card';
    button.dataset.symbol = card.symbol;
    button.setAttribute('aria-label', 'Hidden card');

    const frontFace = document.createElement('span');
    frontFace.className = 'card-face card-front';
    frontFace.textContent = '?';

    const backFace = document.createElement('span');
    backFace.className = 'card-face card-back';
    backFace.textContent = card.symbol;

    button.appendChild(frontFace);
    button.appendChild(backFace);
    button.addEventListener('click', function () {
      handleCardClick(button);
    });
    board.appendChild(button);
  }
}

function handleCardClick(card) {
  if (lockBoard) {
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

  if (!firstCard) {
    firstCard = card;
    setMessage('Pick one more card.');
    return;
  }

  secondCard = card;
  moves += 1;
  updateStats();

  if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.disabled = true;
    secondCard.disabled = true;
    matches += 1;
    updateStats();
    setMessage('Nice match!');

    firstCard = null;
    secondCard = null;

    if (matches === symbols.length) {
      setMessage('You won! Press New Game to play again.');
    }

    return;
  }

  lockBoard = true;
  setMessage('Not a match — try again.');

  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    setMessage('Keep going!');
  }, 750);
}

function resetGame() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
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
  const text = chatInput.value.trim();

  if (!text) {
    return;
  }

  if (hasBlockedWord(text)) {
    chatNotice.textContent = 'Please keep comments kind and family-friendly.';
    return;
  }

  chatNotice.textContent = '';
  addChatMessage(text);
  chatInput.value = '';
}

chatForm.addEventListener('submit', postComment);
resetBtn.addEventListener('click', resetGame);
startBtn.addEventListener('click', startGame);
renderMessages();
resetGame();
