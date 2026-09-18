export type ImageAsset = {
  id: string;
  url: string;
  alt: string;
  order: number;
};

export type Accommodation = {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  capacity: string;
  adults: number | null;
  children: number | null;
  beds: number | null;
  rooms: number | null;
  bathrooms: number | null;
  priceFrom: number | null;
  highlights: string[];
  amenities: string[];
  images: ImageAsset[];
  reserveUrl: string;
  published: boolean;
  featuredHome: boolean;
  homeOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
};

export type Experience = {
  slug: string;
  name: string;
  description: string;
  image: ImageAsset;
  published: boolean;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
  published: boolean;
  order: number;
};

export type ReviewSource = "airbnb" | "booking" | "google" | "direto" | "outro";

export type Review = {
  id: string;
  guestName: string;
  text: string;
  rating: number | null;
  source: ReviewSource;
  accommodationSlug: string | null;
  dateLabel: string | null;
  order: number;
  published: boolean;
};

export type PageBlock =
  | { id: string; type: "text"; content: string; order: number }
  | { id: string; type: "image"; imageUrl: string; imageAlt: string; order: number };

export type NavPage = {
  slug: string;
  label: string;
};

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  navLabel: string | null;
  showInNav: boolean;
  published: boolean;
  order: number;
  blocks: PageBlock[];
};

/** Chaves fixas das seções da Home — a lista de seções não é livre, só o conteúdo/ordem/visibilidade delas. */
export type HomeSectionKey =
  | "hero"
  | "intro"
  | "acomodacoes"
  | "sitio"
  | "experiencias"
  | "avaliacoes"
  | "cta_final";

export type HomeSection = {
  key: HomeSectionKey;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  visible: boolean;
  order: number;
};

export type BookingProviderMode = "none" | "link" | "widget" | "zeloa";
export type BookingOpenMode = "same_tab" | "new_tab";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  googleMapsUrl: string | null;
  defaultReserveUrl: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImageUrl: string | null;
  bookingProvider: BookingProviderMode;
  bookingBaseUrl: string | null;
  bookingOpenMode: BookingOpenMode;
  bookingCtaLabel: string;
  bookingShowSearchHome: boolean;
  bookingShowSearchAccommodation: boolean;
  bookingShowCalendar: boolean;
  bookingWidgetEmbedUrl: string | null;
  googleAnalyticsId: string | null;
  metaPixelId: string | null;
};
