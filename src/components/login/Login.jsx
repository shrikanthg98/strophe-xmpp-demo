import React from "react";
import { Button, Card, Form, Input } from "antd";
import "./Login.css";
import { useDispatch } from "react-redux";
import { setMyDetails } from "../../slices/chatSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      dispatch(
        setMyDetails({
          name: values?.username,
          password: values?.password,
        })
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="login-wrapper">
      <Card className="login-card" title="Login to RADSPA" size="default">
        <Form form={form} autoComplete="off" layout="vertical">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Enter username" }]}
          >
            <Input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Enter password" }]}
          >
            <Input
              type="password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLogin();
                }
              }}
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleLogin}
            style={{ width: "100%" }}
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
