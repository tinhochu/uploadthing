import "@uploadthing/react/styles.css";

import { Inter } from "next/font/google";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { shapeRouteConfig } from "uploadthing/server";

import { uploadRouter } from "~/server/uploadthing";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <NextSSRPlugin routerConfig={shapeRouteConfig(uploadRouter)} />
      </body>
    </html>
  );
}
