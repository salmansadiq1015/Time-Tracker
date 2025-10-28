import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "Time Tracker Dashboard",
  description: "Advanced time tracking and user management dashboard",
  generator: "Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased  overflow-x-hidden`}>
        <AuthProvider>
          <main className="max-w-8xl ">
            {children}
            <Toaster />
          </main>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
