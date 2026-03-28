
ALTER TABLE public.checklist_itens ADD COLUMN status text NOT NULL DEFAULT 'pendente';
UPDATE public.checklist_itens SET status = CASE WHEN feito = true THEN 'sim' ELSE 'pendente' END;
ALTER TABLE public.checklist_itens DROP COLUMN feito;
