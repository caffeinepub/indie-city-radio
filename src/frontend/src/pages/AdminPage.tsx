import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type {
  Episode,
  EpisodeInput,
  PodcastInfo,
} from "../declarations/backend.did";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useIsAdmin";
import {
  useAllEpisodes,
  useCreateEpisode,
  useDeleteEpisode,
  usePodcastInfo,
  useSetPodcastInfo,
  useUpdateEpisode,
} from "../hooks/useQueries";
import { useStorageClient } from "../hooks/useStorageClient";

interface EpisodeFormData {
  title: string;
  description: string;
  showNotes: string;
  publishedDate: string;
  duration: string;
  audioFileId: string;
  artworkFileId: string;
  published: boolean;
  explicit: boolean;
}

const EMPTY_FORM: EpisodeFormData = {
  title: "",
  description: "",
  showNotes: "",
  publishedDate: new Date().toISOString().split("T")[0],
  duration: "",
  audioFileId: "",
  artworkFileId: "",
  published: false,
  explicit: false,
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
      title="Copy principal"
    >
      {copied ? (
        <Check className="w-4 h-4 text-wave-blue" />
      ) : (
        <Copy className="w-4 h-4 text-wave-gray" />
      )}
    </button>
  );
}

function EpisodeFormDialog({
  open,
  onOpenChange,
  initial,
  episodeId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: EpisodeFormData;
  episodeId?: bigint;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EpisodeFormData>(initial ?? EMPTY_FORM);
  const [audioUploadProgress, setAudioUploadProgress] = useState<number | null>(
    null,
  );
  const [artworkUploadProgress, setArtworkUploadProgress] = useState<
    number | null
  >(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const { storageClient } = useStorageClient();
  const createEpisode = useCreateEpisode();
  const updateEpisode = useUpdateEpisode();

  const isEditing = !!episodeId;

  const set = (key: keyof EpisodeFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAudio = async (file: File) => {
    if (!storageClient) {
      toast.error("Storage not ready");
      return;
    }
    try {
      setAudioUploadProgress(0);
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const { hash } = await storageClient.putFile(bytes, (p) =>
        setAudioUploadProgress(p),
      );
      set("audioFileId", hash);
      setAudioUploadProgress(null);
      toast.success("Audio uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Audio upload failed");
      setAudioUploadProgress(null);
    }
  };

  const uploadArtwork = async (file: File) => {
    if (!storageClient) {
      toast.error("Storage not ready");
      return;
    }
    try {
      setArtworkUploadProgress(0);
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const { hash } = await storageClient.putFile(bytes, (p) =>
        setArtworkUploadProgress(p),
      );
      set("artworkFileId", hash);
      setArtworkUploadProgress(null);
      toast.success("Artwork uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Artwork upload failed");
      setArtworkUploadProgress(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const input: EpisodeInput = {
      title: form.title,
      description: form.description,
      showNotes: form.showNotes,
      publishedDate: form.publishedDate,
      duration: form.duration,
      audioFileId: form.audioFileId,
      artworkFileId: form.artworkFileId,
      published: form.published,
      explicit: form.explicit,
    };
    try {
      if (isEditing && episodeId !== undefined) {
        await updateEpisode.mutateAsync({ id: episodeId, input });
        toast.success("Episode updated!");
      } else {
        await createEpisode.mutateAsync(input);
        toast.success("Episode created!");
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save episode");
    }
  };

  const isPending = createEpisode.isPending || updateEpisode.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#1A1C24", borderColor: "#2A2D38" }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-white">
            {isEditing ? "Edit Episode" : "New Episode"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-wave-gray text-xs uppercase tracking-widest">
                Title *
              </Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Episode title"
                style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-wave-gray text-xs uppercase tracking-widest">
                Publish Date
              </Label>
              <Input
                type="date"
                value={form.publishedDate}
                onChange={(e) => set("publishedDate", e.target.value)}
                style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-wave-gray text-xs uppercase tracking-widest">
                Duration
              </Label>
              <Input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="e.g. 45:30"
                style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-wave-gray text-xs uppercase tracking-widest">
              Description
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Short episode description"
              rows={3}
              style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-wave-gray text-xs uppercase tracking-widest">
              Show Notes
            </Label>
            <Textarea
              value={form.showNotes}
              onChange={(e) => set("showNotes", e.target.value)}
              placeholder="Detailed show notes, links, chapters..."
              rows={5}
              style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-wave-gray text-xs uppercase tracking-widest">
              Audio File
            </Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAudio(file);
              }}
            />
            <div className="flex gap-3 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => audioInputRef.current?.click()}
                disabled={audioUploadProgress !== null}
                style={{ borderColor: "#2A2D38", background: "#0B0D12" }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {audioUploadProgress !== null ? "Uploading..." : "Upload Audio"}
              </Button>
              {form.audioFileId && (
                <span className="text-xs text-wave-blue font-mono truncate max-w-xs">
                  ✓ {form.audioFileId.slice(0, 20)}...
                </span>
              )}
            </div>
            {audioUploadProgress !== null && (
              <Progress value={audioUploadProgress} className="h-1" />
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-wave-gray text-xs uppercase tracking-widest">
              Artwork Image
            </Label>
            <input
              ref={artworkInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadArtwork(file);
              }}
            />
            <div className="flex gap-3 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => artworkInputRef.current?.click()}
                disabled={artworkUploadProgress !== null}
                style={{ borderColor: "#2A2D38", background: "#0B0D12" }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {artworkUploadProgress !== null
                  ? "Uploading..."
                  : "Upload Artwork"}
              </Button>
              {form.artworkFileId && (
                <span className="text-xs text-wave-blue font-mono truncate max-w-xs">
                  ✓ {form.artworkFileId.slice(0, 20)}...
                </span>
              )}
            </div>
            {artworkUploadProgress !== null && (
              <Progress value={artworkUploadProgress} className="h-1" />
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-wave-border">
            <div>
              <p className="text-sm font-semibold text-white">Published</p>
              <p className="text-xs text-wave-gray">
                Make visible to public listeners
              </p>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(v) => set("published", v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-wave-border">
            <div>
              <p className="text-sm font-semibold text-white">
                Explicit Content
              </p>
              <p className="text-xs text-wave-gray">
                Mark if this episode contains explicit language
              </p>
            </div>
            <Switch
              checked={form.explicit}
              onCheckedChange={(v) => set("explicit", v)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{ borderColor: "#2A2D38" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="gradient-btn border-0"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Episode"
                : "Create Episode"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PodcastSettingsForm() {
  const { data: info, isLoading } = usePodcastInfo();
  const setInfo = useSetPodcastInfo();
  const [form, setForm] = useState<PodcastInfo | null>(null);

  const currentForm: PodcastInfo = form ??
    info ?? {
      stationName: "",
      description: "",
      websiteUrl: "",
      author: "",
      language: "en",
      category: "Music",
    };

  const set = (key: keyof PodcastInfo, value: string) => {
    setForm((prev) => ({ ...(prev ?? currentForm), [key]: value }));
  };

  const handleSave = async () => {
    try {
      await setInfo.mutateAsync(currentForm);
      toast.success("Podcast settings saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return <div className="text-wave-gray text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-wave-gray text-xs uppercase tracking-widest">
            Station Name
          </Label>
          <Input
            value={currentForm.stationName}
            onChange={(e) => set("stationName", e.target.value)}
            style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-wave-gray text-xs uppercase tracking-widest">
            Author
          </Label>
          <Input
            value={currentForm.author}
            onChange={(e) => set("author", e.target.value)}
            style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-wave-gray text-xs uppercase tracking-widest">
            Website URL
          </Label>
          <Input
            value={currentForm.websiteUrl}
            onChange={(e) => set("websiteUrl", e.target.value)}
            style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-wave-gray text-xs uppercase tracking-widest">
            Language
          </Label>
          <Input
            value={currentForm.language}
            onChange={(e) => set("language", e.target.value)}
            style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-wave-gray text-xs uppercase tracking-widest">
            Category
          </Label>
          <Input
            value={currentForm.category}
            onChange={(e) => set("category", e.target.value)}
            style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-wave-gray text-xs uppercase tracking-widest">
          Description
        </Label>
        <Textarea
          value={currentForm.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          style={{ background: "#0B0D12", borderColor: "#2A2D38" }}
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={setInfo.isPending}
        className="gradient-btn border-0"
      >
        {setInfo.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {setInfo.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

export default function AdminPage() {
  const {
    login,
    loginStatus,
    identity,
    clear: logout,
    isInitializing,
  } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const isAdmin = useIsAdmin();
  const { data: episodes, isLoading: episodesLoading } = useAllEpisodes();
  const deleteEpisode = useDeleteEpisode();

  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const principal = identity?.getPrincipal().toString();

  const handleDeleteEpisode = async (id: bigint) => {
    try {
      await deleteEpisode.mutateAsync(id);
      toast.success("Episode deleted");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete episode");
    }
  };

  const openEditDialog = (episode: Episode) => {
    setEditingEpisode(episode);
    setEpisodeDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingEpisode(null);
    setEpisodeDialogOpen(true);
  };

  if (isInitializing || actorFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-wave-blue" />
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm w-full"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "rgba(71,188,150,0.15)",
              border: "1px solid rgba(71,188,150,0.3)",
            }}
          >
            <Shield className="w-8 h-8 text-wave-blue" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-wave-gray text-sm">
              Sign in with Internet Identity to manage episodes and settings.
            </p>
          </div>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full gradient-btn border-0 h-12 text-sm font-bold tracking-widest uppercase"
          >
            {isLoggingIn && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoggingIn ? "Signing In..." : "Sign In with Internet Identity"}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="grid-bg min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md w-full"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{
              background: "rgba(71,188,150,0.15)",
              border: "1px solid rgba(71,188,150,0.3)",
            }}
          >
            <Shield className="w-8 h-8 text-wave-blue" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-2">
              Access Denied
            </h1>
            <p className="text-wave-gray text-sm">
              Your account does not have admin access.
            </p>
          </div>
          {principal && (
            <div
              className="rounded-xl p-4 text-left"
              style={{ background: "#1A1C24", border: "1px solid #2A2D38" }}
            >
              <p className="text-xs text-wave-gray uppercase tracking-widest mb-2">
                Your Principal
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-mono text-white break-all leading-relaxed">
                  {principal}
                </p>
                <CopyButton text={principal} />
              </div>
            </div>
          )}
          <Button
            onClick={() => logout()}
            variant="outline"
            className="w-full h-12 text-sm font-bold tracking-widest uppercase"
            style={{ borderColor: "#2A2D38" }}
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-wave-blue uppercase mb-1">
                Control Center
              </p>
              <h1 className="font-display font-black text-3xl text-white">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                className="text-xs px-3 py-1"
                style={{
                  background: "rgba(71,188,150,0.15)",
                  color: "#47bc96",
                  border: "1px solid rgba(71,188,150,0.3)",
                }}
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-wave-gray hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>

          {principal && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#1A1C24", border: "1px solid #2A2D38" }}
            >
              <p className="text-xs text-wave-gray uppercase tracking-widest shrink-0">
                Principal
              </p>
              <p className="text-xs font-mono text-wave-blue truncate flex-1">
                {principal}
              </p>
              <CopyButton text={principal} />
            </div>
          )}

          <Tabs defaultValue="episodes">
            <TabsList
              className="mb-6"
              style={{ background: "#1A1C24", borderColor: "#2A2D38" }}
            >
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
              <TabsTrigger value="settings">Podcast Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="episodes">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-wave-gray text-sm">
                    {episodes?.length ?? 0} episode
                    {episodes?.length !== 1 ? "s" : ""} total
                  </p>
                  <Button
                    onClick={openCreateDialog}
                    className="gradient-btn border-0"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Episode
                  </Button>
                </div>

                {episodesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-wave-blue" />
                  </div>
                ) : episodes && episodes.length > 0 ? (
                  <div
                    className="rounded-2xl border border-wave-border overflow-hidden"
                    style={{ background: "#1A1C24" }}
                  >
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-wave-border">
                          <th className="text-left px-6 py-4 text-xs font-semibold tracking-widest text-wave-gray uppercase">
                            Title
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-semibold tracking-widest text-wave-gray uppercase hidden md:table-cell">
                            Date
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-semibold tracking-widest text-wave-gray uppercase hidden md:table-cell">
                            Duration
                          </th>
                          <th className="text-left px-6 py-4 text-xs font-semibold tracking-widest text-wave-gray uppercase">
                            Status
                          </th>
                          <th className="text-right px-6 py-4 text-xs font-semibold tracking-widest text-wave-gray uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {episodes.map((episode) => (
                          <tr
                            key={episode.id.toString()}
                            className="border-b border-wave-border last:border-0 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white truncate max-w-xs">
                                {episode.title}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-wave-gray hidden md:table-cell">
                              {episode.publishedDate}
                            </td>
                            <td className="px-6 py-4 text-wave-gray hidden md:table-cell">
                              {episode.duration}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="text-xs px-2 py-1 rounded-full font-semibold"
                                style={{
                                  background: episode.published
                                    ? "rgba(74,222,128,0.15)"
                                    : "rgba(255,255,255,0.07)",
                                  color: episode.published
                                    ? "#4ade80"
                                    : "#B7BBC8",
                                }}
                              >
                                {episode.published ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(episode)}
                                  className="text-wave-gray hover:text-white h-8 w-8 p-0"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDeleteConfirmId(episode.id)}
                                  className="text-wave-gray hover:text-red-400 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    className="text-center py-16 rounded-2xl border border-wave-border"
                    style={{ background: "#1A1C24" }}
                  >
                    <p className="text-wave-gray">
                      No episodes yet. Create your first one!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <PodcastSettingsForm />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <EpisodeFormDialog
        open={episodeDialogOpen}
        onOpenChange={setEpisodeDialogOpen}
        initial={
          editingEpisode
            ? {
                title: editingEpisode.title,
                description: editingEpisode.description,
                showNotes: editingEpisode.showNotes,
                publishedDate: editingEpisode.publishedDate,
                duration: editingEpisode.duration,
                audioFileId: editingEpisode.audioFileId,
                artworkFileId: editingEpisode.artworkFileId,
                published: editingEpisode.published,
                explicit: editingEpisode.explicit,
              }
            : EMPTY_FORM
        }
        episodeId={editingEpisode?.id}
        onSaved={() => setEditingEpisode(null)}
      />

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <AlertDialogContent
          style={{ background: "#1A1C24", borderColor: "#2A2D38" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Episode?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-wave-gray">
              This action cannot be undone. The episode will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: "#2A2D38" }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirmId !== null && handleDeleteEpisode(deleteConfirmId)
              }
              className="gradient-btn border-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
