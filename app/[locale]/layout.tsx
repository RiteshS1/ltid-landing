import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Noto_Sans_JP, Shippori_Mincho, Bricolage_Grotesque } from "next/font/google";
import { routing } from "@/i18n/routing";
import { AUTHOR, INDEXABLE, ORG, SITE_URL } from "@/lib/site";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    applicationName: "LTID",
    authors: [AUTHOR],
    creator: AUTHOR.name,
    category: "agriculture technology",
    alternates: { canonical: "/" },
    robots: INDEXABLE
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/",
      type: "website",
      siteName: "LTID",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      alternateLocale: locale === "ja" ? ["en_US"] : ["ja_JP"],
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: t("ogTitle") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["/opengraph-image"],
    },
    // the site ships its own JA/EN versions; avoid browser auto-translation mangling them
    other: { google: "notranslate" },
  };
}

async function jsonLd(locale: string) {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const data = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("pageName"),
    description: t("description"),
    url: `${SITE_URL}/`,
    inLanguage: locale,
    author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
    about: {
      "@type": "Organization",
      name: ORG.name,
      alternateName: [ORG.shortName, ORG.legalNameJa],
      url: ORG.officialUrl,
      email: ORG.email,
      address: { "@type": "PostalAddress", ...ORG.address },
      sameAs: ORG.sameAs,
      foundingDate: "2020",
      areaServed: ["JP", "PH"],
      knowsAbout: ["Agricultural finance", "Food value chain", "Dynamic pricing", "Credit scoring", "Agritech"],
    },
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: await jsonLd(locale) }} />
        <NextIntlClientProvider>
          <SmoothScroll />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
