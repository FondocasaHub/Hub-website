-- Area Agenti — Obiettivi 2027 per collaboratore: obiettivo vs reale per trimestre (20/11/2026)
-- Reale fatturato = incassi in cui il collaboratore è produttore + (solo Buyer) incassi dei colleghi su cui ha la quota Buyer.
-- Reale incarichi = immobili con listing = collaboratore e data di acquisizione nel trimestre.
-- Visibilità: Store Manager e Amministrazione tutti; Team Manager il proprio team; ognuno sé stesso.

create or replace function public.obiettivi_collaboratori(p_anno int)
returns table (profilo uuid, nome text, team text, livello text, voce text, obiettivo numeric, trimestri jsonb, reale numeric[], note text)
language sql stable security definer set search_path = public as $$
  with b as (
    select bc.* from budget_collaboratori bc
    join profiles p on p.id = bc.profilo
    where bc.anno = p_anno and bc.ambito = 'personale' and bc.voce in ('fatturato', 'incarichi')
      and (sono_admin() or sono_amministrazione() or bc.profilo = auth.uid()
           or (mio_ruolo() = 'manager' and p.team = mio_team()))
  ),
  fatt as (
    select b.profilo, extract(quarter from i.data_incasso)::int q, sum(i.importo) imp
    from b join incassi i on extract(year from i.data_incasso) = p_anno
      and (i.produttore = b.profilo
           or exists (select 1 from jsonb_array_elements(i.quote) x
                      where x->>'chi' = b.profilo::text and x->>'voce' like 'Buyer%' and i.produttore <> b.profilo))
    where b.voce = 'fatturato'
    group by 1, 2
  ),
  inc as (
    select b.profilo, extract(quarter from m.data_acquisizione)::int q, count(*)::numeric n
    from b join immobili m on m.listing_id = b.profilo and extract(year from m.data_acquisizione) = p_anno
    where b.voce = 'incarichi'
    group by 1, 2
  )
  select b.profilo, coalesce(nullif(p.nome, ''), p.email), p.team, p.livello::text, b.voce, b.importo, b.trimestri,
    array(select coalesce(case when b.voce = 'fatturato'
                               then (select f.imp from fatt f where f.profilo = b.profilo and f.q = g)
                               else (select n.n from inc n where n.profilo = b.profilo and n.q = g) end, 0)
          from generate_series(1, 4) g order by g),
    b.note
  from b join profiles p on p.id = b.profilo
  order by p.team, 2, b.voce
$$;
revoke all on function public.obiettivi_collaboratori(int) from public, anon;
grant execute on function public.obiettivi_collaboratori(int) to authenticated;
-- NB: versione in produzione (migration budget_collaboratori_quota_diretta) restituisce anche quota_diretta e reale_diretto[]
