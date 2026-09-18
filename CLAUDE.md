# CLAUDE.md — Sítio Recanto Azul (site oficial)

Regras permanentes deste projeto. Leia antes de qualquer alteração.

## Escopo

1. Este repositório é **somente** o site institucional/CMS do Sítio Recanto Azul.
2. Nunca modificar projetos externos a este repositório.
3. Nunca acessar ou modificar o Zeloa ou o CRM sem autorização explícita do proprietário.
4. Nunca utilizar banco de produção de outro sistema. Este projeto tem seu próprio projeto Supabase, isolado.

## Padrões de qualidade

5. Priorizar qualidade visual, UX, performance, segurança e simplicidade — nessa ordem de atenção, sem sacrificar nenhuma.
6. O site deve ter aparência de hospedagem de alto padrão (boutique/glamping premium), nunca de template genérico.
7. Mobile-first é obrigatório: toda tela nova é desenhada para 375–430px primeiro.
8. Fotografia é protagonista do design — não sufocar imagens com excesso de UI.
9. Evitar aparência de dashboard/SaaS nas páginas públicas.

## Conteúdo administrável

10. Todo conteúdo que o proprietário precise alterar no futuro deve ser editável pelo painel `/admin`, não hardcoded.
11. O painel administrativo permite editar textos, fotos, galerias, informações de acomodações, experiências, FAQ e políticas.

## Segurança

12. Nunca commitar secrets, tokens, senhas ou chaves privadas.
13. Nunca commitar arquivos `.env` (apenas `.env.example`).
14. `SUPABASE_SERVICE_ROLE_KEY` nunca é exposta ao frontend — uso restrito a rotas de servidor.

## Processo

15. Antes de considerar uma funcionalidade concluída, testar (build, lint, fluxo manual).
16. Antes de considerar uma página visual concluída, revisar no navegador em larguras mobile e desktop.
17. Manter o código organizado, tipado e simples — evitar overengineering.
18. Registrar decisões técnicas importantes em `PROJECT_STATUS.md`.
19. Commits pequenos, claros e coerentes.
20. Push regular para `origin/main` deste repositório (`brunabepplermkt/sitesitiorecantoazul`) — nunca para outro repositório.
21. Decisões pequenas/intermediárias de design ou arquitetura são tomadas de forma autônoma, seguindo critério profissional; só interromper o trabalho por bloqueios reais (ex.: credenciais que só o proprietário possui).

## Skills deste projeto

22. **Criação/refinamento visual** — skill `frontend-design` (instalada em
    `.claude/skills/frontend-design/`, origem: anthropics/claude-plugins-official).
    Usar em toda decisão de paleta, tipografia, layout e hierarquia. Direção
    estética fixada para este projeto: luxury/refined, orgânico/natural,
    editorial, hospedagem boutique, fotografia como protagonista, mobile-first
    — evitar aparência genérica de template/IA (ver seção "Calibração" do
    SKILL.md). Em caso de conflito, as regras deste CLAUDE.md e do briefing do
    proprietário sempre têm prioridade sobre a skill.
23. **Revisão mobile** — sem plugin dedicado (evitar coleção grande de skills
    redundantes): revisão manual real em navegador (Playwright/Chromium) nas
    larguras 390/430/375/768/1440px, nessa ordem de prioridade, cobrindo
    header, hero, cards, galerias, CTAs, formulários, menu e footer.
24. **Acessibilidade** — sem plugin dedicado: checklist manual aplicado a cada
    componente novo/alterado — contraste (mínimo WCAG AA), `:focus-visible`
    visível, HTML semântico, área de toque ≥ 44×44px, `prefers-reduced-motion`
    respeitado.
