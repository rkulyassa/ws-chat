import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const host = window.location.href.startsWith("http://localhost")
  ? "localhost"
  : "134.209.161.181";
const WS_URL = `ws://${host}:3000`;

interface ChatMessage {
  type: "join" | "leave" | "chat" | "server";
  nickname: string;
  text?: string;
}

function App() {
  const [nickname, setNickname] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    const name = nickname.trim();
    if (!name) return;

    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      setConnected(true);
      ws.send(`0${name}`);
    };
    ws.onmessage = (e) => {
      const opcode = e.data[0];
      const data = e.data.slice(1);

      if (opcode === "0") {
        const nickname = data.slice(0, 20).trim();
        setMessages((m) => [...m, { type: "join", nickname }]);
      } else if (opcode === "1") {
        const nickname = data.slice(0, 20).trim();
        const text = data.slice(20, 100).trim();
        setMessages((m) => [...m, { type: "chat", nickname, text }]);
      } else if (opcode === "2") {
        const text = data.slice(0, 100).trim();
        setMessages((m) => [...m, { type: "chat", nickname: "SERVER", text }]);
      } else if (opcode === "3") {
        const nickname = data.slice(0, 20).trim();
        setMessages((m) => [...m, { type: "leave", nickname }]);
      }
    };
    wsRef.current = ws;
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(`1${text}`);
    setInput("");
  };

  useEffect(() => () => wsRef.current?.close(), []);

  if (!connected) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            connect();
          }}
          className="flex w-full max-w-sm gap-2"
        >
          <Input
            placeholder="Username"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            autoFocus
          />
          <Button type="submit">Connect</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col p-4">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {messages.map((msg, i) => {
          if (msg.type === "join") {
            return (
              <div key={i} className="text-sm text-green-500">
                <span className="font-bold">{msg.nickname}</span> joined
              </div>
            );
          } else if (msg.type === "chat") {
            return (
              <div key={i} className="text-sm text-gray-700">
                <span className="font-bold">{msg.nickname}</span>: {msg.text}
              </div>
            );
          } else if (msg.type === "server") {
            return (
              <div key={i} className="text-sm text-red-500">
                <span className="font-bold">SERVER</span>: {msg.text}
              </div>
            );
          } else if (msg.type === "leave") {
            return (
              <div key={i} className="text-sm text-red-500">
                <span className="font-bold">{msg.nickname}</span> left
              </div>
            );
          }
        })}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <Input
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default App;
