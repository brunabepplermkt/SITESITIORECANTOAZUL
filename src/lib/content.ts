import type {
  Accommodation,
  Experience,
  FaqItem,
  SiteSettings,
} from "./types";

/**
 * Conteúdo de base (seed). Serve como fallback quando o Supabase ainda não
 * está configurado e como estrutura de referência para as migrations.
 * O conteúdo real é editável pelo painel /admin uma vez que o Supabase
 * esteja conectado (ver README.md).
 */

export const siteSettings: SiteSettings = {
  siteName: "Sítio Recanto Azul",
  tagline: "Natureza, privacidade e experiências para casais e grupos",
  phone: "(00) 00000-0000",
  whatsapp: "5500000000000",
  email: "contato@sitiorecantoazul.com.br",
  instagram: "https://instagram.com/sitiorecantoazul",
  address: "Endereço a confirmar",
  defaultReserveUrl: "https://wa.me/5500000000000",
};

function img(url: string, alt: string, order = 0) {
  return { id: `${url}-${order}`, url, alt, order };
}

export const accommodations: Accommodation[] = [
  {
    slug: "agata",
    name: "Ágata",
    tagline: "Hidro com vista e rede horizontal para dias lentos",
    description:
      "Um refúgio pensado para casais que buscam sossego. A Ágata combina conforto discreto com uma vista que convida a desacelerar — ideal para dias sem pressa, banhos demorados na hidro e tardes na rede horizontal.",
    capacity: "2 hóspedes",
    priceFrom: null,
    highlights: ["Hidro com vista", "Rede horizontal"],
    amenities: ["Hidromassagem", "Rede horizontal", "Vista privativa"],
    images: [
      img("/images/placeholder/agata-1.svg", "Acomodação Ágata — hidro com vista", 0),
      img("/images/placeholder/agata-2.svg", "Acomodação Ágata — ambiente interno", 1),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
  {
    slug: "mirante",
    name: "Mirante",
    tagline: "Hidro com vista panorâmica e rede horizontal",
    description:
      "Suspenso sobre a paisagem, o Mirante foi criado para quem quer acordar de frente para o horizonte. A hidromassagem com vista panorâmica transforma o fim de tarde em ritual, e a rede horizontal convida ao descanso prolongado.",
    capacity: "2 hóspedes",
    priceFrom: null,
    highlights: ["Hidro com vista panorâmica", "Rede horizontal"],
    amenities: ["Hidromassagem panorâmica", "Rede horizontal", "Vista privativa"],
    images: [
      img("/images/placeholder/mirante-1.svg", "Acomodação Mirante — vista panorâmica", 0),
      img("/images/placeholder/mirante-2.svg", "Acomodação Mirante — ambiente interno", 1),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
  {
    slug: "doce-recanto",
    name: "Doce Recanto",
    tagline: "Hidro interna para uma estadia intimista",
    description:
      "Aconchegante e intimista, o Doce Recanto é o convite perfeito para uma pausa a dois, com hidromassagem interna e um ambiente pensado nos mínimos detalhes para o descanso.",
    capacity: "2 hóspedes",
    priceFrom: null,
    highlights: ["Hidro interna"],
    amenities: ["Hidromassagem interna"],
    images: [
      img("/images/placeholder/doce-recanto-1.svg", "Acomodação Doce Recanto — ambiente interno", 0),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
  {
    slug: "domo-estelar",
    name: "Domo Estelar",
    tagline: "Teto transparente para dormir sob as estrelas",
    description:
      "A acomodação mais imersiva do Recanto Azul. O Domo Estelar combina teto transparente, mezanino, lareira ecológica e jacuzzi externa aquecida para uma experiência que mistura conforto e contato direto com o céu noturno.",
    capacity: "2 a 4 hóspedes",
    priceFrom: null,
    highlights: [
      "Jacuzzi externa aquecida",
      "Banheira interna",
      "Lareira ecológica",
      "Chuveiro duplo",
      "Telão/projetor",
      "Mezanino",
      "Teto transparente",
    ],
    amenities: [
      "Jacuzzi externa aquecida",
      "Banheira interna",
      "Lareira ecológica",
      "Chuveiro duplo",
      "Telão com projetor",
      "Mezanino",
      "Teto transparente",
    ],
    images: [
      img("/images/placeholder/domo-1.svg", "Domo Estelar — teto transparente", 0),
      img("/images/placeholder/domo-2.svg", "Domo Estelar — jacuzzi externa", 1),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
  {
    slug: "chale-para-grupos",
    name: "Chalé para Grupos",
    tagline: "Espaço amplo com galpão de festas e jacuzzi externa",
    description:
      "Pensado para reunir família e amigos, o Chalé para Grupos oferece uma casa completa com quartos, galpão de festas para celebrações e jacuzzi externa para relaxar depois de um dia cheio.",
    capacity: "Grupos",
    priceFrom: null,
    highlights: ["Capacidade para grupos", "Galpão de festas", "Casa com quartos", "Jacuzzi externa"],
    amenities: ["Galpão de festas", "Casa com múltiplos quartos", "Jacuzzi externa"],
    images: [
      img("/images/placeholder/chale-1.svg", "Chalé para Grupos — área externa", 0),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
  {
    slug: "celeiro",
    name: "Celeiro",
    tagline: "Até 11 hóspedes, com jacuzzi, lareira e sinuca",
    description:
      "O Celeiro é o ponto de encontro ideal para grupos maiores: jacuzzi externa coberta, lareira para noites frias, sinuca e churrasqueira para dias inteiros de convivência.",
    capacity: "Até 11 hóspedes",
    priceFrom: null,
    highlights: ["Até 11 hóspedes", "Jacuzzi externa coberta", "Lareira", "Sinuca", "Churrasqueira"],
    amenities: ["Jacuzzi externa coberta", "Lareira", "Sinuca", "Churrasqueira"],
    images: [
      img("/images/placeholder/celeiro-1.svg", "Celeiro — área de convivência", 0),
    ],
    reserveUrl: siteSettings.defaultReserveUrl,
  },
];

export const experiences: Experience[] = [
  {
    slug: "mirante-por-do-sol",
    name: "Mirante para o pôr do sol",
    description: "Um ponto alto do sítio reservado para acompanhar o fim de tarde em silêncio.",
    image: img("/images/placeholder/exp-mirante.svg", "Mirante para o pôr do sol", 0),
  },
  {
    slug: "deck-nascer-do-sol",
    name: "Deck para o nascer do sol",
    description: "Um deck voltado para o horizonte, ideal para começar o dia com calma.",
    image: img("/images/placeholder/exp-deck.svg", "Deck para o nascer do sol", 1),
  },
  {
    slug: "balancos",
    name: "Balanços pelo sítio",
    description: "Balanços espalhados pela propriedade, para pausas simples em meio à natureza.",
    image: img("/images/placeholder/exp-balancos.svg", "Balanços pelo sítio", 2),
  },
  {
    slug: "piquenique",
    name: "Piquenique",
    description: "Um momento a dois ou em grupo, ao ar livre, cercado pela paisagem do Recanto Azul.",
    image: img("/images/placeholder/exp-piquenique.svg", "Piquenique", 3),
  },
  {
    slug: "passeio-a-cavalo",
    name: "Passeio a cavalo",
    description: "Uma forma tranquila de conhecer mais do sítio e da paisagem ao redor.",
    image: img("/images/placeholder/exp-cavalo.svg", "Passeio a cavalo", 4),
  },
];

export const faqs: FaqItem[] = [
  {
    question: "Como faço para reservar?",
    answer:
      "Você pode reservar diretamente pelo botão \"Reservar\" em qualquer acomodação, que te leva ao nosso canal de atendimento.",
  },
  {
    question: "Qual o horário de check-in e check-out?",
    answer: "Os horários serão informados no momento da confirmação da reserva.",
  },
  {
    question: "O sítio aceita animais de estimação?",
    answer: "Consulte disponibilidade diretamente com nossa equipe antes de reservar.",
  },
  {
    question: "Existe um número mínimo de noites?",
    answer: "As condições variam conforme a temporada e serão informadas no atendimento.",
  },
];

export const policiesContent = `# Políticas do Sítio Recanto Azul

Conteúdo provisório. As políticas definitivas de reserva, cancelamento, check-in/check-out e regras da casa serão publicadas aqui e poderão ser editadas pelo painel administrativo.`;
