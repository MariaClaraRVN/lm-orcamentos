ALTER TABLE public.checklists ADD COLUMN cliente_cnpj text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN cliente_cpf text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN cliente_email text NOT NULL DEFAULT '';
ALTER TABLE public.checklists ADD COLUMN tipo_pessoa text NOT NULL DEFAULT 'juridica';