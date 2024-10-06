import React from "react";
import "./ErrorMessage.css";

type Props = {
  error: string;
};

export default function ErrorMessage({ error }: Props) {
  return (
    <div className="error">
      <i className="icon exclamation"></i>
      {error}
    </div>
  );
}
