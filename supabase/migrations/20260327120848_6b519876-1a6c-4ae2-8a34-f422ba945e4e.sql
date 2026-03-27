
ALTER TABLE public.flow_videos ADD COLUMN language text NOT NULL DEFAULT 'en';
ALTER TABLE public.flow_buttons ADD COLUMN language text NOT NULL DEFAULT 'en';
