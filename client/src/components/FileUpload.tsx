import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react";
import { SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from "@/lib/file-parser-client";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function FileUpload({ onFileSelected, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type "${ext}". Please upload a CSV, TSV, or Excel file.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large (max 10 MB).";
    }
    if (file.size === 0) {
      return "File is empty.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [validateFile, onFileSelected]
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
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      {!selectedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
            ${dragActive
              ? "border-yellow-400 bg-yellow-400/5"
              : "border-gray-700 hover:border-gray-500 bg-gray-900/30"
            }
            ${isLoading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <Upload
            size={40}
            className={`mx-auto mb-4 ${dragActive ? "text-yellow-400" : "text-gray-500"}`}
          />
          <p className="text-lg font-semibold text-gray-300 mb-2">
            Drop your listings file here
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

      {/* Selected file preview */}
      {selectedFile && (
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
          {!isLoading && (
            <button
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
              title="Remove file"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-red-400 text-sm bg-red-400/5 border border-red-400/20 rounded-lg p-3">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
