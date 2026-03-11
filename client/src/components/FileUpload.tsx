import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from "@/lib/file-parser-client";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  /** Pass an error from the parent (e.g. parse failure) */
  parseError?: string | null;
  /** Call to reset external parse error */
  onClearError?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** Map common non-supported extensions to friendly names */
const EXT_NAMES: Record<string, string> = {
  ".pdf": "PDF",
  ".doc": "Word document",
  ".docx": "Word document",
  ".txt": "text",
  ".json": "JSON",
  ".xml": "XML",
  ".zip": "ZIP archive",
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
};

export default function FileUpload({ onFileSelected, isLoading, parseError, onClearError }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = parseError || error;

  const validateFile = useCallback((file: File): string | null => {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      const friendlyType = EXT_NAMES[ext];
      if (friendlyType) {
        return `We support .csv, .xlsx, and .tsv files. This looks like a ${friendlyType} file.`;
      }
      return `Unsupported file type "${ext}". Please upload a .csv, .xlsx, or .tsv file.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "This file is too large. Please split it into smaller batches (max 10 MB per file).";
    }
    if (file.size === 0) {
      return "This file appears to be empty. Please check and re-upload.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      onClearError?.();
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [validateFile, onFileSelected, onClearError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    onClearError?.();
    if (inputRef.current) inputRef.current.value = "";
  }, [onClearError]);

  const handleTryAgain = useCallback(() => {
    clearFile();
    // Give DOM time to reset, then open file picker
    setTimeout(() => inputRef.current?.click(), 50);
  }, [clearFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      {!selectedFile && !isLoading && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
            ${dragActive
              ? "border-yellow-400 bg-yellow-400/5 shadow-[0_0_30px_rgba(250,204,21,0.1)]"
              : "border-gray-700 hover:border-gray-500 bg-gray-900/30"
            }
          `}
        >
          <Upload
            size={40}
            className={`mx-auto mb-4 transition-colors ${dragActive ? "text-yellow-400" : "text-gray-500"}`}
          />
          <p className="text-lg font-semibold text-gray-300 mb-2">
            {dragActive ? "Drop to upload" : "Drop your listings file here"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse
          </p>
          <div className="flex justify-center gap-3">
            {[".csv", ".xlsx", ".tsv"].map((ext) => (
              <span
                key={ext}
                className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700"
              >
                {ext}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Supports Amazon Seller Central, Shopify, and Etsy export formats
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={SUPPORTED_MIME_TYPES.join(",") + "," + SUPPORTED_EXTENSIONS.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Parsing state */}
      {isLoading && (
        <div className="border-2 border-dashed border-yellow-400/30 rounded-2xl p-10 text-center bg-yellow-400/5">
          <Loader2 size={40} className="mx-auto mb-4 text-yellow-400 animate-spin" />
          <p className="text-lg font-semibold text-gray-300 mb-2">
            Reading your file...
          </p>
          <p className="text-sm text-gray-500">
            {selectedFile?.name || "Detecting columns and rows"}
          </p>
        </div>
      )}

      {/* Selected file preview (shown after parse, not during) */}
      {selectedFile && !isLoading && !displayError && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet size={20} className="text-green-400" />
          </div>
          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); clearFile(); }}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error message with Try Again */}
      {displayError && (
        <div className="mt-3 bg-red-400/5 border border-red-400/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="text-sm text-red-300 font-medium">{displayError}</p>
            </div>
          </div>
          <button
            onClick={handleTryAgain}
            className="mt-3 text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Try again
          </button>
          {/* Hidden input still needed for Try Again */}
          <input
            ref={inputRef}
            type="file"
            accept={SUPPORTED_MIME_TYPES.join(",") + "," + SUPPORTED_EXTENSIONS.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
