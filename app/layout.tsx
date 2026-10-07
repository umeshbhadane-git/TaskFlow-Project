import type { Metadata } from "next";

import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";



export const metadata: Metadata = {
  title: "TaskFlow",
  description: "Collaborative task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <Navbar />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}