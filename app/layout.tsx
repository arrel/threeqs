import type { Metadata } from "next";
import { Suspense } from "react";
import { RoutedDailyGame } from "@/components/RoutedDailyGame";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Three Qs",
    template: "%s | Three Qs"
  },
  description: "Three daily Math Super Bowl-style practice questions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Paytone+One&family=Urbanist:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <svg className="bg-texture" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Inset/letterpress look: a light highlight just below each glyph
                (the lit bottom lip of a recess) plus a soft dark edge above. */}
            <filter id="qthrees-inset" x="-10%" y="-10%" width="120%" height="120%">
              <feOffset in="SourceAlpha" dx="0" dy="1.6" result="hiAlpha" />
              <feGaussianBlur in="hiAlpha" stdDeviation="0.7" result="hiBlur" />
              <feFlood floodColor="#ffffff" floodOpacity="0.85" result="hiColor" />
              <feComposite in="hiColor" in2="hiBlur" operator="in" result="highlight" />
              <feOffset in="SourceAlpha" dx="0" dy="-1.4" result="loAlpha" />
              <feGaussianBlur in="loAlpha" stdDeviation="0.7" result="loBlur" />
              <feFlood floodColor="#2e140a" floodOpacity="0.5" result="loColor" />
              <feComposite in="loColor" in2="loBlur" operator="in" result="shadow" />
              <feMerge>
                <feMergeNode in="highlight" />
                <feMergeNode in="shadow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern
              id="qthrees"
              width="820"
              height="820"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-4)"
            >
              <g
                fill="currentColor"
                fontFamily="'Paytone One', sans-serif"
                filter="url(#qthrees-inset)"
              >
                <text x="70" y="170" fontSize="130" transform="rotate(-28 70 170)">
                  Q
                </text>
                <text x="340" y="120" fontSize="110" transform="rotate(26 340 120)">
                  3
                </text>
                <text x="560" y="200" fontSize="125" transform="rotate(-23 560 200)">
                  3
                </text>
                <text x="200" y="360" fontSize="120" transform="rotate(30 200 360)">
                  Q
                </text>
                <text x="430" y="340" fontSize="135" transform="rotate(-30 430 340)">
                  3
                </text>
                <text x="650" y="400" fontSize="108" transform="rotate(22 650 400)">
                  Q
                </text>
                <text x="90" y="520" fontSize="118" transform="rotate(27 90 520)">
                  3
                </text>
                <text x="320" y="560" fontSize="128" transform="rotate(-26 320 560)">
                  Q
                </text>
                <text x="600" y="520" fontSize="112" transform="rotate(24 600 520)">
                  3
                </text>
                <text x="170" y="720" fontSize="120" transform="rotate(29 170 720)">
                  Q
                </text>
                <text x="420" y="740" fontSize="130" transform="rotate(-28 420 740)">
                  3
                </text>
                <text x="640" y="700" fontSize="110" transform="rotate(-22 640 700)">
                  Q
                </text>
                <text x="228" y="92" fontSize="60" transform="rotate(22 228 92)">
                  3
                </text>
                <text x="708" y="96" fontSize="64" transform="rotate(-32 708 96)">
                  Q
                </text>
                <text x="468" y="212" fontSize="54" transform="rotate(-34 468 212)">
                  3
                </text>
                <text x="44" y="372" fontSize="58" transform="rotate(34 44 372)">
                  Q
                </text>
                <text x="352" y="250" fontSize="66" transform="rotate(27 352 250)">
                  3
                </text>
                <text x="520" y="448" fontSize="56" transform="rotate(-25 520 448)">
                  Q
                </text>
                <text x="734" y="300" fontSize="58" transform="rotate(23 734 300)">
                  3
                </text>
                <text x="250" y="636" fontSize="62" transform="rotate(33 250 636)">
                  Q
                </text>
                <text x="492" y="628" fontSize="52" transform="rotate(-29 492 628)">
                  3
                </text>
                <text x="702" y="612" fontSize="60" transform="rotate(-21 702 612)">
                  Q
                </text>
                <text x="126" y="648" fontSize="54" transform="rotate(25 126 648)">
                  3
                </text>
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#qthrees)" />
        </svg>
        <Suspense fallback={null}>
          <RoutedDailyGame />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
