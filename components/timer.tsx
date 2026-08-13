"use client";

import React, { useState, useEffect } from "react";

import "@/styles/timer.css";

import {
  getActiveRegistrationDeadline,
  getRegistrationPhase,
  REGISTRATION_START_DATE
} from "@/config/deadline";

export const Timer = ({
  registrationStartDate = REGISTRATION_START_DATE,
  variant = "default",
  flushTop = false
}: {
  registrationStartDate?: string;
  variant?: "default" | "classic";
  flushTop?: boolean;
}) => {

  const [days, setDays] = useState(0);

  const [hours, setHours] = useState(0);

  const [minutes, setMinutes] = useState(0);

  const [seconds, setSeconds] = useState(0);

  const [timerTitle, setTimerTitle] = useState("Registration Ends In");

  const getTime = () => {

    const phase = getRegistrationPhase(new Date(), registrationStartDate);
    const isWaitingToStart = phase === "not_started";
    const deadline = isWaitingToStart
      ? registrationStartDate
      : getActiveRegistrationDeadline(new Date(), registrationStartDate);

    setTimerTitle(
      isWaitingToStart
        ? "Registration Starts In"
        : "Registration Ends In"
    );

    const time =
      deadline ? Date.parse(deadline) - Date.now() : 0;

    // STOP TIMER
    if (time <= 0) {

      setDays(0);

      setHours(0);

      setMinutes(0);

      setSeconds(0);

      return;
    }

    // DAYS
    setDays(
      Math.floor(
        time / (1000 * 60 * 60 * 24)
      )
    );

    // HOURS
    setHours(
      Math.floor(
        (time / (1000 * 60 * 60)) % 24
      )
    );

    // MINUTES
    setMinutes(
      Math.floor(
        (time / 1000 / 60) % 60
      )
    );

    // SECONDS
    setSeconds(
      Math.floor(
        (time / 1000) % 60
      )
    );
  };

  useEffect(() => {

    // INITIAL LOAD
    getTime();

    // UPDATE EVERY SECOND
    const interval =
      setInterval(getTime, 1000);

    // CLEAR INTERVAL
    return () =>
      clearInterval(interval);

  }, [registrationStartDate]);

  return (

    <div
      className={`timer ${variant === "classic" ? "timer-classic" : "timer-default border border-rose-600 rounded"} ${flushTop ? "timer-flush-top" : ""}`}
      role="timer"
    >

      {variant === "classic" && (
        <>
          <span className="timer-corner timer-corner-tl" aria-hidden="true" />
          <span className="timer-corner timer-corner-tr" aria-hidden="true" />
          <span className="timer-corner timer-corner-bl" aria-hidden="true" />
          <span className="timer-corner timer-corner-br" aria-hidden="true" />
        </>
      )}

      {/* TITLE */}
      <h1 className="timer-title text-center font-bold text-lg">

        {timerTitle}

      </h1>

      {/* DAYS */}
      <div className="col-4">

        <div className="box">

          <p>

            {days < 10 ? "0" + days : days}

          </p>

          <span className="text">

            Days

          </span>

        </div>

      </div>

      {/* HOURS */}
      <div className="col-4">

        <div className="box">

          <p>

            {hours < 10 ? "0" + hours : hours}

          </p>

          <span className="text">

            Hours

          </span>

        </div>

      </div>

      {/* MINUTES */}
      <div className="col-4">

        <div className="box">

          <p>

            {minutes < 10 ? "0" + minutes : minutes}

          </p>

          <span className="text">

            Minutes

          </span>

        </div>

      </div>

      {/* SECONDS */}
      <div className="col-4">

        <div className="box">

          <p>

            {seconds < 10 ? "0" + seconds : seconds}

          </p>

          <span className="text">

            Seconds

          </span>

        </div>

      </div>

    </div>
  );
};
