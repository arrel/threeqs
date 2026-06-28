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
  {
    id: "easy-percent-24",
    prompt: "A team solves $18$ out of $24$ practice problems. What percent did the team solve?",
    choices: [
      { id: "A", label: "60%" },
      { id: "B", label: "70%" },
      { id: "C", label: "75%" },
      { id: "D", label: "80%" }
    ],
    correctChoiceId: "C",
    explanation: "$18 \\div 24 = 0.75$, so the team solved $75\\%$ of the problems.",
    difficulty: "easy",
    topics: ["percent", "fractions"],
    vocabTerms: [
      {
        term: "Percent",
        definition: "A number out of 100. For example, 75% means 75 out of every 100."
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "easy-mean-scores",
    prompt: "The scores $7$, $10$, $9$, and $14$ are averaged. What is the mean?",
    choices: [
      { id: "A", label: "9" },
      { id: "B", label: "10" },
      { id: "C", label: "11" },
      { id: "D", label: "12" }
    ],
    correctChoiceId: "B",
    explanation: "The sum is $7+10+9+14=40$. Divide by $4$ scores to get $10$.",
    difficulty: "easy",
    topics: ["statistics", "mean"],
    vocabTerms: [
      {
        term: "Mean",
        definition: "The average. Add all the values, then divide by how many values there are.",
        aliases: ["average", "averaged"]
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "easy-ratio-tiles",
    prompt: "A pattern uses $3$ red tiles for every $5$ blue tiles. If there are $64$ tiles total, how many are red?",
    choices: [
      { id: "A", label: "21" },
      { id: "B", label: "24" },
      { id: "C", label: "32" },
      { id: "D", label: "40" }
    ],
    correctChoiceId: "B",
    explanation: "There are $3+5=8$ equal parts. $64 \\div 8=8$, and $3$ red parts make $3\\cdot8=24$ red tiles.",
    difficulty: "easy",
    topics: ["ratios"],
    vocabTerms: [
      {
        term: "Ratio",
        definition: "A comparison of two amounts. A 3 to 5 ratio means 3 parts of one thing for every 5 parts of another.",
        aliases: ["for every"]
      }
    ],
    gradeBand: "6",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "easy-rectangle-perimeter",
    prompt: "A rectangle has length $13$ cm and width $8$ cm. What is its perimeter?",
    choices: [
      { id: "A", label: "21 cm" },
      { id: "B", label: "34 cm" },
      { id: "C", label: "42 cm" },
      { id: "D", label: "104 cm" }
    ],
    correctChoiceId: "C",
    explanation: "Perimeter is $2(13+8)=2\\cdot21=42$ cm.",
    difficulty: "easy",
    topics: ["geometry", "perimeter"],
    vocabTerms: [
      {
        term: "Perimeter",
        definition: "The distance all the way around the outside of a shape."
      }
    ],
    gradeBand: "6",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-equation-parentheses",
    prompt: "Solve for $x$: $3(x+4)=57$.",
    choices: [
      { id: "A", label: "11" },
      { id: "B", label: "15" },
      { id: "C", label: "17" },
      { id: "D", label: "23" }
    ],
    correctChoiceId: "B",
    explanation: "Divide by $3$ to get $x+4=19$, so $x=15$.",
    difficulty: "medium",
    topics: ["algebra", "equations"],
    vocabTerms: [
      {
        term: "Equation",
        definition: "A math sentence with an equals sign showing that two expressions have the same value."
      },
      {
        term: "Variable",
        definition: "A letter or symbol that stands for a number you do not know yet.",
        aliases: ["solve"]
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-probability-bag",
    prompt: "A bag has $4$ red, $5$ blue, and $3$ green marbles. What is the probability of choosing a marble that is not blue?",
    choices: [
      { id: "A", label: "$\\frac{5}{12}$" },
      { id: "B", label: "$\\frac{7}{12}$" },
      { id: "C", label: "$\\frac{2}{3}$" },
      { id: "D", label: "$\\frac{7}{5}$" }
    ],
    correctChoiceId: "B",
    explanation: "There are $12$ marbles total. Not blue means red or green: $4+3=7$, so the probability is $\\frac{7}{12}$.",
    difficulty: "medium",
    topics: ["probability", "fractions"],
    vocabTerms: [
      {
        term: "Probability",
        definition: "The chance that something will happen. It is often written as a fraction, decimal, or percent."
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "medium-lcm-buses",
    prompt: "Two shuttles leave together at 8:00. One leaves every $12$ minutes and the other every $18$ minutes. When do they next leave together?",
    choices: [
      { id: "A", label: "8:24" },
      { id: "B", label: "8:30" },
      { id: "C", label: "8:36" },
      { id: "D", label: "8:48" }
    ],
    correctChoiceId: "C",
    explanation: "The least common multiple of $12$ and $18$ is $36$, so they next leave together $36$ minutes after 8:00.",
    difficulty: "medium",
    topics: ["number theory", "lcm"],
    vocabTerms: [
      {
        term: "Least Common Multiple",
        definition: "The smallest number that is a multiple of each number in a set.",
        aliases: ["lcm"]
      },
      {
        term: "Multiple",
        definition: "A number you get by multiplying by a whole number. 36 is a multiple of 12 because 12 times 3 is 36."
      }
    ],
    gradeBand: "6-7",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "medium-trapezoid-area",
    prompt: "A trapezoid has bases $9$ cm and $15$ cm, and height $6$ cm. What is its area?",
    choices: [
      { id: "A", label: "54 sq cm" },
      { id: "B", label: "72 sq cm" },
      { id: "C", label: "90 sq cm" },
      { id: "D", label: "144 sq cm" }
    ],
    correctChoiceId: "B",
    explanation: "Area is $\\frac{1}{2}(9+15)\\cdot6=\\frac{1}{2}\\cdot24\\cdot6=72$ square centimeters.",
    difficulty: "medium",
    topics: ["geometry", "area"],
    vocabTerms: [
      {
        term: "Trapezoid",
        definition: "A four-sided shape with at least one pair of parallel sides."
      },
      {
        term: "Base",
        definition: "A side of a shape that is used as the bottom or reference side for measuring height.",
        aliases: ["bases"]
      },
      {
        term: "Height",
        definition: "The straight-up-and-down distance from a base to the opposite side."
      },
      {
        term: "Area",
        definition: "The amount of flat space inside a shape."
      }
    ],
    gradeBand: "6-7",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-remainders",
    prompt: "What is the smallest positive integer that leaves a remainder of $2$ when divided by $5$ and a remainder of $3$ when divided by $7$?",
    choices: [
      { id: "A", label: "12" },
      { id: "B", label: "17" },
      { id: "C", label: "22" },
      { id: "D", label: "27" }
    ],
    correctChoiceId: "B",
    explanation: "Check numbers that are $2$ more than a multiple of $5$: $2, 7, 12, 17$. The first one with remainder $3$ after division by $7$ is $17$.",
    difficulty: "stretch",
    topics: ["number theory", "remainders"],
    vocabTerms: [
      {
        term: "Remainder",
        definition: "The amount left over after sharing or dividing into equal groups."
      },
      {
        term: "Positive Integer",
        definition: "A whole number greater than zero, such as 1, 2, 3, and so on.",
        aliases: ["positive integer"]
      }
    ],
    gradeBand: "7-8",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-consecutive-even",
    prompt: "Three consecutive even integers have a sum of $126$. What is the largest of the three integers?",
    choices: [
      { id: "A", label: "40" },
      { id: "B", label: "42" },
      { id: "C", label: "44" },
      { id: "D", label: "46" }
    ],
    correctChoiceId: "C",
    explanation: "The middle number is $126 \\div 3=42$. The consecutive even integers are $40$, $42$, and $44$.",
    difficulty: "stretch",
    topics: ["algebra", "integer reasoning"],
    vocabTerms: [
      {
        term: "Consecutive",
        definition: "Coming one right after another with no gaps."
      },
      {
        term: "Even Integer",
        definition: "A whole number that can be divided by 2 with no remainder.",
        aliases: ["even integers", "integer", "integers"]
      },
      {
        term: "Sum",
        definition: "The answer you get when you add numbers."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  },
  {
    id: "stretch-percent-change",
    prompt: "A price is increased by $20\\%$ and then decreased by $25\\%$. The final price is $36. What was the original price?",
    choices: [
      { id: "A", label: "$30" },
      { id: "B", label: "$36" },
      { id: "C", label: "$40" },
      { id: "D", label: "$45" }
    ],
    correctChoiceId: "C",
    explanation: "Increasing by $20\\%$ and decreasing by $25\\%$ multiplies the original by $1.2\\cdot0.75=0.9$. So $0.9x=36$, and $x=40$.",
    difficulty: "stretch",
    topics: ["percent", "algebra"],
    vocabTerms: [
      {
        term: "Increase",
        definition: "To make an amount larger.",
        aliases: ["increased", "increasing"]
      },
      {
        term: "Decrease",
        definition: "To make an amount smaller.",
        aliases: ["decreased", "decreasing"]
      },
      {
        term: "Original",
        definition: "The starting amount before any changes happen."
      },
      {
        term: "Percent",
        definition: "A number out of 100. For example, 20% means 20 out of every 100."
      }
    ],
    gradeBand: "7-8",
    source: tcoeSource,
    adapted: true
  },
  {
    id: "stretch-inclusion-count",
    prompt: "How many integers from $1$ to $100$ are divisible by $3$ or by $5$?",
    choices: [
      { id: "A", label: "40" },
      { id: "B", label: "47" },
      { id: "C", label: "53" },
      { id: "D", label: "60" }
    ],
    correctChoiceId: "B",
    explanation: "There are $33$ multiples of $3$ and $20$ multiples of $5$. The $6$ multiples of $15$ were counted twice, so $33+20-6=47$.",
    difficulty: "stretch",
    topics: ["counting", "divisibility"],
    vocabTerms: [
      {
        term: "Divisible",
        definition: "Able to be divided evenly with no remainder."
      },
      {
        term: "Multiple",
        definition: "A number you get by multiplying by a whole number. 15 is a multiple of 3 and 5."
      }
    ],
    gradeBand: "7-8",
    source: musSource,
    adapted: true
  }
];
