import React, { useState } from "react";
import { generateSessionId, addDays } from "./utils";
import "./Components/Landing.css";

export default function Landing({ setSession }) {

  const [generatedSession, setGeneratedSession] = useState(null);
  const [enteredId, setEnteredId] = useState("");

  // ---------- GENERATE ID ----------
  const handleGenerate = () => {
    const id = generateSessionId();
    const expiry = addDays(new Date(), 16);

    const sessionObj = {
      id,
      expiry,
      rangeStart: null,
      rangeEnd: null,
      completedDates: []
    };

    localStorage.setItem("hanumanSession", JSON.stringify(sessionObj));

    setGeneratedSession(sessionObj);
  };

  // ---------- CONTINUE AFTER GENERATE ----------
  const handleContinue = () => {
    setSession(generatedSession);
  };

  // ---------- ENTER ID ----------
  const handleSubmitId = () => {
    const saved = JSON.parse(localStorage.getItem("hanumanSession"));

    if (saved && saved.id === enteredId.trim()) {
      setSession(saved);
    } else {
      alert("Invalid ID");
    }
  };

  return (
    <div className="container">
      <div className="landing-card">

        <h2>Om Namo Hanumathey Namaha</h2>

        {/* GENERATE SECTION */}
        {!generatedSession && (
          <>
          <h4>No ID?</h4>
            <button className="landing-btn landing-btn-primary" onClick={handleGenerate}>
              Generate Here
            </button>

            <hr style={{margin:"20px 0"}} />

            <h4>Enter Existing ID</h4>

            <input className="landing-input"
              type="text"
              placeholder="Enter Session ID"
              value={enteredId}
              onChange={(e) => setEnteredId(e.target.value)}
              style={{
                padding: "8px",
                width: "200px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            />
            <br/><br/>
            <button className="landing-btn landing-btn-primary"  onClick={handleSubmitId}>
              Submit
            </button>
          </>
        )}

        {/* SHOW GENERATED ID */}
        {generatedSession && (
          <>
            <h4>Your Session ID:</h4>
            <h2 className="session-id" style={{color:"red"}}>
              {generatedSession.id}
            </h2>

            <button className="landing-btn landing-btn-secondary" onClick={handleContinue}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
