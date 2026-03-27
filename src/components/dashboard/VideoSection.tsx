import VideoRow from "./VideoRow";

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
  title: string;
  items: FlowVideo[];
  buttons: FlowButton[];
  uploading: string | null;
  onUpload: (nodeKey: string, file: File, type: "main" | "loop") => void;
  onRemove: (nodeKey: string, videoUrl: string, type: "main" | "loop") => void;
  onButtonsUpdate: () => void;
  language: string;
}

const VideoSection = ({ title, items, buttons, uploading, onUpload, onRemove, onButtonsUpdate, language }: Props) => {
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
            uploading={uploading}
            onUpload={onUpload}
            onRemove={onRemove}
            onButtonsUpdate={onButtonsUpdate}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
