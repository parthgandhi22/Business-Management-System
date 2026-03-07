import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import socket from "../socket";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import "../index.css";

function EmployeeDashboard() {

  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [slips, setSlips] = useState([]);

  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);


  // ===============================
  // Fetch Employee Tasks
  // ===============================
  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks/my-tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  // ===============================
  // Fetch Inbox Messages
  // ===============================
  const fetchMessages = async () => {
    try {
      const res = await axios.get("/messages/inbox");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async(id)=>{

    try{

      await axios.delete(`/messages/delete/${id}`);

      fetchMessages();
      fetchUnread();

    }catch(err){
      console.error(err);
    }

  };


  // ===============================
  // Fetch Unread Counter
  // ===============================
  const fetchUnread = async () => {
    try {
      const res = await axios.get("/messages/unread-count");
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };


  // ===============================
  // Fetch Salary Slips (LATEST 5)
  // ===============================
  const fetchSlips = async () => {
    try {
      const res = await axios.get("/payroll/my-slips");
      setSlips(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  // ===============================
  // Mark message as read
  // ===============================
  const markAsRead = async (id) => {

    const message = messages.find(m => m._id === id);
    if(message?.isRead) return;
    // instant UI update
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === id ? { ...msg, isRead: true } : msg
      )
    );

    setUnreadCount((prev) => Math.max(prev - 1, 0));

    try {
      await axios.patch(`/messages/read/${id}`);
    } catch (err) {
      console.error(err);
    }
  };


  // ===============================
  // Check Google Calendar
  // ===============================
  const checkCalendarConnection = async () => {
    try {

      const res = await axios.get("/auth/me");

      if (res.data.googleAccessToken) {
        setCalendarConnected(true);
      } else {
        setCalendarConnected(false);
      }

      setLoadingCalendar(false);

    } catch (err) {
      console.error(err);
      setLoadingCalendar(false);
    }
  };


  // ===============================
  // INITIAL DATA LOAD
  // ===============================
  useEffect(() => {

    fetchTasks();
    fetchMessages();
    fetchUnread();
    fetchSlips();
    checkCalendarConnection();

  }, []);


  // ===============================
  // SOCKET EVENTS
  // ===============================
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));

    // ⭐ Notify server that this user is online
    if (user) {
      socket.emit("userOnline", {
        id: user.id,
        name: user.name,
        role: user.role
      });
    }

    socket.on("taskUpdated",() => {
      fetchTasks();
      fetchUnread();
      fetchMessages();
    });

    socket.on("taskCreated",() => {
      fetchTasks();
      fetchUnread();
      fetchMessages();
    });

    socket.on("taskDeleted",() => {
      fetchTasks();
      fetchUnread();
      fetchMessages();
    });

    socket.on("salarySent", () => {
      fetchUnread();
      fetchMessages();
      fetchSlips();
    });

    socket.on("announcement", () => {
      fetchUnread();
      fetchMessages();
    });

    return () => {
      socket.off("taskUpdated");
      socket.off("taskCreated");
      socket.off("taskDeleted");
      socket.off("salarySent");
      socket.off("announcement");
    };

  }, []);


  // ===============================
  // Google Calendar
  // ===============================
  const connectCalendar = () => {
    window.location.href =
      "https://business-management-system-8g4u.onrender.com/api/google/connect";
  };

  const openCalendar = () => {
    window.open("https://calendar.google.com", "_blank");
  };


  // ===============================
  // Drag End Handler
  // ===============================
  const onDragEnd = async (result) => {

    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {

      await axios.patch(`/tasks/update-status/${taskId}`, {
        status: newStatus,
      });

    } catch (err) {
      console.error(err);
      fetchTasks();
    }

  };


  const getTasksByStatus = (status) =>
    tasks
      .filter((task) => task.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


  return (
    <>
      <Navbar role="employee" />

      <div className="kanban-container">

        {/* ===== TOP BAR ===== */}

        <div  id="kanban" className="dashboard-topbar">

          <div className="dashboard-title">
            <h1>My Kanban Board</h1>
          </div>

          <div className="topbar-right">

            {!loadingCalendar && (
              <div className="calendar-widget">

                {!calendarConnected ? (

                  <button
                    className="calendar-connect-btn"
                    onClick={connectCalendar}
                  >
                    Connect Calendar
                  </button>

                ) : (

                  <button
                    className="calendar-icon-btn"
                    onClick={openCalendar}
                    title="Open Google Calendar"
                  >
                    📅
                  </button>

                )}

              </div>
            )}

          </div>

        </div>


        {/* ===== KANBAN BOARD ===== */}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board">

            {["To Do", "In Progress", "Completed"].map((status) => (
              <Droppable droppableId={status} key={status}>

                {(provided) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >

                    <h3>{status}</h3>

                    {getTasksByStatus(status).map((task, index) => (

                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >

                        {(provided) => (

                          <div
                            className="kanban-card"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >

                            <h4>{task.title}</h4>

                            <p>{task.description}</p>

                            <small>
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString()
                                : "No Deadline"}
                            </small>

                          </div>

                        )}

                      </Draggable>

                    ))}

                    {provided.placeholder}

                  </div>
                )}

              </Droppable>
            ))}

          </div>
        </DragDropContext>


        {/* ===== INBOX ===== */}

        <div id="inbox" className="inbox-section">

          <h2>
            Inbox
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </h2>

          {messages.length === 0 ? (

            <p>No messages</p>

          ) : (

            messages.map((msg) => (

              <div key={msg._id} className={`message-card ${msg.isRead ? "" : "unread"}`}>

                <div className="message-top">

                  <p onClick={()=>markAsRead(msg._id)}>
                    {msg.message}
                  </p>

                  <button
                    className="delete-msg-btn"
                    onClick={()=>deleteMessage(msg._id)}
                  >
                    ✕
                  </button>

                </div>

                <small>
                  {new Date(msg.createdAt).toLocaleString()}
                </small>

              </div>

            ))

          )}

        </div>


        {/* ===== SALARY SLIPS ===== */}

        <div id="salary-slips" className="salary-section">

          <h2>Recent Salary Slips</h2>

          {slips.length === 0 ? (

            <p>No salary slips available</p>

          ) : (

            <table className="salary-table">

              <thead>
                <tr>
                  <th>Month</th>
                  <th>Download</th>
                </tr>
              </thead>

              <tbody>

                {slips.map((slip) => {

                  const fileName = slip.filePath.split("/").pop();

                  return (

                    <tr key={slip._id}>

                      <td>{slip.month}</td>

                      <td>

                        <a
                          href={`https://business-management-system-8g4u.onrender.com/salary_slips/${fileName}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          )}

        </div>

      </div>
    </>
  );
}

export default EmployeeDashboard;