import React, { useState } from "react";
import "./Components/Landing.css";

const API_BASE = "https://hanumanchantsapi.azurewebsites.net/api/session";
//const API_BASE = "https://localhost:7137/api/session";

export default function Landing({ setSession }) {

  const [generatedSession, setGeneratedSession] = useState(null);
  const [enteredId, setEnteredId] = useState("");
  const [serverDown, setServerDown] = useState(false);

  // ---------- GENERATE ID ----------
  const handleGenerate = async () => {
  try {
    const res = await fetch(`${API_BASE}`, {
      method: "POST"
    });

    if (!res.ok) throw new Error();

    const session = await res.json();
    setGeneratedSession({
  id: session.rowKey,
  expiry: session.expiry
});

  } catch {
    setServerDown(true);
  }
};



  // ---------- CONTINUE AFTER GENERATE ----------
  const handleContinue = () => {
  setSession({
    id: generatedSession.rowKey,
    expiry: generatedSession.expiry
  });
};

  // ---------- ENTER ID ----------
  const handleSubmitId = async () => {
  try {
    const res = await fetch(
      `${API_BASE}/${enteredId}`
    );

    if (!res.ok) throw new Error();

    const session = await res.json();
    setSession({
  id: session.rowKey,
  expiry: session.expiry
});

  } catch {
    setServerDown(true);
  }
};



  return (
    <div className="container">
      {serverDown ? (
      <div className="server-popup">
        <div className="server-popup-content">
          <h2>Server Unavailable</h2>
          <p>Please try again later.</p>

          <button className="landing-btn landing-btn-primary" 
          onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    ) : (
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
              {generatedSession.rowKey}
            </h2>

            <button className="landing-btn landing-btn-secondary" onClick={handleContinue}>
              Continue
            </button>
          </>
        )}
      </div>
    )}
    </div>
  );
}
