// --- Config ---
const COUNT = 10;
const LIST_URL = `https://cataas.com/api/cats?limit=${COUNT}`;

// --- State ---
const deckEl = document.getElementById('deck');
const progressEl = document.getElementById('progress');
const btnLike = document.getElementById('btn-like');
const btnNope = document.getElementById('btn-nope');

const summaryEl = document.getElementById('summary');
const likedGrid = document.getElementById('liked-grid');
const likeCount = document.getElementById('like-count');
const totalCount = document.getElementById('total-count');
const btnRestart = document.getElementById('btn-restart');

let cards = [];
let likedUrls = [];
let disliked = 0;
let total = 0;

// --- Helpers ---
function imageUrlById(id, w = 700, h = 900) {
  return `https://cataas.com/cat/${id}?width=${w}&height=${h}`;
}
function updateProgress() {
  const processed = total - cards.length;
  progressEl.textContent = cards.length
    ? `${processed}/${total} viewed`
    : `All ${total} viewed`;
}
function showBadge(card, type, strength){
  const like = card.querySelector('.badge.like');
  const nope = card.querySelector('.badge.nope');
  if (type === 'like') {
    like.style.opacity = String(Math.min(1, strength));
    like.style.transform = `scale(${0.9 + Math.min(0.1, strength/2)})`;
    nope.style.opacity = '0';
  } else if (type === 'nope') {
    nope.style.opacity = String(Math.min(1, strength));
    nope.style.transform = `scale(${0.9 + Math.min(0.1, strength/2)})`;
    like.style.opacity = '0';
  } else {
    like.style.opacity = '0';
    nope.style.opacity = '0';
  }
}

function attachSwipe(card, imgUrl){
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;
  let dragging = false;

  const onStart = (x, y) => {
    dragging = true;
    startX = x; startY = y;
    card.style.transition = 'none';
  };
  const onMove = (x, y) => {
    if (!dragging) return;
    currentX = x - startX;
    currentY = y - startY;

    const rotate = (currentX / 20);
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

    const threshold = Math.abs(currentX) / 120;
    showBadge(card, currentX > 0 ? 'like' : 'nope', threshold);
  };
  const onEnd = () => {
    if (!dragging) return;
    dragging = false;

    const offRight = currentX > 120;
    const offLeft  = currentX < -120;

    
    if (!offRight && !offLeft) {
      card.style.transition = 'transform .18s ease';
      card.style.transform = '';
      showBadge(card, 'none', 0);
      return;
    }

    const toX = (offRight ? window.innerWidth : -window.innerWidth);
    const toY = currentY;
    card.style.transition = 'transform .22s ease-out';
    card.style.transform = `translate(${toX}px, ${toY}px) rotate(${currentX/20}deg)`;

    
    setTimeout(() => {
      card.remove();
      cards.pop();
      if (offRight) {
        likedUrls.push(imgUrl);
      } else {
        disliked++;
      }
      nextOrSummary();
    }, 200);
  };


  card.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, {passive: true});
  card.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, {passive: true});
  card.addEventListener('touchend', onEnd);
  card.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onEnd);

  card.tabIndex = 0;
}

function createCard(imgUrl){
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('role', 'img');
  card.setAttribute('aria-label', 'Cat picture');

  const img = document.createElement('img');
  img.src = imgUrl;
  img.alt = 'Cat';
  img.loading = 'lazy';

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.innerHTML = `
    <span class="badge like">LIKE</span>
    <span class="badge nope">NOPE</span>
  `;

  card.appendChild(img);
  card.appendChild(badges);

  deckEl.appendChild(card);
  return card;
}

function nextOrSummary(){
  updateProgress();
  if (cards.length === 0) {
    //Summary
    totalCount.textContent = String(total);
    likeCount.textContent  = String(likedUrls.length);
    likedGrid.innerHTML = '';
    likedUrls.forEach(url => {
      const i = document.createElement('img');
      i.src = url;
      i.alt = 'Liked cat';
      i.loading = 'lazy';
      likedGrid.appendChild(i);
    });

    summaryEl.classList.remove('hidden');
    document.querySelector('.controls').classList.add('hidden');

    summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

btnLike.addEventListener('click', () => {
  const top = cards.at(-1);
  if (!top) return;

  top.style.transition = 'transform .22s ease-out';
  top.style.transform = `translate(${window.innerWidth}px, 0) rotate(14deg)`;
  const img = top.querySelector('img');
  setTimeout(() => { top.remove(); cards.pop(); likedUrls.push(img.src); nextOrSummary(); }, 200);
});
btnNope.addEventListener('click', () => {
  const top = cards.at(-1);
  if (!top) return;
  top.style.transition = 'transform .22s ease-out';
  top.style.transform = `translate(-${window.innerWidth}px, 0) rotate(-14deg)`;
  setTimeout(() => { top.remove(); cards.pop(); disliked++; nextOrSummary(); }, 200);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') btnLike.click();
  if (e.key === 'ArrowLeft')  btnNope.click();
});

btnRestart.addEventListener('click', () => {
  location.reload();
});

async function loadCats(){
  try {

    const urls = [];
    for (let i = 0; i < COUNT; i++) {
      const bust = Date.now() + '-' + Math.random().toString(36).slice(2);
      const r = await fetch(`https://cataas.com/cat?json=true&_=${bust}`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });
      if (!r.ok) throw new Error('Failed to fetch a cat');
      const j = await r.json();
      const id = j._id || j.id;
      urls.push(imageUrlById(id, 700, 900) + `&_=${bust}`);
    }

    total = urls.length;
    updateProgress();

    urls.forEach((url) => {
      const card = createCard(url);
      attachSwipe(card, url);
      cards.push(card);
    });

  } catch (err) {
    console.error('Error loading cats:', err);
    progressEl.textContent = 'Failed to load cats. Please refresh to try again.';
  }
}


loadCats();
