import { useState } from "react";
import { Upload, Video, Check, Loader2, Trash2, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import ButtonManager from "./ButtonManager";

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

interface Props {
  video: FlowVideo;
  buttons: FlowButton[];
  uploading: string | null;
  onUpload: (nodeKey: string, file: File, type: "main" | "loop") => void;
  onRemove: (nodeKey: string, videoUrl: string, type: "main" | "loop") => void;
  onButtonsUpdate: () => void;
  language: string;
}

const VideoRow = ({ video, buttons, uploading, onUpload, onRemove, onButtonsUpdate, language }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const hasVideo = !!video.video_url;
  const hasLoop = !!video.loop_video_url;
  const isUploadingMain = uploading === `${video.node_key}-main`;
  const isUploadingLoop = uploading === `${video.node_key}-loop`;

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
            {hasVideo ? "Video ✓" : "No video"} · {hasLoop ? "Loop ✓" : "No loop"} · {buttons.length} btn{buttons.length !== 1 ? "s" : ""}
          </p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="mt-2 ml-4 space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <Video className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground flex-1">Main Video</span>
            {hasVideo && (
              <button onClick={() => onRemove(video.node_key, video.video_url!, "main")} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <label className="cursor-pointer p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {isUploadingMain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(video.node_key, f, "main"); }} disabled={!!uploading} />
            </label>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
            <RefreshCw className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground flex-1">Loop Video (plays blurred after main)</span>
            {hasLoop && (
              <button onClick={() => onRemove(video.node_key, video.loop_video_url!, "loop")} className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <label className="cursor-pointer p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {isUploadingLoop ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(video.node_key, f, "loop"); }} disabled={!!uploading} />
            </label>
          </div>

          <ButtonManager nodeKey={video.node_key} buttons={buttons} onUpdate={onButtonsUpdate} language={language} />
        </div>
      )}
    </div>
  );
};

export default VideoRow;
