import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "woaste-paend | Kullad Chai House",
  description:
    "A tactile chai storefront built around a rolling kullad experience and earthy tea-house visuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          <SiteHeader />
          {children}
          <footer className="site-footer">
            <div className="site-footer-inner">
              <p>woaste-paend</p>
              <small>
                Clay cups, signature pours, and Woategi gatherings built for
                longer evenings.
              </small>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
