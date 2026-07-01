const DISALLOWED_STUDENT_NAME_TOKENS = new Set([
  "bastard",
  "bitch",
  "boob",
  "boobs",
  "cunt",
  "douche",
  "fuck",
  "fucked",
  "fucker",
  "fucking",
  "penis",
  "porn",
  "sexy",
  "shit",
  "shitty",
  "slut",
  "vagina",
  "whore"
]);

const LEET_CHARACTERS: Record<string, string> = {
  "!": "i",
  "$": "s",
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a"
};

export function isDisallowedStudentName(name: string): boolean {
  const tokens = getCanonicalNameTokens(name);
  return tokens.some((token) => DISALLOWED_STUDENT_NAME_TOKENS.has(token));
}

function getCanonicalNameTokens(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[!$0134578@]/g, (character) => LEET_CHARACTERS[character] ?? character)
    .split(/[^a-z]+/)
    .filter(Boolean);
}
