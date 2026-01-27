# ws-chat

## TODO
- [x] Custom nicknames
- [ ] Client leave messages
- [x] Nickname in message UX
- [ ] Message timestamps
- [ ] Startup message
- [ ] Connected users list
- [ ] More compact chat area
- [ ] Chat history per server lifetime
- [ ] Bishy emotes
- [ ] Color names
- [ ] Pending message state UX

## Protocol
| Direction           | Opcode | Description          | Data Format                                 |
|---------------------|--------|----------------------|---------------------------------------------|
| **Client → Server** |   0    | Client join          | nickname                                    |
|                     |   1    | Chat                 | message                                     |
| **Server → Client** |   0    | Client join          | nickname `[20 chars]`                       |
|                     |   1    | Chat                 | nickname `[20 chars]`, message `[80 chars]` |
|                     |   2    | Server announcement  | message `[80 chars]`                        |
|                     |   3    | Client leave         | nickname `[20 chars]`                       |