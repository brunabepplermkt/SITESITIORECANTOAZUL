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
  description: string;
  capacity: string;
  priceFrom: number | null;
  highlights: string[];
  amenities: string[];
  images: ImageAsset[];
  reserveUrl: string;
};

export type Experience = {
  slug: string;
  name: string;
  description: string;
  image: ImageAsset;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type Testimonial = {
  guestName: string;
  quote: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  defaultReserveUrl: string;
};
