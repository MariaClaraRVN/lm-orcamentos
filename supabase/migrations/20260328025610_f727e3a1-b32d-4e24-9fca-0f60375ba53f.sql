ALTER TABLE public.checklists ADD COLUMN marca_maquina text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN modelo_maquina text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN cliente_endereco text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN cliente_telefone text NOT NULL DEFAULT '';