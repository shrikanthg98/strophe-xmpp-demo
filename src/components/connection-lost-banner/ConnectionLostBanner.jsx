import React from "react";
import { useSelector } from "react-redux";
import { Button } from "antd";
// import { getXMPPClient } from "../../utils/xmppClient";
import { DisconnectOutlined } from "@ant-design/icons";
import useToast from "../../utils/antToast";
import "./ConnectionLostBanner.css";

const ConnectionLostBanner = () => {
  const { showError } = useToast();
  const xmppIsConnected = useSelector((state) => state.chat.xmppIsConnected);
  const xmppConnectionRetrying = useSelector(
    (state) => state.chat.xmppConnectionRetrying
  );
  // const xmpp = getXMPPClient();

  if (xmppIsConnected) return null;
  return (
    <div className="connection-lost-banner">
      <span className="icon">
        <DisconnectOutlined />
      </span>
      <span className="text">Connection Lost</span>
      <span className="subtext">
        {xmppConnectionRetrying ? (
          "Trying to reconnect..."
        ) : (
          <Button
            type="primary"
            onClick={async () => {
              try {
                // await xmpp.stop();
                // await xmpp.start();
              } catch (error) {
                showError("Something went wrong! please reload");
              }
            }}
          >
            Retry
          </Button>
        )}
      </span>
    </div>
  );
};

export default ConnectionLostBanner;
