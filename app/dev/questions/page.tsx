import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MathText } from "@/components/MathText";
import { problems } from "@/data/problems";
import type { Difficulty, Problem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Question Review | Three Qs"
};

const difficultyOrder: Difficulty[] = ["easy", "medium", "stretch"];

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  stretch: "Stretch"
};

export default function QuestionReviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const groupedProblems = difficultyOrder
    .map((difficulty) => ({
      difficulty,
      problems: problems.filter((problem) => problem.difficulty === difficulty)
    }))
    .filter((group) => group.problems.length > 0);

  return (
    <main className="dev-review-page">
      <section className="dev-review-hero" aria-labelledby="question-review-title">
        <div>
          <p className="dev-review-kicker">Local development</p>
          <h1 id="question-review-title">Question review</h1>
          <p className="dev-review-intro">
            {problems.length} questions with options, answers, explanations, and source context.
          </p>
        </div>

        <div className="dev-review-stats" aria-label="Question counts by difficulty">
          {groupedProblems.map(({ difficulty, problems: groupProblems }) => (
            <div className="dev-review-stat" key={difficulty}>
              <strong>{groupProblems.length}</strong>
              <span>{difficultyLabels[difficulty]}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="dev-review-groups">
        {groupedProblems.map(({ difficulty, problems: groupProblems }) => (
          <section className="dev-review-group" key={difficulty}>
            <header className="dev-review-group-header">
              <h2>{difficultyLabels[difficulty]}</h2>
              <span>{groupProblems.length} questions</span>
            </header>

            <div className="dev-question-list">
              {groupProblems.map((problem) => (
                <QuestionCard
                  key={problem.id}
                  problem={problem}
                  questionNumber={problems.findIndex((item) => item.id === problem.id) + 1}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function QuestionCard({ problem, questionNumber }: { problem: Problem; questionNumber: number }) {
  const correctChoice = problem.choices.find((choice) => choice.id === problem.correctChoiceId);

  return (
    <article className="dev-question-card" id={problem.id}>
      <header className="dev-question-header">
        <div className="dev-question-title">
          <span className={`dev-difficulty dev-difficulty-${problem.difficulty}`}>
            {difficultyLabels[problem.difficulty]}
          </span>
          <h3>
            <span>Q{questionNumber}.</span> <MathText text={problem.prompt} />
          </h3>
        </div>

        <dl className="dev-question-meta">
          <div>
            <dt>Grade</dt>
            <dd>{problem.gradeBand}</dd>
          </div>
          <div>
            <dt>ID</dt>
            <dd>{problem.id}</dd>
          </div>
        </dl>
      </header>

      <ol className="dev-choice-list" aria-label={`Options for question ${questionNumber}`}>
        {problem.choices.map((choice) => {
          const isCorrect = choice.id === problem.correctChoiceId;

          return (
            <li className={isCorrect ? "dev-choice dev-choice-correct" : "dev-choice"} key={choice.id}>
              <span className="dev-choice-letter">{choice.id}</span>
              <span className="dev-choice-text">
                <MathText text={choice.label} />
              </span>
              {isCorrect ? <strong className="dev-answer-pill">Answer</strong> : null}
            </li>
          );
        })}
      </ol>

      <div className="dev-answer-panel">
        <div>
          <span className="dev-answer-label">Correct answer</span>
          <p>
            <strong>{correctChoice?.id ?? problem.correctChoiceId}</strong>
            {correctChoice ? (
              <>
                {" "}
                <MathText text={correctChoice.label} />
              </>
            ) : null}
          </p>
        </div>

        <div>
          <span className="dev-answer-label">Explanation</span>
          <p>
            <MathText text={problem.explanation} />
          </p>
        </div>
      </div>

      <footer className="dev-question-footer">
        <div className="dev-topic-list">
          {problem.topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>

        <div className="dev-source">
          {problem.source.url ? (
            <a href={problem.source.url} rel="noreferrer" target="_blank">
              {problem.source.name}
            </a>
          ) : (
            problem.source.name
          )}
          {problem.adapted ? <span>Adapted</span> : null}
        </div>
      </footer>
    </article>
  );
}
