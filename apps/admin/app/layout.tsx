import type { Metadata } from "next";
import "./globals.css";
/* Ported dashboard stylesheets (order matches the prototype's Admin v4.html) */
import "./nova-css/dashboard.css";
import "./nova-css/dashboard-pages.css";
import "./nova-css/dashboard-comms.css";
import "./nova-css/dashboard-v2.css";
import "./nova-css/dashboard-v3.css";
import "./nova-css/dashboard-v4.css";
import "./nova-css/dashboard-v5.css";

/* Suppress the unhandled ioredis 'error' event emitted when the shared
   @nova/database redis client can't connect to localhost:6379 in dev.
   Without this listener Node throws an uncaught exception that crashes
   the dev server after a few requests. */
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (err: any) => {
    if (err?.name === 'AggregateError' || err?.code === 'ECONNREFUSED') return
    throw err
  })
}

export const metadata: Metadata = {
  title: "Nova Tyres — Admin",
  description: "Nova Tyres store operations & content console.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
