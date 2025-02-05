import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register all Chart.js components
Chart.register(...registerables);

// Connect to the Flask-SocketIO server
const socket = io("http://localhost:5000");

function App() {
  // States for storing the data points for each chart
  const [selfData, setSelfData] = useState([]);
  const [globalData, setGlobalData] = useState([]);

  useEffect(() => {
    // Listener for numbers sent only to this client
    socket.on("random_number", (data) => {
      console.log("Received self number:", data.number);
      setSelfData((prevData) => {
        const newData = [...prevData, data.number];
        // Keep only the latest 50 points
        if (newData.length > 50) newData.shift();
        return newData;
      });
    });

    // Listener for broadcasted numbers sent to all clients
    socket.on("global_random_number", (data) => {
      console.log(
        `Received broadcast: Client ${data.clientID} sent number ${data.number}`
      );
      setGlobalData((prevData) => {
        const newData = [...prevData, data.number];
        if (newData.length > 50) newData.shift();
        return newData;
      });
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("random_number");
      socket.off("global_random_number");
    };
  }, []);

  // Function to trigger sending numbers only to the current client
  const sendSelfMessage = () => {
    socket.emit("client_message", { message: "start" });
  };

  // Function to trigger broadcasting numbers to all clients
  const sendGlobalMessage = () => {
    socket.emit("client_message_all", { message: "broadcast" });
  };

  // Prepare chart data for the self client numbers chart
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

  // Prepare chart data for the global (broadcast) numbers chart
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

  // Chart options (fixed width/height and no animation for immediate updates)
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
    <div style={{ padding: "1rem" }}>
      <h1>Real-time Charts</h1>
      <div>
        <button onClick={sendSelfMessage} style={{ marginRight: "1rem" }}>
          Start Self Numbers
        </button>
        <button onClick={sendGlobalMessage}>Start Global Numbers</button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        <div>
          <h2>Self Numbers Chart</h2>
          <Line data={selfChartData} options={chartOptions} width={600} height={300} />
        </div>
        <div>
          <h2>Global Numbers Chart</h2>
          <Line data={globalChartData} options={chartOptions} width={600} height={300} />
        </div>
      </div>
    </div>
  );
}

export default App;
