import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Unique Mechanical Works",
    template: "%s | Unique Mechanical Works",
  },
  description:
    "Unique Mechanical Works — premium vehicle sales and professional automotive services in Nigeria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-snow text-graphite antialiased">
        {children}
      </body>
    </html>
  );
}