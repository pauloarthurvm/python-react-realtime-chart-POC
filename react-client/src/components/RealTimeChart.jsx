import React from "react";
import { Line } from "react-chartjs-2";

const RealTimeChart = ({ title, data, options, width, height }) => {
  return (
    <div>
      <h2>{title}</h2>
      <Line data={data} options={options} width={width} height={height} />
    </div>
  );
};

export default RealTimeChart;