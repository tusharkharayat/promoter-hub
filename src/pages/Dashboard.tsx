import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Video, Check, Loader2, Trash2 } from "lucide-react";

interface FlowVideo {
  id: string;
  node_key: string;
  label: string;
  video_url: string | null;
  updated_at: string;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<FlowVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    const { data } = await supabase
      .from("flow_videos")
      .select("*")
      .order("created_at");
    if (data) setVideos(data as FlowVideo[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleUpload = async (nodeKey: string, file: File) => {
    setUploading(nodeKey);
    const ext = file.name.split(".").pop();
    const path = `${nodeKey}.${ext}`;

    // Remove old file if exists
    await supabase.storage.from("videos").remove([path]);

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploading(null);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(path);

    await supabase
      .from("flow_videos")
      .update({ video_url: urlData.publicUrl })
      .eq("node_key", nodeKey);

    setUploading(null);
    fetchVideos();
  };

  const handleRemove = async (nodeKey: string, videoUrl: string) => {
    const filename = videoUrl.split("/").pop();
    if (filename) {
      await supabase.storage.from("videos").remove([filename]);
    }
    await supabase
      .from("flow_videos")
      .update({ video_url: null })
      .eq("node_key", nodeKey);
    fetchVideos();
  };

  // Group videos by type
  const introVideos = videos.filter((v) => v.node_key === "intro");
  const categoryVideos = videos.filter((v) =>
    ["power-user", "professional", "everyday-essential"].includes(v.node_key)
  );
  const productVideos = videos.filter(
    (v) =>
      v.node_key !== "intro" &&
      !["power-user", "professional", "everyday-essential"].includes(v.node_key)
  );

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
            Upload videos for each step in the Virtual Promoter flow
          </p>
        </div>

        <Section title="Intro" items={introVideos} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
        <Section title="Category Videos" items={categoryVideos} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
        <Section title="Product Videos" items={productVideos} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} />
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  items: FlowVideo[];
  uploading: string | null;
  onUpload: (nodeKey: string, file: File) => void;
  onRemove: (nodeKey: string, videoUrl: string) => void;
}

const Section = ({ title, items, uploading, onUpload, onRemove }: SectionProps) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((v) => (
          <VideoRow
            key={v.id}
            video={v}
            isUploading={uploading === v.node_key}
            onUpload={onUpload}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

interface VideoRowProps {
  video: FlowVideo;
  isUploading: boolean;
  onUpload: (nodeKey: string, file: File) => void;
  onRemove: (nodeKey: string, videoUrl: string) => void;
}

const VideoRow = ({ video, isUploading, onUpload, onRemove }: VideoRowProps) => {
  const hasVideo = !!video.video_url;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        {hasVideo ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <Video className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{video.label}</p>
        <p className="text-xs text-muted-foreground">
          {hasVideo ? "Video uploaded" : "No video"}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {hasVideo && (
          <button
            onClick={() => onRemove(video.node_key, video.video_url!)}
            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <label className="cursor-pointer p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(video.node_key, file);
            }}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};

export default Dashboard;
