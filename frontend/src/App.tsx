import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UsersIcon } from "lucide-react";
import { SendIcon } from "lucide-react";
import { LogInIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";

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
  const [users, setUsers] = useState<string[]>([]);
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
        setUsers((u) => [...u, nickname]);
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
        setUsers((u) => u.filter((name) => name !== nickname));
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
      <div className="flex min-h-svh items-center justify-center">
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
    <div className="flex min-h-svh flex-col py-40 px-64">
      <div className="flex flex-1">
        <div className="flex-1 overflow-y-auto bg-white rounded-md p-4 border border-gray-200 shadow-xs">
          {messages.map((message, i) => {
            const timestampEl = (
              <span className="text-xs text-gray-300 float-right font-mono">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            );
            if (message.type === "join") {
              return (
                <div key={i} className="text-sm text-green-500 clearfix">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <LogInIcon size={14} strokeWidth={3} />
                      <span className="font-bold">{message.nickname}</span>
                      <span>joined</span>
                    </div>
                    {timestampEl}
                  </div>
                </div>
              );
            } else if (message.type === "chat") {
              return (
                <div key={i} className="text-sm text-gray-700 clearfix">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>
                        <strong>{message.nickname}</strong>:
                      </span>
                      <span>{message.text}</span>
                    </div>
                    {timestampEl}
                  </div>
                </div>
              );
            } else if (message.type === "server") {
              return (
                <div key={i} className="text-sm text-gray-400 clearfix">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>
                        <strong>SERVER</strong>:
                      </span>
                      <span>{message.text}</span>
                    </div>
                    {timestampEl}
                  </div>
                </div>
              );
            } else if (message.type === "leave") {
              return (
                <div key={i} className="text-sm text-red-500 clearfix">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <LogOutIcon size={14} strokeWidth={3} />
                      <span>
                        <strong>{message.nickname}</strong>
                      </span>
                      <span>left</span>
                    </div>
                    {timestampEl}
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="w-48 bg-gray-50 rounded-md p-4 border border-gray-200 ml-4 flex flex-col shadow-xs">
          <div className="flex items-center gap-1 mb-1">
            <UsersIcon color="#6a7282" size={16} strokeWidth={2.5} />
            <span className="text-sm text-gray-500">Users</span>
          </div>
          <Separator className="mb-1" />
          {users.map((user, i) => (
            <div key={i} className="text-sm text-gray-500 pl-0.5">
              {user}
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={send}
        className="flex gap-2 mt-4"
        style={{ maxWidth: "none" }}
      >
        <Input
          placeholder="Message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit">
          Send
          <SendIcon />
        </Button>
      </form>
    </div>
    // </div>
  );
}

export default App;
