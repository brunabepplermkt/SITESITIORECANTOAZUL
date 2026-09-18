import Link from "next/link";

const SECTIONS = [
  { href: "/admin/configuracoes", label: "Configurações do site", desc: "Nome, contato, redes sociais, link de reserva padrão." },
  { href: "/admin/acomodacoes", label: "Acomodações", desc: "Textos, comodidades, fotos e galeria de cada acomodação." },
  { href: "/admin/experiencias", label: "Experiências", desc: "Momentos e atividades exibidos no site." },
  { href: "/admin/avaliacoes", label: "Avaliações", desc: "Depoimentos reais de hóspedes (Airbnb, Booking, Google, direto)." },
  { href: "/admin/faq", label: "FAQ", desc: "Perguntas frequentes exibidas para os hóspedes." },
  { href: "/admin/politicas", label: "Políticas", desc: "Texto de políticas de reserva e regras da casa." },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-bark">Painel administrativo</h1>
      <p className="mt-2 text-bark/70">Escolha o que deseja editar.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="focus-ring block rounded-sm border border-black/10 p-5 hover:border-black/20"
          >
            <p className="font-serif text-lg text-bark">{s.label}</p>
            <p className="mt-1 text-sm text-bark/60">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
