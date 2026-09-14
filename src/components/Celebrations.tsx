import { useId } from "react";
import styles from "./Celebrations.module.css";

/** Decorative only: the medal's existing label remains its accessible name. */
export function GoldGleam() {
  return (
    <span aria-hidden="true" className={styles.goldGleam}>
      <span className={styles.goldSpark} />
      <span className={styles.goldSpark} />
      <span className={styles.goldSpark} />
    </span>
  );
}

export function StreakFlame() {
  const id = useId();

  return (
    <div aria-hidden="true" className={styles.fireStage}>
      <div className={styles.fireGlow} />
      <div className={styles.ignitionRing} />
      <div className={styles.fireFloor} />
      <div className={styles.embers}>
        {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
      </div>
      <svg className={styles.flame} fill="none" focusable="false" viewBox="0 0 240 260">
        <defs>
          <linearGradient id={`${id}-outer`} x1="120" y1="20" x2="120" y2="242" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffb134" />
            <stop offset="0.45" stopColor="#ff681f" />
            <stop offset="1" stopColor="#e73518" />
          </linearGradient>
          <linearGradient id={`${id}-inner`} x1="125" y1="70" x2="125" y2="243" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffe780" />
            <stop offset="0.55" stopColor="#ffb72c" />
            <stop offset="1" stopColor="#ff801b" />
          </linearGradient>
          <linearGradient id={`${id}-core`} x1="123" y1="133" x2="123" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffef0" />
            <stop offset="1" stopColor="#ffe58b" />
          </linearGradient>
        </defs>
        <path
          className={styles.outerFlame}
          fill={`url(#${id}-outer)`}
          d="M120 242C74 242 42 214 45 178C47 153 62 137 68 111C74 120 81 137 80 146C103 120 86 89 106 60C115 46 125 32 125 13C157 37 172 61 165 91C161 109 173 122 180 136C182 119 179 106 176 97C207 123 213 151 205 181C199 215 171 242 120 242Z"
        />
        <path
          className={styles.innerFlame}
          fill={`url(#${id}-inner)`}
          d="M122 240C90 241 68 220 69 192C70 175 81 164 88 151C88 168 94 174 99 177C112 153 103 133 116 114C127 100 136 87 133 68C157 91 158 108 149 133C145 146 150 160 159 171C162 159 166 150 171 144C166 169 185 176 181 199C177 223 153 241 122 240Z"
        />
        <path
          className={styles.flameCore}
          fill={`url(#${id}-core)`}
          d="M122 239C102 239 90 226 93 208C95 194 109 185 109 170C116 175 119 182 118 190C131 178 133 154 128 135C151 155 144 174 151 191C156 202 160 209 155 222C149 234 136 240 122 239Z"
        />
      </svg>
    </div>
  );
}
