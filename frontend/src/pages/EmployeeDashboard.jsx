import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../axiosConfig";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import "../index.css";

function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
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
  // Check Google Calendar Status
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

  useEffect(() => {
    fetchTasks();
    checkCalendarConnection();
  }, []);

  // ===============================
  // Connect Google Calendar
  // ===============================
  const connectCalendar = () => {
    window.location.href =
      "http://localhost:8000/api/google/connect";
  };

  // ===============================
  // Open Google Calendar
  // ===============================
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
      <Navbar role="Employee" />

      <div className="kanban-container">

        {/* ===============================
            TOP BAR (Calendar Integration)
        =============================== */}

        <div className="dashboard-topbar">

          <div className="dashboard-title">
            <h1>My Kanban Board</h1>
          </div>

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

        {/* ===============================
            KANBAN BOARD
        =============================== */}

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

      </div>
    </>
  );
}

export default EmployeeDashboard;