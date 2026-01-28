# ws-chat

## TODO
- [x] Custom nicknames
- [x] Client leave messages
- [x] Nickname in message UX
- [x] Fix segfault when last client disconnects
- [x] Chat history per server lifetime
- [x] Startup message
- [x] More compact chat area
- [x] Message timestamps
- [x] Connected users list
- [x] UI Icons
- [ ] Error toast for server not running
- [ ] Fix chatmessage text wrapping
- [ ] Remaining characters in input field
- [ ] Bishy emotes
- [ ] Color names
- [ ] Pending message state UX
- [ ] Typing indicator
- [ ] Use binary communication instead of plaintext
- [ ] Dark theme

## Protocol
| Direction           | Opcode | Description          | Data Format                                          |
|---------------------|--------|----------------------|------------------------------------------------------|
| **Client → Server** |   0    | Client join          | nickname                                             |
|                     |   1    | Chat                 | message                                              |
| **Server → Client** |   0    | Client join          | timestamp `[10B]`, nickname `[20B]`                  |
|                     |   1    | Chat                 | timestamp `[10B]`, nickname `[20B]`, message `[80B]` |
|                     |   2    | Server announcement  | timestamp `[10B]`, message `[80B]`                   |
|                     |   3    | Client leave         | timestamp `[10B]`, nickname `[20B]`                  |

## Pitfalls
- User list UI is based on nickname alone. Would need server-side user IDs to ensure uniqueness. This distinction is irrelevant on the server however since client connections are distinguished by default in program memory.