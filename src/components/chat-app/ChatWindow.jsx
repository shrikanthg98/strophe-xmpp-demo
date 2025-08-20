import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useXMPP } from "../../hooks/useXMPP";
import {
  useAttachFileMutation,
  useGetChatHistoryQuery,
  useLazyGetAllUnreadMessagesCountQuery,
  useLazyGetChatListQuery,
} from "../../services/chatApi";
import {
  firstLetterCap,
  getName,
  getNameAfterSlash,
  getNameFromRoomJid,
} from "../../utils/helperFuncs";
// import AddMemberToGroupModal from "./AddMemberToGroupModal";
import {
  addMessage,
  setMessages,
  setReplyToMessage,
  setSelectedProfile,
} from "../../slices/chatSlice";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  SendOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Spin, Tooltip, Upload } from "antd";
import useToast from "../../utils/antToast";
import { setMessageAppOpen, setSelectedStudy } from "../../slices/appSlice";
import "./ChatWindow.css";
import moment from "moment";
import {
  joinGroupChat,
  sendDirectMessage,
  sendGroupMessage,
} from "../../xmpp/xmppManager";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const { showError } = useToast();
  const myDetails = useSelector((state) => state.chat.myDetails);
  const selectedProfile = useSelector((state) => state.chat.selectedProfile);
  const messages = useSelector((state) => state.chat.messages);
  const isBroadcast = selectedProfile?.isBroadcast;
  const isGroup = selectedProfile?.isGroup;
  const presenceMap = useSelector((state) => state.chat.presenceMap);
  const xmppIsConnected = useSelector((state) => state.chat.xmppIsConnected);
  const retryCount = useSelector((state) => state.chat.retryCount);
  const selectedStudy = useSelector((state) => state.app.selectedStudy);
  const replyToMessage = useSelector((state) => state.chat.replyToMessage);
  const xmppConnectionRetrying = useSelector(
    (state) => state.chat.xmppConnectionRetrying
  );

  // const { sendTyping, sendGroupMessage, joinGroup, sendGroupMessageWithReply } =
  //   useXMPP();
  const [triggerChatList] = useLazyGetChatListQuery();
  const [triggerUnreadMessagesCount] = useLazyGetAllUnreadMessagesCountQuery();

  const { isLoading, refetch: refetchChatHistory } = useGetChatHistoryQuery(
    {
      from: myDetails.name,
      to: selectedProfile?.name,
      isGroup: selectedProfile?.isGroup,
    },
    {
      skip: !selectedProfile?.name,
    }
  );

  const [attachFile, { isLoading: uploading }] = useAttachFileMutation();
  const [input, setInput] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSend = () => {
    const toUsername = selectedProfile?.name;
    const message = input.trim();
    if (!selectedProfile?.isGroup && toUsername && message) {
      sendDirectMessage(toUsername, message);
      dispatch(
        addMessage({ date: moment().toISOString(), from: "me", body: message })
      );
    }

    if (selectedProfile?.isGroup && toUsername && message) {
      sendGroupMessage(toUsername, message);
    }

    setInput("");
  };

  const handleUpload = async ({ file }) => {
    try {
      if (+file?.size > 1048576) {
        throw new Error(`File ${file?.name} size exceeds 1MB`);
      }
      await attachFile({
        from: myDetails?.name,
        file,
        roomName: getName(selectedProfile.jid),
      }).unwrap();
      await refetchChatHistory();
    } catch (error) {
      console.log(error);
      showError(error.message || "File upload failed");
    }
  };

  useEffect(() => {
    dispatch(setMessages([]));
  }, [selectedProfile?.jid, dispatch]);

  useEffect(() => {
    if (selectedProfile?.jid) {
      dispatch(setReplyToMessage({}));
      // joinGroup(selectedProfile.jid, myDetails.name);
    }
  }, [selectedProfile, myDetails, dispatch]);

  useEffect(() => {
    if (!selectedStudy?.studyId && myDetails?.name) {
      triggerChatList({ userName: myDetails?.name });
    }
  }, [myDetails, selectedStudy]);

  // useEffect(() => {
  //   if (selectedProfile?.jid && myDetails.name && retryCount > 0) {
  //     joinGroup(selectedProfile.jid, myDetails.name);
  //   }
  // }, [retryCount, selectedProfile?.jid, myDetails.name]);

  useEffect(() => {
    if (selectedProfile?.name && selectedProfile?.isGroup) {
      joinGroupChat(selectedProfile?.name);
    }
  }, [selectedProfile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!xmppIsConnected) {
    return (
      <div className="chat-window">
        <div className="chat-container-options">
          <button
            onClick={() => {
              triggerUnreadMessagesCount({ userName: myDetails?.name });
              dispatch(setMessageAppOpen(false));
              dispatch(setSelectedProfile({}));
              dispatch(setSelectedStudy({}));
            }}
            title="Minimize"
            className="minimize"
          >
            —
          </button>
        </div>
        <div
          className="display-flex"
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          {xmppConnectionRetrying ? (
            <h2>Connection lost! retrying...</h2>
          ) : (
            <h2>
              Connection lost! <button>Retry</button>
            </h2>
          )}
        </div>
      </div>
    );
  }

  if (!selectedProfile?.name) {
    return (
      <div style={{ width: "100%" }}>
        <div className="chat-container-options">
          <button
            onClick={() => {
              triggerUnreadMessagesCount({ userName: myDetails?.name });
              dispatch(setMessageAppOpen(false));
            }}
            title="Minimize"
            className="minimize"
          >
            —
          </button>
        </div>
        <div className="chat-window centered">
          <h2>Please select a user to chat.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="display-flex">
        {!isBroadcast && isGroup && (
          <Tooltip title="Add an user to this group" placement="bottomLeft">
            <button
              className="rounded-btn"
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserAddOutlined />
            </button>
          </Tooltip>
        )}
        <h3 style={{ flex: 1, textAlign: "center" }}>
          {firstLetterCap(
            isBroadcast ? "Broadcast Message" : selectedProfile?.name
          )}
          {/* {!isGroup && !isBroadcast ? (
            presenceMap[
              selectedProfile?.isCaseStudy
                ? selectedProfile.name?.toString().toLowerCase().split("_")[0]
                : selectedProfile?.name
            ] === "online" ? (
              <span className="status-dot online" />
            ) : (
              <span className="status-dot offline" />
            )
          ) : null} */}
        </h3>
        <div className="chat-container-minimize">
          <button
            title="Minimize"
            onClick={() => {
              triggerUnreadMessagesCount({ userName: myDetails?.name });
              dispatch(setMessageAppOpen(false));
              dispatch(setSelectedProfile({}));
              dispatch(setSelectedStudy({}));
            }}
          >
            —
          </button>
        </div>
      </div>

      <div className="message-history">
        {isLoading ? (
          <div style={{ textAlign: "center" }}>Loading...</div>
        ) : messages?.length > 0 ? (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${
                (
                  msg?.type === "group" || msg?.type === "groupchat"
                    ? getNameAfterSlash(msg.from)
                    : getName(msg.from) === myDetails.name || msg.from === "me"
                )
                  ? "you"
                  : "them"
              }`}
            >
              {console.log("MESSAGE", msg, getNameAfterSlash(msg.from))}
              <div className="message-body">{msg.body}</div>
              <div className="time-stamp">
                {moment(msg?.date)
                  .utcOffset("+05:30")
                  .format("HH:mm, DD/MM/YY")}
                <br />
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center" }}>No message sent yet</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {replyToMessage?.stanzaId && (
        <div className="reply-to-message">
          <div
            style={{
              textAlign: "right",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  textAlign: "left",
                  alignItems: "center",
                  display: "flex",
                  gap: 5,
                }}
              >
                Replying to{" "}
                <span className="text-bold-500" style={{ fontSize: "1rem" }}>
                  {firstLetterCap(getNameAfterSlash(replyToMessage?.from))}`s
                </span>
              </div>
            </div>
            <CloseOutlined
              onClick={() => dispatch(setReplyToMessage({}))}
              className="reply-to-message-close"
            />
          </div>

          <div className="reply-to-message-body">{replyToMessage?.body}</div>
        </div>
      )}
      {!isBroadcast && (
        <div className="input-bar">
          <textarea
            name="message-input"
            type="text"
            value={input}
            onChange={(e) => {
              // sendTyping(selectedProfile?.jid);
              setInput(e.target.value);
            }}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <Tooltip title="Attach document">
              <button className="rounded-btn">
                <Upload
                  customRequest={handleUpload}
                  accept=".png,.jpg,.jpeg,.gif,.pdf"
                  multiple={false}
                  maxCount={1}
                  showUploadList={false}
                >
                  {uploading ? (
                    <Spin
                      style={{ color: "white" }}
                      indicator={<LoadingOutlined spin />}
                    />
                  ) : (
                    <PaperClipOutlined style={{ color: "white" }} />
                  )}
                </Upload>
              </button>
            </Tooltip>
            <button
              className="rounded-btn"
              style={{ height: 42 }}
              onClick={handleSend}
              title="Send message"
            >
              <SendOutlined />
            </button>
          </div>
        </div>
      )}

      {/* <AddMemberToGroupModal
        openModal={showAddMemberModal}
        onCancel={() => setShowAddMemberModal(false)}
      /> */}
    </div>
  );
};

export default ChatWindow;
