"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadUrl } from "@/systems/pam/hooks/useUploadUrl";

interface Props {
  employeeId: number;
  onUploadComplete: (fileKey: string) => void;
  onReset?: () => void;
}

export function AppraisalFileUpload({ employeeId, onUploadComplete, onReset }: Props) {
  const { upload, uploading, fileKey, fileName, error, reset } = useUploadUrl(employeeId);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const key = await upload(file);
      if (key) onUploadComplete(key);
    },
    [upload, onUploadComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  function handleReset() {
    reset();
    onReset?.();
  }

  // Uploaded state
  if (fileKey) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
        <FileCheck className="h-4 w-4 shrink-0 text-green-600" />
        <span className="flex-1 truncate text-sm font-medium text-green-800">{fileName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-green-700 hover:text-red-600"
          onClick={handleReset}
          title="Remove file"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/40",
          uploading && "pointer-events-none opacity-60",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Drop file here or{" "}
              <span className="font-medium text-primary">click to upload</span>
            </p>
            <p className="text-[11px] text-muted-foreground">PDF, DOCX, or image</p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}