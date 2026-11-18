/** Site-wide constants for metadata, structured data and metadata routes. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ltid-landing.vercel.app").replace(/\/$/, "");

/**
 * This is an unofficial concept page about a real company, so it is NOT indexed
 * by default (link previews still work). Set NEXT_PUBLIC_ALLOW_INDEXING=true to
 * let search engines index it, e.g. if LTID adopts it.
 */
export const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export const ORG = {
  name: "Long Term Industrial Development",
  legalNameJa: "株式会社ロングターム・インダストリアル・ディベロップメント",
  shortName: "LTID",
  officialUrl: "https://www.ltid.jp",
  email: "customerservices@ltid.jp",
  address: {
    streetAddress: "2-24-8 Jindaiji",
    addressLocality: "Mitaka-shi",
    addressRegion: "Tokyo",
    postalCode: "181-0016",
    addressCountry: "JP",
  },
  sameAs: ["https://www.ltid.jp", "https://fundinno.com/projects/291"],
};

export const AUTHOR = { name: "Riteshh", url: "https://riteshh.in" };
