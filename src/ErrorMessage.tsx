import React from "react";
import "./ErrorMessage.css";

type ErrorMessageProps = {
  error: string;
};

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div className="error">
      <i className="icon exclamation"></i>
      {error}
    </div>
  );
}
