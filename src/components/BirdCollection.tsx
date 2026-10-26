"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, Bird as BirdIcon, LockKeyhole } from "lucide-react";
import { BottomSheet } from "@/components/BottomSheet";
import { birds, type Bird } from "@/data/birds";
import { getBirdCollection } from "@/lib/birds";
import type { DailyResult } from "@/lib/types";

export function BirdCollection({
  history,
  todayKey,
  rewardDate,
  isLoading = false,
  prominent = false,
  action,
}: {
  history: DailyResult[];
  todayKey: string;
  rewardDate?: string;
  isLoading?: boolean;
  prominent?: boolean;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Bird | null>(null);
  const collection = getBirdCollection(history, todayKey);
  const reward = rewardDate ? collection.rewardForDate(rewardDate) : undefined;
  const next = collection.nextBird;
  const earnedToday = collection.rewardForDate(todayKey);
  const featured =
    earnedToday ?? next ?? collection.collected.at(-1) ?? birds[0];
  const isFeaturedEarned = collection.collected.includes(featured);
  const openAlbum = () => {
    setSelected(null);
    setOpen(true);
  };

  if (rewardDate && !reward) return null;

  return (
    <div className="bird-collection">
      {reward ? (
        <button
          className="bird-reward"
          type="button"
          onClick={() => {
            setSelected(reward);
            setOpen(true);
          }}
        >
          <img
            src={`/birds/${reward.id}.webp`}
            alt=""
            width="104"
            height="72"
          />
          <span>
            <small>Added to your field guide</small>
            <strong>{reward.name}</strong>
            <span>
              Meet your bird <ArrowRight size={14} />
            </span>
          </span>
        </button>
      ) : null}
      {!rewardDate && prominent ? (
        <section className="bird-home" aria-label="Your daily bird discovery">
          <div className="bird-home-heading">
            <p className="bird-album-kicker">SANTA BARBARA FIELD NOTES</p>
            <h2>
              {!next
                ? "A field guide of your own."
                : earnedToday
                  ? "Look who you discovered."
                  : "A new bird, every day."}
            </h2>
          </div>
          <button
            className="bird-home-art"
            type="button"
            disabled={isLoading}
            onClick={() => {
              setSelected(isFeaturedEarned ? featured : null);
              setOpen(true);
            }}
            aria-label={
              isFeaturedEarned
                ? `Meet ${featured.name}`
                : "Preview your next bird discovery"
            }
          >
            <img
              src={`/birds/${featured.id}.webp`}
              alt={
                isFeaturedEarned
                  ? `Painting of ${featured.name}`
                  : "A painted preview of your next Santa Barbara bird"
              }
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <span className="bird-home-tag">
              {isLoading
                ? "Loading your field guide"
                : isFeaturedEarned
                  ? "IN YOUR COLLECTION"
                  : "WAITING TO BE DISCOVERED"}
            </span>
            <span className="bird-home-number">
              {String(birds.indexOf(featured) + 1).padStart(2, "0")} / 12
            </span>
          </button>
          <div className="bird-home-story">
            <span className="bird-home-habitat">{featured.habitat}</span>
            <h3>{isFeaturedEarned ? featured.name : "Your next discovery"}</h3>
            <p>{isFeaturedEarned ? featured.fact : featured.clue}</p>
            {!isFeaturedEarned ? (
              <span className="bird-home-invitation">
                Finish today’s quiz to add this bird to your field guide.
              </span>
            ) : null}
          </div>
          {action}
          <button
            className="bird-home-album"
            disabled={isLoading}
            type="button"
            onClick={openAlbum}
          >
            <span className="bird-home-thumbnails" aria-hidden="true">
              {(collection.collected.length
                ? collection.collected.slice(-3)
                : birds.slice(0, 3)
              ).map((bird) => (
                <img
                  className={
                    collection.collected.includes(bird) ? "" : "uncollected"
                  }
                  src={`/birds/${bird.id}.webp`}
                  alt=""
                  width="48"
                  height="48"
                  key={bird.id}
                />
              ))}
            </span>
            <span>
              <strong>Your field guide</strong>
              <small>
                {isLoading
                  ? "Loading your birds…"
                  : `${collection.collected.length} of ${birds.length} birds discovered`}
              </small>
            </span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          {earnedToday && next ? (
            <p className="bird-home-tomorrow">
              <strong>Next time:</strong> {next.clue}
            </p>
          ) : !next ? (
            <p className="bird-home-tomorrow">
              All 12 birds are yours. Revisit their stories anytime.
            </p>
          ) : null}
        </section>
      ) : null}
      {!rewardDate && !prominent ? (
        <button
          className="bird-album-trigger"
          disabled={isLoading}
          type="button"
          onClick={() => {
            setSelected(null);
            setOpen(true);
          }}
        >
          <BirdIcon size={25} aria-hidden="true" />
          <span>
            <strong>Santa Barbara field guide</strong>
            <small>
              {isLoading
                ? "Loading your birds…"
                : `${collection.collected.length} of ${birds.length} birds discovered`}
            </small>
          </span>
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      ) : null}
      {!prominent && !isLoading && (!rewardDate || reward) ? (
        <p className="bird-teaser">
          {next ? (
            <>
              <strong>
                {collection.completedToday ? "Next time" : "Today’s mystery"}:
              </strong>{" "}
              {next.clue}
            </>
          ) : (
            "All 12 birds discovered. Your Santa Barbara field guide is complete!"
          )}
        </p>
      ) : null}
      <BottomSheet
        open={open}
        onDismiss={() => setOpen(false)}
        title="Santa Barbara field guide"
        titleId="bird-album-title"
        testId="bird-album"
        backdropTestId="bird-album-backdrop"
        closeLabel="Close field guide"
        className="bird-album-sheet"
      >
        <div className="bird-album-content">
          {selected ? (
            <>
              <button
                className="bird-back"
                type="button"
                onClick={() => setSelected(null)}
              >
                ← All birds
              </button>
              <BirdDetail bird={selected} />
            </>
          ) : (
            <>
              <p className="bird-album-kicker">SANTA BARBARA · COLLECTION 01</p>
              <h3 className="bird-album-heading">
                A little closer to the wild.
              </h3>
              <p className="bird-album-intro">
                Finish all three questions to discover a bird. Any score counts.
                Miss a day? Your birds stay.
              </p>
              <div className="bird-progress">
                <span>
                  {collection.collected.length} / {birds.length} discovered
                </span>
                <progress
                  aria-label="Birds discovered"
                  value={collection.collected.length}
                  max={birds.length}
                />
              </div>
              {!next ? (
                <p className="bird-complete">
                  Collection complete! Tap any bird to revisit its story.
                </p>
              ) : (
                <p className="bird-next">
                  <strong>
                    {collection.completedToday
                      ? "Next time"
                      : "Your next discovery"}
                  </strong>
                  <br />
                  {next.clue}
                </p>
              )}
              {(
                ["Neighborhood", "Oak woodland", "Coast & wetlands"] as const
              ).map((habitat) => (
                <section
                  className="bird-habitat"
                  key={habitat}
                  aria-label={habitat}
                >
                  <h3>{habitat}</h3>
                  <div className="bird-grid">
                    {birds
                      .filter((bird) => bird.habitat === habitat)
                      .map((bird) => {
                        const unlocked = collection.collected.includes(bird);
                        return (
                          <button
                            key={bird.id}
                            className={`bird-tile ${unlocked ? "discovered" : "locked"}`}
                            disabled={!unlocked}
                            onClick={() => setSelected(bird)}
                            type="button"
                            aria-label={
                              unlocked
                                ? bird.name
                                : `Undiscovered bird ${birds.indexOf(bird) + 1}`
                            }
                          >
                            <img
                              src={`/birds/${bird.id}.webp`}
                              alt=""
                              width="160"
                              height="110"
                              loading="lazy"
                            />
                            <span>
                              {unlocked ? (
                                bird.name
                              ) : (
                                <>
                                  <LockKeyhole size={12} /> Undiscovered
                                </>
                              )}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </section>
              ))}
              <p className="bird-sources">
                Local species:{" "}
                <a
                  href="https://santabarbaraaudubon.org/wp-content/uploads/SBAS-Local-Bird-Checklist.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Santa Barbara Audubon
                </a>{" "}
                and the{" "}
                <a
                  href="https://sbbotanicgarden.org/wp-content/uploads/2022/05/SBBotanicGarden-Bird-List-Excel-62nd_NewBrand.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Botanic Garden
                </a>
                . AI-painted illustrations; real birds vary with age and sex.
              </p>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}

function BirdDetail({ bird }: { bird: Bird }) {
  return (
    <article className="bird-detail">
      <img
        src={`/birds/${bird.id}.webp`}
        alt={`Natural-history painting of ${bird.name}`}
        width="320"
        height="220"
      />
      <p className="bird-album-kicker">
        {bird.habitat} · #{String(birds.indexOf(bird) + 1).padStart(2, "0")}
      </p>
      <h3>{bird.name}</h3>
      <p className="bird-fact">{bird.fact}</p>
      <div className="bird-spotting">
        <strong>Out in the wild</strong>
        <p>{bird.spottingTip}</p>
      </div>
      <a
        className="bird-source"
        href={bird.source}
        target="_blank"
        rel="noreferrer"
      >
        Read more & see real photos ↗
      </a>
    </article>
  );
}
