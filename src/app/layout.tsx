import type { Metadata } from "next";
import "./globals.css";
import { RelovaProvider } from "@/context/RelovaContext";

export const metadata: Metadata = {
  title: "Relova DBMS · Industrial Surplus Exchange",
  description:
    "A simplified, database-driven circular economy platform for industrial surplus material exchanges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RelovaProvider>{children}</RelovaProvider>
      </body>
    </html>
  );
}
