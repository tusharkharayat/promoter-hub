import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import VideoSection from "@/components/dashboard/VideoSection";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

// Master node structure — every language gets these nodes
const MASTER_NODES = [
  { node_key: "intro", label: "Intro Video (after language select)" },
  { node_key: "power-user", label: "Power User Category Video" },
  { node_key: "professional", label: "Professional Category Video" },
  { node_key: "everyday-essential", label: "Everyday Essential Category Video" },
  { node_key: "galaxy-s25-ultra", label: "Galaxy S25 Ultra" },
  { node_key: "galaxy-z-fold-6", label: "Galaxy Z Fold 6" },
  { node_key: "galaxy-tab-s10", label: "Galaxy Tab S10" },
  { node_key: "galaxy-watch-ultra", label: "Galaxy Watch Ultra" },
  { node_key: "galaxy-s25-plus", label: "Galaxy S25+" },
  { node_key: "galaxy-book-6", label: "Galaxy Book 6" },
  { node_key: "galaxy-buds-3-pro", label: "Galaxy Buds 3 Pro" },
  { node_key: "smartthings", label: "SmartThings" },
  { node_key: "galaxy-a56", label: "Galaxy A56" },
  { node_key: "galaxy-s25-fe", label: "Galaxy S25 FE" },
  { node_key: "galaxy-buds-3", label: "Galaxy Buds 3" },
  { node_key: "galaxy-fit-3", label: "Galaxy Fit 3" },
];

interface FlowVideo {
  id: string;
  node_key: string;
  label: string;
  video_url: string | null;
  loop_video_url: string | null;
  updated_at: string;
  language: string;
}

interface FlowButton {
  id: string;
  node_key: string;
  label: string;
  target_node_key: string | null;
  sort_order: number;
  appear_at_seconds: number;
  language: string;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<FlowVideo[]>([]);
  const [buttons, setButtons] = useState<FlowButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("en");
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [videosRes, buttonsRes] = await Promise.all([
      supabase.from("flow_videos").select("*").eq("language", selectedLang).order("created_at"),
      supabase.from("flow_buttons").select("*").eq("language", selectedLang).order("sort_order"),
    ]);

    let vids = (videosRes.data || []) as FlowVideo[];

    // Auto-seed missing nodes for this language
    if (vids.length < MASTER_NODES.length) {
      const existingKeys = new Set(vids.map((v) => v.node_key));
      const missing = MASTER_NODES.filter((n) => !existingKeys.has(n.node_key));
      if (missing.length > 0) {
        const rows = missing.map((n) => ({
          node_key: n.node_key,
          label: n.label,
          language: selectedLang,
        }));
        const { data: inserted } = await supabase.from("flow_videos").insert(rows).select("*");
        if (inserted) vids = [...vids, ...(inserted as FlowVideo[])];
      }
    }

    setVideos(vids);
    if (buttonsRes.data) setButtons(buttonsRes.data as FlowButton[]);
    setLoading(false);
  }, [selectedLang]);

  useEffect(() => { setLoading(true); fetchData(); }, [fetchData]);

  const handleUpload = async (nodeKey: string, file: File, type: "main" | "loop") => {
    const uploadKey = `${nodeKey}-${type}`;
    setUploading(uploadKey);
    const ext = file.name.split(".").pop();
    const path = type === "loop" ? `${selectedLang}/${nodeKey}-loop.${ext}` : `${selectedLang}/${nodeKey}.${ext}`;
    await supabase.storage.from("videos").remove([path]);
    const { error: uploadError } = await supabase.storage.from("videos").upload(path, file, { upsert: true });
    if (uploadError) { console.error("Upload error:", uploadError); setUploading(null); return; }
    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(path);
    const field = type === "loop" ? "loop_video_url" : "video_url";
    await supabase.from("flow_videos").update({ [field]: urlData.publicUrl }).eq("node_key", nodeKey).eq("language", selectedLang);
    setUploading(null);
    fetchData();
  };

  const handleRemove = async (nodeKey: string, videoUrl: string, type: "main" | "loop") => {
    const filename = videoUrl.split("/videos/")[1] || videoUrl.split("/").pop();
    if (filename) await supabase.storage.from("videos").remove([filename]);
    const field = type === "loop" ? "loop_video_url" : "video_url";
    await supabase.from("flow_videos").update({ [field]: null }).eq("node_key", nodeKey).eq("language", selectedLang);
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
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Video Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage videos and buttons for the Virtual Promoter flow
          </p>
        </div>

        {/* Language tabs */}
        <div className="mb-6 flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedLang === lang.code
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <VideoSection title="Intro" items={introVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
        <VideoSection title="Category Videos" items={categoryVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
        <VideoSection title="Product Videos" items={productVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
      </div>
    </div>
  );
};

export default Dashboard;
