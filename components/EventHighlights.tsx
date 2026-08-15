"use client";

import {
  BookOpenCheck,
  CalendarDays,
  Presentation,
  Trophy,
  UsersRound,
} from "lucide-react";

import styles from "./EventHighlights.module.css";

const highlights = [
  { title: "5+ Events", icon: Trophy },
  { title: "2-Day Festival", icon: CalendarDays },
  { title: "Expert Workshops", icon: Presentation },
  { title: "Skill Development", icon: BookOpenCheck },
  { title: "National Networking Opportunity", icon: UsersRound },
];

export default function EventHighlights() {
  return (
    <div className={styles.highlights}>
      <h3 className={styles.title}>Event Highlights</h3>

      <div className={styles.list}>
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <div className={styles.item} key={item.title}>
              <div className={styles.iconOuter}>
                <div className={styles.iconCircle}>
                  <Icon size={23} strokeWidth={1.9} className={styles.icon} />
                </div>
              </div>
              <span className={styles.itemTitle}>{item.title}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.decoration} aria-hidden="true">
        <span className={styles.node1} />
        <span className={styles.node2} />
        <span className={styles.node3} />
        <span className={styles.line1} />
        <span className={styles.line2} />
        <span className={styles.line3} />
      </div>
    </div>
  );
}
