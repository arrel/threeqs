import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results"
};

// The game UI is rendered once in the root layout (app/layout.tsx) so it stays
// mounted across route changes. Each route only needs to exist for navigation.
export default function ResultsPage() {
  return null;
}
