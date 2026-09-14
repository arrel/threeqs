import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { MathText } from "@/components/MathText";
import { problems } from "@/data/problems";
import styles from "./review.module.css";

export const metadata: Metadata = {
  title: "Question bank review",
  robots: { index: false, follow: false }
};

const difficultyOrder = { easy: 0, medium: 1, stretch: 2 };
const orderedProblems = [...problems].sort(
  (a, b) => a.scheduledDate.localeCompare(b.scheduledDate) ||
    difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
);

export default async function ReviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const host = (await headers()).get("host") ?? "";
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
    notFound();
  }

  return (
    <main className={styles.page} id="top">
      <header className={styles.header}>
        <Link href="/">← Back to Three Qs</Link>
        <h1>Question bank review</h1>
        <p>All {problems.length} questions, in schedule order. Correct answers and explanations are shown below each question.</p>
      </header>
      {orderedProblems.map((problem, index) => (
        <article className={styles.card} id={problem.id} key={problem.id}>
          <div className={styles.meta}>
            <a href={`#${problem.id}`}>Question {index + 1}</a>
            <span>{problem.scheduledDate}</span>
            <span>{problem.difficulty} · Grades {problem.gradeBand}</span>
          </div>
          <h2><MathText text={problem.prompt} /></h2>
          <ul className={styles.choices}>
            {problem.choices.map((choice) => (
              <li className={choice.id === problem.correctChoiceId ? styles.correct : undefined} key={choice.id}>
                <strong>{choice.id}.</strong>
                <MathText text={choice.label} />
                {choice.id === problem.correctChoiceId && <strong className={styles.badge}>✓ Correct answer</strong>}
              </li>
            ))}
          </ul>
          <div className={styles.explanation}>
            <h3>Explanation</h3>
            <MathText text={problem.explanation} />
          </div>
          <p className={styles.topics}>{problem.topics.join(" · ")}</p>
        </article>
      ))}
      <Link href="#top">Back to top ↑</Link>
    </main>
  );
}
