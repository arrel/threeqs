export type Bird = {
  id: string;
  name: string;
  habitat: "Neighborhood" | "Oak woodland" | "Coast & wetlands";
  clue: string;
  fact: string;
  spottingTip: string;
  source: string;
};

// Keep this order stable: each position is a permanent collection reward.
export const birds: Bird[] = [
  {
    id: "annas-hummingbird",
    name: "Anna’s Hummingbird",
    habitat: "Neighborhood",
    clue: "A tiny bird with a 60-mph courtship dive.",
    fact: "A male can reach about 60 mph during his courtship dive. That’s freeway speed, powered by wings!",
    spottingTip:
      "Watch flowering gardens for a tiny green bird. A male’s pink head can look dark until the light hits it.",
    source: "https://abcbirds.org/birds/annas-hummingbird/",
  },
  {
    id: "california-scrub-jay",
    name: "California Scrub-Jay",
    habitat: "Oak woodland",
    clue: "An acorn thief dressed in blue.",
    fact: "These jays watch other jays hide acorns, then steal the stash. They also raid Acorn Woodpecker stores.",
    spottingTip:
      "Look around oaks and neighborhood gardens for a blue bird with a gray back and a long tail.",
    source: "https://www.allaboutbirds.org/guide/California_Scrub-Jay/overview",
  },
  {
    id: "black-phoebe",
    name: "Black Phoebe",
    habitat: "Neighborhood",
    clue: "A tiny aerial hunter in a black-and-white outfit.",
    fact: "A Black Phoebe waits on a low perch, darts into the air to catch an insect, then often returns to its lookout.",
    spottingTip:
      "Check low fences near water or lawns. Look for a dark head, white belly, and a dipping tail.",
    source: "https://www.allaboutbirds.org/guide/Black_Phoebe/overview",
  },
  {
    id: "brown-pelican",
    name: "Brown Pelican",
    habitat: "Coast & wetlands",
    clue: "A plunge-diver with a built-in fishing pouch.",
    fact: "Brown Pelicans dive headfirst into the sea to catch fish. Their stretchy throat pouch scoops up water and prey.",
    spottingTip:
      "Watch the Santa Barbara waterfront for big birds gliding in lines just above the waves.",
    source: "https://www.allaboutbirds.org/guide/Brown_Pelican/overview",
  },
  {
    id: "acorn-woodpecker",
    name: "Acorn Woodpecker",
    habitat: "Oak woodland",
    clue: "This bird’s pantry can have 50,000 tiny cupboards.",
    fact: "A family’s granary tree can have up to 50,000 holes. Each hole can hold an acorn for later.",
    spottingTip:
      "Scan oak trunks for stored acorns and a black-and-white bird with a red cap.",
    source: "https://www.allaboutbirds.org/guide/Acorn_Woodpecker/overview",
  },
  {
    id: "house-finch",
    name: "House Finch",
    habitat: "Neighborhood",
    clue: "A bird whose food helps choose its feather color.",
    fact: "A male’s red feathers get their color from pigments in his food. Some males turn out orange or yellow instead.",
    spottingTip:
      "Listen for cheerful songs near gardens. Males often have rosy heads; both sexes have streaky brown bodies.",
    source: "https://www.allaboutbirds.org/guide/House_Finch/overview",
  },
  {
    id: "snowy-egret",
    name: "Snowy Egret",
    habitat: "Coast & wetlands",
    clue: "White feathers, black legs, and bright yellow slippers.",
    fact: "Snowy Egrets have yellow feet at the ends of black legs. Those feet can stir up prey in shallow water.",
    spottingTip:
      "Look along shallow lagoon edges for a small white heron. Check the feet to help with identification.",
    source: "https://www.allaboutbirds.org/guide/Snowy_Egret/overview",
  },
  {
    id: "california-quail",
    name: "California Quail",
    habitat: "Oak woodland",
    clue: "That fancy head plume is hiding a six-part secret.",
    fact: "The curving plume on a quail’s head looks like one feather, but it’s actually six overlapping feathers.",
    spottingTip:
      "Look beneath shrubs along woodland trails. Listen for a three-part call that sounds like ‘Chi-ca-go.’",
    source: "https://www.allaboutbirds.org/guide/California_Quail/overview",
  },
  {
    id: "killdeer",
    name: "Killdeer",
    habitat: "Coast & wetlands",
    clue: "An expert actor with a pretend broken wing.",
    fact: "A Killdeer may pretend to have an injured wing to draw a predator away from its nest.",
    spottingTip:
      "Scan open ground and lagoon edges for two dark chest bands. If one acts injured, give it space and move away.",
    source: "https://www.allaboutbirds.org/guide/Killdeer/overview",
  },
  {
    id: "western-bluebird",
    name: "Western Bluebird",
    habitat: "Oak woodland",
    clue: "A blue bird that borrows a woodpecker’s construction work.",
    fact: "Western Bluebirds nest in holes, but can’t excavate their own. Old woodpecker holes can become ready-made homes.",
    spottingTip:
      "Watch open woodland and grassy parks for blue birds dropping from perches to catch insects.",
    source: "https://www.allaboutbirds.org/guide/Western_Bluebird/overview",
  },
  {
    id: "great-blue-heron",
    name: "Great Blue Heron",
    habitat: "Coast & wetlands",
    clue: "A tall, patient fisher with a lightning-fast strike.",
    fact: "A Great Blue Heron can stand almost motionless, then strike quickly to catch prey with its long bill.",
    spottingTip:
      "Look around lagoons for a tall gray-blue bird. In flight, it folds its long neck into an S.",
    source: "https://www.allaboutbirds.org/guide/Great_Blue_Heron/overview",
  },
  {
    id: "red-tailed-hawk",
    name: "Red-tailed Hawk",
    habitat: "Oak woodland",
    clue: "A soaring hunter that sometimes works with a partner.",
    fact: "Red-tailed Hawks have been seen hunting together, watching opposite sides of a tree to catch squirrels.",
    spottingTip:
      "Look above foothills and open fields for broad wings. Adults often show a rusty-red tail in sunlight.",
    source: "https://www.allaboutbirds.org/guide/Red-tailed_Hawk/overview",
  },
];
