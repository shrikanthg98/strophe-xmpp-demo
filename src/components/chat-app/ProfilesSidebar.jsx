import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addChat,
  clearNewMessagesCountInChatList,
  setSelectedProfile,
} from "../../slices/chatSlice";
import { Select, Tooltip } from "antd";
// import CreateEditUserModal from "./CreateEditUserModal";
import {
  useGetAllUsersQuery,
  useGetChatListQuery,
  useGetRoomIdQuery,
} from "../../services/chatApi";
// import CreateEditGroupModal from "./CreateEditGroupModal";
import { firstLetterCap } from "../../utils/helperFuncs";
// import BroadcastModal from "./BroadcastModal";
import {
  FileTextOutlined,
  SearchOutlined,
  SoundOutlined,
  TeamOutlined,
} from "@ant-design/icons";
// import { useXMPP } from "../../hooks/useXMPP";
import { skipToken } from "@reduxjs/toolkit/query";
import "./ProfilesSideBar.css";

const searchUserStr = "Search user...";

const ProfilesSideBar = () => {
  const dispatch = useDispatch();
  // const { leaveGroup } = useXMPP();
  const myDetails = useSelector((state) => state.chat.myDetails);
  const selectedProfile = useSelector((state) => state.chat.selectedProfile);
  const chatList = useSelector((state) => state.chat.chatList);
  const allUsers = useSelector((state) => state.chat.allUsers);
  const selectedStudy = useSelector((state) => state.app.selectedStudy);
  const presenceMap = useSelector((state) => state.chat.presenceMap);

  const [expanded, setExpanded] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [searchedUser, setSearchedUser] = useState(searchUserStr);

  useGetAllUsersQuery(
    myDetails?.name
      ? selectedStudy?.studyId
        ? {
            me: myDetails.name,
            readers: selectedStudy?.readers?.map((ele) => ele?.name),
          }
        : { me: myDetails.name }
      : skipToken,
    {
      refetchOnMountOrArgChange: false,
    }
  );

  const { isLoading } = useGetChatListQuery(
    myDetails?.name
      ? selectedStudy?.studyId
        ? { userName: myDetails?.name, caseStudy: selectedStudy?.studyId }
        : { userName: myDetails?.name }
      : skipToken,
    {
      refetchOnMountOrArgChange: false,
    }
  );

  const { data: newChat } = useGetRoomIdQuery(
    {
      from: myDetails?.name,
      to: searchedUser,
      caseStudy: selectedStudy?.studyId,
    },
    {
      skip: searchedUser === searchUserStr,
    }
  );

  const baseOptions = [
    { label: "Create Group", action: () => setShowCreateGroupModal(true) },
    {
      label: "Broadcast Message",
      action: () => setShowBroadcastModal(true),
    },
    { label: "Other Settings", action: () => console.log("Other Settings") },
  ];

  const adminOptions = [
    { label: "Create User", action: () => setShowCreateUserModal(true) },
  ];

  const options =
    myDetails?.name === "admin"
      ? [...adminOptions, ...baseOptions]
      : baseOptions;

  useEffect(() => {
    if (!newChat || Object.keys(newChat).length === 0) return;

    const existingChat = chatList?.find((chat) => chat?.jid === newChat.jid);

    if (existingChat) {
      dispatch(setSelectedProfile(existingChat));
    } else {
      dispatch(addChat(newChat));
      dispatch(setSelectedProfile(newChat));
    }

    setSearchedUser(searchUserStr);
  }, [newChat, dispatch]);

  return (
    <div className={`profiles-sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <div className="profiles-sidebar-header">
        {expanded &&
          (selectedStudy?.studyId ? (
            <div className="display-flex">
              <FileTextOutlined
                style={{ fontSize: 30, marginRight: "0.5rem" }}
              />
              <div className="custom-h2">{selectedStudy?.studyId}</div>
            </div>
          ) : (
            <div className="display-flex">
              <Tooltip
                arrow={false}
                color="black"
                title={
                  <div style={{ width: 250 }}>
                    <ul className="admin-options-list">
                      {options.map((opt, index) => (
                        <li key={index} onClick={opt.action}>
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                }
                placement="bottomLeft"
              >
                <img className="profile-icon" src="/dp-icon.jpg" alt="Admin" />
              </Tooltip>
              <div className="custom-h2">{firstLetterCap(myDetails.name)}</div>
            </div>
          ))}
        <div className="custom-h2" onClick={() => setExpanded(!expanded)}>
          <button className="rounded-btn">{expanded ? "◀" : "▶"}</button>
        </div>
      </div>

      <div className="profile-search-bar">
        <Select
          value={searchedUser}
          showSearch
          style={{ width: "100%", textAlign: "left" }}
          suffixIcon={<SearchOutlined style={{ fontSize: 16 }} />}
          options={(allUsers || []).map((val) => ({
            value: val,
            label: firstLetterCap(val),
          }))}
          onSelect={(val) => setSearchedUser(val)}
        />
      </div>

      <ul className="profile-list">
        {isLoading ? (
          <p style={{ textAlign: "center" }} className="text-bold-500">
            Loading...
          </p>
        ) : !chatList || chatList?.length === 0 ? (
          <p style={{ textAlign: "center" }} className="text-bold-500">
            No chats available
          </p>
        ) : (
          chatList?.map((user, idx) => (
            <li
              onClick={() => {
                // if (
                //   selectedProfile?.jid &&
                //   selectedProfile.name?.toLowerCase() !==
                //     user?.name?.toLowerCase()
                // ) {
                //   leaveGroup(selectedProfile?.jid, myDetails?.name);
                // }
                if (
                  selectedProfile.name?.toLowerCase() !==
                  user?.name?.toLowerCase()
                ) {
                  dispatch(setSelectedProfile(user));
                  dispatch(clearNewMessagesCountInChatList(user));
                }
              }}
              key={idx}
              className={`profile-item ${
                selectedProfile?.name === user?.name ? "selected" : ""
              } display-flex`}
            >
              {/* {!user?.isGroup &&
                !user?.isBroadcast &&
                (presenceMap[
                  user?.isCaseStudy
                    ? user?.name?.toString().toLowerCase().split("_")[0]
                    : user?.name
                ] === "online" ? (
                  <span className="status-dot online" />
                ) : (
                  <span className="status-dot offline" />
                ))} */}
              <div
                style={
                  user?.isGroup || user?.isBroadcast
                    ? { marginLeft: "1.1rem" }
                    : {}
                }
              >
                {firstLetterCap(
                  user?.isBroadcast ? "Broadcast Message" : user?.name
                )}
                {/* {expanded
                  ? firstLetterCap(
                      user?.isBroadcast ? "Broadcast Message" : user?.name
                    )
                  : user?.name.slice(0, 2).toUpperCase()} */}
              </div>

              <div
                style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}
              >
                {parseInt(user?.unReadMessagesCount) > 0 && (
                  <div style={{ margin: "0 0.5rem" }}>
                    <span className="message-count">
                      {user?.unReadMessagesCount}
                    </span>
                  </div>
                )}
                {user?.isBroadcast ? (
                  <SoundOutlined />
                ) : user?.isGroup ? (
                  <TeamOutlined />
                ) : (
                  <div style={{ padding: "0.5rem" }} />
                )}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* <CreateEditUserModal
        openModal={showCreateUserModal}
        onCancel={() => setShowCreateUserModal(false)}
        title="Create User"
      />
      <CreateEditGroupModal
        openModal={showCreateGroupModal}
        onCancel={() => setShowCreateGroupModal(false)}
        title="Create Group"
      />
      <BroadcastModal
        openModal={showBroadcastModal}
        onCancel={() => setShowBroadcastModal(false)}
      /> */}
    </div>
  );
};

export default ProfilesSideBar;
