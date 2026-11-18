import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Noto_Sans_JP, Shippori_Mincho, Bricolage_Grotesque } from "next/font/google";
import { routing } from "@/i18n/routing";
import SmoothScroll from "@/components/ui/SmoothScroll";
import "../globals.css";

const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});
const shippori = Shippori_Mincho({
  variable: "--font-shippori",
  weight: ["500", "700"],
  display: "swap",
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f5efe2",
  colorScheme: "light",
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ltid-landing.vercel.app";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL(BASE),
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/" },
    openGraph: {
      title: t("ogTitle"),
      description: t("description"),
      type: "website",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      alternateLocale: locale === "ja" ? ["en_US"] : ["ja_JP"],
      siteName: "LTID",
    },
    twitter: { card: "summary_large_image", title: t("ogTitle") },
    // the site ships its own JA/EN versions; avoid browser auto-translation mangling them
    other: { google: "notranslate" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${notoJp.variable} ${shippori.variable} ${bricolage.variable}`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <SmoothScroll />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
