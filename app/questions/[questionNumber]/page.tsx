import type { Metadata } from "next";

type QuestionPageProps = {
  params: Promise<{
    questionNumber: string;
  }>;
};

export async function generateMetadata({ params }: QuestionPageProps): Promise<Metadata> {
  const { questionNumber } = await params;

  if (!["1", "2", "3"].includes(questionNumber)) {
    return {
      title: {
        absolute: "Three Qs"
      }
    };
  }

  return {
    title: `Question ${questionNumber}`
  };
}

// The game UI is rendered once in the root layout (app/layout.tsx) so it stays
// mounted across route changes. Each route only needs to exist for navigation.
export default function QuestionPage() {
  return null;
}
