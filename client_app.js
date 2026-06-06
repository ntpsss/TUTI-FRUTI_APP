const { json } = require("express");
// для сообщений 
const chat = document.getElementById('chat');
const authorInput = document.getElementById('author');
const textInput = document.getElementById('text');
const sendBtn = document.getElementById('sendBtn');

// ЛОГИН
const loginBtn = document.getElementById('loginBtn');
const loginMenu = document.getElementById('loginMenu');

const loginSubmit = document.getElementById('loginSubmit');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
    // регистрация
const registrBtn = document.getElementById('registerBtn');
const registerMenu = document.getElementById('registerMenu');
const regLoginInput = document.getElementById('regLogin');
const regPasswordInput = document.getElementById('regPassword');
const regPasswordConfirm = document.getElementById('regPasswordConfirm');
const registerSubmit = document.getElementById('registerSubmit');
// добавление в др
const frienBtn = document.getElementById('addFriendBtn');
const addFriendMenu = document.getElementById('addFriendMenu');
const friendInput = document.getElementById('friendInput');
const addfriendBtn = document.getElementById('addFriendSubmit');
  // список друзей
const friendList = document.getElementById('friendList');
let ws = null;
let reconnectTimer = null;
let pendingLoginName = '';
let currentUserName = '';

frienBtn.addEventListener('click', () => {
  addFriendMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!frienBtn.contains(e.target) && !addFriendMenu.contains(e.target)){
    addFriendMenu.classList.remove('show');
  }
});

registrBtn.addEventListener('click',() => {
  registerMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
 if (!registrBtn.contains(e.target) && !registerMenu.contains(e.target)){
    registerMenu.classList.remove('show');
 }
});

loginBtn.addEventListener('click', () => {
  loginMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!loginMenu.contains(e.target) && !loginBtn.contains(e.target)) {
    loginMenu.classList.remove('show');
  }
});


// Делегирование: клик по кнопке удаления внутри списка
friendList.addEventListener('click', (e) => {
  const btn = e.target.closest('.friend-item-remove');
  if (!btn) return;
  const idx = parseInt(btn.dataset.index, 10);
  friends.splice(idx, 1);
  saveFriends();
  renderFriends();
});
function connection() {
  addSystem(`Подключение...`);
  ws = new WebSocket(`https://server-tuti-2.onrender.com/`);

  ws.addEventListener('open', () => {
    addSystem('Подключение установлено');
  });

  ws.addEventListener('message', (event) => {
    let data;

    try {
      data = JSON.parse(event.data);
    } catch (error) {
      addSystem('Ошибка: сервер прислал некорректный JSON');
      return;
    }
    
    if(data.type === 'name_friend_result'){
      if(data.success === true){
        addSystem(data.message);
        return;
      }
    }
  if(data.type === 'friend_request'){
  const div = document.createElement('div');
  div.className = 'system friend-request-msg';

  const msgSpan = document.createElement('span');
  msgSpan.textContent = data.message;

  const actions = document.createElement('div');
  actions.className = 'friend-request-actions';

  const button_yes = document.createElement('button');
  button_yes.className = 'button_yes';
  button_yes.title = 'Принять';
  button_yes.innerHTML = `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="3"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

  const button_no = document.createElement('button');
  button_no.className = 'button_no';
  button_no.title = 'Отклонить';
  button_no.innerHTML = `
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="3"
         stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`;

  actions.appendChild(button_yes);
  actions.appendChild(button_no);
  div.appendChild(msgSpan);
  div.appendChild(actions);
  friendList.appendChild(div);
  chat.scrollTop = chat.scrollHeight;


  button_yes.addEventListener('click', () =>{
    ws.send(JSON.stringify({
      type: 'friend_accept',
      currentUserName
    }));
  });
}
    if(data.type === 'friend_accept'){
      if(data.accept === true){
        addSystem(data.message);
      }
    }

    if (data.type === 'register_result') {
      addSystem(data.message);
      
      currentUserName = pendingLoginName;
      authorInput.value = currentUserName;
      authorInput.readOnly = true;
      registerMenu.classList.remove('show');
      regLoginInput.value = '';
      regPasswordInput.value = '';
      return;
    }
    if (data.type === 'login_result') {
      addSystem(data.message);

      if (data.success === true) {
        currentUserName = pendingLoginName;
        authorInput.value = currentUserName;
        authorInput.readOnly = true;
        registerMenu.classList.remove('show');
        loginInput.value = '';
        passwordInput.value = '';
      }
      return;
    }
    if (data.type === 'history') {
      chat.innerHTML = '';
      (data.message || []).forEach(renderMessage);
      return;
    }

    if (data.type === 'message') {
      renderMessage(data.message);
      return;
    }

    if (data.type === 'error') {
      addSystem('Ошибка: ' + data.message);
    }
  });

  ws.addEventListener('close', () => {
    addSystem('Соединение закрыто. Повторная попытка через 3 сек.');
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connection, 3000);
  });

  ws.addEventListener('error', () => {
    addSystem('Ошибка WebSocket');
  });
}

///////////// отправка сообщения
function sendMessage() {
  const text = textInput.value.trim();
  const author = authorInput.value.trim();

  if (!author || !text) return;

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    addSystem('Нет соединения с сервером');
    return;
  }

  ws.send(JSON.stringify({
    type: 'message',
    author,
    text
  }));

  textInput.value = '';
  textInput.focus();
}

sendBtn.addEventListener('click', sendMessage);

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

///////////// отправка данных логина
function login_send() {
  const name = loginInput.value.trim();
  const password = passwordInput.value.trim();
  let data;
  
  if (!name || !password) {
    addSystem('Введите логин и пароль');
    return;
  }

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    addSystem('Нет соединения с сервером');
    return;
  }

  ws.send(JSON.stringify({
    type: 'login',
    name,
    password
  }));
  pendingLoginName = name;
}

///////////// отправка регистрационных данных
function register_send() {
  const nameregistr = regLoginInput.value.trim();
  const passwordregistr = regPasswordInput.value.trim();
  
  if(!nameregistr || !passwordregistr){
    addSystem('Введите логин и пароль');
  }

  ws.send(JSON.stringify({
    type: 'registration',
    nameregistr,
    passwordregistr
  }));
  pendingLoginName = nameregistr;
}

loginSubmit.addEventListener('click', login_send);
registerSubmit.addEventListener('click', register_send);

///////////// добавление в друзья (отправка имени пользователя)
function addFriend() {
  const nameAdd = friendInput.value.trim();
  let send_invite_name = pendingLoginName;
  //const nameSend = send_invite_name.value.trim();
  if(!nameAdd) {
    addSystem('Введите имя');
  }
  ws.send(JSON.stringify({
    type: 'name_friend',
    nameAdd,
    //nameSend,
    send_invite_name
  }));
}

addfriendBtn.addEventListener('click', addFriend);
function renderMessage(msg) {
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="msg-author">${escapeHtml(msg.author)}</div>
    <div class="msg-text">${escapeHtml(msg.text)}</div>
    <div class="meta">${formatTime(msg.created_at)}</div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addSystem(text) {
  const div = document.createElement('div');
  div.className = 'system';
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatTime(value) {
  const date = new Date(value);
  return date.toLocaleString('ru-RU');
}

connection();