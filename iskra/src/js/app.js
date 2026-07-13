let currentUser = null;      // залогінений користувач
let currentProfiles = [];    // черга анкет у стрічці
let currentMatches = [];     // список метчів
let activeChatUserId = null; // з ким зараз відкритий чат

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.add("hidden"));
  const target = document.getElementById(`screen-${id}`);
  if (target) target.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-goto]");
  if (!el) return;
  e.preventDefault();
  showScreen(el.dataset.goto);
});

function renderHeaderNav() {
  const nav = $("#header-nav");
  if (currentUser) {
    nav.innerHTML = `
      <span class="nav-greeting">✦ ${escapeHtml(currentUser.name)}</span>
      <button class="btn btn-ghost" id="btn-logout">Вийти</button>
    `;
    $("#btn-logout").addEventListener("click", logout);
  } else {
    nav.innerHTML = `
      <button class="btn btn-ghost" data-goto="auth-login">Увійти</button>
      <button class="btn btn-primary" data-goto="auth-register">Створити анкету</button>
    `;
  }
}

function logout() {
  currentUser = null;
  activeChatUserId = null;
  renderHeaderNav();
  showScreen("landing");
  showToast("До зустрічі! ✦");
}


let toastTimer = null;
function showToast(text) {
  const toast = $("#toast");
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function initials(name) {
  return name.trim().charAt(0).toUpperCase();
}


$("#form-register").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = $("#register-error");
  errorEl.textContent = "";
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const user = await api.register(data);
    currentUser = user;
    renderHeaderNav();
    showToast(`Ласкаво просимо, ${user.name}! ✦`);
    form.reset();
    await enterApp();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});


$("#form-login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = $("#login-error");
  errorEl.textContent = "";
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const user = await api.login(data);
    currentUser = user;
    renderHeaderNav();
    showToast(`З поверненням, ${user.name}! ✦`);
    form.reset();
    await enterApp();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});


async function enterApp() {
  showScreen("app");
  switchTab("browse");
  await Promise.all([loadProfiles(), loadMatches()]);
}


$$(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
  $$(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  $$(".tab-panel").forEach((p) => p.classList.remove("active"));
  $(`#panel-${tab}`).classList.add("active");
}


async function loadProfiles() {
  currentProfiles = await api.getProfiles(currentUser.id);
  renderStage();
}

function renderStage() {
  const stage = $("#swipe-stage");
  stage.innerHTML = "";
  if (currentProfiles.length === 0) {
    stage.innerHTML = `<div class="stage-empty">Анкети закінчились ✦<br>Загляни пізніше.</div>`;
    return;
  }
  const profile = currentProfiles[0];
  const card = document.createElement("div");
  card.className = "profile-card";
  card.id = "current-card";
  card.innerHTML = `
    <div class="demo-avatar" style="--c1:${profile.colors[0]};--c2:${profile.colors[1]}">${initials(profile.name)}</div>
    <h3>${escapeHtml(profile.name)}, ${profile.age}</h3>
    <p class="p-tag">${escapeHtml(profile.bio)}</p>
    <div class="spark-meter"><div class="spark-meter-fill" style="width:${profile.sparkPercent}%"></div></div>
    <div class="spark-label">✦ ${profile.sparkPercent}% іскри</div>
  `;
  stage.appendChild(card);
  enableDrag(card);
}

function enableDrag(card) {
  let startX = 0, currentX = 0, dragging = false;

  const onDown = (clientX) => { dragging = true; startX = clientX; card.style.transition = "none"; };
  const onMove = (clientX) => {
    if (!dragging) return;
    currentX = clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX / 18}deg)`;
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    card.style.transition = "";
    if (currentX > 100) { resolveSwipe(true); }
    else if (currentX < -100) { resolveSwipe(false); }
    else { card.style.transform = ""; }
    currentX = 0;
  };

  card.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);

  card.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  card.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  card.addEventListener("touchend", onUp);
}

async function resolveSwipe(liked) {
  const profile = currentProfiles[0];
  if (!profile) return;
  const card = $("#current-card");
  if (card) {
    card.style.transform = `translateX(${liked ? 500 : -500}px) rotate(${liked ? 30 : -30}deg)`;
    card.style.opacity = "0";
  }
  const result = await api.swipe({ fromUserId: currentUser.id, toUserId: profile.id, liked });
  currentProfiles.shift();
  setTimeout(() => renderStage(), 250);

  if (liked && result.matched) {
    showToast(`Це метч з ${profile.name}! ✦`);
    await loadMatches();
  } else if (liked) {
    showToast(`Лайк надіслано ${profile.name} ✦`);
  }
}

$("#btn-like").addEventListener("click", () => resolveSwipe(true));
$("#btn-pass").addEventListener("click", () => resolveSwipe(false));


async function loadMatches() {
  currentMatches = await api.getMatches(currentUser.id);
  $("#matches-count").textContent = currentMatches.length;
  renderMatches();
}

function renderMatches() {
  const list = $("#matches-list");
  if (currentMatches.length === 0) {
    list.innerHTML = `<p class="matches-empty">Поки що немає метчів. Полайкай когось у стрічці ✦</p>`;
    return;
  }
  list.innerHTML = currentMatches.map((m) => `
    <div class="match-card" data-user-id="${m.id}">
      <div class="match-avatar" style="background:linear-gradient(135deg, ${m.colors[0]}, ${m.colors[1]})">${initials(m.name)}</div>
      <div>
        <div class="match-name">${escapeHtml(m.name)}, ${m.age}</div>
        <div class="match-meta">відкрити чат →</div>
      </div>
    </div>
  `).join("");

  $$(".match-card", list).forEach((card) => {
    card.addEventListener("click", () => {
      openChat(Number(card.dataset.userId));
      switchTab("chat");
    });
  });
}


async function openChat(otherUserId) {
  activeChatUserId = otherUserId;
  const other = currentMatches.find((m) => m.id === otherUserId);
  $("#chat-with-label").textContent = other ? `Розмова з ${other.name}` : "";
  $("#chat-empty").classList.add("hidden");
  $("#form-chat").style.display = "flex";
  await renderMessages();
}

async function renderMessages() {
  if (!activeChatUserId) return;
  const messages = await api.getMessages(currentUser.id, activeChatUserId);
  const box = $("#chat-messages");
  box.innerHTML = messages.map((m) => `
    <div class="chat-bubble ${m.fromUserId === currentUser.id ? "me" : "them"}">${escapeHtml(m.text)}</div>
  `).join("");
  const window_ = $("#chat-window");
  window_.scrollTop = window_.scrollHeight;
}

$("#form-chat").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if (!text || !activeChatUserId) return;
  input.value = "";
  await api.sendMessage({ fromUserId: currentUser.id, toUserId: activeChatUserId, text });
  await renderMessages();
});


// ===============================
// SESSION STORAGE
// ===============================

function saveSession(user) {
  localStorage.setItem("iskra_user", JSON.stringify(user));
}

function loadSession() {
  const saved = localStorage.getItem("iskra_user");

  if (saved) {
    currentUser = JSON.parse(saved);
    renderHeaderNav();
    enterApp();
  }
}

function clearSession() {
  localStorage.removeItem("iskra_user");
}


// переопределяем logout с очисткой
const oldLogout = logout;

logout = function () {
  clearSession();
  oldLogout();
};


// сохраняем пользователя после входа
const oldEnterApp = enterApp;

enterApp = async function () {
  if (currentUser) {
    saveSession(currentUser);
  }

  await oldEnterApp();
};


// проверка формы регистрации
document.addEventListener("DOMContentLoaded", () => {

  const register = $("#form-register");

  if(register){
    register.addEventListener("submit", () => {

      const inputs = register.querySelectorAll("input");

      let valid = true;

      inputs.forEach(input => {

        if(!input.value.trim()){
          input.style.borderColor = "#FF6F5E";
          valid = false;
        }

      });

      if(!valid){
        showToast("Заповніть всі поля ✦");
      }

    });
  }


  loadSession();

});

renderHeaderNav();
showScreen("landing");
