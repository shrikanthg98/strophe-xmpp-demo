import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  keepUnusedDataFor: 0,
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: ({ username, password }) => ({
        url: "/openfire/createUser",
        method: "POST",
        body: { username, password },
      }),
    }),
    getChatList: builder.query({
      query: ({ userName, caseStudy }) => ({
        url: `/openfire/getRoomsList?from=${userName}${
          caseStudy ? "&caseStudy=" + caseStudy : ""
        }`,
        method: "GET",
      }),
    }),
    sendDM: builder.mutation({
      query: ({ to, message, from, password }) => ({
        url: "/openfire/dm",
        method: "POST",
        body: { to, message, from, password },
      }),
    }),
    getChatHistory: builder.query({
      query: ({ from, to, isGroup }) => ({
        url: `/openfire/chat/history?from=${from}&to=${to}&isGroup=${!!isGroup}`,
        method: "GET",
      }),
    }),
    createGroup: builder.mutation({
      query: ({ roomName, owner }) => ({
        url: "/openfire/create/group",
        method: "POST",
        body: { roomName, nickName: roomName, owner },
      }),
    }),
    sendGroupChatMessage: builder.mutation({
      query: ({ roomName, message, userName }) => ({
        url: "/openfire/group/chat",
        method: "POST",
        body: { roomName, message, userName },
      }),
    }),
    sendBroadcast: builder.mutation({
      query: ({ message, users, from }) => ({
        url: `/openfire/send/broadcast`,
        method: "POST",
        body: { message, users, from },
      }),
    }),
    getAllUsers: builder.query({
      query: ({ me, readers }) => ({
        url: `/openfire/getUsers${me ? "?q=" + me : ""}${
          readers ? "&readers=" + readers : []
        }`,
        method: "GET",
      }),
    }),
    addUserToGroup: builder.mutation({
      query: ({ roomName, user }) => ({
        url: `/openfire/group/add`,
        method: "POST",
        body: { roomName, nickName: roomName, users: user },
      }),
    }),
    getRoomId: builder.query({
      query: ({ from, to, caseStudy }) => ({
        url: `/openfire/getRoomId?from=${from}&to=${to}${
          caseStudy ? "&caseStudy=" + caseStudy : ""
        }`,
        method: "GET",
      }),
    }),
    attachFile: builder.mutation({
      query: ({ from, file, roomName }) => {
        const formData = new FormData();
        formData.append("from", from);
        formData.append("file", file);
        formData.append("roomName", roomName);

        return {
          url: `/openfire/send-file`,
          method: "POST",
          body: formData,
        };
      },
    }),
    getAllUnreadMessagesCount: builder.query({
      query: ({ userName }) => ({
        url: `/openfire/getAllUnreadMsgsCount?from=${userName}`,
        method: "GET",
      }),
    }),
    getMessagesDelivered: builder.query({
      query: ({ userName }) => ({
        url: `/openfire/update${userName ? "?username=" + userName : ""}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetChatListQuery,
  useSendDMMutation,
  useGetChatHistoryQuery,
  useCreateGroupMutation,
  useSendGroupChatMessageMutation,
  useSendBroadcastMutation,
  useGetAllUsersQuery,
  useAddUserToGroupMutation,
  useGetRoomIdQuery,
  useAttachFileMutation,
  useLazyGetAllUsersQuery,
  useLazyGetChatListQuery,
  useGetAllUnreadMessagesCountQuery,
  useLazyGetAllUnreadMessagesCountQuery,
  useGetMessagesDeliveredQuery,
  useLazyGetMessagesDeliveredQuery,
} = chatApi;
