"use client";

import React, { useState, useEffect } from "react";

import "@/styles/timer.css";

import { REGISTRATION_DEADLINE } from "@/config/deadline";

export const Timer = () => {

  const [days, setDays] = useState(0);

  const [hours, setHours] = useState(0);

  const [minutes, setMinutes] = useState(0);

  const [seconds, setSeconds] = useState(0);

  const deadline = REGISTRATION_DEADLINE;

  const getTime = () => {

    const time =
      Date.parse(deadline) - Date.now();

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

  }, []);

  return (

    <div
      className="timer border border-rose-600 rounded -mx-4 my-2 lg:m-10"
      role="timer"
    >

      {/* TITLE */}
      <h1 className="text-center font-bold text-lg">

        Registration Ends In

      </h1>

      {/* DAYS */}
      <div className="col-4">

        <div className="box">

          <p id="day">

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

          <p id="hour">

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

          <p id="minute">

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

          <p id="second">

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