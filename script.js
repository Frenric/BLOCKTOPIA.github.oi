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

const symbols = ['🌙', '🚀', '⭐', '🎮', '🌈', '💎', '🔥', '🎵'];
const blockedWords = new Set(['asshole', 'bastard', 'bitch', 'crap', 'damn', 'fuck', 'shit']);
let conversation = [];

let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

function shuffle(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }

  return copy;
}

function updateStats() {
  movesEl.textContent = String(moves);
  matchesEl.textContent = `${matches} / ${symbols.length}`;
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

  conversation.forEach((entry) => {
    const row = document.createElement('div');
    row.className = `chat-row ${entry.own ? 'self' : 'other'}`;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${entry.own ? 'self' : 'other'}`;

    const sender = document.createElement('div');
    sender.className = 'chat-sender';
    sender.textContent = entry.sender;

    const text = document.createElement('div');
    text.className = 'chat-text';
    text.textContent = entry.text;

    bubble.append(sender, text);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addChatMessage(text) {
  conversation.push({ sender: 'You', text, own: true });
  renderMessages();
}

function hasBlockedWord(text) {
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  return words.some((word) => blockedWords.has(word.replace(/^'+|'+$/g, '')));
}

function buildBoard() {
  board.innerHTML = '';

  deck = shuffle(
    symbols
      .flatMap((symbol) => [
        { id: `${symbol}-a`, symbol },
        { id: `${symbol}-b`, symbol },
      ])
      .map((card) => ({ ...card, key: `${card.id}-${Math.random()}` }))
  );

  deck.forEach((card) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-card';
    button.dataset.symbol = card.symbol;
    button.dataset.id = card.id;
    button.setAttribute('aria-label', 'Hidden card');
    button.innerHTML = `
      <span class="card-face card-front">?</span>
      <span class="card-face card-back">${card.symbol}</span>
    `;
    button.addEventListener('click', () => handleCardClick(button));
    board.appendChild(button);
  });
}

function handleCardClick(card) {
  if (
    lockBoard ||
    !card ||
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

chatForm.addEventListener('submit', (event) => {
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
});

resetBtn.addEventListener('click', resetGame);
startBtn.addEventListener('click', () => {
  startScreen.hidden = true;
  gameScreen.hidden = false;
});
renderMessages();
resetGame();

