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
    explanation: "$90 = 9 \\cdot 10 = 3^2 \\cdot 2 \\cdot 5 = 2 \\cdot 3^2 \\cdot 5$.",
    difficulty: "easy",
    topics: ["number theory", "prime factorization"],
    vocabTerms: [
      {
        term: "Prime Factorization",
        definition: "Breaking down a composite number into a product of prime numbers."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-gcf-bins",
    scheduledDate: "2026-06-28",
    prompt: "A teacher has $48$ rulers and $60$ pairs of scissors. She wants to divide them into identical supply bins with no items left over. What is the maximum number of bins she can make?",
    choices: [
      { id: "A", label: "6" },
      { id: "B", label: "12" },
      { id: "C", label: "24" },
      { id: "D", label: "120" }
    ],
    correctChoiceId: "B",
    explanation: "The problem asks for the greatest common factor (GCF) of $48$ and $60$. Factors of $48$: $1,2,3,4,6,8,12,16,24,48$. Factors of $60$: $1,2,3,4,5,6,10,12,15,20,30,60$. The largest shared factor is $12$.",
    difficulty: "medium",
    topics: ["number theory", "gcf"],
    vocabTerms: [
      {
        term: "Greatest Common Factor",
        definition: "The largest whole number that divides evenly into two or more numbers.",
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
    prompt: "Simplify the following expression to a single power: $\\frac{2^5 \\cdot 4^3}{8^2}$.",
    choices: [
      { id: "A", label: "$2^3$" },
      { id: "B", label: "$2^5$" },
      { id: "C", label: "$2^{11}$" },
      { id: "D", label: "$4^2$" }
    ],
    correctChoiceId: "B",
    explanation: "Convert all terms to base 2: $4^3 = (2^2)^3 = 2^6$, and $8^2 = (2^3)^2 = 2^6$. The expression becomes $\\frac{2^5 \\cdot 2^6}{2^6} = 2^5$.",
    difficulty: "stretch",
    topics: ["number theory", "exponents"],
    vocabTerms: [
      {
        term: "Exponent",
        definition: "A number representing how many times the base is multiplied by itself."
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
    explanation: "The unit rate is $12.50 \\div 5 = $2.50$ per pound. For $8$ pounds: $8 \\cdot 2.50 = $20.00$.",
    difficulty: "easy",
    topics: ["proportional reasoning", "unit rate"],
    vocabTerms: [
      {
        term: "Unit Rate",
        definition: "A rate comparing an amount to exactly one unit of another quantity."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-train-travel-time",
    scheduledDate: "2026-06-29",
    prompt: "A train travels at a constant speed of $75$ miles per hour. How many minutes will it take to travel $45$ miles?",
    choices: [
      { id: "A", label: "30 minutes" },
      { id: "B", label: "36 minutes" },
      { id: "C", label: "40 minutes" },
      { id: "D", label: "45 minutes" }
    ],
    correctChoiceId: "B",
    explanation: "$\\text{Time} = \\frac{\\text{Distance}}{\\text{Speed}} = \\frac{45}{75} = \\frac{3}{5}$ of an hour. Convert to minutes: $\\frac{3}{5} \\cdot 60 = 36$ minutes.",
    difficulty: "medium",
    topics: ["proportional reasoning", "speed"],
    vocabTerms: [
      {
        term: "Constant Speed",
        definition: "Speed that does not change over time."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-jacket-discounts",
    scheduledDate: "2026-06-29",
    prompt: "A jacket is on sale for $20\\%$ off its original price of $150$. At the cash register, an additional coupon of $10\\%$ off the sale price is applied. What is the final price before tax?",
    choices: [
      { id: "A", label: "$105" },
      { id: "B", label: "$108" },
      { id: "C", label: "$110" },
      { id: "D", label: "$120" }
    ],
    correctChoiceId: "B",
    explanation: "First discount: $150 \\cdot (1 - 0.20) = 150 \\cdot 0.80 = 120$. Second discount: $120 \\cdot (1 - 0.10) = 120 \\cdot 0.90 = 108$.",
    difficulty: "stretch",
    topics: ["proportional reasoning", "percent"],
    vocabTerms: [
      {
        term: "Discount",
        definition: "A reduction in the original selling price of an item."
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
    prompt: "Point $P$ starts at $(-3, 4)$ on the coordinate plane. If it is shifted down $6$ units and right $5$ units, what are its new coordinates?",
    choices: [
      { id: "A", label: "$(2, -2)$" },
      { id: "B", label: "$(-8, 9)$" },
      { id: "C", label: "$(2, 10)$" },
      { id: "D", label: "$(-2, -2)$" }
    ],
    correctChoiceId: "A",
    explanation: "New x-coordinate: $-3 + 5 = 2$. New y-coordinate: $4 - 6 = -2$. The point becomes $(2, -2)$.",
    difficulty: "easy",
    topics: ["pre-algebra", "coordinate plane"],
    vocabTerms: [
      {
        term: "Coordinate Plane",
        definition: "A two-dimensional grid formed by the intersection of a horizontal x-axis and vertical y-axis."
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
        definition: "An algebraic equation where each term is either a constant or a variable raised to the first power."
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
    explanation: "Subtract $7$ from both sides: $-3x < 15$. Divide by $-3$ and flip the inequality sign: $x > -5$.",
    difficulty: "stretch",
    topics: ["pre-algebra", "inequalities"],
    vocabTerms: [
      {
        term: "Inequality",
        definition: "A mathematical statement comparing two quantities that are not necessarily equal using signs like < or >."
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
    prompt: "Which of the following groups of lengths can form a valid triangle?",
    choices: [
      { id: "A", label: "2 cm, 3 cm, 6 cm" },
      { id: "B", label: "4 cm, 4 cm, 9 cm" },
      { id: "C", label: "5 cm, 7 cm, 11 cm" },
      { id: "D", label: "3 cm, 8 cm, 12 cm" }
    ],
    correctChoiceId: "C",
    explanation: "By the Triangle Inequality Theorem, the sum of any two sides must be greater than the third side. $5 + 7 = 12 > 11$, which passes.",
    difficulty: "easy",
    topics: ["geometry", "triangle inequality"],
    vocabTerms: [
      {
        term: "Triangle Inequality Theorem",
        definition: "A rule stating that the sum of the lengths of any two sides of a triangle must be strictly greater than the length of the remaining side."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-composite-shape-area",
    scheduledDate: "2026-07-01",
    prompt: "A shape is composed of a rectangle with a length of $10$ cm and width of $6$ cm, with a right triangle attached to its side. The right triangle has a base of $4$ cm along the width of the rectangle ($6$ cm). What is the total area of this composite shape?",
    choices: [
      { id: "A", label: "68 sq cm" },
      { id: "B", label: "72 sq cm" },
      { id: "C", label: "84 sq cm" },
      { id: "D", label: "120 sq cm" }
    ],
    correctChoiceId: "B",
    explanation: "Area of the rectangle: $10 \\cdot 6 = 60$ sq cm. Area of the triangle: $\\frac{1}{2} \\cdot 4 \\cdot 6 = 12$ sq cm. Total area: $60 + 12 = 72$ sq cm.",
    difficulty: "medium",
    topics: ["geometry", "area"],
    vocabTerms: [
      {
        term: "Composite Shape",
        definition: "A figure made up of two or more simpler geometric structures."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-prism-sa-calc",
    scheduledDate: "2026-07-01",
    prompt: "A rectangular prism has a length of $5$ cm, a width of $4$ cm, and a height of $8$ cm. What is its total surface area?",
    choices: [
      { id: "A", label: "120 sq cm" },
      { id: "B", label: "160 sq cm" },
      { id: "C", label: "184 sq cm" },
      { id: "D", label: "200 sq cm" }
    ],
    correctChoiceId: "C",
    explanation: "Surface area formula: $2(lw + lh + wh) = 2(5\\cdot4 + 5\\cdot8 + 4\\cdot8) = 2(20 + 40 + 32) = 2(92) = 184$ sq cm.",
    difficulty: "stretch",
    topics: ["geometry", "surface area"],
    vocabTerms: [
      {
        term: "Surface Area",
        definition: "The total area of all external faces belonging to a three-dimensional solid."
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
    prompt: "Sam is choosing an outfit. He has $4$ different shirts, $3$ pairs of pants, and $2$ pairs of shoes. How many unique outfit combinations can he create?",
    choices: [
      { id: "A", label: "9" },
      { id: "B", label: "12" },
      { id: "C", label: "18" },
      { id: "D", label: "24" }
    ],
    correctChoiceId: "D",
    explanation: "By the Fundamental Counting Principle, multiply the choice options together: $4 \\cdot 3 \\cdot 2 = 24$.",
    difficulty: "easy",
    topics: ["combinatorics", "counting"],
    vocabTerms: [
      {
        term: "Fundamental Counting Principle",
        definition: "A method using multiplication to find the total number of outcomes when combining multiple independent choices."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-sports-venn",
    scheduledDate: "2026-07-02",
    prompt: "In a class of $30$ students, $17$ track students run cross country, $13$ play basketball, and $5$ participate in both sports. How many students participate in neither sport?",
    choices: [
      { id: "A", label: "0" },
      { id: "B", label: "5" },
      { id: "C", label: "10" },
      { id: "D", label: "25" }
    ],
    correctChoiceId: "B",
    explanation: "Total unique student athletes = $(\\text{Country only}) + (\\text{Basketball only}) + (\\text{Both}) = (17 - 5) + (13 - 5) + 5 = 12 + 8 + 5 = 25$. Non-athletes: $30 - 25 = 5$.",
    difficulty: "medium",
    topics: ["logic", "venn diagram"],
    vocabTerms: [
      {
        term: "Venn Diagram",
        definition: "An overlapping circle graphic showing logical relationships and shared elements among distinct sets."
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-word-permutations",
    scheduledDate: "2026-07-02",
    prompt: "How many unique 4-letter arrangements can be made using the letters from the word $MATH$ if no letters are repeated?",
    choices: [
      { id: "A", label: "16" },
      { id: "B", label: "24" },
      { id: "C", label: "48" },
      { id: "D", label: "256" }
    ],
    correctChoiceId: "B",
    explanation: "This is a permutation of $4$ unique items: $4! = 4 \\cdot 3 \\cdot 2 \\cdot 1 = 24$.",
    difficulty: "stretch",
    topics: ["combinatorics", "permutations"],
    vocabTerms: [
      {
        term: "Permutation",
        definition: "An ordered arrangement of elements where the specific sequential position matters."
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
    prompt: "A fair 6-sided die is rolled, and a standard coin is flipped. What is the probability of rolling a $4$ and flipping heads?",
    choices: [
      { id: "A", label: "$\\frac{1}{12}$" },
      { id: "B", label: "$\\frac{1}{8}$" },
      { id: "C", label: "$\\frac{1}{4}$" },
      { id: "D", label: "$\\frac{2}{3}$" }
    ],
    correctChoiceId: "A",
    explanation: "The events are independent. $P(4) = \\frac{1}{6}$ and $P(\\text{heads}) = \\frac{1}{2}$. Combined probability: $\\frac{1}{6} \\cdot \\frac{1}{2} = \\frac{1}{12}$.",
    difficulty: "easy",
    topics: ["probability", "independent events"],
    vocabTerms: [
      {
        term: "Independent Events",
        definition: "Events where the outcome of the first event has no impact on the probability of the second event occurring."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-grade-weighted-mean",
    scheduledDate: "2026-07-03",
    prompt: "In a science course, tests are worth $60\\%$ of the grade and homework is worth $40\\%$. Alex scores an average of $80$ on his tests and $95$ on his homework assignments. What is his final weighted mean grade?",
    choices: [
      { id: "A", label: "86" },
      { id: "B", label: "87.5" },
      { id: "C", label: "89" },
      { id: "D", label: "90" }
    ],
    correctChoiceId: "A",
    explanation: "Weighted Mean = $(80 \\cdot 0.60) + (95 \\cdot 0.40) = 48 + 38 = 86$.",
    difficulty: "medium",
    topics: ["statistics", "weighted mean"],
    vocabTerms: [
      {
        term: "Weighted Mean",
        definition: "An average calculated by multiplying each value by a specific weight coefficient reflecting its relative importance."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-dependent-tokens",
    scheduledDate: "2026-07-03",
    prompt: "A box contains $5$ red tokens and $5$ blue tokens. Two tokens are drawn sequentially without replacement. What is the probability that both tokens drawn are red?",
    choices: [
      { id: "A", label: "$\\frac{1}{4}$" },
      { id: "B", label: "$\\frac{2}{9}$" },
      { id: "C", label: "$\\frac{1}{2}$" },
      { id: "D", label: "$\\frac{5}{18}$" }
    ],
    correctChoiceId: "B",
    explanation: "First pull: $P(\\text{Red}) = \\frac{5}{10} = \\frac{1}{2}$. Second pull (dependent, 9 remaining): $P(\\text{Red}) = \\frac{4}{9}$. Final probability: $\\frac{1}{2} \\cdot \\frac{4}{9} = \\frac{4}{18} = \\frac{2}{9}$.",
    difficulty: "stretch",
    topics: ["probability", "dependent events"],
    vocabTerms: [
      {
        term: "Dependent Events",
        definition: "Events where the outcome of the initial action alters the sample space and conditional probability of successive actions."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  }
];
