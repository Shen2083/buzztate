import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check, Loader2, Languages, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  translationStyles, 
  targetLanguages, 
  type TranslationStyle, 
  type TargetLanguage,
  type TranslateResponse,
  type TranslationResult
} from "@shared/schema";

function LanguageCheckbox({ 
  language, 
  selected, 
  onToggle 
}: { 
  language: TargetLanguage; 
  selected: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid={`checkbox-language-${language.toLowerCase()}`}
      className={`
        p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
        flex items-center gap-2 text-left
        ${selected 
          ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" 
          : "bg-card border-border text-muted-foreground hover-elevate"
        }
      `}
    >
      <div className={`
        w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
        ${selected ? "bg-yellow-400 border-yellow-400" : "border-muted-foreground"}
      `}>
        {selected && <Check className="w-3 h-3 text-gray-900" />}
      </div>
      <span className="font-medium">{language}</span>
    </button>
  );
}

function ResultCard({ result, index }: { result: TranslationResult; index: number }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.translation);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${result.language} translation copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className="p-6 relative animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
      data-testid={`card-result-${result.language.toLowerCase()}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-yellow-400 font-semibold text-lg" data-testid={`text-language-${result.language.toLowerCase()}`}>
          {result.language}
        </h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          className="text-muted-foreground"
          data-testid={`button-copy-${result.language.toLowerCase()}`}
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      
      <p className="text-lg font-bold text-foreground mb-4" data-testid={`text-translation-${result.language.toLowerCase()}`}>
        {result.translation}
      </p>
      
      <div className="border-t border-border pt-3 mt-3">
        <p className="text-xs uppercase text-muted-foreground mb-1">Reality Check:</p>
        <p className="text-sm italic text-muted-foreground" data-testid={`text-reality-${result.language.toLowerCase()}`}>
          {result.reality_check}
        </p>
      </div>
    </Card>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<TranslationStyle>("Modern Slang");
  const [selectedLanguages, setSelectedLanguages] = useState<TargetLanguage[]>([]);
  const [results, setResults] = useState<TranslationResult[]>([]);
  const { toast } = useToast();

  const translateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/translate", {
        text,
        target_languages: selectedLanguages,
        style
      });
      return response.json() as Promise<TranslateResponse>;
    },
    onSuccess: (data) => {
      setResults(data.results);
    },
    onError: (error: Error) => {
      toast({
        title: "Translation failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });

  const toggleLanguage = (language: TargetLanguage) => {
    setSelectedLanguages(prev => 
      prev.includes(language) 
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const canSubmit = text.trim().length > 0 && selectedLanguages.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Zap className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl sm:text-5xl font-bold">
              <span className="text-foreground">Buzz</span>
              <span className="text-yellow-400">tate</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Translate with personality. Get stylized translations that actually sound human.
          </p>
        </header>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Text
            </label>
            <Textarea
              placeholder="Enter the text you want to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
              data-testid="input-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Sparkles className="w-4 h-4 inline mr-2 text-yellow-400" />
              Translation Style
            </label>
            <Select value={style} onValueChange={(v) => setStyle(v as TranslationStyle)}>
              <SelectTrigger 
                className="w-full bg-card border-border text-foreground focus:ring-2 focus:ring-yellow-400"
                data-testid="select-style"
              >
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {translationStyles.map((s) => (
                  <SelectItem key={s} value={s} data-testid={`option-style-${s.toLowerCase().replace(/\s+/g, '-')}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Languages className="w-4 h-4 inline mr-2 text-yellow-400" />
              Target Languages
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {targetLanguages.map((lang) => (
                <LanguageCheckbox
                  key={lang}
                  language={lang}
                  selected={selectedLanguages.includes(lang)}
                  onToggle={() => toggleLanguage(lang)}
                />
              ))}
            </div>
            {selectedLanguages.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Select at least one language
              </p>
            )}
          </div>

          <Button
            onClick={() => translateMutation.mutate()}
            disabled={!canSubmit || translateMutation.isPending}
            className="w-full sm:w-auto sm:mx-auto sm:flex bg-yellow-400 text-gray-900 font-bold text-lg px-8 py-6 rounded-lg"
            data-testid="button-translate"
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Buzztate It
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <Languages className="w-6 h-6 text-yellow-400" />
              Your Translations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((result, idx) => (
                <ResultCard key={result.language} result={result} index={idx} />
              ))}
            </div>
          </section>
        )}

        {translateMutation.isPending && (
          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
              <p className="text-muted-foreground text-lg">Creating stylized translations...</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
