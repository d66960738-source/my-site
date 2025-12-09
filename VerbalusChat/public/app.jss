// ===== Регистрация =====
function register() {
    let name = document.getElementById("username")?.value.trim();
    let pass = document.getElementById("password")?.value.trim();

    if (!name || !pass) {
        alert("Заполните все поля!");
        return;
    }

    let userID = "U" + Math.floor(Math.random() * 9999999);
    let user = { id: userID, username: name, password: pass };

    localStorage.setItem("user_" + userID, JSON.stringify(user));
    localStorage.setItem("currentUser", userID);

    alert("Регистрация успешна! Ваш ID: " + userID);
    window.location = "index.html";
}

// ===== Вход =====
function login() {
    let name = document.getElementById("username")?.value.trim();
    let pass = document.getElementById("password")?.value.trim();

    if (!name || !pass) {
        alert("Заполните все поля!");
        return;
    }

    let found = false;
    for (let key in localStorage) {
        if (key.startsWith("user_")) {
            let user = JSON.parse(localStorage.getItem(key));
            if (user.username === name && user.password === pass) {
                found = true;
                localStorage.setItem("currentUser", user.id);
                window.location = "index.html";
                break;
            }
        }
    }

    if (!found) alert("Неверный логин или пароль");
}

// ===== Загрузка профиля =====
function loadUserProfile() {
    let profileName = document.getElementById("profileName");
    let myID = document.getElementById("myID");
    if (!profileName || !myID) return;

    let current = localStorage.getItem("currentUser");
    if (!current) {
        alert("Сначала зарегистрируйтесь!");
        window.location = "register.html";
        return;
    }

    let user = JSON.parse(localStorage.getItem("user_" + current));
    profileName.innerText = user.username;
    myID.innerText = user.id;
}

// ===== Отправка сообщений =====
function sendMessage() {
    let currentUserID = localStorage.getItem("currentUser");
    let targetID = document.getElementById("targetID").value.trim();
    let msg = document.getElementById("chatInput").value.trim();
    let imgFile = document.getElementById("imageInput").files[0];

    if (!targetID || (!msg && !imgFile)) {
        alert("Введите сообщение или выберите фото!");
        return;
    }

    if (!localStorage.getItem("user_" + targetID)) {
        alert("Пользователь с таким ID не найден");
        return;
    }

    let chatKey = [currentUserID, targetID].sort().join("_");
    let chat = JSON.parse(localStorage.getItem(chatKey) || "[]");

    if (imgFile) {
        let reader = new FileReader();
        reader.onload = function(e) {
            chat.push({ from: currentUserID, message: msg, image: e.target.result });
            localStorage.setItem(chatKey, JSON.stringify(chat));
            document.getElementById("chatInput").value = "";
            document.getElementById("imageInput").value = "";
            loadMessages(targetID);
        }
        reader.readAsDataURL(imgFile);
    } else {
        chat.push({ from: currentUserID, message: msg });
        localStorage.setItem(chatKey, JSON.stringify(chat));
        document.getElementById("chatInput").value = "";
        loadMessages(targetID);
    }
}

// ===== Загрузка сообщений =====
function loadMessages(targetID) {
    let currentUserID = localStorage.getItem("currentUser");
    let chatKey = [currentUserID, targetID].sort().join("_");
    let chat = JSON.parse(localStorage.getItem(chatKey) || "[]");

    let chatDiv = document.getElementById("chatMessages");
    chatDiv.innerHTML = "";

    chat.forEach(item => {
        let sender = item.from === currentUserID ? "Вы" : "Друг";
        let msgElem = document.createElement("p");
        msgElem.style.alignSelf = item.from === currentUserID ? "flex-end" : "flex-start";
        msgElem.style.backgroundColor = item.from === currentUserID ? "#dcf8c6" : "#f1f0f0";
        msgElem.style.padding = "8px 12px";
        msgElem.style.borderRadius = "12px";
        msgElem.style.maxWidth = "70%";

        msgElem.innerHTML = `<b>${sender}:</b> ${item.message || ""}`;
        if (item.image) {
            let img = document.createElement("img");
            img.src = item.image;
            img.style.maxWidth = "150px";
            img.style.display = "block";
            img.style.marginTop = "5px";
            msgElem.appendChild(img);
        }

        chatDiv.appendChild(msgElem);
    });

    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// ===== Автообновление профиля и сообщений =====
document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();

    let targetInput = document.getElementById("targetID");
    if (targetInput) {
        targetInput.addEventListener("input", function() {
            let targetID = this.value.trim();
            if(targetID) loadMessages(targetID);
        });
    }
});