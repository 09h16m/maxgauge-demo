"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Copy, Check } from "lucide-react";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  onRun?: () => void;
};

export default function CodeBlock({
  code,
  language = "sql",
  showLineNumbers = true,
  onRun,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-md bg-[#0f172a]">
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/20 text-white transition-colors hover:bg-white/30"
          aria-label="코드 복사"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
        {onRun && (
          <button
            type="button"
            onClick={onRun}
            className="flex h-8 items-center justify-center rounded-sm bg-white px-3 text-sm font-medium text-[#030712] transition-colors hover:bg-white/90"
          >
            실행
          </button>
        )}
      </div>

      <Highlight
        theme={themes.nightOwl}
        code={code.trim()}
        language={language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} m-0 overflow-x-auto p-6 text-[13px] leading-6`}
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} className="table w-full table-fixed">
                {showLineNumbers && (
                  <span className="table-cell w-[3rem] select-none pr-4 text-right text-xs text-sky-400/70">
                    {i + 1}
                  </span>
                )}
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}


