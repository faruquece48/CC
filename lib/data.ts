import React from "react";

import { CgWorkAlt } from "react-icons/cg";

import {
  FaReact,
  FaTools,
  FaCalendarAlt,
} from "react-icons/fa";

import { LuGraduationCap } from "react-icons/lu";

export const timelineData = [
  {
    title: "Message From Head",

    // videoLink: "https://www.youtube.com/embed/hBKRd4PfOwc",

    description:
      "Welcome to the Department of Building Engineering & Construction Management (BECM). As a developing and over-populated country, Bangladesh often lacks importance in construction safety, proper construction management...",

    icon: React.createElement(LuGraduationCap),

    details: "/message-from-head",
  },

  {
    title: "About BECM",

    videoLink: "",

    description:
      "Building Engineering & Construction Management (BECM) under the Faculty of Civil Engineering started journey as a new department with 30 students in 2016 at Rajshahi University of Engineering & Technology (RUET)...",

    icon: React.createElement(CgWorkAlt),

    details: "/about-becm",
  },

  {
    title: "About Construct Carnival",

    videoLink: "",

    description:
      "The Construct Carnival stands as a beacon of innovation and excellence, orchestrated by the esteemed Department of Building Engineering and Construction Management (BECM) at RUET...",

    icon: React.createElement(FaReact),

    details: "/about",
  },

  {
    title: "Workshop Highlights",

    videoLink: "",

    description:
      "Explore hands-on workshops, technical learning sessions, industry expert talks and practical training opportunities designed to enhance engineering and management skills...",

    icon: React.createElement(FaTools),

    details: "/workshop-highlights",
  },

  {
    title: "Events Experience",

    videoLink: "",

    description:
      "Experience exciting competitions, networking opportunities, cultural moments and unforgettable memories from Construct Carnival events and activities...",

    icon: React.createElement(FaCalendarAlt),

    details: "/events-experience",
  },
] as const;