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
    prompt: "If $5$ pounds of apples cost $12.50$, what is the cost of $8$ pounds of apples?",
    choices: [
      { id: "A", label: "$15.00" },
      { id: "B", label: "$18.00" },
      { id: "C", label: "$20.00" },
      { id: "D", label: "$22.50" }
    ],
    correctChoiceId: "C",
    explanation: "First find the price for $1$ pound: $12.50 \\div 5 = 2.50$. Then multiply by $8$: $8 \\cdot 2.50 = 20.00$.",
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
    prompt: "A jacket costs $150$ before a sale. It is $20\\%$ off, and then a coupon takes another $10\\%$ off the sale price. What is the final price before tax?",
    choices: [
      { id: "A", label: "$105" },
      { id: "B", label: "$108" },
      { id: "C", label: "$110" },
      { id: "D", label: "$120" }
    ],
    correctChoiceId: "B",
    explanation: "The first discount leaves $80\\%$ of the price: $150 \\cdot 0.80 = 120$. The coupon takes $10\\%$ off that sale price, so $120 \\cdot 0.90 = 108$.",
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
