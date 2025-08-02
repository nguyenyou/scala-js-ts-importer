import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";

interface CodeHighlighterProps {
  code: string;
  language: "typescript" | "scala";
  className?: string;
}

let highlighterInstance: Highlighter | null = null;

export function CodeHighlighter({ code, language, className = "" }: CodeHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeHighlighter = async () => {
      try {
        if (!highlighterInstance) {
          highlighterInstance = await createHighlighter({
            themes: ['github-light', 'github-dark'],
            langs: ['typescript', 'scala']
          });
        }

        const highlighted = highlighterInstance.codeToHtml(code, {
          lang: language,
          theme: 'github-light'
        });

        setHighlightedCode(highlighted);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to highlight code:", error);
        setHighlightedCode(`<pre><code>${escapeHtml(code)}</code></pre>`);
        setIsLoading(false);
      }
    };

    if (code.trim()) {
      initializeHighlighter();
    } else {
      setHighlightedCode("");
      setIsLoading(false);
    }
  }, [code, language]);

  if (isLoading && code.trim()) {
    return (
      <div className={`p-4 text-sm font-mono bg-slate-50 text-slate-800 whitespace-pre-wrap min-h-full ${className}`}>
        <span className="text-slate-500 italic">Loading syntax highlighting...</span>
      </div>
    );
  }

  if (!code.trim()) {
    return (
      <div className={`p-4 text-sm font-mono bg-slate-50 text-slate-800 whitespace-pre-wrap min-h-full ${className}`}>
        <span className="text-slate-500 italic">
          {language === "typescript" 
            ? "No TypeScript code to display" 
            : "No Scala code to display"}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`text-sm min-h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
      style={{
        // Override Shiki's default styles to match our theme
        "--shiki-background": "rgb(248 250 252)", // slate-50
      } as React.CSSProperties}
    />
  );
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}