# Chat Messaging API & WebSocket Guide

This document describes the REST endpoints and realtime events related to chat messaging in the Total Dashboard backend.

## Base URL

```
{SERVER_URL}/api/v1/chat
```

Replace `{SERVER_URL}` with the value of `NEXT_PUBLIC_SERVER_URL` used by the client (e.g. `https://example.com`).

## Authentication

All endpoints require authentication. Include the JWT token returned from `/api/v1/auth/login` in the `Authorization` header:

```
Authorization: <JWT_TOKEN>
```

> **Note:** The middleware expects the raw token value (no `Bearer` prefix).

---

## REST Endpoints

### 1. Send Message

- **Endpoint:** `POST /message/create`
- **Description:** Adds a new message to a chat and updates the latest message metadata.
- **Request Body:**
  ```json
  {
    "chatId": "<chat_id>",
    "content": "Hello team!",
    "contentType": "text" // optional, defaults to text
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Message created successfully!",
    "message": {
      "_id": "...",
      "sender": { "_id": "...", "name": "..." },
      "chat": { "_id": "..." },
      "content": "Hello team!",
      "contentType": "text",
      "createdAt": "2024-05-10T10:20:30.000Z"
    }
  }
  ```

### 2. Get Messages for a Chat

- **Endpoint:** `GET /message/:id`
- **Description:** Fetches all messages for the chat with ID `:id`.
- **Path Parameter:**
  - `id` – chat ID.
- **Response:**
  ```json
  {
    "success": true,
    "messages": [
      {
        "_id": "...",
        "sender": { "_id": "...", "name": "..." },
        "chat": "...",
        "content": "Hello team!",
        "createdAt": "2024-05-10T10:20:30.000Z"
      },
      { /* ... */ }
    ]
  }
  ```

### 3. Mark Messages as Read

- **Endpoint:** `PATCH /message/read/:id`
- **Description:** Removes unread markers for the authenticated user in chat `:id`.
- **Path Parameter:**
  - `id` – chat ID.
- **Response:**
  ```json
  { "success": true }
  ```

### 4. Add Reaction to Message

- **Endpoint:** `POST /message/reaction/:messageId`
- **Description:** Adds (or updates) a reaction for the current user on the specified message.
- **Path Parameter:**
  - `messageId` – ID of the message to react to.
- **Request Body:**
  ```json
  {
    "emoji": "👍"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": {
      "_id": "...",
      "reactions": [
        { "emoji": "👍", "userIds": ["<user_id>", "..."] }
      ]
    }
  }
  ```

---

## WebSocket (Socket.IO) Integration

- **Namespace:** default (`/`)
- **URL:** `{SERVER_URL}` (same origin as REST API)
- **Client Library:** Socket.IO

### Connection

Establish the socket connection with the authenticated user’s ID as a query parameter:

```js
import { io } from 'socket.io-client';

const socket = io(SERVER_URL, {
  query: { userID: currentUserId },
});
```

On connection, the server:
- Marks the user as online (`userModel.isOnline = true`).
- Broadcasts `newUserData` to all clients with `{ userID, isOnline: true }`.

### Rooms

- Use `join chat` to subscribe to a chat room:
  ```js
  socket.emit('join chat', chatId);
  ```

Rooms are required to receive message and typing events scoped to a chat.

### Client → Server Events

| Event Name        | Payload                                   | Purpose |
|-------------------|-------------------------------------------|---------|
| `join chat`       | `chatId` (string)                         | Join a chat room to receive updates. |
| `NewMessageAdded` | `{ chatId, message }`                     | Notify server about a new message. The server replicates `fetchMessages` & `newMessageSummary` broadcasts. |
| `typing`          | `chatId` (string)                         | Indicates user started typing; broadcast to other room members. |
| `stop typing`     | `chatId` (string)                         | Indicates user stopped typing. |
| `notification`    | `{ ... }` (custom payload)                | Broadcast a notification to all users. |
| `messageReaction` | `{ chatId, reaction }`                    | Broadcast reaction updates to a chat. |
| `markRead`        | `{ chatId, userId }`                      | Notify room when user has read messages. |

### Server → Client Events

| Event Name          | Payload                                       | Description |
|---------------------|-----------------------------------------------|-------------|
| `newUserData`       | `{ userID, isOnline }`                        | User came online/offline. Sent globally. |
| `fetchMessages`     | `{ chatId, message }`                         | Prompt clients to refresh messages for a chat (triggered after `NewMessageAdded`). |
| `newMessageSummary` | `{ chatId, message }`                         | Update chat list summaries (latest message, unread markers). |
| `typing`            | none                                          | Another user in the room is typing. |
| `stop typing`       | none                                          | Typing indicator should be hidden. |
| `newNotification`   | `{ ... }` (matches `notification` payload)    | Broadcast notifications to all clients. |
| `messageReaction`   | `{ chatId, reaction }`                        | Reaction update for the chat. |
| `messagesRead`      | `{ chatId, userId }`                          | Indicates `userId` read messages in chat `chatId`. |

### Disconnect

When the socket disconnects, the server:
- Marks the user offline (`isOnline = false`).
- Broadcasts `newUserData` with `{ userID, isOnline: false }`.

### Recommended Client Flow

1. **Connect** via Socket.IO with `userID` query.
2. **Fetch chat list** via `GET /api/v1/chat/all/:userId`.
3. **Join relevant chat rooms** (`join chat`).
4. **Send messages** with REST `POST /message/create`, then emit `NewMessageAdded` to notify peers.
5. **Listen** for `fetchMessages` / `newMessageSummary` / `messageReaction` / `messagesRead` to keep UI updated.
6. **Emit/receive** `typing` / `stop typing` for realtime status.
7. **On unmount / logout**, close the socket to trigger disconnect cleanup.

---

## Error Handling

- REST endpoints return standard HTTP status codes (`400`, `401`, `404`, `500`).
- Socket events log errors server-side; clients should implement timeouts / retries and confirm message persistence via REST responses.

For any questions or updates to this document, refer to `server/controller/messageController.js`, `server/routes/chatRoutes.js`, and `server/socketServer.js`.
