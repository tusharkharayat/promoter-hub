import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Video, Check, Loader2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import ButtonManager from "@/components/dashboard/ButtonManager";

interface FlowVideo {
  id: string;
  node_key: string;
  label: string;
  video_url: string | null;
  updated_at: string;
}

interface FlowButton {
  id: string;
  node_key: string;
  label: string;
  target_node_key: string | null;
  sort_order: number;
  appear_at_seconds: number;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<FlowVideo[]>([]);
  const [buttons, setButtons] = useState<FlowButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [videosRes, buttonsRes] = await Promise.all([
      supabase.from("flow_videos").select("*").order("created_at"),
      supabase.from("flow_buttons").select("*").order("sort_order"),
    ]);
    if (videosRes.data) setVideos(videosRes.data as FlowVideo[]);
    if (buttonsRes.data) setButtons(buttonsRes.data as FlowButton[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (nodeKey: string, file: File) => {
    setUploading(nodeKey);
    const ext = file.name.split(".").pop();
    const path = `${nodeKey}.${ext}`;
    await supabase.storage.from("videos").remove([path]);
    const { error: uploadError } = await supabase.storage.from("videos").upload(path, file, { upsert: true });
    if (uploadError) { console.error("Upload error:", uploadError); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(path);
    await supabase.from("flow_videos").update({ video_url: urlData.publicUrl }).eq("node_key", nodeKey);
    setUploading(null);
    fetchData();
  };

  const handleRemove = async (nodeKey: string, videoUrl: string) => {
    const filename = videoUrl.split("/").pop();
    if (filename) await supabase.storage.from("videos").remove([filename]);
    await supabase.from("flow_videos").update({ video_url: null }).eq("node_key", nodeKey);
    fetchData();
  };

  const introVideos = videos.filter((v) => v.node_key === "intro");
  const categoryVideos = videos.filter((v) => ["power-user", "professional", "everyday-essential"].includes(v.node_key));
  const productVideos = videos.filter((v) => v.node_key !== "intro" && !["power-user", "professional", "everyday-essential"].includes(v.node_key));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-auto" style={{ touchAction: "auto" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Video Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage videos and buttons for the Virtual Promoter flow
          </p>
        </div>

        <Section title="Intro" items={introVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} />
        <Section title="Category Videos" items={categoryVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} />
        <Section title="Product Videos" items={productVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} />
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  items: FlowVideo[];
  buttons: FlowButton[];
  uploading: string | null;
  onUpload: (nodeKey: string, file: File) => void;
  onRemove: (nodeKey: string, videoUrl: string) => void;
  onButtonsUpdate: () => void;
}

const Section = ({ title, items, buttons, uploading, onUpload, onRemove, onButtonsUpdate }: SectionProps) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h2>
      <div className="space-y-2">
        {items.map((v) => (
          <VideoRow
            key={v.id}
            video={v}
            buttons={buttons.filter((b) => b.node_key === v.node_key)}
            isUploading={uploading === v.node_key}
            onUpload={onUpload}
            onRemove={onRemove}
            onButtonsUpdate={onButtonsUpdate}
          />
        ))}
      </div>
    </div>
  );
};

interface VideoRowProps {
  video: FlowVideo;
  buttons: FlowButton[];
  isUploading: boolean;
  onUpload: (nodeKey: string, file: File) => void;
  onRemove: (nodeKey: string, videoUrl: string) => void;
  onButtonsUpdate: () => void;
}

const VideoRow = ({ video, buttons, isUploading, onUpload, onRemove, onButtonsUpdate }: VideoRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasVideo = !!video.video_url;

  return (
    <div>
      <div
        className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          {hasVideo ? <Check className="w-4 h-4 text-primary" /> : <Video className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{video.label}</p>
          <p className="text-xs text-muted-foreground">
            {hasVideo ? "Video uploaded" : "No video"} · {buttons.length} button{buttons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {hasVideo && (
            <button onClick={() => onRemove(video.node_key, video.video_url!)} className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <label className="cursor-pointer p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(video.node_key, f); }} disabled={isUploading} />
          </label>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <ButtonManager nodeKey={video.node_key} buttons={buttons} onUpdate={onButtonsUpdate} />
      )}
    </div>
  );
};

export default Dashboard;
