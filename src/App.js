import React from "react";
import { notification } from "antd";
import { NotificationProvider } from "./utils/antToast";
import Home from "./components/Home";
import "./App.css";

function App() {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationProvider value={api}>
      <Home />
      {contextHolder}
    </NotificationProvider>
  );
}

export default App;
