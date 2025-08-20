const BASE_URL = process.env.REACT_APP_BASE_URL;

const loggerApi = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/logs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log("log created");
  } catch (error) {
    console.error("Error:", error);
  }
};

export default loggerApi;
