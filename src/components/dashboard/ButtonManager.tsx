import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, GripVertical } from "lucide-react";

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
  nodeKey: string;
  buttons: FlowButton[];
  onUpdate: () => void;
  language: string;
}

const ButtonManager = ({ nodeKey, buttons, onUpdate, language }: Props) => {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newTimestamp, setNewTimestamp] = useState("0");

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const targetKey = newTarget.trim() || newLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await supabase.from("flow_buttons").insert({
      node_key: nodeKey,
      label: newLabel.trim(),
      target_node_key: targetKey,
      sort_order: buttons.length,
      appear_at_seconds: parseFloat(newTimestamp) || 0,
      language,
    });
    setNewLabel("");
    setNewTarget("");
    setNewTimestamp("0");
    setAdding(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("flow_buttons").delete().eq("id", id);
    onUpdate();
  };

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    await supabase.from("flow_buttons").update({ [field]: value }).eq("id", id);
    onUpdate();
  };

  return (
    <div className="mt-2 ml-12 space-y-1.5">
      {buttons.map((btn) => (
        <div key={btn.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-sm">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            className="flex-1 min-w-0 bg-transparent border-b border-transparent focus:border-primary outline-none text-foreground px-1 py-0.5"
            value={btn.label}
            onChange={(e) => handleUpdate(btn.id, "label", e.target.value)}
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">@</span>
            <input
              className="w-14 bg-transparent border-b border-transparent focus:border-primary outline-none text-foreground text-center px-1 py-0.5 text-xs"
              type="number"
              min="0"
              step="0.5"
              value={btn.appear_at_seconds}
              onChange={(e) => handleUpdate(btn.id, "appear_at_seconds", parseFloat(e.target.value) || 0)}
            />
            <span className="text-xs text-muted-foreground">s</span>
          </div>
          <button
            onClick={() => handleDelete(btn.id)}
            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
          <input
            className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none text-foreground px-1 py-1 text-sm"
            placeholder="Button label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            autoFocus
          />
          <input
            className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none text-foreground px-1 py-1 text-sm"
            placeholder="Target node key (auto-generated if empty)"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Appear at (seconds):</label>
            <input
              className="w-20 bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none text-foreground px-1 py-1 text-sm"
              type="number"
              min="0"
              step="0.5"
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add button
        </button>
      )}
    </div>
  );
};

export default ButtonManager;
