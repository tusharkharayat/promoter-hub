
CREATE TABLE public.flow_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_key text NOT NULL,
  label text NOT NULL,
  target_node_key text,
  sort_order int NOT NULL DEFAULT 0,
  appear_at_seconds numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flow_buttons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read flow buttons" ON public.flow_buttons FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert flow buttons" ON public.flow_buttons FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update flow buttons" ON public.flow_buttons FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete flow buttons" ON public.flow_buttons FOR DELETE TO public USING (true);
