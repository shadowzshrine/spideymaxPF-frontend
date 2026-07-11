import "./globals.css";

export const metadata = {
  title: "Mageshwaran S | Portfolio OS",
  description: "MERN Stack scroll-driven 3D superhero developer portfolio for Mageshwaran S.",
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
