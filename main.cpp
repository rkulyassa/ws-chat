#include <iostream>
#include <App.h>

struct ClientData {
    int clientId;
};

int main() {
    std::vector<uWS::WebSocket<false, true, ClientData>*> clients;

    int clientIndex = 1;

    uWS::App()
    // .get("/*", [](auto *res, auto */*req*/) {
    //     res->end("Hello world!");
    // })
    .ws<ClientData>("/*", {
        .open = [&clients, &clientIndex](auto *ws) {
            std::cout << "Client connected\n";
            ws->getUserData()->clientId = clientIndex++;
            clients.push_back(ws);
            std::string joinMessage = "[SERVER]: Client " + std::to_string(ws->getUserData()->clientId) + " joined\n";
            for (auto *c : clients) {
                c->send(joinMessage, uWS::OpCode::TEXT);
            }
        },
        .message = [&clients](auto *ws, std::string_view message, uWS::OpCode opCode) {
            int senderId = ws->getUserData()->clientId;
            std::string mmessage(message);
            std::string broadcastMessage = "[Client " + std::to_string(senderId) + "]: " + mmessage;
            for (auto *c : clients) {
                c->send(broadcastMessage, uWS::OpCode::TEXT);
            }
        },
        .close = [](auto *ws, int /*code*/, std::string_view /*msg*/) {
            std::cout << "Client closed\n";
        }
    })    
    .listen(3000, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << 3000 << std::endl;
        }
    }).run();

    std::cout << "Failed to listen on port 3000" << std::endl;
}