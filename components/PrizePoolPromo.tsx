import Link from "next/link";
import { ArrowUpRight, Crown, Sparkles, Star, Trophy } from "lucide-react";

import styles from "./PrizePoolPromo.module.css";

const particles = [
  { left: "7%", top: "20%", delay: "0s", size: "4px" },
  { left: "17%", top: "72%", delay: "1.1s", size: "6px" },
  { left: "34%", top: "12%", delay: "2.2s", size: "3px" },
  { left: "67%", top: "18%", delay: ".7s", size: "5px" },
  { left: "81%", top: "74%", delay: "1.8s", size: "4px" },
  { left: "93%", top: "28%", delay: "2.8s", size: "6px" },
];

export default function PrizePoolPromo() {
  return (
    <section className={styles.stage} aria-label="Total prize pool promotion">
      <div className={styles.ambientGlow} />
      <div className={styles.frame}>
        <div className={styles.noise} />
        <div className={styles.grid} />
        <div className={styles.lightSweep} />

        {particles.map((particle, index) => (
          <i
            aria-hidden="true"
            className={styles.particle}
            key={index}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
            }}
          />
        ))}

        <div className={styles.cornerTopLeft} />
        <div className={styles.cornerBottomRight} />

        <div className={styles.ribbon}>
          <Star size={12} fill="currentColor" />
          <span>THE REWARD AWAITS</span>
          <Star size={12} fill="currentColor" />
        </div>

        <div className={styles.content}>
          <div className={styles.medallionWrap}>
            <div className={styles.orbit}>
              <Sparkles className={styles.orbitSpark} size={20} />
            </div>
            <div className={styles.medallion}>
              <div className={styles.medallionInner}>
                <Crown className={styles.crown} size={21} />
                <Trophy className={styles.trophy} size={57} strokeWidth={1.55} />
              </div>
            </div>
            <span className={styles.edition}>2.0</span>
          </div>

          <div className={styles.copy}>
            <div className={styles.eyebrow}>
              <span />
              <p>Construct Carnival presents</p>
              <span />
            </div>

            <p className={styles.prizeLabel}>TOTAL PRIZE POOL</p>

            <div className={styles.amountRow}>
              <span className={styles.amount}>100K</span>
              <span className={styles.plus}>+</span>
              <span className={styles.currency}>BDT</span>
            </div>

            <p className={styles.tagline}>
              Dream bigger. Build smarter. <strong>Win greater.</strong>
            </p>
          </div>

          <div className={styles.actionArea}>
            <span className={styles.badge}>Nationwide Competition</span>
            <Link className={styles.cta} href="/events">
              <span>Explore Events</span>
              <ArrowUpRight size={19} strokeWidth={2.4} />
            </Link>
            <p>Step into the arena and make your mark.</p>
          </div>
        </div>

        <div className={styles.bottomLine}>
          <span />
          <b>BUILD · COMPETE · CONQUER</b>
          <span />
        </div>
      </div>
    </section>
  );
}