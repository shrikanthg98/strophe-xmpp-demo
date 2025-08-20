import { createSlice } from "@reduxjs/toolkit";
import { chatApi } from "../services/chatApi";
// import { getName, isFromWeb } from "../utils/helperFuncs";

const initialState = {
  selectedProfile: {},
  messages: [],
  typingUser: null,
  presenceMap: {},
  allPresencesMap: {},
  myDetails: {},
  xmppIsConnected: false,
  chatList: [],
  allUsers: [],
  myJid: "",
  retryCount: 0,
  newMessageToast: {},
  allUnreadMessagesCount: 0,
  replyToMessage: {},
  xmppConnectionRetrying: true,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
    setXmppConnection: (state, action) => {
      state.xmppIsConnected = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      let messages = [...state.messages];
      messages = [...messages, { ...action.payload }];
      state.messages = messages;
    },
    // addMessage: (state, action) => {
    //   const newMessage = action.payload;
    //   const presenceMap = state.presenceMap;
    //   const selectedProfile = state.selectedProfile;
    //   if (selectedProfile?.name) {
    //     if (selectedProfile?.isGroup) {
    //       let usersPresence = [];
    //       let users = [...selectedProfile?.usersList] || [];
    //       users.forEach((ele) => {
    //         if (presenceMap[ele] === "online") {
    //           usersPresence.push(true);
    //           return;
    //         }
    //         usersPresence.push(false);
    //       });
    //       newMessage.status = usersPresence.includes(false)
    //         ? "sent"
    //         : "delivered";
    //     } else {
    //       newMessage.status =
    //         presenceMap[selectedProfile.name.toLowerCase()] === "online"
    //           ? "delivered"
    //           : "sent";
    //     }
    //   }
    //   state.messages.push(newMessage);
    // },
    setTypingUser: (state, action) => {
      state.typingUser = action.payload;
    },
    // updatePresence: (state, action) => {
    //   const { from, type } = action.payload;
    //   const selectedProfile = state.selectedProfile;
    //   const messages = state.messages;
    //   const myDetails = { ...state.myDetails };
    //   const presenceMap = state.presenceMap;

    //   if (!isFromWeb(from)) return;

    //   state.presenceMap[getName(from)] =
    //     type === "unavailable" ? "offline" : "online";

    //   if (selectedProfile?.name) {
    //     let tempMessages = [];
    //     if (selectedProfile?.isGroup) {
    //       let usersPresence = [];
    //       if (
    //         selectedProfile?.usersList &&
    //         selectedProfile?.usersList?.length > 0
    //       ) {
    //         [...selectedProfile?.usersList]
    //           ?.filter((ele) => ele !== myDetails?.name)
    //           .forEach((ele) => {
    //             if (presenceMap[ele] === "online") {
    //               usersPresence.push(true);
    //               return;
    //             }
    //             usersPresence.push(false);
    //           });
    //       }
    //       tempMessages = messages.map((msg) => {
    //         if (msg?.status === "sent" && !usersPresence.includes(false)) {
    //           return { ...msg, status: "delivered" };
    //         }
    //         return msg;
    //       });
    //     } else {
    //       tempMessages = messages.map((msg) => {
    //         if (msg?.status === "sent") {
    //           return { ...msg, status: "delivered" };
    //         }
    //         return msg;
    //       });
    //     }
    //     state.messages = tempMessages;
    //   }
    // },
    setMyDetails: (state, action) => {
      state.myDetails = action.payload;
    },
    setChatList: (state, action) => {
      state.chatList = action.payload;
    },
    updateChatList: (state, action) => {
      const newMsgNotification = action.payload;
      const selectedProfile = state.selectedProfile;
      if (!newMsgNotification?.jid) return;
      if (selectedProfile?.jid === newMsgNotification?.jid) return;
      if (
        !newMsgNotification?.unReadMessagesCount &&
        parseInt(newMsgNotification?.unReadMessagesCount) === 0
      )
        return;
      state.newMessageToast = newMsgNotification;
      const index = state.chatList.findIndex(
        (c) => c?.jid === newMsgNotification?.jid
      );
      const temp = [...state.chatList];
      const newMsg = {
        ...state.chatList[index],
        ...newMsgNotification,
      };
      delete temp[index];
      temp.unshift(newMsg);
      state.chatList = temp?.filter((c) => c);
    },
    clearNewMessagesCountInChatList: (state, action) => {
      const user = action.payload;
      const chatList = [...state.chatList];
      const index = chatList.findIndex((c) => c?.jid === user?.jid);
      const currentChat = { ...chatList[index], unReadMessagesCount: 0 };
      chatList[index] = currentChat;
      state.chatList = chatList;
    },
    addChat: (state, action) => {
      state.chatList.unshift(action.payload);
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setMyJid: (state, action) => {
      state.myJid = action.payload;
    },
    updateRetryCount: (state) => {
      state.retryCount += 1;
    },
    setNewMessageToast: (state, action) => {
      state.newMessageToast = action.payload;
    },
    setReplyToMessage: (state, action) => {
      state.replyToMessage = action.payload;
    },
    updateMessages: (state, action) => {
      const { joinedNotificationData } = action.payload;
      if (joinedNotificationData) {
        state.messages = [...state.messages].map((msg) => {
          if (msg?.status) delete msg.status;
          return msg;
        });
      }
    },
    setXmppConnectionRetrying: (state, action) => {
      state.xmppConnectionRetrying = action.payload;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        chatApi.endpoints.getAllUsers.matchFulfilled,
        (state, { payload }) => {
          state.allUsers = payload;
        }
      )
      .addMatcher(
        chatApi.endpoints.getChatList.matchFulfilled,
        (state, { payload }) => {
          state.chatList = Array.isArray(payload) ? payload : [];
        }
      )
      .addMatcher(
        chatApi.endpoints.getChatHistory.matchFulfilled,
        (state, { payload }) => {
          state.messages = payload;
        }
      )
      .addMatcher(
        chatApi.endpoints.getAllUnreadMessagesCount.matchFulfilled,
        (state, { payload }) => {
          state.allUnreadMessagesCount = payload?.length || 0;
        }
      );
  },
});

export const {
  setSelectedProfile,
  setXmppConnection,
  setMessages,
  addMessage,
  addSelfMessage,
  setTypingUser,
  updatePresence,
  setMyDetails,
  setChatList,
  updateChatList,
  addChat,
  setAllUsers,
  setMyJid,
  updateRetryCount,
  setNewMessageToast,
  setReplyToMessage,
  updateMessages,
  clearNewMessagesCountInChatList,
  setXmppConnectionRetrying,
  resetState,
} = chatSlice.actions;

export default chatSlice.reducer;
