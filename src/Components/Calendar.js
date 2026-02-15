import React, {useState,useEffect} from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import Mantra from "../Assets/Mantra.mp3";
import ram from "../Assets/ram.png";
import Mantram from "../Assets/Mantram.jpeg";

const numbers = [1,2,3,4,5,6,7,8,9];

export default function MyCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [playedNumbers, setPlayedNumbers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [completedDates, setCompletedDates] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingDate, setProcessingDate] = useState(null);   

  const start = new Date(2026, 1, 14); // Feb 14
  const end = new Date(2026, 2, 1);    // Mar 1
  const today = new Date();

  useEffect(() => {
    const saved = localStorage.getItem("completedDates");
    if (saved) setCompletedDates(JSON.parse(saved));
  }, []);

  const isInRange = (date) => date >= start && date <= end;

  const isToday = (date) =>
    date.toDateString() === today.toDateString();

  const handleDateClick = async (date) => {
    if (!isToday(date) || !isInRange(date)) return;
    const d = date.toDateString();
    
    if (processingDate === d) return;
    setProcessingDate(d);
    setSelectedDate(date);
    setPlayedNumbers([]);
    setShowPopup(false);

    await playNineTimes(date);
  };

  const playNineTimes = async (date) => {
  setIsPlaying(true);
  for (let i = 1; i <= 9; i++) {
    await playAudio(i);
    setPlayedNumbers((prev) => [...prev, i]);
  }
    setIsPlaying(false);

  // Small delay to ensure UI updates
  setTimeout(() => {
    // setShowPopup(true);
    // setCompletedDates((prev) => [...prev, date.toDateString()]);
    // setProcessingDate(null);
    const dateStr = date.toDateString();

  let updated = completedDates;

  if (!completedDates.includes(dateStr)) {
    updated = [...completedDates, dateStr];
  }

  setCompletedDates(updated);
  localStorage.setItem("completedDates", JSON.stringify(updated));

  setShowPopup(true);
  setProcessingDate(null);
  }, 300);
};

// Plays the mantra audio and returns a promise that resolves when it ends or fails
const playAudio = (index) => {
  return new Promise((resolve) => {
    const audio = new Audio(Mantra);

    audio.onended = () => {
      resolve();
    };

    audio.onerror = () => {
      console.log("Audio failed at count:", index);
      resolve(); // still continue loop
    };

    audio.play().catch(() => resolve());
  });
};

  return(
    <div className="container">
        <div className="calendar-card">
        <Calendar
        value={selectedDate}
        onClickDay={handleDateClick}
         showNeighboringMonth={false}
        tileClassName={({ date }) => {
          const d = date.toDateString();

          if (!isInRange(date)) return "disabled-date";
          if (completedDates.includes(d)) return "completed-date";
          if (processingDate === d) return "processing-date";
          //if (isToday(date)) return "active-range";

          return "active-range";
        }}
        tileDisabled={({ date }) => {
            const d = date.toDateString();
            return (
              !isInRange(date) ||               // outside Feb14–Mar1
              completedDates.includes(d) ||     // already completed
              processingDate === d ||           // currently playing
              !isToday(date)                // not today
            );
          }}
        />
        </div>
        
      {selectedDate && (
        <div className="chant-section">
            <div className="numbers-box">
                {numbers.map((num) => (
                <div
                    key={num}
                    className={playedNumbers.includes(num) ? "num played" : "num"}
                >
                    {num}
                </div>
                ))}
            </div>

            {isPlaying && (
                <div className="mantra-image">
                <img src={Mantram} alt="Mantra" />
                </div>
            )}
            </div>

                )}
          {showPopup && (
        <div className="popup">
            <div className="popup-content">
            <img src={ram} alt="Completed" />
            <h3>Completed</h3>
            <button
            onClick={() => {
                setShowPopup(false);
                setPlayedNumbers([]);   // RESET NUMBERS
                setSelectedDate(null);  // REMOVE ACTIVE SELECTION
            }}
            >
            Close
            </button>
            </div>
  </div>
)}
  </div>
  );
}