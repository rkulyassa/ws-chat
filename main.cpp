#include <iostream>
#include <chrono>
#include <App.h>

const int PORT = 3000;
constexpr size_t NICKNAME_MAX_LEN = 20;
constexpr size_t MESSAGE_MAX_LEN = 80;

struct ClientData {
    std::string nickname;
};

class ChatMessage {
    public:
        ChatMessage() {}

        void write(size_t numChars, const std::string& data, char padChar = ' ') {
            if (data.size() < numChars) {
                message += data;
                message.append(numChars - data.size(), padChar);
            } else {
                message += data.substr(0, numChars);
            }
        }

        void writeTimestamp() {
            auto now = std::chrono::system_clock::now();
            auto epoch_seconds = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
            char ts_buf[11]{};
            snprintf(ts_buf, sizeof(ts_buf), "%010llu", static_cast<long long>(epoch_seconds));
            message += std::string(ts_buf, 10);
        }

        const std::string& str() const {
            return message;
        }

    private:
        std::string message;
        // time_t timestamp;
};

ChatMessage buildServerMessage(std::string text) {
    ChatMessage m;
    m.write(1, "2");
    m.writeTimestamp();
    m.write(text.size(), text);
    return m;
}

int main() {
    std::vector<uWS::WebSocket<false, true, ClientData>*> clients;
    std::vector<ChatMessage> history;

    history.push_back(buildServerMessage("Welcome to ws-chat! (Bishop chat 🐈‍⬛)"));
    history.push_back(buildServerMessage("View the source at https://github.com/rkulyassa/ws-chat"));

    uWS::App()
    .ws<ClientData>("/*", {
        .open = [&clients, &history](auto *ws) {
            std::cout << "Client connected" << std::endl;
            clients.push_back(ws);

            for (ChatMessage m : history) ws->send(m.str(), uWS::OpCode::TEXT);
        },
        .message = [&clients, &history](auto *ws, std::string_view raw_message, uWS::OpCode opCode) {
            std::string message(raw_message);
            int op = message.at(0) - '0';
            std::string data = message.substr(1);

            if (op == 0) {
                ws->getUserData()->nickname = data.substr(0, NICKNAME_MAX_LEN);
                ChatMessage m;
                m.write(1, "0");
                m.writeTimestamp();
                m.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                for (auto *c : clients) c->send(m.str(), uWS::OpCode::TEXT);
                history.push_back(m);
            } else if (op == 1) {
                ChatMessage m;
                m.write(1, "1");
                m.writeTimestamp();
                m.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                m.write(MESSAGE_MAX_LEN, data);
                for (auto *c : clients) c->send(m.str(), uWS::OpCode::TEXT);
                history.push_back(m);
            }
        },
        .close = [&clients, &history](auto *ws, int /*code*/, std::string_view /*msg*/) {
            std::cout << "Client left: " << ws->getUserData()->nickname << std::endl;
            clients.erase(std::remove(clients.begin(), clients.end(), ws), clients.end());
            ChatMessage m;
            m.write(1, "3");
            m.writeTimestamp();
            m.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
            for (auto *c : clients) c->send(m.str(), uWS::OpCode::TEXT);
            history.push_back(m);
        }
    })    
    .listen(PORT, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << PORT << std::endl;
        }
    }).run();

    std::cout << "Failed to listen on port " << PORT << std::endl;
}