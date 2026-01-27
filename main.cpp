#include <iostream>
#include <App.h>

constexpr size_t NICKNAME_MAX_LEN = 20;
constexpr size_t MESSAGE_MAX_LEN = 80;

struct ClientData {
    std::string nickname;
};

class Packet {
    public:
        Packet() {}

        void write(size_t numChars, const std::string& data, char padChar = ' ') {
            if (data.size() < numChars) {
                packet += data;
                packet.append(numChars - data.size(), padChar);
            } else {
                packet += data.substr(0, numChars);
            }
        }

        const std::string& str() const {
            return packet;
        }

    private:
        std::string packet;
};

int main() {
    std::vector<uWS::WebSocket<false, true, ClientData>*> clients;
    std::vector<Packet> history;

    std::string serverInitMessage = "Welcome to ws-chat! (Bishop chat 🐈‍⬛). View the source at https://github.com/rkulyassa/ws-chat";
    Packet serverInitPacket;
    serverInitPacket.write(1, "2");
    serverInitPacket.write(serverInitMessage.size(), serverInitMessage);
    history.push_back(serverInitPacket);

    uWS::App()
    .ws<ClientData>("/*", {
        .open = [&clients, &history](auto *ws) {
            std::cout << "Client connected" << std::endl;
            clients.push_back(ws);

            for (Packet packet : history) ws->send(packet.str(), uWS::OpCode::TEXT);
        },
        .message = [&clients, &history](auto *ws, std::string_view raw_message, uWS::OpCode opCode) {
            std::string message(raw_message);
            int op = message.at(0) - '0';
            std::string data = message.substr(1);

            if (op == 0) {
                ws->getUserData()->nickname = data.substr(0, NICKNAME_MAX_LEN);
                Packet packet;
                packet.write(1, "0");
                packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
                history.push_back(packet);
            } else if (op == 1) {
                Packet packet;
                packet.write(1, "1");
                packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                packet.write(MESSAGE_MAX_LEN, data);
                for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
                history.push_back(packet);
            }
        },
        .close = [&clients, &history](auto *ws, int /*code*/, std::string_view /*msg*/) {
            std::cout << "Client left: " << ws->getUserData()->nickname << std::endl;
            clients.erase(std::remove(clients.begin(), clients.end(), ws), clients.end());
            Packet packet;
            packet.write(1, "3");
            packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
            for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
            history.push_back(packet);
        }
    })    
    .listen(3000, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << 3000 << std::endl;
        }
    }).run();

    std::cout << "Failed to listen on port 3000" << std::endl;
}