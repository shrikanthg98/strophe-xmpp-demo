import React, { useState, useCallback, useEffect } from "react";
import { Strophe } from "strophe.js";
import {
  connectXmpp,
  disconnectXmpp,
  sendDirectMessage,
} from "../xmpp/xmppManager";
import { useDispatch, useSelector } from "react-redux";
import { firstLetterCap } from "../utils/helperFuncs";
import { addMessage, resetState, setXmppConnection } from "../slices/chatSlice";
import Login from "./login/Login";
import StudiesTable from "./workspace/StudiesTable";
import { MessageOutlined } from "@ant-design/icons";
import {
  resetAppState,
  setMessageAppOpen,
  setSelectedStudy,
} from "../slices/appSlice";
import "./Home.css";
import ProfilesSideBar from "./chat-app/ProfilesSidebar";
import ChatWindow from "./chat-app/ChatWindow";
import moment from "moment";

function Home() {
  const dispatch = useDispatch();
  const myDetails = useSelector((state) => state.chat.myDetails);
  const messageAppOpen = useSelector((state) => state.app.messageAppOpen);
  const allUnreadMessagesCount = useSelector(
    (state) => state.chat.allUnreadMessagesCount
  );
  const { name: username = "", password = "" } = myDetails;
  const [statusText, setStatusText] = useState("Disconnected");
  const [toUserName, setToUsername] = useState("");
  const [message, setMessage] = useState("");
  const [inbox, setInbox] = useState([]);

  const handleStatus = useCallback((status) => {
    switch (status) {
      case Strophe.Status.CONNECTING:
        setStatusText("Connecting...");
        break;
      case Strophe.Status.CONNFAIL:
        setStatusText("Connection failed");
        break;
      case Strophe.Status.AUTHENTICATING:
        setStatusText("Authenticating...");
        break;
      case Strophe.Status.AUTHFAIL:
        setStatusText("Authentication failed");
        break;
      case Strophe.Status.CONNECTED:
        setStatusText("Connected");
        dispatch(setXmppConnection(true));
        break;
      case Strophe.Status.DISCONNECTED:
        setStatusText("Disconnected");
        dispatch(setXmppConnection(false));
        break;
      case Strophe.Status.DISCONNECTING:
        setStatusText("Disconnecting...");
        dispatch(setXmppConnection(false));
        break;
      default:
        setStatusText(`Status: ${status}`);
    }
  }, []);

  const handleIncoming = useCallback((msg) => {
    dispatch(addMessage({ date: moment().toISOString(), ...msg }));
  }, []);

  const onLogin = () => {
    if (!username || !password) return;
    connectXmpp(username, password, handleStatus, handleIncoming);
  };

  const onLogout = () => {
    disconnectXmpp();
    dispatch(resetState());
    dispatch(resetAppState());
  };

  const onSend = () => {
    if (!toUserName || !message) return;
    sendDirectMessage(toUserName, message);
    setInbox((prev) => [
      { ts: Date.now(), from: "me", body: message },
      ...prev,
    ]);
    setMessage("");
  };

  useEffect(() => {
    if (username && password) onLogin();
  }, [username, password]);

  if (!username || !password) return <Login />;

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          margin: "10px 0px 0px 0px",
          padding: 0,
        }}
      >
        RADSPA
      </h1>
      <div className="main-wrapper">
        <div className="main-container">
          <StudiesTable />
          {!messageAppOpen && (
            <button
              title="Open messaging app"
              className="rounded-btn floating-msg-button"
              onClick={() => {
                dispatch(setMessageAppOpen(true));
                dispatch(setSelectedStudy({}));
              }}
            >
              <div className="msg-btn-icon-wrapper">
                <MessageOutlined style={{ fontSize: 20 }} />
                {allUnreadMessagesCount > 0 && (
                  <span className="msg-badge">
                    {allUnreadMessagesCount > 99
                      ? "99+"
                      : allUnreadMessagesCount}
                  </span>
                )}
              </div>
            </button>
          )}

          {messageAppOpen && (
            <div className="chat-container">
              <ProfilesSideBar />
              <ChatWindow />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
