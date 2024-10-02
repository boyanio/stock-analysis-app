import React, { useState } from "react";
import { useAuth } from "./hooks/auth";
import ErrorMessage from "./ErrorMessage";

export default function LogIn() {
  const [error, setError] = useState("");
  const { updateToken } = useAuth();

  async function handleLogInClick() {
    const response = await fetch("/api/auth", {
      method: "POST",
    });
    if (!response.ok) {
      setError("Cannot authenticate. Please, try again shortly.");
      return;
    }

    const body = (await response.json()) as { token: string };
    setError("");
    updateToken(body.token);
  }

  return (
    <>
      <h2>Analyze the best time to buy & sell</h2>

      <button type="button" onClick={handleLogInClick}>
        Log In
      </button>

      {error && <ErrorMessage error={error} />}
    </>
  );
}
