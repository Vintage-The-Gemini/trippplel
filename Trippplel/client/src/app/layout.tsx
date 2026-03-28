import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Trippplel — Premium Streetwear",
    template: "%s | Trippplel",
  },
  description: "Premium t-shirts and hoodies. Limited drops. Real culture.",
  keywords: ["streetwear", "tshirts", "hoodies", "fashion", "trippplel"],
  openGraph: {
    title: "Trippplel — Premium Streetwear",
    description: "Premium t-shirts and hoodies. Limited drops. Real culture.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
              borderRadius: "0px",
              fontWeight: "700",
              fontSize: "12px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              border: "2px solid #CCFF00",
            },
            success: {
              iconTheme: { primary: "#CCFF00", secondary: "#000" },
            },
          }}
        />
      </body>
    </html>
  );
}
