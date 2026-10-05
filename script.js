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

// These symbols are used to make the card pairs.
const symbols = ['⛏️', '💎', '🧱', '🪨', '🌳', '🥕', '🐷', '🧟'];

// Comments containing any of these words will not be posted.
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

// Make a copy of the cards and swap them into random places.
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

// Update the move and match numbers on the page.
function updateStats() {
  movesElement.textContent = moves;
  matchesElement.textContent = matches + ' / ' + symbols.length;
}

function setMessage(text) {
  messageElement.textContent = text;
}

// Show all comments in the chat area.
function showComments() {
  // Clear the old messages before drawing them again.
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

// Check if a word matches one of the blocked words.
function isBlockedWord(word) {
  for (let i = 0; i < blockedWords.length; i++) {
    if (word === blockedWords[i]) {
      return true;
    }
  }

  return false;
}

// Split the comment into words and check each word.
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

// Make sixteen cards and put them on the game board.
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

// Turn over the two cards after the player finds no match.
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

// Check the card the player clicked.
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

  // The second span in each button shows that card's symbol.
  if (firstCard.children[1].textContent === secondCard.children[1].textContent) {
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

// Reset the counters and create a new shuffled game.
function resetGame() {
  // Stop an old mismatch timer if New Game is pressed.
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

// Hide the start page and show the game.
function startGame() {
  startScreen.hidden = true;
  gameScreen.hidden = false;
}

// Check and post a comment from the form.
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

// Set up the page buttons and form.
chatForm.addEventListener('submit', postComment);
resetButton.addEventListener('click', resetGame);
startButton.addEventListener('click', startGame);

showComments();
resetGame();
