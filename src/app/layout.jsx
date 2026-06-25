import "./globals.css";

export const metadata = {
  title: "Pace - Every Second Tells a Story",
  description:
    "A quiz platform that tracks time students spend on each question.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
