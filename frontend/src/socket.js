import { io } from "socket.io-client";

const socket = io("https://business-management-system-8g4u.onrender.com", {
  withCredentials: true
});

export default socket;