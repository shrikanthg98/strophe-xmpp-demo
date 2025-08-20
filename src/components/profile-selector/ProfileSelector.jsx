import React from "react";
import "./ProfileSelector.css";
import { useDispatch, useSelector } from "react-redux";
import { setMyDetails } from "../../slices/chatSlice";
import useToast from "../../utils/antToast";
import { firstLetterCap } from "../../utils/helperFuncs";
import { useGetAllUsersQuery } from "../../services/chatApi";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const ProfileSelector = () => {
  const { isLoading } = useGetAllUsersQuery({});
  const dispatch = useDispatch();
  const { showSuccess } = useToast();
  const allUsers = useSelector((state) => state.chat.allUsers);
  const profiles = allUsers.map((ele) => ({
    name: ele,
    img: "/dp-icon.jpg",
    password: "Test@123",
  }));

  return (
    <div className="profile-container">
      <h1 className="profile-heading" style={{ marginTop: 0 }}>
        Select a profile to proceed
      </h1>
      {isLoading ? (
        <Spin indicator={<LoadingOutlined spin style={{ fontSize: 48 }} />} />
      ) : (
        <div className="profile-selector">
          {profiles.map((profile, i) => (
            <div
              key={i}
              className="profile"
              onClick={() => {
                dispatch(setMyDetails(profile));
                showSuccess(`Logged in as ${firstLetterCap(profile.name)}`);
              }}
            >
              <img
                src={profile.img}
                alt={profile.name}
                className="profile-img"
              />
              <p className="profile-name">{firstLetterCap(profile.name)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;
