const ws = new WebSocket("ws://localhost:3000");
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");

function addMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.textContent = text;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

ws.onopen = () => {
  addMessage("Connected to server");
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
    ws.send(input.value);
    // addMessage(`Sent: ${input.value}`);
    input.value = "";
  }
});
