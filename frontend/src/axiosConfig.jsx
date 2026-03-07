import axios from "axios";

const instance = axios.create({
  baseURL: "https://business-management-system-8g4u.onrender.com/api",
  withCredentials: true // VERY IMPORTANT
});

export default instance;