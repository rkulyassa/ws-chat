import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const host = window.location.href.startsWith("http://localhost")
  ? "localhost"
  : "134.209.161.181";
const WS_URL = `ws://${host}:3000`;

interface ChatMessage {
  type: "join" | "leave" | "chat" | "server";
  timestamp: Date;
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
    ws.binaryType = "arraybuffer";
    ws.onopen = () => {
      setConnected(true);
      ws.send(`0${name}`);
    };
    ws.onmessage = (e) => {
      const opcode = e.data[0];
      const timestamp = new Date(0);
      timestamp.setUTCSeconds(+e.data.slice(1, 11));
      const data = e.data.slice(11);

      if (opcode === "0") {
        const nickname = data.slice(0, 20).trim();
        setMessages((m) => [...m, { type: "join", timestamp, nickname }]);
      } else if (opcode === "1") {
        const nickname = data.slice(0, 20).trim();
        const text = data.slice(20, 100).trim();
        setMessages((m) => [...m, { type: "chat", timestamp, nickname, text }]);
      } else if (opcode === "2") {
        const text = data.slice(0, 100).trim();
        setMessages((m) => [
          ...m,
          { type: "server", timestamp, nickname: "SERVER", text },
        ]);
      } else if (opcode === "3") {
        const nickname = data.slice(0, 20).trim();
        setMessages((m) => [...m, { type: "leave", timestamp, nickname }]);
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
    <div className="flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex-1 space-y-2 overflow-y-auto bg-white rounded-md p-4 border border-gray-200">
        {messages.map((message, i) => {
          const timestampEl = (
            <span
              className="text-xs text-gray-300 float-right font-mono"
              // style={{ fontFamily: '"Courier New", Courier, monospace' }}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );

          if (message.type === "join") {
            return (
              <div key={i} className="text-sm text-green-500 clearfix">
                <span className="font-bold">{message.nickname}</span> joined
                {timestampEl}
              </div>
            );
          } else if (message.type === "chat") {
            return (
              <div key={i} className="text-sm text-gray-700 clearfix">
                <span className="font-bold">{message.nickname}</span>:{" "}
                {message.text}
                {timestampEl}
              </div>
            );
          } else if (message.type === "server") {
            return (
              <div key={i} className="text-sm text-gray-400 clearfix">
                <span className="font-bold">SERVER</span>: {message.text}
                {timestampEl}
              </div>
            );
          } else if (message.type === "leave") {
            return (
              <div key={i} className="text-sm text-red-500 clearfix">
                <span className="font-bold">{message.nickname}</span> left
                {timestampEl}
              </div>
            );
          }
        })}
      </div>
      <form onSubmit={send} className="w-full max-w-md mt-2 flex gap-2">
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
