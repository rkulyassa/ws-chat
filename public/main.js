const host = window.location.href.startsWith("http://localhost")
  ? "localhost"
  : "134.209.161.181";

let ws = null;
let nickname = "";

const nicknameScreen = document.getElementById("nicknameScreen");
const chatScreen = document.getElementById("chatScreen");
const nicknameInput = document.getElementById("nicknameInput");
const joinButton = document.getElementById("joinButton");
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");

function addMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.textContent = text;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function joinChat() {
  const enteredNickname = nicknameInput.value.trim();
  if (enteredNickname === "") {
    alert("Please enter a nickname");
    return;
  }
  
  nickname = enteredNickname;
  nicknameScreen.style.display = "none";
  chatScreen.style.display = "block";
  
  // Connect to WebSocket
  ws = new WebSocket(`ws://${host}:3000`);
  
  ws.onopen = () => {
    // Send nickname to server as first message
    ws.send(JSON.stringify({ type: "nickname", nickname: nickname }));
    addMessage(`Connected as ${nickname}`);
  };

  ws.onmessage = (e) => {
    addMessage(`${e.data}`);
  };

  ws.onerror = (error) => {
    addMessage(`Error: ${error.message || "Connection error"}`);
  };

  ws.onclose = () => {
    addMessage("Disconnected from server");
  };

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && input.value.trim() !== "") {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(input.value);
        input.value = "";
      }
    }
  });
}

joinButton.addEventListener("click", joinChat);
nicknameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    joinChat();
  }
});
