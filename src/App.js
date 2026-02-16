import React, { useState } from "react";
import Landing from "./Landing";
import MyCalendar from "./Components/Calendar";

export default function App() {
  const [session, setSession] = useState(null);

  return session
    ? <MyCalendar session={session} setSession={setSession} />
    : <Landing setSession={setSession} />;
}
