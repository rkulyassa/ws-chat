#include <iostream>
#include <App.h>

constexpr size_t NICKNAME_MAX_LEN = 20;
constexpr size_t MESSAGE_MAX_LEN = 80;

struct ClientData {
    // int clientId;
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

        void clear() {
            packet.clear();
        }

    private:
        std::string packet;
};

int main() {
    std::vector<uWS::WebSocket<false, true, ClientData>*> clients;

    // int clientIndex = 1;

    uWS::App()
    .ws<ClientData>("/*", {
        .open = [&clients/*, &clientIndex*/](auto *ws) {
            std::cout << "Client connected" << std::endl;
            // ws->getUserData()->clientId = clientIndex++;
            clients.push_back(ws);
        },
        .message = [&clients](auto *ws, std::string_view raw_message, uWS::OpCode opCode) {

            std::string message(raw_message);
            int op = message.at(0) - '0';
            std::string data = message.substr(1);

            if (op == 0) {
                ws->getUserData()->nickname = data.substr(0, NICKNAME_MAX_LEN);
                Packet packet;
                packet.write(1, "0");
                packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
            } else if (op == 1) {
                Packet packet;
                packet.write(1, "1");
                packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
                packet.write(MESSAGE_MAX_LEN, data);
                for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
            }
        },
        .close = [&clients](auto *ws, int /*code*/, std::string_view /*msg*/) {
            std::cout << "Client left: " << ws->getUserData()->nickname << std::endl;
            Packet packet;
            packet.write(1, "3");
            packet.write(NICKNAME_MAX_LEN, ws->getUserData()->nickname);
            for (auto *c : clients) c->send(packet.str(), uWS::OpCode::TEXT);
        }
    })    
    .listen(3000, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << 3000 << std::endl;
        }
    }).run();

    std::cout << "Failed to listen on port 3000" << std::endl;
}