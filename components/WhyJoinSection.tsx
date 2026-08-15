"use client";

import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  UsersRound,
} from "lucide-react";

import styles from "./WhyJoinSection.module.css";

const features = [
  {
    number: "01",
    title: "Skill Development",
    description:
      "Enhance your technical, creative, and leadership skills through real challenges.",
    icon: GraduationCap,
    theme: "forest",
  },
  {
    number: "02",
    title: "Team Competition",
    description:
      "Collaborate, innovate, and compete with passionate peers across the country.",
    icon: UsersRound,
    theme: "blue",
  },
  {
    number: "03",
    title: "Industry Exposure",
    description:
      "Interact with experts, mentors, and explore real-world insights.",
    icon: BriefcaseBusiness,
    theme: "olive",
  },
  {
    number: "04",
    title: "Certificates & Recognition",
    description:
      "Earn certificates, win exciting prizes, and get recognized for your achievements.",
    icon: Award,
    theme: "plum",
  },
] as const;

export default function WhyJoinSection() {
  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.heading}>
          <div className={styles.eyebrow}>
            <span className={styles.smallLine} />
            <span className={styles.dot} />
            <span className={styles.eyebrowText}>Why Join</span>
            <span className={styles.dot} />
            <span className={styles.smallLine} />
          </div>

          <h2 className={styles.title}>
            Construct <span>Carnival 2.0?</span>
          </h2>

          <div className={styles.taglineRow}>
            <span className={styles.tagLine} />
            <span className={styles.tagDot} />
            <p>
              Learn <span className={styles.wordDiamond} /> Compete{" "}
              <span className={styles.wordDiamond} /> Network{" "}
              <span className={styles.wordDiamond} /> Grow
            </p>
            <span className={styles.tagDot} />
            <span className={styles.tagLine} />
          </div>
        </div>

        <div className={styles.cardGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.number}
                className={`${styles.card} ${styles[feature.theme]}`}
              >
                <div className={styles.cornerNumber}>{feature.number}</div>
                <div className={styles.iconOuter}>
                  <div className={styles.iconCircle}>
                    <Icon size={54} strokeWidth={1.8} />
                  </div>
                </div>
                <h3>{feature.title}</h3>
                <span className={styles.titleUnderline} />
                <p>{feature.description}</p>
                <div className={styles.bottomAccent} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
