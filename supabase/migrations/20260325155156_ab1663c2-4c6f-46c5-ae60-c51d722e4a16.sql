
CREATE TABLE public.flow_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  node_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flow_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read flow videos" ON public.flow_videos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert flow videos" ON public.flow_videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update flow videos" ON public.flow_videos FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete flow videos" ON public.flow_videos FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_flow_videos_updated_at
  BEFORE UPDATE ON public.flow_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

CREATE POLICY "Anyone can read videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Anyone can upload videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Anyone can update videos" ON storage.objects FOR UPDATE USING (bucket_id = 'videos');
CREATE POLICY "Anyone can delete videos" ON storage.objects FOR DELETE USING (bucket_id = 'videos');

INSERT INTO public.flow_videos (node_key, label) VALUES
  ('intro', 'Intro Video (after language select)'),
  ('power-user', 'Power User Category Video'),
  ('professional', 'Professional Category Video'),
  ('everyday-essential', 'Everyday Essential Category Video'),
  ('galaxy-s25-ultra', 'Galaxy S25 Ultra'),
  ('galaxy-z-fold-6', 'Galaxy Z Fold 6'),
  ('galaxy-tab-s10', 'Galaxy Tab S10'),
  ('galaxy-watch-ultra', 'Galaxy Watch Ultra'),
  ('galaxy-s25-plus', 'Galaxy S25+'),
  ('galaxy-book-6', 'Galaxy Book 6'),
  ('galaxy-buds-3-pro', 'Galaxy Buds 3 Pro'),
  ('smartthings', 'SmartThings'),
  ('galaxy-a56', 'Galaxy A56'),
  ('galaxy-s25-fe', 'Galaxy S25 FE'),
  ('galaxy-buds-3', 'Galaxy Buds 3'),
  ('galaxy-fit-3', 'Galaxy Fit 3');
