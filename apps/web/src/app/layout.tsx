import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CitCalendar | Reserva de Citas Online",
  description: "Plataforma de reservas de belleza rápida, sin comisiones y optimizada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        {/* Material icons for modern UI elements similar to Stitch designs */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface antialiased">
        <div className="grain-overlay"></div>
        {children}
      </body>
    </html>
  );
}
