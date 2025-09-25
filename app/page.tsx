// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Actions UI Demo",
  description: "Minimal Next.js UI to trigger GitHub Actions via Vercel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
