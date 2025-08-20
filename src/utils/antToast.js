import { createContext, useContext } from "react";

const NotificationContext = createContext(null);

export const NotificationProvider = NotificationContext.Provider;

const useToast = () => {
  const api = useContext(NotificationContext);
  const placement = "topRight";
  const duration = 1;

  if (!api)
    throw new Error("useToast must be used inside <NotificationProvider>");

  return {
    showSuccess: (message) =>
      api.success({
        message: "Success",
        description: message,
        placement,
        duration,
      }),

    showError: (message) =>
      api.error({
        message: "Error",
        description: message,
        placement,
        duration,
      }),

    showInfo: (message) =>
      api.info({ message: "Info", description: message, placement, duration }),

    showWarning: (message) =>
      api.warning({
        message: "Warning",
        description: message,
        placement,
        duration,
      }),
  };
};

export default useToast;
