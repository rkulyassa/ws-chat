#include <iostream>
#include <App.h>

int main() {
    uWS::App()
    // .get("/*", [](auto *res, auto */*req*/) {
    //     res->end("Hello world!");
    // })
    .ws<nullptr_t>("/*", {
        .open = [](auto *ws) {
            std::cout << "Client connected\n";
        },
        .message = [](auto *ws, std::string_view msg, uWS::OpCode opCode) {
            ws->send(msg, opCode); // echo back
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