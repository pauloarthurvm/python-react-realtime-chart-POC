// src/components/ButtonGlobalNumbers.jsx
import React from "react";

const ButtonGlobalNumbers = ({ onClick }) => {
  return (
    <button onClick={onClick} style={{ margin: "1rem" }}>
      Start Global Numbers
    </button>
  );
};

export default ButtonGlobalNumbers;
