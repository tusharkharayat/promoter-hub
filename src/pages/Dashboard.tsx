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

const PRODUCTS = [
  { key: "galaxy-book-6-series", label: "Galaxy Book 6 Series" },
  { key: "galaxy-s26", label: "Galaxy S26" },
  { key: "galaxy-s25", label: "Galaxy S25" },
  { key: "galaxy-watch-8", label: "Galaxy Watch 8" },
  { key: "galaxy-tab-s10", label: "Galaxy Tab S10" },
];

const VARIANTS = ["Ultra", "Pro", "Base"];

// Master node structure — every language gets these nodes
const MASTER_NODES: { node_key: string; label: string }[] = [
  { node_key: "product-picker", label: "Product Picker (loop video + 5 buttons)" },
  ...PRODUCTS.flatMap((p) => [
    { node_key: p.key, label: `${p.label} — Intro` },
    ...VARIANTS.map((v) => ({
      node_key: `${p.key}-${v.toLowerCase()}`,
      label: `${p.label} — ${v}`,
    })),
  ]),
];

const PICKER_KEY = "product-picker";
const INTRO_KEYS = PRODUCTS.map((p) => p.key);
const VARIANT_KEYS = PRODUCTS.flatMap((p) =>
  VARIANTS.map((v) => `${p.key}-${v.toLowerCase()}`)
);

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
    let btns = (buttonsRes.data || []) as FlowButton[];

    // Auto-seed missing video nodes for this language
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

    // Auto-seed default buttons (picker → 5 products; each intro → 3 variants)
    const btnsByNode = new Map<string, FlowButton[]>();
    btns.forEach((b) => {
      if (!btnsByNode.has(b.node_key)) btnsByNode.set(b.node_key, []);
      btnsByNode.get(b.node_key)!.push(b);
    });

    const toInsert: Omit<FlowButton, "id">[] = [];

    if (!btnsByNode.has(PICKER_KEY)) {
      PRODUCTS.forEach((p, i) => {
        toInsert.push({
          node_key: PICKER_KEY,
          label: p.label,
          target_node_key: p.key,
          sort_order: i,
          appear_at_seconds: 0,
          language: selectedLang,
        });
      });
    }

    PRODUCTS.forEach((p) => {
      if (!btnsByNode.has(p.key)) {
        VARIANTS.forEach((v, i) => {
          toInsert.push({
            node_key: p.key,
            label: v,
            target_node_key: `${p.key}-${v.toLowerCase()}`,
            sort_order: i,
            appear_at_seconds: 0,
            language: selectedLang,
          });
        });
      }
    });

    if (toInsert.length > 0) {
      const { data: insertedBtns } = await supabase.from("flow_buttons").insert(toInsert).select("*");
      if (insertedBtns) btns = [...btns, ...(insertedBtns as FlowButton[])];
    }

    setVideos(vids);
    setButtons(btns);
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

  // Order videos according to MASTER_NODES
  const orderedKey = (k: string) => MASTER_NODES.findIndex((n) => n.node_key === k);
  const sortByMaster = (a: FlowVideo, b: FlowVideo) => orderedKey(a.node_key) - orderedKey(b.node_key);

  const pickerVideos = videos.filter((v) => v.node_key === PICKER_KEY);
  const introVideos = videos.filter((v) => INTRO_KEYS.includes(v.node_key)).sort(sortByMaster);
  const variantVideos = videos.filter((v) => VARIANT_KEYS.includes(v.node_key)).sort(sortByMaster);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-y-auto overflow-x-hidden" style={{ touchAction: "auto", WebkitOverflowScrolling: "touch", overscrollBehavior: "auto" }}>
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

        <VideoSection title="Product Picker (loop + 5 buttons)" items={pickerVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
        <VideoSection title="Product Intro Videos" items={introVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
        <VideoSection title="Product Variants (Ultra / Pro / Base)" items={variantVideos} buttons={buttons} uploading={uploading} onUpload={handleUpload} onRemove={handleRemove} onButtonsUpdate={fetchData} language={selectedLang} />
      </div>
    </div>
  );
};

export default Dashboard;
