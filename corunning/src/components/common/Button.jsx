// Button.jsx
import React from "react";
import "./Button.css";

function Button({
  children,
  type = "button",
  size = "cta",        // large | cta | small
  variant = "primary", // primary | secondary | ghost
  className = "",
  onClick,
  style
}) {
  return (
    <button
      type={type}
      className={`btn btn-${size} btn-${variant} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

export default Button;
