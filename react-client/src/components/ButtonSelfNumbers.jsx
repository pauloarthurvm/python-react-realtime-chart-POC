// src/components/ButtonSelfNumbers.jsx
import React from "react";

const ButtonSelfNumbers = ({ onClick }) => {
  return (
    <button onClick={onClick} style={{ margin: "1rem" }}>
      Start Self Numbers
    </button>
  );
};

export default ButtonSelfNumbers;
