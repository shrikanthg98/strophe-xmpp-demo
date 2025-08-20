import { Strophe, $pres, $msg } from "strophe.js";
import loggerApi from "../services/loggerService";
import moment from "moment";

let connection = null;
let currentUser = null;
let currentPass = null;
let joinedRooms = new Set(); // stores { roomName, nickname }

let wasPreviouslyConnected = false;
let lastLoggedEvent = null;
let lastDisconnectWasUnexpected = false;
let reconnectTimer = null;
let isManualDisconnect = false;

const WS_ENDPOINT = "ws://20.40.57.223:7070/ws";
const XMPP_DOMAIN = "20.40.57.223";
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;
let reconnectDelay = RECONNECT_BASE_MS;

const ts = () => moment().format("HH:mm:ss.SSS");

// --- Logging helpers ---
async function logOnConnected(username) {
  const t = ts();
  const payload = { username, connected: t };
  if (wasPreviouslyConnected && lastDisconnectWasUnexpected)
    payload.reconnected = t;
  await loggerApi(payload);
  wasPreviouslyConnected = true;
  lastDisconnectWasUnexpected = false;
  lastLoggedEvent = "connected";
}

async function logOnDisconnected(username) {
  const t = ts();
  await loggerApi({ username, disconnected: t, offline: t });
  lastLoggedEvent = "disconnected";
}

// --- Nickname generator ---
function generateNickname(baseName) {
  const suffix = Math.floor(Math.random() * 1000); // 0–999
  return `${baseName}_${suffix}`;
}

// --- Cleanup ---
function cleanupConnection() {
  try {
    if (connection) {
      if (typeof connection.reset === "function") connection.reset();
      try {
        connection.disconnect();
      } catch {}
    }
  } finally {
    connection = null;
    joinedRooms.clear();
  }
}

// --- Reconnect ---
function scheduleReconnect(onStatus, onMessageCb) {
  if (isManualDisconnect) return;
  clearTimeout(reconnectTimer);
  reconnectDelay = Math.min(
    RECONNECT_MAX_MS,
    reconnectDelay * 2 || RECONNECT_BASE_MS
  );
  reconnectTimer = setTimeout(() => {
    if (isManualDisconnect || !currentUser || !currentPass) return;
    doConnect(currentUser, currentPass, onStatus, onMessageCb);
  }, reconnectDelay);
}

// --- Actual connection ---
function doConnect(username, password, onStatus, onMessageCb) {
  connection = new Strophe.Connection(WS_ENDPOINT);
  Strophe.log = function () {};
  Strophe.LogLevel = Strophe.LogLevel ? Strophe.LogLevel.FATAL : 0;

  const jid = `${username}@${XMPP_DOMAIN}`;

  // DM handler
  connection.addHandler(
    (stanza) => {
      const from = stanza.getAttribute("from")?.split("@")[0];
      const bodyEl = stanza.getElementsByTagName("body")[0];
      if (bodyEl) {
        const body = Strophe.getText(bodyEl);
        onMessageCb && onMessageCb({ from, body, type: "dm" });
      }
      return true;
    },
    null,
    "message",
    "chat"
  );

  // Group chat handler
  connection.addHandler(
    (stanza) => {
      const from = stanza.getAttribute("from");
      const bodyEl = stanza.getElementsByTagName("body")[0];
      if (bodyEl) {
        const body = Strophe.getText(bodyEl);
        onMessageCb && onMessageCb({ from, body, type: "group" });
      }
      return true;
    },
    null,
    "message",
    "groupchat"
  );

  const onConnectStatus = async (status) => {
    onStatus && onStatus(status);

    if (status === Strophe.Status.CONNECTED) {
      try {
        connection.send($pres().tree());
      } catch {}
      reconnectDelay = RECONNECT_BASE_MS;
      if (lastLoggedEvent !== "connected") await logOnConnected(username);

      // Rejoin all rooms
      joinedRooms.forEach(({ roomName, nickname }) => {
        const roomJid = `${roomName}@conference.${XMPP_DOMAIN}`;
        const pres = $pres({ to: `${roomJid}/${nickname}` }).c("x", {
          xmlns: "http://jabber.org/protocol/muc",
        });
        connection.send(pres.tree());
      });
    } else if (status === Strophe.Status.DISCONNECTED) {
      if (lastLoggedEvent !== "disconnected") await logOnDisconnected(username);
      if (!isManualDisconnect) {
        lastDisconnectWasUnexpected = true;
        scheduleReconnect(onStatus, onMessageCb);
      }
    } else if (
      status === Strophe.Status.CONNFAIL ||
      status === Strophe.Status.AUTHFAIL ||
      status === Strophe.Status.ERROR
    ) {
      if (!isManualDisconnect) scheduleReconnect(onStatus, onMessageCb);
    }
  };

  connection.connect(jid, password, onConnectStatus);
}

// --- Public API ---
export async function connectXmpp(username, password, onStatus, onMessageCb) {
  isManualDisconnect = false;
  currentUser = username;
  currentPass = password;

  await loggerApi({ username, initiated: ts() });
  reconnectDelay = RECONNECT_BASE_MS;
  cleanupConnection();
  doConnect(username, password, onStatus, onMessageCb);
}

// --- DMs ---
export function sendDirectMessage(toUsername, text) {
  if (!connection || !text || !toUsername) return;
  const toJid = `${toUsername}@${XMPP_DOMAIN}`;
  const stanza = $msg({ to: toJid, type: "chat" }).c("body").t(text);
  connection.send(stanza.tree());
}

// --- Group Chats ---
export function joinGroupChat(roomName, onMessageCb) {
  if (!connection || !currentUser) return;

  const roomJid = `${roomName}@conference.${XMPP_DOMAIN}`;
  const pres = $pres({ to: `${roomJid}/${currentUser}` }).c("x", {
    xmlns: "http://jabber.org/protocol/muc",
  });
  connection.send(pres.tree());
  const room = Array.from(joinedRooms).find((r) => r.roomName === roomName);
  if (!room) joinedRooms.add({ roomName, currentUser });
  console.log("joinedRooms", joinedRooms);
}

export function sendGroupMessage(roomName, text) {
  if (!connection || !text) return;
  const room = Array.from(joinedRooms).find((r) => r.roomName === roomName);
  if (!room) return;
  const roomJid = `${roomName}@conference.${XMPP_DOMAIN}`;
  const stanza = $msg({ to: roomJid, type: "groupchat" }).c("body").t(text);
  console.log("stanza", stanza, text, roomJid);
  connection.send(stanza.tree());
}

export function leaveGroupChat(roomName) {
  if (!connection) return;
  const room = Array.from(joinedRooms).find((r) => r.roomName === roomName);
  if (!room) return;
  const roomJid = `${roomName}@conference.${XMPP_DOMAIN}/${room.nickname}`;
  const pres = $pres({ to: roomJid, type: "unavailable" });
  connection.send(pres.tree());
  joinedRooms.delete(room);
}

// --- Disconnect ---
export function disconnectXmpp() {
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  isManualDisconnect = true;

  const username = currentUser;
  // Leave all rooms
  Array.from(joinedRooms).forEach(({ roomName }) => leaveGroupChat(roomName));

  try {
    if (connection) connection.disconnect();
  } catch {}
  if (username && lastLoggedEvent !== "disconnected")
    logOnDisconnected(username);
  lastDisconnectWasUnexpected = false;
  cleanupConnection();
}

// --- Getter ---
export function getConnection() {
  return connection;
}
