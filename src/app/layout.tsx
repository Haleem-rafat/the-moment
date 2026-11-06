import type { Metadata, Viewport } from "next";
import {
  Aref_Ruqaa,
  Cormorant_Garamond,
  El_Messiri,
  Great_Vibes,
  IBM_Plex_Sans_Arabic,
  Inter,
} from "next/font/google";
import "./globals.css";

// All fonts are self-hosted with the site, so they look the same in every browser.
// Arabic is the default language, so only its fonts load up front.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-latin-display",
  preload: false,
});
const inter = Inter({ subsets: ["latin"], variable: "--font-latin-body", preload: false });
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-latin-script",
  preload: false,
});
const display = El_Messiri({ subsets: ["arabic"], variable: "--font-arabic-display" });
const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-arabic-body",
});
const script = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-arabic-script",
});

const TITLE = "يا إسراء… عندي حاجة عايز أوريهالك";
const DESCRIPTION = "كل بداية جميلة ليها لحظة. افتحي اللينك وعلّي الصوت.";

// Deliberately vague: a link preview or browser tab must not spoil the surprise.
export const metadata: Metadata = {
  metadataBase: new URL("https://moment.framecasts.com"),
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "/",
    siteName: "اللحظة",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: TITLE, type: "image/jpeg" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#1c0811",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable} ${display.variable} ${body.variable} ${script.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
