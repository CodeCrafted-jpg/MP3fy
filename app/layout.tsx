import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/thermeProvider";
import { Vortex } from "@/components/votext"; // ✅

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MP3fy",
  description: "An app to get mp3 of any youtube playlist",
  icons:'/next.svg'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ClerkProvider
          appearance={{
            layout: { socialButtonsVariant: "iconButton" },
            variables: {
              colorText: "#fff",
              colorPrimary: "#0E78F9",
              colorBackground: "#1C1F2E",
              colorInputBackground: "#252A41",
              colorInputText: "#fff",
            },
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative min-h-screen w-full overflow-hidden">
              {/* 🔮 Vortex Background */}
              {/* <Vortex
                className="absolute inset-0 w-full h-full z-0"
              
                rangeY={1500}
                particleCount={100}
              /> */}

              {/* 💬 Foreground Content */}
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
