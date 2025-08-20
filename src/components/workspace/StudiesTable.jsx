import React, { useEffect, useState } from "react";
import { Button, Space, Table, Tooltip } from "antd";
import { ExclamationCircleOutlined, MessageOutlined } from "@ant-design/icons";
import { firstLetterCap } from "../../utils/helperFuncs";
import { dataSource, FuncDummyData } from "../../utils/dummyData";
import "./StudiesTable.css";
import { useDispatch, useSelector } from "react-redux";
import { resetState } from "../../slices/chatSlice";
import { resetAppState } from "../../slices/appSlice";
import { disconnectXmpp } from "../../xmpp/xmppManager";
import ConnectionLostBanner from "../connection-lost-banner/ConnectionLostBanner";

const StudiesTable = () => {
  const dispatch = useDispatch();
  const myDetails = useSelector((state) => state.chat.myDetails);
  const [bannerDelay, setBannerDelay] = useState(0);
  const { data, functUpdateData } = FuncDummyData();

  const options = [
    {
      label: "Logout",
      action: () => {
        disconnectXmpp();
        dispatch(resetState());
        dispatch(resetAppState());
        // if (selectedProfile?.jid) {
        //   leaveGroup(selectedProfile?.jid, myDetails?.name);
        // }
        // stopClient();
        // showSuccess("Logged out successfully");
      },
    },
  ];

  const columns = [
    {
      title: "Study ID",
      dataIndex: "studyId",
      key: "studyId",
    },
    {
      title: "#",
      key: "studyId",
      render: (cellVal, rowVal, idx) => {
        return (
          <Space size={"large"}>
            <ExclamationCircleOutlined
              // className="cursor-pointer"
              style={{ fontSize: 18 }}
            />
            {rowVal?.status !== "Completed" && (
              <MessageOutlined
                // className="cursor-pointer"
                style={{ fontSize: 18 }}
                // onClick={() => {
                // dispatch(setMessageAppOpen(true));
                // dispatch(setSelectedStudy(rowVal));
                // dispatch(setMessages([]));
                // dispatch(setChatList([]));
                // dispatch(setAllUsers([]));
                // if (selectedProfile?.jid) {
                //   leaveGroup(selectedProfile?.jid, myDetails?.name);
                // }
                // dispatch(setSelectedProfile({}));
                // }}
              />
            )}
          </Space>
        );
      },
    },
    {
      title: "Call Codes",
      dataIndex: "callCodes",
      key: "studyId",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "studyId",
    },
    {
      title: "Assigned to",
      dataIndex: "name",
      key: "studyId",
    },
    {
      title: "MRN",
      dataIndex: "mrn",
      key: "studyId",
    },
    {
      title: "Procedure",
      dataIndex: "procedure",
      key: "studyId",
    },
    // {
    //   title: "Action",
    //   key: "studyId",
    //   render: (cellVal, rowVal, idx) => {
    //     if (rowVal?.status === "Completed") return null;
    //     return <Button onClick={() => functUpdateData(idx)}>Complete</Button>;
    //   },
    // },
  ];

  setTimeout(() => {
    setBannerDelay((prev) => prev + 1);
  }, 2000);

  return (
    <div className="st-main-container">
      <div className="st-secondary-container">
        {!!bannerDelay && <ConnectionLostBanner />}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>Workspace {">"} All Studies</div>
          <div className="display-flex">
            <div className="custom-h2" style={{ paddingRight: "0.5rem" }}>
              {firstLetterCap(myDetails.name)}
            </div>
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
          </div>
        </div>
        <div>
          <Table dataSource={data} columns={columns} pagination={false} />
        </div>
      </div>
    </div>
  );
};

export default StudiesTable;
