import React, { useState, useEffect, useRef,useCallback } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import Mantra from "../Assets/Mantra.mp3";
import ram from "../Assets/ram.png";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";

import Mantram_TE from "../Assets/Mantram_TE.jpeg";
import Mantram_EN from "../Assets/Mantram_EN.jpeg";
import Mantram_HN from "../Assets/Mantram_HN.jpeg";
import Mantram_TN from "../Assets/Mantram_TN.jpeg";
import Mantram_KN from "../Assets/Mantram_KN.jpeg";
import Mantram_ML from "../Assets/Mantram_ML.jpeg";
import Mantram_GJ from "../Assets/Mantram_GJ.jpeg";

const API_BASE = "https://hanumanchantsapi.azurewebsites.net/api/session";
//const API_BASE = "https://localhost:7137/api/session";


const numbers = [1,2,3,4,5,6,7,8,9];

const mantraImages = {
  English: Mantram_EN,
  Telugu: Mantram_TE,
  Hindi: Mantram_HN,
  Tamil: Mantram_TN,
  Kannada: Mantram_KN,
  Malayalam: Mantram_ML,
  Gujarati: Mantram_GJ
};



export default function MyCalendar({ session, setSession }) {

  const [selectedDate, setSelectedDate] = useState(null);
  const [playedNumbers, setPlayedNumbers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [completedDates, setCompletedDates] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingDate, setProcessingDate] = useState(null);
  const [language, setLanguage] = useState("");
  const effectiveLanguage = language || "English";
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [serverDown, setServerDown] = useState(false);

  const audioRef = useRef(new Audio(Mantra));
  const today = useRef(new Date()).current;
  
  /* ---------- SERVER LOAD ---------- */
    const loadSessionFromServer = async () => {
      if (!session?.id) return;
  
      try {
        const res = await fetch(`${API_BASE}/${session.id}`);
        if (!res.ok) throw new Error("Server Unreachable");
  
        const data = await res.json();
        setServerDown(false);
  
        if (data.completedDates && data.completedDates.trim() !== "") {
        setCompletedDates(data.completedDates.split(","));
        } else {
          setCompletedDates([]);
        }
  
        if (data.rangeStart && data.rangeEnd) {
        setRangeStart(new Date(data.rangeStart));
        setRangeEnd(new Date(data.rangeEnd));
        setRangeMode(true);
      }
      } catch (err) {
        console.error("Server error:", err);
        setServerDown(true);
      }
    };
  
    useEffect(() => {
      loadSessionFromServer();
    }, [session]);
  
    /* ---------- SERVER SAVE ---------- */
    const saveSessionToServer = async (updatedDates) => {
      if (!session?.id) return;
  
      try {
      const res = await fetch(`${API_BASE}/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedDates: updatedDates.join(","),
          rangeStart,
          rangeEnd
        })
    });

    if (!res.ok) throw new Error("Save failed");

    setServerDown(false);
  } catch (err) {
    setServerDown(true);
  }
    };

  /* ---------------- AUDIO VOLUME ---------------- */
  const toggleMute = () => {
    if (isMuted || volume === 0) {
      // unmute
      setIsMuted(false);
      setVolume(0.5); // restore mid volume
    } else {
      // mute
      setIsMuted(true);
      setVolume(0);
    }
  };

  useEffect(() => {
  if (volume === 0) {
    setIsMuted(true);
    audioRef.current.volume = 0;
  } else {
    setIsMuted(false);
    audioRef.current.volume = volume;
  }
}, [volume]);

  /* ---------------- DATE HELPERS ---------------- */
  const normalizeDate = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dateKey = useCallback((d) => {
    const n = normalizeDate(d);
    return `${n.getFullYear()}-${n.getMonth()+1}-${n.getDate()}`;
  }, []);

  const isTodayCompleted = completedDates.includes(dateKey(today));

  const isTodayDate = (date) =>
    normalizeDate(date).getTime() === normalizeDate(today).getTime();

  const isPastDate = (date) =>
    normalizeDate(date) < normalizeDate(today);

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const isWithinSelectedRange = (date) => {
    if (!rangeStart || !rangeEnd) return false;

    const d = normalizeDate(date).getTime();
    const s = normalizeDate(rangeStart).getTime();
    const e = normalizeDate(rangeEnd).getTime();

    return d >= s && d <= e;
  };

  /* ---- AUTO MARK PAST RANGE DATES RED ---- */
  useEffect(() => {
  if (!rangeStart || !rangeEnd) return;

  let changed = false;
  const updated = [...completedDates];
  let d = new Date(rangeStart);

  while (normalizeDate(d) < normalizeDate(today)) {
    const key = dateKey(d);
    if (!updated.includes(key)) {
      updated.push(key);
      changed = true;   // mark change
    }
    d.setDate(d.getDate() + 1);
  }

  if (changed) {
    setCompletedDates(updated);
  }

}, [rangeStart, rangeEnd, completedDates, dateKey, today]);



  /* ---------------- DATE CLICK ---------------- */
  const handleDateClick = async (date) => {

    if (!rangeMode) return;

    // RANGE SELECTION MODE
    if (!rangeStart) {
      if (isPastDate(date)) return;

      const start = new Date(date);
      const end = addDays(start, 15);

      setRangeStart(start);
      setRangeEnd(end);
      
      return;
    }

    // DAILY MODE → ONLY TODAY
    if (!isTodayDate(date)) return;

    const d = dateKey(date);
    if (processingDate === d) return;

    setProcessingDate(d);
    setSelectedDate(date);
    setPlayedNumbers([]);
    setShowPopup(false);

    await playNineTimes(date);
  };

  /* ---------------- PLAY 9 TIMES ---------------- */
  const playNineTimes = async (date) => {
    setIsPlaying(true);

    for (let i = 1; i <= 9; i++) {
      await playAudio();
      setPlayedNumbers(prev => [...prev, i]);
    }

    setIsPlaying(false);

    const key = dateKey(date);
    let updated = completedDates;

    if (!completedDates.includes(key))
      updated = [...completedDates, key];

    setCompletedDates(updated);
    

    setShowPopup(true);
  };

  /* ---------------- AUDIO ---------------- */
  const playAudio = () => {
    return new Promise(resolve => {
      const audio = audioRef.current;
      audio.currentTime = 0;
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
    });
  };

  /* ---------------- UI ---------------- */
  return (
    
    <div className="container">
      {serverDown && (
        <div className="server-banner">
          Server Unavailable. Please try again later.
        </div>
      )}
      <div className="global-controls">
        <div className="lang-dropdown">
          <div className="lang-selected" onClick={() => setLangOpen(!langOpen)}>
          {language || "Select Language"}
          </div>

          {langOpen && (
            <div className="lang-options">
              {["English","Telugu","Hindi","Tamil","Kannada","Malayalam","Gujarati"]
                .map(lang => (
                  <div key={lang}
                    className="lang-option"
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                  >
                    {lang}
                  </div>
              ))}
            </div>
          )}
      </div>

      <div className="volume-controls">
          {isMuted || volume === 0 ? (
          <FaVolumeMute className="speaker-icon" onClick={toggleMute}/>
          ) :  (
            <FaVolumeUp className="speaker-icon" onClick={toggleMute}/>
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
          }}
            className="volume-slider"
          />
      </div>
    </div>

    <div className="calendar-card">
        <Calendar
          value={selectedDate}
          onClickDay={handleDateClick}
          showNeighboringMonth={false}

          tileClassName={({ date }) => {
            const d = dateKey(date);

            if (completedDates.includes(d))
              return "completed-date";

            if (processingDate === d)
              return "processing-date";

            if (rangeMode && rangeStart && rangeEnd && isWithinSelectedRange(date))
              return "range-selected";

            return "";
          }}

          tileDisabled={({ date }) => {
            const d = dateKey(date);

            // 1. DEFAULT PAGE LOAD → DISABLE ALL
            if (!rangeMode) return true;

            // 2. RANGE MODE BUT START NOT PICKED → ONLY FUTURE ENABLED
            if (rangeMode && !rangeStart) {
              return isPastDate(date); // disables past
            }

            // 3. RANGE ACTIVE → DISABLE OUTSIDE RANGE
            if (rangeStart && rangeEnd && !isWithinSelectedRange(date))
              return true;

            // 4. CHANTING CONDITIONS
            return (
              completedDates.includes(d) ||
              processingDate === d
            );
          }}
        />

        {/* Date Range Links */}
        <div className="range-links">
          {!isPlaying && !showPopup && !isTodayCompleted &&(
          <span onClick={() => {
            setRangeMode(true);
            setRangeStart(null);
            setRangeEnd(null);
          }}>
            Time Period
          </span>
          )}

          {!isPlaying && !showPopup && !isTodayCompleted &&(
          <span onClick={() => {
            setRangeMode(false);
            setRangeStart(null);
            setRangeEnd(null);
          }}>
            Clear
          </span>
        )}
        </div>
      </div>

      {/* Numbers */}
      {selectedDate && (
        <div className="chant-section">
          <div className="numbers-box">
            {numbers.map(num => (
              <div key={num}
                className={playedNumbers.includes(num) ? "num played" : "num"}>
                {num}
              </div>
            ))}
          </div>

          {isPlaying && (
            <div className="mantra-image">
              <img src={mantraImages[effectiveLanguage]} alt="Mantra"/>
            </div>
          )}
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <img src={ram} alt="Completed"/>
            <h3>Completed</h3>
            <button onClick={async ()=>{
              await saveSessionToServer(completedDates);

              setShowPopup(false);
              setPlayedNumbers([]);
              setSelectedDate(null);
            }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}