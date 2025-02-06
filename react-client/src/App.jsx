// src/app.jsx
import React, { useState, useEffect } from "react";

// import { io } from "socket.io-client";
import useSocket from "./hooks/useSocket";

// import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

import RealTimeChart from "./components/RealTimeChart";
import ButtonSelfNumbers from "./components/ButtonSelfNumbers";
import ButtonGlobalNumbers from "./components/ButtonGlobalNumbers";

import styles from "./App.module.css";

// Register Chart.js components
Chart.register(...registerables);

// Connect to the Flask-SocketIO server
// const socket = io("http://localhost:5000");

function App() {
  // Connect to the Flask-SocketIO server using the custom hook.
  const socket = useSocket("http://localhost:5000");

  // State for self numbers (only this client)
  const [selfData, setSelfData] = useState([]);
  // State for global/broadcast numbers (all clients)
  const [globalData, setGlobalData] = useState([]);

  // Register event listeners only after socket is defined.
  useEffect(() => {
    if (!socket) return; // Wait until socket is created

    // Listener for numbers sent only to this client.
    socket.on("random_number", (data) => {
      console.log("Received self number:", data.number);
      setSelfData((prevData) => {
        const newData = [...prevData, data.number];
        if (newData.length > 100) newData.shift(); // Keep only the latest 100 values
        return newData;
      });
    });

    // Listener for broadcasted numbers sent to all clients.
    socket.on("global_random_number", (data) => {
      console.log(
        `Received global number from Client ${data.clientID}:`,
        data.number
      );
      setGlobalData((prevData) => {
        const newData = [...prevData, data.number];
        if (newData.length > 100) newData.shift();
        return newData;
      });
    });

    // Cleanup the event listeners when socket changes or component unmounts.
    return () => {
      socket.off("random_number");
      socket.off("global_random_number");
    };
  }, [socket]);

  // Functions to trigger Socket.IO events.
  const sendSelfMessage = () => {
    if (socket) socket.emit("client_message", { message: "start" });
  };

  const sendGlobalMessage = () => {
    if (socket) socket.emit("client_message_all", { message: "broadcast" });
  };

  // Prepare chart data for self numbers
  const selfChartData = {
    labels: selfData.map((_, index) => index + 1),
    datasets: [
      {
        label: "Self Numbers",
        data: selfData,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  // Prepare chart data for global numbers
  const globalChartData = {
    labels: globalData.map((_, index) => index + 1),
    datasets: [
      {
        label: "Global Numbers",
        data: globalData,
        fill: false,
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        title: { display: true, text: "Data Point" },
      },
      y: {
        title: { display: true, text: "Value" },
        beginAtZero: true,
      },
    },
  };

  return (
    // <div style={{ padding: "1rem" }}>
    <div className={styles.container}>
      <h1>Real-time Charts</h1>
      <div style={{ marginBottom: "1rem" }}>
        <ButtonSelfNumbers onClick={sendSelfMessage} />
        <ButtonGlobalNumbers onClick={sendGlobalMessage} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <RealTimeChart
          title="Self Numbers Chart"
          data={selfChartData}
          options={chartOptions}
          width={600}
          height={300}
        />
        <RealTimeChart
          title="Global Numbers Chart"
          data={globalChartData}
          options={chartOptions}
          width={600}
          height={300}
        />
      </div>
    </div>
  );
}

export default App;