import type { Problem } from "@/lib/types";

const tcoeSource = {
  name: "Original Math Super Bowl-style practice, inspired by TCOE prior tests",
  url: "https://www.tcoe.org/MathSuperBowl/tests-from-prior-years"
};

const musSource = {
  name: "Original Math Super Bowl-style practice, inspired by MUS sample tests",
  url: "https://musmath.weebly.com/sample-tests.html"
};

export const problems: Problem[] = [
  // ==========================================
  // JUNE 28: Advanced Number Theory
  // ==========================================
  {
    id: "easy-prime-factorization-90",
    scheduledDate: "2026-06-28",
    prompt: "What is the prime factorization of $90$?",
    choices: [
      { id: "A", label: "$2 \\cdot 3 \\cdot 5$" },
      { id: "B", label: "$2 \\cdot 3^2 \\cdot 5$" },
      { id: "C", label: "$2^2 \\cdot 3 \\cdot 5$" },
      { id: "D", label: "$9 \\cdot 10$" }
    ],
    correctChoiceId: "B",
    explanation: "Break $90$ into factors: $90 = 9 \\cdot 10$. Then $9 = 3^2$ and $10 = 2 \\cdot 5$, so $90 = 2 \\cdot 3^2 \\cdot 5$.",
    difficulty: "easy",
    topics: ["number theory", "prime factorization"],
    vocabTerms: [
      {
        term: "Prime Factorization",
        definition: "Writing a number as prime numbers multiplied together."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-gcf-bins",
    scheduledDate: "2026-06-28",
    prompt: "A teacher has $48$ rulers and $60$ pairs of scissors. She wants to make matching supply bins with no items left over. What is the greatest number of bins she can make?",
    choices: [
      { id: "A", label: "6" },
      { id: "B", label: "12" },
      { id: "C", label: "24" },
      { id: "D", label: "120" }
    ],
    correctChoiceId: "B",
    explanation: "Each bin has to be the same, with no leftovers. That means we need the greatest common factor of $48$ and $60$. The biggest number that divides both is $12$, so she can make $12$ bins.",
    difficulty: "medium",
    topics: ["number theory", "gcf"],
    vocabTerms: [
      {
        term: "Greatest Common Factor",
        definition: "The largest whole number that divides evenly into each number.",
        aliases: ["gcf"]
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-exponent-simplify",
    scheduledDate: "2026-06-28",
    prompt: "Write this expression as one power: $\\frac{2^5 \\cdot 4^3}{8^2}$.",
    choices: [
      { id: "A", label: "$2^3$" },
      { id: "B", label: "$2^5$" },
      { id: "C", label: "$2^{11}$" },
      { id: "D", label: "$4^2$" }
    ],
    correctChoiceId: "B",
    explanation: "Rewrite everything using base $2$. Since $4^3 = (2^2)^3 = 2^6$ and $8^2 = (2^3)^2 = 2^6$, the expression becomes $\\frac{2^5 \\cdot 2^6}{2^6} = 2^5$.",
    difficulty: "stretch",
    topics: ["number theory", "exponents"],
    vocabTerms: [
      {
        term: "Exponent",
        definition: "The small raised number that tells how many times to multiply the base."
      }
    ],
    gradeBand: "7-8",
    source: tcoeSource,
    adapted: true
  },

  // ==========================================
  // JUNE 29: Proportional Reasoning
  // ==========================================
  {
    id: "easy-apples-unit-rate",
    scheduledDate: "2026-06-29",
    prompt: "If $5$ pounds of apples cost \\$12.50, what is the cost of $8$ pounds of apples?",
    choices: [
      { id: "A", label: "\\$15.00" },
      { id: "B", label: "\\$18.00" },
      { id: "C", label: "\\$20.00" },
      { id: "D", label: "\\$22.50" }
    ],
    correctChoiceId: "C",
    explanation: "First find the price for $1$ pound: $\\$12.50 \\div 5 = \\$2.50$. Then multiply by $8$: $8 \\cdot \\$2.50 = \\$20.00$.",
    difficulty: "easy",
    topics: ["proportional reasoning", "unit rate"],
    vocabTerms: [
      {
        term: "Unit Rate",
        definition: "A rate for $1$ of something, like the cost for $1$ pound."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-train-travel-time",
    scheduledDate: "2026-06-29",
    prompt: "A train goes $75$ miles per hour. How many minutes will it take to go $45$ miles?",
    choices: [
      { id: "A", label: "30 minutes" },
      { id: "B", label: "36 minutes" },
      { id: "C", label: "40 minutes" },
      { id: "D", label: "45 minutes" }
    ],
    correctChoiceId: "B",
    explanation: "At $75$ miles per hour, the time is $45 \\div 75 = \\frac{3}{5}$ of an hour. Since an hour has $60$ minutes, $\\frac{3}{5} \\cdot 60 = 36$ minutes.",
    difficulty: "medium",
    topics: ["proportional reasoning", "speed"],
    vocabTerms: [
      {
        term: "Constant Speed",
        definition: "A speed that stays the same the whole time."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-jacket-discounts",
    scheduledDate: "2026-06-29",
    prompt: "A jacket costs \\$150 before a sale. It is $20\\%$ off, and then a coupon takes another $10\\%$ off the sale price. What is the final price before tax?",
    choices: [
      { id: "A", label: "\\$105" },
      { id: "B", label: "\\$108" },
      { id: "C", label: "\\$110" },
      { id: "D", label: "\\$120" }
    ],
    correctChoiceId: "B",
    explanation: "The first discount leaves $80\\%$ of the price: $\\$150 \\cdot 0.80 = \\$120$. The coupon takes $10\\%$ off that sale price, so $\\$120 \\cdot 0.90 = \\$108$.",
    difficulty: "stretch",
    topics: ["proportional reasoning", "percent"],
    vocabTerms: [
      {
        term: "Discount",
        definition: "An amount taken off a price."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  },

  // ==========================================
  // JUNE 30: Pre-Algebra Foundations
  // ==========================================
  {
    id: "easy-point-shift-quadrant",
    scheduledDate: "2026-06-30",
    prompt: "Point $P$ starts at $(-3, 4)$ on the coordinate plane. Move it down $6$ units and right $5$ units. What are its new coordinates?",
    choices: [
      { id: "A", label: "$(2, -2)$" },
      { id: "B", label: "$(-8, 9)$" },
      { id: "C", label: "$(2, 10)$" },
      { id: "D", label: "$(-2, -2)$" }
    ],
    correctChoiceId: "A",
    explanation: "Moving right $5$ adds $5$ to the $x$-coordinate: $-3 + 5 = 2$. Moving down $6$ subtracts $6$ from the $y$-coordinate: $4 - 6 = -2$. The new point is $(2, -2)$.",
    difficulty: "easy",
    topics: ["pre-algebra", "coordinate plane"],
    vocabTerms: [
      {
        term: "Coordinate Plane",
        definition: "A grid with an $x$-axis and a $y$-axis, used to locate points."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-linear-equation-y",
    scheduledDate: "2026-06-30",
    prompt: "Solve for $y$: $4y - 9 = 2y + 15$.",
    choices: [
      { id: "A", label: "3" },
      { id: "B", label: "6" },
      { id: "C", label: "12" },
      { id: "D", label: "24" }
    ],
    correctChoiceId: "C",
    explanation: "Subtract $2y$ from both sides: $2y - 9 = 15$. Add $9$ to both sides: $2y = 24$. Divide by $2$: $y = 12$.",
    difficulty: "medium",
    topics: ["pre-algebra", "equations"],
    vocabTerms: [
      {
        term: "Linear Equation",
        definition: "An equation where the variable is not squared, cubed, or raised to another power."
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-inequality-flip",
    scheduledDate: "2026-06-30",
    prompt: "Solve the inequality for $x$: $-3x + 7 < 22$.",
    choices: [
      { id: "A", label: "$x < -5$" },
      { id: "B", label: "$x > -5$" },
      { id: "C", label: "$x < 5$" },
      { id: "D", label: "$x > 5$" }
    ],
    correctChoiceId: "B",
    explanation: "Subtract $7$ from both sides to get $-3x < 15$. When you divide by a negative number, flip the sign: $x > -5$.",
    difficulty: "stretch",
    topics: ["pre-algebra", "inequalities"],
    vocabTerms: [
      {
        term: "Inequality",
        definition: "A math statement that compares two values using signs like $<$ or $>$."
      }
    ],
    gradeBand: "7-8",
    source: tcoeSource,
    adapted: true
  },

  // ==========================================
  // JULY 01: Advanced Geometry
  // ==========================================
  {
    id: "easy-triangle-theorem-sides",
    scheduledDate: "2026-07-01",
    prompt: "Which group of side lengths can make a triangle?",
    choices: [
      { id: "A", label: "2 cm, 3 cm, 6 cm" },
      { id: "B", label: "4 cm, 4 cm, 9 cm" },
      { id: "C", label: "5 cm, 7 cm, 11 cm" },
      { id: "D", label: "3 cm, 8 cm, 12 cm" }
    ],
    correctChoiceId: "C",
    explanation: "For a triangle, any two side lengths must add up to more than the third side. For $5$, $7$, and $11$, we have $5 + 7 = 12$, and $12$ is greater than $11$, so these lengths work.",
    difficulty: "easy",
    topics: ["geometry", "triangle inequality"],
    vocabTerms: [
      {
        term: "Triangle Inequality Theorem",
        definition: "A rule that says any two sides of a triangle must add up to more than the third side."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-composite-shape-area",
    scheduledDate: "2026-07-01",
    prompt: "A shape is made from a $10$ cm by $6$ cm rectangle and a right triangle attached to one side. The triangle has base $4$ cm and height $6$ cm. What is the total area?",
    choices: [
      { id: "A", label: "68 sq cm" },
      { id: "B", label: "72 sq cm" },
      { id: "C", label: "84 sq cm" },
      { id: "D", label: "120 sq cm" }
    ],
    correctChoiceId: "B",
    explanation: "Find each part, then add. The rectangle has area $10 \\cdot 6 = 60$ sq cm. The triangle has area $\\frac{1}{2} \\cdot 4 \\cdot 6 = 12$ sq cm. Total area is $60 + 12 = 72$ sq cm.",
    difficulty: "medium",
    topics: ["geometry", "area"],
    vocabTerms: [
      {
        term: "Composite Shape",
        definition: "A shape made by putting two or more simpler shapes together."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-prism-sa-calc",
    scheduledDate: "2026-07-01",
    prompt: "A rectangular prism is $5$ cm long, $4$ cm wide, and $8$ cm tall. What is its total surface area?",
    choices: [
      { id: "A", label: "120 sq cm" },
      { id: "B", label: "160 sq cm" },
      { id: "C", label: "184 sq cm" },
      { id: "D", label: "200 sq cm" }
    ],
    correctChoiceId: "C",
    explanation: "Surface area counts all the outside faces. Use $2(lw + lh + wh)$: $2(5\\cdot4 + 5\\cdot8 + 4\\cdot8) = 2(20 + 40 + 32) = 184$ sq cm.",
    difficulty: "stretch",
    topics: ["geometry", "surface area"],
    vocabTerms: [
      {
        term: "Surface Area",
        definition: "The total area of all the outside faces of a 3D shape."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  },

  // ==========================================
  // JULY 02: Combinatorics & Logic
  // ==========================================
  {
    id: "easy-outfit-combinations",
    scheduledDate: "2026-07-02",
    prompt: "Sam is choosing an outfit. He has $4$ shirts, $3$ pairs of pants, and $2$ pairs of shoes. How many different outfits can he make?",
    choices: [
      { id: "A", label: "9" },
      { id: "B", label: "12" },
      { id: "C", label: "18" },
      { id: "D", label: "24" }
    ],
    correctChoiceId: "D",
    explanation: "Choose a shirt, then pants, then shoes. Multiply the number of choices: $4 \\cdot 3 \\cdot 2 = 24$ outfits.",
    difficulty: "easy",
    topics: ["combinatorics", "counting"],
    vocabTerms: [
      {
        term: "Fundamental Counting Principle",
        definition: "A shortcut for counting choices: multiply the number of options for each step."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-sports-venn",
    scheduledDate: "2026-07-02",
    prompt: "In a class of $30$ students, $17$ students run cross country, $13$ play basketball, and $5$ do both sports. How many students do neither sport?",
    choices: [
      { id: "A", label: "0" },
      { id: "B", label: "5" },
      { id: "C", label: "10" },
      { id: "D", label: "25" }
    ],
    correctChoiceId: "B",
    explanation: "The $5$ students in both sports are counted in both groups, so subtract them once: $17 + 13 - 5 = 25$ students play at least one sport. That leaves $30 - 25 = 5$ students in neither sport.",
    difficulty: "medium",
    topics: ["logic", "venn diagram"],
    vocabTerms: [
      {
        term: "Venn Diagram",
        definition: "A diagram with overlapping circles that shows what groups have in common."
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-word-permutations",
    scheduledDate: "2026-07-02",
    prompt: "How many different 4-letter arrangements can you make from the letters in $MATH$ if you use each letter once?",
    choices: [
      { id: "A", label: "16" },
      { id: "B", label: "24" },
      { id: "C", label: "48" },
      { id: "D", label: "256" }
    ],
    correctChoiceId: "B",
    explanation: "There are $4$ choices for the first letter, then $3$, then $2$, then $1$. So the number of arrangements is $4 \\cdot 3 \\cdot 2 \\cdot 1 = 24$.",
    difficulty: "stretch",
    topics: ["combinatorics", "permutations"],
    vocabTerms: [
      {
        term: "Permutation",
        definition: "An arrangement where order matters."
      }
    ],
    gradeBand: "7-8",
    source: tcoeSource,
    adapted: true
  },

  // ==========================================
  // JULY 03: Data Interpretation
  // ==========================================
  {
    id: "easy-die-coin-probability",
    scheduledDate: "2026-07-03",
    prompt: "You roll a fair 6-sided die and flip a coin. What is the probability of rolling a $4$ and getting heads?",
    choices: [
      { id: "A", label: "$\\frac{1}{12}$" },
      { id: "B", label: "$\\frac{1}{8}$" },
      { id: "C", label: "$\\frac{1}{4}$" },
      { id: "D", label: "$\\frac{2}{3}$" }
    ],
    correctChoiceId: "A",
    explanation: "Rolling the die does not change the coin flip. The chance of rolling a $4$ is $\\frac{1}{6}$, and the chance of heads is $\\frac{1}{2}$. Multiply: $\\frac{1}{6} \\cdot \\frac{1}{2} = \\frac{1}{12}$.",
    difficulty: "easy",
    topics: ["probability", "independent events"],
    vocabTerms: [
      {
        term: "Independent Events",
        definition: "Events where one result does not change the chance of the other result."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-grade-weighted-mean",
    scheduledDate: "2026-07-03",
    prompt: "In science class, tests count for $60\\%$ of the grade and homework counts for $40\\%$. Alex averages $80$ on tests and $95$ on homework. What is his final weighted mean grade?",
    choices: [
      { id: "A", label: "86" },
      { id: "B", label: "87.5" },
      { id: "C", label: "89" },
      { id: "D", label: "90" }
    ],
    correctChoiceId: "A",
    explanation: "Tests count more than homework, so multiply each score by its weight. Tests: $80 \\cdot 0.60 = 48$. Homework: $95 \\cdot 0.40 = 38$. Add them: $48 + 38 = 86$.",
    difficulty: "medium",
    topics: ["statistics", "weighted mean"],
    vocabTerms: [
      {
        term: "Weighted Mean",
        definition: "An average where some parts count more than others."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-dependent-tokens",
    scheduledDate: "2026-07-03",
    prompt: "A box contains $5$ red tokens and $5$ blue tokens. Two tokens are drawn one after the other without replacement. What is the probability that both tokens drawn are red?",
    choices: [
      { id: "A", label: "$\\frac{1}{4}$" },
      { id: "B", label: "$\\frac{2}{9}$" },
      { id: "C", label: "$\\frac{1}{2}$" },
      { id: "D", label: "$\\frac{5}{18}$" }
    ],
    correctChoiceId: "B",
    explanation: "For the first token, the chance of red is $\\frac{5}{10} = \\frac{1}{2}$. If the first token is red, then $4$ red tokens are left out of $9$ total tokens. Multiply: $\\frac{1}{2} \\cdot \\frac{4}{9} = \\frac{2}{9}$.",
    difficulty: "stretch",
    topics: ["probability", "dependent events"],
    vocabTerms: [
      {
        term: "Dependent Events",
        definition: "Events where the first result changes what can happen next."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  }
];

const downloadedMsbSource = {
  name: "Original Math Super Bowl-style practice, inspired by downloaded 2014, 2017, and 2018 MSB tests",
  year: "2014-2018"
};

const downloadedPowerBowlSource = {
  name: "Original Math Super Bowl-style practice, inspired by downloaded Power Bowl tests",
  year: "2023-2026"
};

type SummerContext = {
  dateKey: string;
  dayIndex: number;
  cycle: number;
};

type SummerProblemTemplate = (context: SummerContext) => Problem[];

type SummerProblemArgs = {
  context: SummerContext;
  difficulty: Problem["difficulty"];
  slug: string;
  prompt: string;
  correctLabel: string;
  distractors: string[];
  explanation: string;
  topics: string[];
  vocabTerms: NonNullable<Problem["vocabTerms"]>;
  gradeBand: string;
};

const summerProblemTemplates: SummerProblemTemplate[] = [
  makeRateProblems,
  makeFractionProblems,
  makePercentProblems,
  makeNumberTheoryProblems,
  makeGeometryProblems,
  makeAlgebraProblems,
  makeCountingProblems,
  makeProbabilityProblems,
  makeStatisticsProblems,
  makeCoordinateProblems,
  makeClockProblems,
  makeSequenceProblems,
  makeMoneyProblems,
  makeRatioProblems,
  makeIntegerProblems,
  makeLogicProblems
];

problems.push(...buildSummerProblems());

function buildSummerProblems(): Problem[] {
  return getDateKeys("2026-07-04", "2026-08-19").flatMap((dateKey, dayIndex) => {
    const template = summerProblemTemplates[dayIndex % summerProblemTemplates.length];
    return template({
      dateKey,
      dayIndex,
      cycle: Math.floor(dayIndex / summerProblemTemplates.length)
    });
  });
}

function getDateKeys(startDateKey: string, endDateKey: string): string[] {
  const [startYear, startMonth, startDay] = startDateKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDateKey.split("-").map(Number);
  const date = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const endTime = Date.UTC(endYear, endMonth - 1, endDay);
  const result: string[] = [];

  while (date.getTime() <= endTime) {
    result.push(date.toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return result;
}

function makeSummerProblem(args: SummerProblemArgs): Problem {
  const choices = makeChoices(args.correctLabel, args.distractors, args.context.dayIndex);

  return {
    id: `summer-${args.context.dateKey}-${args.difficulty}-${args.slug}`,
    scheduledDate: args.context.dateKey,
    prompt: args.prompt,
    choices,
    correctChoiceId: choices.find((choice) => choice.label === args.correctLabel)?.id ?? "A",
    explanation: args.explanation,
    difficulty: args.difficulty,
    topics: args.topics,
    vocabTerms: args.vocabTerms,
    gradeBand: args.gradeBand,
    source: args.context.dayIndex % 2 === 0 ? downloadedMsbSource : downloadedPowerBowlSource,
    adapted: true
  };
}

function makeChoices(correctLabel: string, distractors: string[], seed: number): Problem["choices"] {
  const labels = [correctLabel, ...distractors];
  const offset = seed % labels.length;
  const rotatedLabels = [...labels.slice(offset), ...labels.slice(0, offset)];

  return rotatedLabels.map((label, index) => ({
    id: String.fromCharCode(65 + index),
    label
  }));
}

function dollars(amount: number): string {
  return `\\$${amount.toFixed(2)}`;
}

function mixedNumber(whole: number, numerator: number, denominator: number): string {
  return `$${whole}\\frac{${numerator}}{${denominator}}$`;
}

function makeRateProblems(context: SummerContext): Problem[] {
  const pounds = 4 + context.cycle;
  const totalCost = 10 + 2 * context.cycle;
  const targetPounds = 7 + context.cycle;
  const unitPrice = totalCost / pounds;
  const finalCost = unitPrice * targetPounds;
  const speed = 48 + 6 * context.cycle;
  const minutes = 25 + 5 * context.cycle;
  const distance = speed * minutes / 60;
  const aHours = 6 + 3 * context.cycle;
  const bHours = 12 + 6 * context.cycle;
  const togetherHours = 1 / (1 / aHours + 1 / bHours);

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "fruit-unit-rate",
      prompt: `${pounds} pounds of peaches cost ${dollars(totalCost)}. At the same rate, how much do ${targetPounds} pounds cost?`,
      correctLabel: dollars(finalCost),
      distractors: [dollars(finalCost + unitPrice), dollars(finalCost - unitPrice), dollars(totalCost + targetPounds)],
      explanation: `First find the unit rate: ${dollars(totalCost)} \\div ${pounds} = ${dollars(unitPrice)} per pound. Then multiply by ${targetPounds}: ${targetPounds} \\cdot ${dollars(unitPrice)} = ${dollars(finalCost)}.`,
      topics: ["proportional reasoning", "unit rate"],
      vocabTerms: [{ term: "Unit Rate", definition: "A rate for exactly $1$ unit, such as the cost for $1$ pound." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "bike-distance",
      prompt: `A cyclist rides at a constant speed of ${speed} miles per hour for ${minutes} minutes. How far does the cyclist ride?`,
      correctLabel: `${distance} miles`,
      distractors: [`${distance + 6} miles`, `${speed * minutes} miles`, `${Math.max(1, distance - 4)} miles`],
      explanation: `${minutes} minutes is $\\frac{${minutes}}{60}$ of an hour. The distance is ${speed} \\cdot \\frac{${minutes}}{60} = ${distance}$ miles.`,
      topics: ["proportional reasoning", "speed"],
      vocabTerms: [{ term: "Constant Speed", definition: "A speed that stays the same over a period of time." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "work-rate",
      prompt: `Nora can paint a fence in ${aHours} hours. Luis can paint the same fence in ${bHours} hours. If they work together at those rates, how long will the job take?`,
      correctLabel: `${togetherHours} hours`,
      distractors: [`${aHours + bHours} hours`, `${Math.min(aHours, bHours)} hours`, `${togetherHours + 1} hours`],
      explanation: `Together they paint $\\frac{1}{${aHours}} + \\frac{1}{${bHours}} = \\frac{1}{${togetherHours}}$ of the fence per hour, so the whole fence takes ${togetherHours} hours.`,
      topics: ["rates", "work problems"],
      vocabTerms: [{ term: "Work Rate", definition: "The fraction of a job completed in one unit of time." }],
      gradeBand: "7-8"
    })
  ];
}

function makeFractionProblems(context: SummerContext): Problem[] {
  const yardsWhole = 3 + context.cycle;
  const left = 24 + 8 * context.cycle;
  const original = left * 8;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "remaining-money",
      prompt: "Maya spends $\\frac{2}{3}$ of her allowance on a book and then $\\frac{1}{4}$ of what remains on a bookmark. What fraction of her original allowance does she spend on the bookmark?",
      correctLabel: "$\\frac{1}{12}$",
      distractors: ["$\\frac{1}{4}$", "$\\frac{1}{6}$", "$\\frac{3}{4}$"],
      explanation: `After spending $\\frac{2}{3}$, Maya has $\\frac{1}{3}$ left. One-fourth of that is $\\frac{1}{4} \\cdot \\frac{1}{3} = \\frac{1}{12}$.`,
      topics: ["fractions", "multiplication"],
      vocabTerms: [{ term: "Fraction Of", definition: "A phrase that usually means to multiply by a fraction." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "fabric-sum",
      prompt: `A costume crew buys ${mixedNumber(yardsWhole, 1, 2)} yards of red fabric, ${mixedNumber(2, 3, 4)} yards of blue fabric, and ${mixedNumber(1, 1, 4)} yards of green fabric. How many yards of fabric is that in all?`,
      correctLabel: mixedNumber(yardsWhole + 4, 1, 2),
      distractors: [mixedNumber(yardsWhole + 3, 1, 2), mixedNumber(yardsWhole + 4, 1, 4), mixedNumber(yardsWhole + 5, 1, 2)],
      explanation: `Add the whole numbers and fractions separately. The fractions are $\\frac{1}{2}+\\frac{3}{4}+\\frac{1}{4}=1\\frac{1}{2}$, so the total is ${mixedNumber(yardsWhole + 4, 1, 2)} yards.`,
      topics: ["fractions", "mixed numbers"],
      vocabTerms: [{ term: "Mixed Number", definition: "A number written with a whole number and a fraction." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "animal-photos",
      prompt: `In a photo contest, $\\frac{1}{2}$ of the photos are cats, $\\frac{1}{4}$ are dogs, $\\frac{1}{8}$ are birds, and the remaining ${left} photos are rabbits. How many photos were entered?`,
      correctLabel: `${original}`,
      distractors: [`${original / 2}`, `${original - left}`, `${original + left}`],
      explanation: `The listed cat, dog, and bird fractions add to $\\frac{7}{8}$, so rabbits are $\\frac{1}{8}$ of the photos. If $\\frac{1}{8}$ is ${left}, then the total is ${left} \\cdot 8 = ${original}.`,
      topics: ["fractions", "part-whole reasoning"],
      vocabTerms: [{ term: "Remainder", definition: "The part left after the other parts have been counted or removed." }],
      gradeBand: "7-8"
    })
  ];
}

function makePercentProblems(context: SummerContext): Problem[] {
  const spectators = 320 + 80 * context.cycle;
  const percent = 25 + 5 * context.cycle;
  const buyers = spectators * percent / 100;
  const price = 80 + 20 * context.cycle;
  const discount = 15 + 5 * context.cycle;
  const sale = price * (100 - discount) / 100;
  const finalPrice = sale * 0.9;
  const afterRaise = 126 + 18 * context.cycle;
  const original = afterRaise / 1.2;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "hot-dogs-percent",
      prompt: `${percent}\\% of the ${spectators} spectators at a game bought a hot dog. How many spectators bought hot dogs?`,
      correctLabel: `${buyers}`,
      distractors: [`${buyers + percent}`, `${spectators - buyers}`, `${buyers / 2}`],
      explanation: `${percent}\\% = ${percent / 100}. Multiply ${spectators} by ${percent / 100}: ${spectators} \\cdot ${percent / 100} = ${buyers}.`,
      topics: ["percent", "multiplication"],
      vocabTerms: [{ term: "Percent", definition: "A rate out of $100$." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "stacked-discount",
      prompt: `A backpack costs ${dollars(price)}. It is ${discount}\\% off, and then a coupon takes another $10\\%$ off the sale price. What is the final price before tax?`,
      correctLabel: dollars(finalPrice),
      distractors: [dollars(sale), dollars(price * 0.75), dollars(price - discount)],
      explanation: `After the first discount, the price is ${dollars(price)} \\cdot ${(100 - discount) / 100} = ${dollars(sale)}. The coupon leaves $90\\%$ of that: ${dollars(sale)} \\cdot 0.90 = ${dollars(finalPrice)}.`,
      topics: ["percent", "discount"],
      vocabTerms: [{ term: "Discount", definition: "An amount subtracted from the original price." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "reverse-percent",
      prompt: `After a $20\\%$ raise, Priya earns ${dollars(afterRaise)} for a tutoring shift. How much did she earn before the raise?`,
      correctLabel: dollars(original),
      distractors: [dollars(afterRaise * 0.8), dollars(afterRaise - 20), dollars(original + 20)],
      explanation: `A $20\\%$ raise means the new amount is $120\\%$ of the old amount. Divide by $1.20$: ${dollars(afterRaise)} \\div 1.20 = ${dollars(original)}.`,
      topics: ["percent", "reverse percent"],
      vocabTerms: [{ term: "Original Amount", definition: "The starting amount before an increase or decrease." }],
      gradeBand: "7-8"
    })
  ];
}

function makeNumberTheoryProblems(context: SummerContext): Problem[] {
  const factor = 6 + context.cycle;
  const a = factor * 8;
  const b = factor * 10;
  const blinkA = 12 + 3 * context.cycle;
  const blinkB = 18 + 3 * context.cycle;
  const lcm = leastCommonMultiple(blinkA, blinkB);
  const n = 72 + 18 * context.cycle;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "supply-gcf",
      prompt: `A coach has ${a} cones and ${b} jerseys. She wants to make identical practice kits with no items left over. What is the greatest number of kits she can make?`,
      correctLabel: `${factor * 2}`,
      distractors: [`${factor}`, `${factor * 4}`, `${a + b}`],
      explanation: `The greatest common factor of ${a} and ${b} is ${factor * 2}, so she can make ${factor * 2} identical kits.`,
      topics: ["number theory", "gcf"],
      vocabTerms: [{ term: "Greatest Common Factor", definition: "The largest whole number that divides evenly into two or more numbers.", aliases: ["GCF"] }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "blinking-lcm",
      prompt: `A red light blinks every ${blinkA} seconds and a blue light blinks every ${blinkB} seconds. If they blink together now, how many seconds pass before they blink together again?`,
      correctLabel: `${lcm} seconds`,
      distractors: [`${blinkA + blinkB} seconds`, `${Math.max(blinkA, blinkB)} seconds`, `${lcm / 2} seconds`],
      explanation: `The next shared blink happens at the least common multiple of ${blinkA} and ${blinkB}, which is ${lcm}.`,
      topics: ["number theory", "lcm"],
      vocabTerms: [{ term: "Least Common Multiple", definition: "The smallest positive number that is a multiple of each number.", aliases: ["LCM"] }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "prime-factorization",
      prompt: `Which expression is the prime factorization of ${n}?`,
      correctLabel: primeFactorLabel(n),
      distractors: [`$2 \\cdot ${n / 2}$`, `$3 \\cdot ${n / 3}$`, `$${n}$`],
      explanation: `Break ${n} into prime factors. Since ${n} = ${primeFactorLabel(n).replaceAll("$", "")}, the prime factorization is ${primeFactorLabel(n)}.`,
      topics: ["number theory", "prime factorization"],
      vocabTerms: [{ term: "Prime Factorization", definition: "Writing a whole number as prime numbers multiplied together." }],
      gradeBand: "7-8"
    })
  ];
}

function makeGeometryProblems(context: SummerContext): Problem[] {
  const length = 9 + context.cycle;
  const width = 5 + context.cycle;
  const triBase = 4 + 2 * context.cycle;
  const triHeight = width;
  const compositeArea = length * width + triBase * triHeight / 2;
  const side = 4 + context.cycle;
  const height = 7 + context.cycle;
  const surfaceArea = 2 * (side * side + side * height + side * height);
  const cubeSide = 3 + context.cycle;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "cube-volume",
      prompt: `How many $1$ cm cubes are needed to build a cube with side length ${cubeSide} cm?`,
      correctLabel: `${cubeSide ** 3}`,
      distractors: [`${cubeSide * 6}`, `${cubeSide ** 2}`, `${cubeSide ** 3 + cubeSide}`],
      explanation: `A cube with side length ${cubeSide} cm has volume ${cubeSide}^3 = ${cubeSide ** 3} cubic centimeters, so it needs ${cubeSide ** 3} unit cubes.`,
      topics: ["geometry", "volume"],
      vocabTerms: [{ term: "Volume", definition: "The amount of space inside a three-dimensional object." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "composite-area",
      prompt: `A shape is made from a ${length} cm by ${width} cm rectangle and a right triangle with base ${triBase} cm and height ${triHeight} cm. What is the total area?`,
      correctLabel: `${compositeArea} sq cm`,
      distractors: [`${length * width} sq cm`, `${compositeArea + triBase * triHeight / 2} sq cm`, `${length * width + triBase + triHeight} sq cm`],
      explanation: `The rectangle area is ${length} \\cdot ${width} = ${length * width}. The triangle area is $\\frac{1}{2} \\cdot ${triBase} \\cdot ${triHeight} = ${triBase * triHeight / 2}$. Add them to get ${compositeArea} sq cm.`,
      topics: ["geometry", "area"],
      vocabTerms: [{ term: "Composite Shape", definition: "A shape made from two or more simpler shapes." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "prism-surface-area",
      prompt: `A rectangular prism has a square base with side length ${side} cm and height ${height} cm. What is its total surface area?`,
      correctLabel: `${surfaceArea} sq cm`,
      distractors: [`${side * side * height} sq cm`, `${surfaceArea - side * side} sq cm`, `${surfaceArea + side * side} sq cm`],
      explanation: `Surface area is $2(lw + lh + wh)$. Here that is $2(${side}\\cdot${side} + ${side}\\cdot${height} + ${side}\\cdot${height}) = ${surfaceArea}$ sq cm.`,
      topics: ["geometry", "surface area"],
      vocabTerms: [{ term: "Surface Area", definition: "The total area of all outside faces of a solid." }],
      gradeBand: "7-8"
    })
  ];
}

function makeAlgebraProblems(context: SummerContext): Problem[] {
  const x = 6 + context.cycle;
  const total = 3 * x + 5;
  const y = 9 + context.cycle;
  const equationConstant = 2 * y - 11;
  const photoSmall = 4 + context.cycle;
  const photoLarge = 6 + context.cycle;
  const saleTotal = 2 * photoSmall + 3 * photoLarge;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "simple-equation",
      prompt: `Solve for $x$: $3x + 5 = ${total}$.`,
      correctLabel: `${x}`,
      distractors: [`${x + 1}`, `${x - 1}`, `${total}`],
      explanation: `Subtract $5$ from both sides to get $3x = ${total - 5}$. Divide by $3$: $x = ${x}$.`,
      topics: ["pre-algebra", "equations"],
      vocabTerms: [{ term: "Variable", definition: "A letter or symbol that represents an unknown number." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "two-step-equation",
      prompt: `Solve for $y$: $4y - 11 = 2y + ${equationConstant}$.`,
      correctLabel: `${y}`,
      distractors: [`${y + 2}`, `${y - 2}`, `${2 * y}`],
      explanation: `Subtract $2y$ from both sides: $2y - 11 = ${equationConstant}. Add $11$: $2y = ${equationConstant + 11}. Divide by $2$: $y = ${y}.`,
      topics: ["pre-algebra", "linear equations"],
      vocabTerms: [{ term: "Linear Equation", definition: "An equation whose variable is only to the first power." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "photo-system",
      prompt: `At a fair, two small photos and three large photos cost ${dollars(saleTotal)}. Two large photos cost ${dollars(2 * photoLarge)}. How much does one small photo cost?`,
      correctLabel: dollars(photoSmall),
      distractors: [dollars(photoLarge), dollars(saleTotal / 5), dollars(photoSmall + photoLarge)],
      explanation: `Two large photos cost ${dollars(2 * photoLarge)}, so one large photo costs ${dollars(photoLarge)}. Three large photos cost ${dollars(3 * photoLarge)}. The two small photos cost ${dollars(saleTotal - 3 * photoLarge)}, so one small photo costs ${dollars(photoSmall)}.`,
      topics: ["algebra", "systems"],
      vocabTerms: [{ term: "System of Equations", definition: "Two or more equations that describe the same situation." }],
      gradeBand: "7-8"
    })
  ];
}

function makeCountingProblems(context: SummerContext): Problem[] {
  const shirts = 3 + context.cycle;
  const pants = 4;
  const shoes = 2 + context.cycle;
  const digit = 4 + context.cycle;
  const arrangements = 5 * 4 * 3;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "meal-combinations",
      prompt: `A lunch menu has ${shirts} sandwiches, ${pants} sides, and ${shoes} drinks. How many different lunches can be made by choosing one of each?`,
      correctLabel: `${shirts * pants * shoes}`,
      distractors: [`${shirts + pants + shoes}`, `${shirts * pants}`, `${shirts * pants * shoes + 2}`],
      explanation: `Use the counting principle: ${shirts} \\cdot ${pants} \\cdot ${shoes} = ${shirts * pants * shoes} lunches.`,
      topics: ["combinatorics", "counting"],
      vocabTerms: [{ term: "Fundamental Counting Principle", definition: "A rule that says to multiply the choices for each step." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "two-digit-digit-count",
      prompt: `How many two-digit numbers have at least one digit that is a ${digit}?`,
      correctLabel: "18",
      distractors: ["17", "19", "10"],
      explanation: `There are $10$ two-digit numbers with tens digit ${digit}, from ${digit}0 to ${digit}9. There are $9$ two-digit numbers with ones digit ${digit}. The number ${digit}${digit} is in both groups, so subtract it once: $10 + 9 - 1 = 18$.`,
      topics: ["combinatorics", "digits"],
      vocabTerms: [{ term: "Overlap", definition: "The part that belongs to two groups at the same time." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "club-officers",
      prompt: "A club has $5$ students running for president, vice president, and secretary. One student cannot hold more than one office. How many different officer groups are possible?",
      correctLabel: `${arrangements}`,
      distractors: ["15", "20", "125"],
      explanation: `Order matters because the offices are different. There are $5$ choices for president, $4$ for vice president, and $3$ for secretary: $5 \\cdot 4 \\cdot 3 = ${arrangements}$.`,
      topics: ["combinatorics", "permutations"],
      vocabTerms: [{ term: "Permutation", definition: "An arrangement where order matters." }],
      gradeBand: "7-8"
    })
  ];
}

function makeProbabilityProblems(context: SummerContext): Problem[] {
  const red = 4 + context.cycle;
  const blue = 6 + context.cycle;
  const total = red + blue;
  const shadedAngle = 90 + 30 * context.cycle;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "die-even",
      prompt: "A fair six-sided die is rolled once. What is the probability of rolling an even number?",
      correctLabel: "$\\frac{1}{2}$",
      distractors: ["$\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{6}$"],
      explanation: `The even outcomes are $2$, $4$, and $6$, so there are $3$ favorable outcomes out of $6$. The probability is $\\frac{3}{6} = \\frac{1}{2}$.`,
      topics: ["probability", "simple probability"],
      vocabTerms: [{ term: "Favorable Outcome", definition: "An outcome that matches what you are trying to happen." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "spinner-angle",
      prompt: `A spinner has a shaded sector with central angle ${shadedAngle} degrees. What is the probability that the spinner lands in the shaded sector?`,
      correctLabel: `$\\frac{${shadedAngle}}{360}$`,
      distractors: [`$\\frac{${360 - shadedAngle}}{360}$`, `$\\frac{${shadedAngle}}{180}$`, `$\\frac{1}{${shadedAngle}}$`],
      explanation: `A full circle has $360^\\circ$. The probability is the shaded angle divided by $360^\\circ$: $\\frac{${shadedAngle}}{360}$.`,
      topics: ["probability", "geometry"],
      vocabTerms: [{ term: "Central Angle", definition: "An angle whose vertex is at the center of a circle." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "marbles-without-replacement",
      prompt: `A bag contains ${red} red marbles and ${blue} blue marbles. Two marbles are drawn without replacement. What is the probability that both are red?`,
      correctLabel: `$\\frac{${red * (red - 1)}}{${total * (total - 1)}}$`,
      distractors: [`$\\frac{${red}}{${total}}$`, `$\\frac{${red * red}}{${total * total}}$`, `$\\frac{${blue * (blue - 1)}}{${total * (total - 1)}}$`],
      explanation: `The first red has probability $\\frac{${red}}{${total}}$. Then ${red - 1} red marbles remain out of ${total - 1}. Multiply: $\\frac{${red}}{${total}} \\cdot \\frac{${red - 1}}{${total - 1}} = \\frac{${red * (red - 1)}}{${total * (total - 1)}}$.`,
      topics: ["probability", "dependent events"],
      vocabTerms: [{ term: "Without Replacement", definition: "Not putting an item back before the next draw." }],
      gradeBand: "7-8"
    })
  ];
}

function makeStatisticsProblems(context: SummerContext): Problem[] {
  const data = [8 + context.cycle, 10 + context.cycle, 12 + context.cycle, 16 + context.cycle, 19 + context.cycle];
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const testAverage = 82 + context.cycle;
  const homeworkAverage = 94 - context.cycle;
  const weighted = testAverage * 0.6 + homeworkAverage * 0.4;
  const targetAverage = 87 + context.cycle;
  const firstFourTotal = 83 + 90 + 85 + (86 + context.cycle);
  const needed = 5 * targetAverage - firstFourTotal;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "mean-data",
      prompt: `Find the mean of these numbers: ${data.join(", ")}.`,
      correctLabel: `${mean}`,
      distractors: [`${data[2]}`, `${data[data.length - 1] - data[0]}`, `${mean + 2}`],
      explanation: `Add the numbers to get ${mean * data.length}. Divide by ${data.length}: ${mean * data.length} \\div ${data.length} = ${mean}.`,
      topics: ["statistics", "mean"],
      vocabTerms: [{ term: "Mean", definition: "The average found by adding values and dividing by how many values there are." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "weighted-grade",
      prompt: `Tests count for $60\\%$ of a grade and homework counts for $40\\%$. If Jordan averages ${testAverage} on tests and ${homeworkAverage} on homework, what is the weighted mean grade?`,
      correctLabel: `${weighted}`,
      distractors: [`${(testAverage + homeworkAverage) / 2}`, `${testAverage}`, `${homeworkAverage}`],
      explanation: `Multiply each average by its weight: ${testAverage} \\cdot 0.60 = ${testAverage * 0.6}, and ${homeworkAverage} \\cdot 0.40 = ${homeworkAverage * 0.4}. Add them to get ${weighted}.`,
      topics: ["statistics", "weighted mean"],
      vocabTerms: [{ term: "Weighted Mean", definition: "An average where some values count more than others." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "missing-score",
      prompt: `A student wants an average of ${targetAverage} after $5$ quizzes. The first four scores are $83$, $90$, $85$, and $${86 + context.cycle}$. What score is needed on the fifth quiz?`,
      correctLabel: `${needed}`,
      distractors: [`${targetAverage}`, `${needed - 5}`, `${needed + 5}`],
      explanation: `An average of ${targetAverage} on $5$ quizzes needs a total of ${5 * targetAverage}. The first four total ${firstFourTotal}, so the fifth score must be ${5 * targetAverage} - ${firstFourTotal} = ${needed}.`,
      topics: ["statistics", "missing value"],
      vocabTerms: [{ term: "Total Needed", definition: "The sum required to reach a target average." }],
      gradeBand: "7-8"
    })
  ];
}

function makeCoordinateProblems(context: SummerContext): Problem[] {
  const startX = -5 - context.cycle;
  const startY = 3 + context.cycle;
  const dx = 7 + context.cycle;
  const dy = 5 + context.cycle;
  const newX = startX + dx;
  const newY = startY - dy;
  const squareSide = 3 + context.cycle;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "point-shift",
      prompt: `Point $P$ starts at $(${startX}, ${startY})$. It moves right ${dx} units and down ${dy} units. What are the new coordinates?`,
      correctLabel: `$(${newX}, ${newY})$`,
      distractors: [`$(${startX - dx}, ${startY + dy})$`, `$(${newX}, ${startY + dy})$`, `$(${startX - dx}, ${newY})$`],
      explanation: `Moving right adds to the $x$-coordinate: ${startX} + ${dx} = ${newX}. Moving down subtracts from the $y$-coordinate: ${startY} - ${dy} = ${newY}.`,
      topics: ["coordinate plane", "integers"],
      vocabTerms: [{ term: "Coordinate Pair", definition: "An ordered pair $(x,y)$ that names a point on a coordinate plane." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "coordinate-square",
      prompt: `A square has vertices $(-${squareSide}, -${squareSide})$, $(-${squareSide}, ${squareSide})$, $(${squareSide}, ${squareSide})$, and $(${squareSide}, -${squareSide})$. What is its area?`,
      correctLabel: `${(2 * squareSide) ** 2} square units`,
      distractors: [`${2 * squareSide} square units`, `${4 * squareSide} square units`, `${squareSide ** 2} square units`],
      explanation: `The side length goes from $-${squareSide}$ to ${squareSide}, so it is ${2 * squareSide} units. The area is ${2 * squareSide}^2 = ${(2 * squareSide) ** 2} square units.`,
      topics: ["coordinate plane", "area"],
      vocabTerms: [{ term: "Vertex", definition: "A corner point of a shape." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "coordinate-distance",
      prompt: `What is the distance between $(-${4 + context.cycle}, ${2 + context.cycle})$ and $(${5 + context.cycle}, ${2 + context.cycle})$ on the coordinate plane?`,
      correctLabel: `${9 + 2 * context.cycle} units`,
      distractors: [`${1} unit`, `${7 + context.cycle} units`, `${11 + 2 * context.cycle} units`],
      explanation: `The points have the same $y$-coordinate, so the distance is the horizontal difference: ${5 + context.cycle} - (-${4 + context.cycle}) = ${9 + 2 * context.cycle} units.`,
      topics: ["coordinate plane", "distance"],
      vocabTerms: [{ term: "Horizontal Distance", definition: "Distance measured left or right, using the $x$-coordinates." }],
      gradeBand: "7-8"
    })
  ];
}

function makeClockProblems(context: SummerContext): Problem[] {
  const gameMinutes = 95 + 10 * context.cycle;
  const leaveHour = 10 + context.cycle;
  const leaveMinute = 15;
  const arriveMinuteTotal = leaveHour * 60 + leaveMinute + 30 + gameMinutes;
  const slowLoss = 10 + 5 * context.cycle;
  const realHoursForClockTwoHours = 120 / (60 - slowLoss);
  const realMinutesForClockTwoHours = realHoursForClockTwoHours * 60;
  const days = 365;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "elapsed-time",
      prompt: `A team leaves at ${leaveHour}:${leaveMinute.toString().padStart(2, "0")} A.M., drives for $30$ minutes, and then plays a game that lasts ${gameMinutes} minutes. What time is it when the game ends?`,
      correctLabel: formatTime(arriveMinuteTotal),
      distractors: [formatTime(arriveMinuteTotal - 30), formatTime(arriveMinuteTotal + 30), formatTime(arriveMinuteTotal - gameMinutes)],
      explanation: `The total elapsed time is $30 + ${gameMinutes} = ${30 + gameMinutes}$ minutes. Adding that to ${leaveHour}:${leaveMinute.toString().padStart(2, "0")} A.M. gives ${formatTime(arriveMinuteTotal)}.`,
      topics: ["time", "elapsed time"],
      vocabTerms: [{ term: "Elapsed Time", definition: "The amount of time that passes between two moments." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "slow-clock",
      prompt: `A slow clock loses ${slowLoss} minutes every real hour. It is set correctly at $6{:}00$ A.M. What is the real time when the slow clock first shows $8{:}00$ A.M.?`,
      correctLabel: formatTime(6 * 60 + realMinutesForClockTwoHours),
      distractors: [formatTime(8 * 60), formatTime(6 * 60 + 120 + slowLoss), formatTime(6 * 60 + 120 - slowLoss)],
      explanation: `In each real hour the slow clock shows ${60 - slowLoss} minutes passing. To show $120$ clock minutes, it needs $120 \\div ${60 - slowLoss} = ${realHoursForClockTwoHours}$ real hours, or ${realMinutesForClockTwoHours} minutes after $6{:}00$ A.M.`,
      topics: ["rates", "time"],
      vocabTerms: [{ term: "Clock Rate", definition: "How fast a clock measures time compared with real time." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "calendar-day",
      prompt: `January $1$ of a non-leap year is a Monday. What day of the week is January $1$ of the next year?`,
      correctLabel: "Tuesday",
      distractors: ["Monday", "Wednesday", "Sunday"],
      explanation: `A non-leap year has ${days} days. Since ${days} leaves remainder $1$ when divided by $7$, the next January $1$ is one weekday later: Tuesday.`,
      topics: ["calendar math", "remainders"],
      vocabTerms: [{ term: "Remainder", definition: "What is left after dividing into equal groups." }],
      gradeBand: "7-8"
    })
  ];
}

function makeSequenceProblems(context: SummerContext): Problem[] {
  const step = 10 + context.cycle;
  const stars = 3 * step + 2;
  const average = 35 + 2 * context.cycle;
  const firstOdd = average - 6;
  const first = 4 + context.cycle;
  const difference = 3 + context.cycle;
  const term = first + 11 * difference;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "linear-pattern",
      prompt: `A pattern has $5$ stars in step $1$, $8$ stars in step $2$, and $11$ stars in step $3$. If the pattern continues, how many stars are in step ${step}?`,
      correctLabel: `${stars}`,
      distractors: [`${stars - 3}`, `${stars + 3}`, `${5 * step}`],
      explanation: `The pattern increases by $3$ each step. A rule is $3n + 2$, so step ${step} has $3(${step}) + 2 = ${stars}$ stars.`,
      topics: ["patterns", "sequences"],
      vocabTerms: [{ term: "Sequence", definition: "A list of numbers or objects that follows a pattern." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "consecutive-odds",
      prompt: `Seven consecutive odd numbers have an average of ${average}. What is the smallest of the seven numbers?`,
      correctLabel: `${firstOdd}`,
      distractors: [`${average}`, `${firstOdd - 2}`, `${firstOdd + 2}`],
      explanation: `For seven consecutive odd numbers, the average is the middle number. The smallest is three odd steps below ${average}: ${average} - 6 = ${firstOdd}.`,
      topics: ["number patterns", "averages"],
      vocabTerms: [{ term: "Consecutive Odd Numbers", definition: "Odd numbers that follow one another, each $2$ apart." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "arithmetic-sequence",
      prompt: `An arithmetic sequence starts at ${first} and adds ${difference} each time. What is the $12$th term?`,
      correctLabel: `${term}`,
      distractors: [`${first + 12 * difference}`, `${term - difference}`, `${term + difference}`],
      explanation: `The $12$th term is $11$ jumps after the first term: ${first} + 11 \\cdot ${difference} = ${term}.`,
      topics: ["sequences", "arithmetic sequence"],
      vocabTerms: [{ term: "Arithmetic Sequence", definition: "A sequence that changes by the same amount each step." }],
      gradeBand: "7-8"
    })
  ];
}

function makeMoneyProblems(context: SummerContext): Problem[] {
  const quarters = 7 + context.cycle;
  const dimes = 4 + context.cycle;
  const totalCents = 25 * quarters + 10 * dimes;
  const adult = 8 + context.cycle;
  const child = 5 + context.cycle;
  const ticketTotal = 3 * adult + 4 * child;
  const cork = 2 + context.cycle;
  const bottleTotal = 2 * cork + 30;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "coins-total",
      prompt: `A jar has ${quarters} quarters and ${dimes} dimes. How much money is in the jar?`,
      correctLabel: dollars(totalCents / 100),
      distractors: [dollars((totalCents + 25) / 100), dollars((totalCents - 10) / 100), dollars((quarters + dimes) / 100)],
      explanation: `${quarters} quarters are worth ${quarters} \\cdot 25 = ${25 * quarters} cents. ${dimes} dimes are worth ${dimes} \\cdot 10 = ${10 * dimes} cents. The total is ${totalCents} cents, or ${dollars(totalCents / 100)}.`,
      topics: ["money", "coins"],
      vocabTerms: [{ term: "Cent", definition: "One hundredth of a dollar." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "ticket-revenue",
      prompt: `A theater sells adult tickets for ${dollars(adult)} and child tickets for ${dollars(child)}. If it sells $3$ adult tickets and $4$ child tickets, how much money does it collect?`,
      correctLabel: dollars(ticketTotal),
      distractors: [dollars(7 * adult), dollars(ticketTotal - child), dollars(ticketTotal + adult)],
      explanation: `Adult tickets bring in $3 \\cdot ${dollars(adult)} = ${dollars(3 * adult)}$. Child tickets bring in $4 \\cdot ${dollars(child)} = ${dollars(4 * child)}$. Total: ${dollars(ticketTotal)}.`,
      topics: ["money", "expressions"],
      vocabTerms: [{ term: "Revenue", definition: "Money collected from sales." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "bottle-cork",
      prompt: `A bottle and cork together cost ${dollars(bottleTotal)}. The bottle costs exactly ${dollars(30)} more than the cork. How much does the cork cost?`,
      correctLabel: dollars(cork),
      distractors: [dollars(bottleTotal - 30), dollars((bottleTotal - 30) / 2 + 1), dollars(30)],
      explanation: `If the cork costs $c$, the bottle costs $c + 30$. Together: $2c + 30 = ${bottleTotal}$. So $2c = ${bottleTotal - 30}$ and $c = ${cork}$.`,
      topics: ["algebra", "money"],
      vocabTerms: [{ term: "Difference", definition: "The amount by which one number is greater than another." }],
      gradeBand: "7-8"
    })
  ];
}

function makeRatioProblems(context: SummerContext): Problem[] {
  const taller = 54 + 6 * context.cycle;
  const shorter = taller * 2 / 3;
  const mapInches = 3 + context.cycle;
  const miles = mapInches * 12;
  const smallSide = 5 + context.cycle;
  const largeSide = smallSide * 3;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "building-ratio",
      prompt: `The heights of two buildings are in the ratio $3:2$. If the taller building is ${taller} feet tall, how tall is the shorter building?`,
      correctLabel: `${shorter} feet`,
      distractors: [`${taller + shorter} feet`, `${taller - shorter} feet`, `${taller * 2} feet`],
      explanation: `The taller building represents $3$ parts, so one part is ${taller} \\div 3 = ${taller / 3}. The shorter building is $2$ parts: ${taller / 3} \\cdot 2 = ${shorter} feet.`,
      topics: ["ratios", "proportions"],
      vocabTerms: [{ term: "Ratio", definition: "A comparison of two quantities." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "map-scale",
      prompt: `On a map, $1$ inch represents $12$ miles. Two towns are ${mapInches} inches apart on the map. How far apart are the towns in real life?`,
      correctLabel: `${miles} miles`,
      distractors: [`${mapInches + 12} miles`, `${miles / 2} miles`, `${miles + 12} miles`],
      explanation: `Multiply the map distance by the scale: ${mapInches} \\cdot 12 = ${miles} miles.`,
      topics: ["ratios", "scale"],
      vocabTerms: [{ term: "Scale", definition: "A ratio that compares a model or map to the real object or distance." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "similar-triangles",
      prompt: `Two similar triangles have matching side lengths ${smallSide} cm and ${largeSide} cm. If another side of the smaller triangle is $7$ cm, what is the matching side of the larger triangle?`,
      correctLabel: "21 cm",
      distractors: ["14 cm", "15 cm", "35 cm"],
      explanation: `The scale factor from the smaller triangle to the larger one is ${largeSide} \\div ${smallSide} = 3. Multiply the matching side: $7 \\cdot 3 = 21$ cm.`,
      topics: ["geometry", "similar figures"],
      vocabTerms: [{ term: "Scale Factor", definition: "The number used to multiply side lengths from one similar figure to another." }],
      gradeBand: "7-8"
    })
  ];
}

function makeIntegerProblems(context: SummerContext): Problem[] {
  const positive = 45 + 5 * context.cycle;
  const negative = -61 - 3 * context.cycle;
  const distance = positive - negative;
  const low = 2 + context.cycle;
  const high = 5 + context.cycle;
  const integerCount = high + low + 1;
  const x = 4 + context.cycle;
  const y = -3 - context.cycle;
  const value = 2 * x - 3 * y;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "number-line-distance",
      prompt: `What is the distance on a number line between ${negative} and ${positive}?`,
      correctLabel: `${distance}`,
      distractors: [`${Math.abs(positive + negative)}`, `${distance - 10}`, `${distance + 10}`],
      explanation: `Distance is positive. Subtract the smaller value from the larger value: ${positive} - (${negative}) = ${distance}.`,
      topics: ["integers", "number line"],
      vocabTerms: [{ term: "Absolute Distance", definition: "The positive distance between two points on a number line." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "square-root-integers",
      prompt: `How many integers are between $-\\sqrt{${low * low + 1}}$ and $\\sqrt{${high * high + high}}$?`,
      correctLabel: `${integerCount}`,
      distractors: [`${integerCount - 1}`, `${integerCount + 1}`, `${high - low}`],
      explanation: `$-\\sqrt{${low * low + 1}}$ is between $-${low + 1}$ and $-${low}$, and $\\sqrt{${high * high + high}}$ is between ${high} and ${high + 1}. The integers from $-${low}$ through ${high} are ${integerCount} integers.`,
      topics: ["square roots", "integers"],
      vocabTerms: [{ term: "Square Root", definition: "A number that gives a target value when multiplied by itself." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "evaluate-expression",
      prompt: `If $x=${x}$ and $y=${y}$, what is the value of $2x - 3y$?`,
      correctLabel: `${value}`,
      distractors: [`${2 * x + 3 * y}`, `${value - 6}`, `${value + y}`],
      explanation: `Substitute the values: $2(${x}) - 3(${y}) = ${2 * x} - (${3 * y}) = ${value}$.`,
      topics: ["pre-algebra", "substitution"],
      vocabTerms: [{ term: "Substitution", definition: "Replacing a variable with its given value." }],
      gradeBand: "7-8"
    })
  ];
}

function makeLogicProblems(context: SummerContext): Problem[] {
  const totalStudents = 30 + 2 * context.cycle;
  const runners = 16 + context.cycle;
  const basketball = 12 + context.cycle;
  const both = 5 + context.cycle;
  const neither = totalStudents - (runners + basketball - both);
  const switches = 100;
  const onCount = 50 + 33 - 2 * 16;
  const colors = 2;
  const slots = 5 + context.cycle;

  return [
    makeSummerProblem({
      context,
      difficulty: "easy",
      slug: "venn-neither",
      prompt: `In a class of ${totalStudents} students, ${runners} run track, ${basketball} play basketball, and ${both} do both. How many students do neither activity?`,
      correctLabel: `${neither}`,
      distractors: [`${both}`, `${totalStudents - runners - basketball}`, `${runners + basketball - both}`],
      explanation: `Students in at least one activity: ${runners} + ${basketball} - ${both} = ${runners + basketball - both}. Students in neither: ${totalStudents} - ${runners + basketball - both} = ${neither}.`,
      topics: ["logic", "venn diagram"],
      vocabTerms: [{ term: "Venn Diagram", definition: "A diagram with overlapping circles that shows how groups are related." }],
      gradeBand: "6"
    }),
    makeSummerProblem({
      context,
      difficulty: "medium",
      slug: "switches",
      prompt: `There are ${switches} switches, all off. Every second switch is turned on. Then every third switch is changed to the opposite position. How many switches are on?`,
      correctLabel: `${onCount}`,
      distractors: ["50", "67", "83"],
      explanation: `There are $50$ multiples of $2$ and $33$ multiples of $3$. The $16$ multiples of $6$ were turned on, then back off. On switches: $50 + 33 - 2\\cdot16 = ${onCount}$.`,
      topics: ["logic", "multiples"],
      vocabTerms: [{ term: "Multiple", definition: "The result of multiplying a number by a whole number." }],
      gradeBand: "6-7"
    }),
    makeSummerProblem({
      context,
      difficulty: "stretch",
      slug: "binary-lockers",
      prompt: `A locker code uses ${slots} squares. Each square can be black or white. How many different locker codes are possible?`,
      correctLabel: `${colors ** slots}`,
      distractors: [`${colors * slots}`, `${slots ** 2}`, `${colors ** slots - 2}`],
      explanation: `Each of the ${slots} squares has $2$ choices. By the counting principle, there are $2^${slots} = ${colors ** slots}$ possible codes.`,
      topics: ["logic", "counting"],
      vocabTerms: [{ term: "Binary Choice", definition: "A choice with exactly two options." }],
      gradeBand: "7-8"
    })
  ];
}

function leastCommonMultiple(a: number, b: number): number {
  return Math.abs(a * b) / greatestCommonFactor(a, b);
}

function greatestCommonFactor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y !== 0) {
    [x, y] = [y, x % y];
  }

  return x;
}

function primeFactorLabel(value: number): string {
  let remaining = value;
  const factors: Record<number, number> = {};

  for (let factor = 2; factor <= remaining; factor += 1) {
    while (remaining % factor === 0) {
      factors[factor] = (factors[factor] ?? 0) + 1;
      remaining /= factor;
    }
  }

  const label = Object.entries(factors)
    .map(([factor, exponent]) => exponent === 1 ? factor : `${factor}^${exponent}`)
    .join(" \\cdot ");

  return `$${label}$`;
}

function formatTime(totalMinutes: number): string {
  const roundedMinutes = Math.round(totalMinutes);
  const hour24 = Math.floor(roundedMinutes / 60);
  const minute = roundedMinutes % 60;
  const period = hour24 >= 12 ? "P.M." : "A.M.";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}
