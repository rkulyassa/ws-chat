# ws-chat

## TODO
- [ ] Custom nicknames
- [ ] Message timestamps
- [ ] Startup message
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