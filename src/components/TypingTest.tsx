"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { paragraphs } from "@/data/paragraphs";
import { useSocket } from "@/hooks/useSocket";

function pickParagraph() {
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

export default function TypingTest() {
  const { emitTypingStart, emitTypingUpdate, emitTypingEnd, emitTypingReset } =
    useSocket("PC");

  const [text, setText] = useState("");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setText(pickParagraph());
  }, []);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const correct = typed.split("").filter((c, i) => c === text[i]).length;
  const accuracy =
    typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
  const progress = Math.round((typed.length / text.length) * 100);

  function calcWpm(elapsedSec: number) {
    if (elapsedSec <= 0) return 0;
    return Math.round((typed.length / 5) / (elapsedSec / 60));
  }

  const endTest = useCallback(() => {
    if (!running) return;
    setRunning(false);
    setFinished(true);
    const now = Date.now();
    setEndTime(now);
    const elapsed = (now - startTime) / 1000;
    const wpm = calcWpm(elapsed);
    if (intervalRef.current) clearInterval(intervalRef.current);
    emitTypingEnd({ elapsed, wpm, accuracy, progress: 100 });
  }, [running, startTime, typed, accuracy, progress, emitTypingEnd]);

  useEffect(() => {
    if (timeLeft <= 0 && running) {
      endTest();
    }
  }, [timeLeft, running, endTest]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (finished) return;

    if (!running) {
      setRunning(true);
      setStartTime(Date.now());
      setTimeLeft(60);
      emitTypingStart();

      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) return 0;
          return t - 1;
        });
      }, 1000);
    }

    setTyped(val);

    const newCorrect = val.split("").filter((c, i) => c === text[i]).length;
    const newWrong = val.length - newCorrect;
    setCorrectCount(newCorrect);
    setWrongCount(newWrong);

    const elapsed = (Date.now() - startTime) / 1000;
    const wpm = calcWpm(elapsed);

    // Emit update every ~10 chars or every keystroke
    if (val.length % 5 === 0 || val.length === text.length) {
      emitTypingUpdate({
        elapsed,
        wpm,
        accuracy:
          val.length > 0
            ? Math.round((newCorrect / val.length) * 100)
            : 100,
        progress: Math.round((val.length / text.length) * 100),
      });
    }

    if (val.length >= text.length) {
      endTest();
    }
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTyped("");
    setStartTime(0);
    setEndTime(0);
    setFinished(false);
    setTimeLeft(60);
    setRunning(false);
    setCorrectCount(0);
    setWrongCount(0);
    emitTypingReset();
    inputRef.current?.focus();
  }

  const elapsedSec =
    finished
      ? (endTime - startTime) / 1000
      : running
        ? (Date.now() - startTime) / 1000
        : 0;
  const wpm = finished ? calcWpm(elapsedSec) : running ? calcWpm(elapsedSec) : 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!text) return <div className="mx-auto max-w-3xl text-subtext0">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between text-sm">
        <div className="flex gap-6">
          <div>
            <span className="text-overlay0">WPM </span>
            <span className="text-2xl font-bold tabular-nums">{wpm}</span>
          </div>
          <div>
            <span className="text-overlay0">Accuracy </span>
            <span className="text-2xl font-bold tabular-nums">{accuracy}%</span>
          </div>
          <div>
            <span className="text-overlay0">Time </span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                timeLeft <= 10 ? "text-red" : ""
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        </div>
        <div>
          <span className="text-overlay0">Progress </span>
          <span className="text-2xl font-bold tabular-nums">{progress}%</span>
        </div>
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface1">
        <div
          className="h-full rounded-full bg-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="mb-6 cursor-text rounded-lg border border-surface1 p-6 text-lg leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {text.split("").map((char, i) => {
          let cls = "text-subtext0";
          if (i < typed.length) {
            cls = typed[i] === char ? "text-green" : "text-red bg-surface0";
          }
          if (i === typed.length) {
            cls += " border-l-2 border-yellow-400 animate-pulse";
          }
          return (
            <span key={i} className={cls}>
              {char}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        className="absolute left-[-9999px]"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <div className="flex items-center justify-between text-sm text-overlay0">
        <span>
          Correct: <span className="text-green">{correctCount}</span> |
          Wrong: <span className="text-red">{wrongCount}</span>
        </span>
        <button
          onClick={handleReset}
          className="rounded border border-surface1 px-4 py-2 hover:bg-surface1"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
