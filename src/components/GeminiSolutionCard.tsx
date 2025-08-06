// app/components/ui/GeminiSolutionCard.tsx

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For tables, strikethrough, etc.
import { Sparkles, Clipboard, Check, Zap, TerminalSquare } from "lucide-react";

// --- Sub-component for rendering code blocks with a copy button ---
const CustomCodeBlock = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "bash";

  const handleCopy = () => {
    if (typeof children === "string") {
      navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // We check for 'inline' which is a prop react-markdown adds for `code`
  // @ts-ignore
  if (className === "inline") {
    return (
      <code className="bg-gray-700 text-green-300 px-1.5 py-0.5 rounded-md font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="my-4 bg-black/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-1 bg-gray-800/80">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TerminalSquare size={16} />
          <span>{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors p-1 rounded-md"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Clipboard size={16} />
          )}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-sm font-mono overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
};

// --- Sub-component for rendering list items with a checkbox ---
const CheckableListItem = ({ children }: { children: React.ReactNode }) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <li
      className="flex items-start gap-3 my-2 transition-colors"
      onClick={() => setIsChecked(!isChecked)}
      style={{ cursor: "pointer" }}
    >
      <input
        type="checkbox"
        checked={isChecked}
        readOnly
        className="mt-1.5 h-4 w-4 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-600 cursor-pointer"
      />
      <span
        className={`flex-1 ${
          isChecked ? "text-gray-500 line-through" : "text-gray-300"
        }`}
      >
        {children}
      </span>
    </li>
  );
};

// --- The Main Card Component ---
const GeminiSolutionCard = ({ solution }: { solution: string }) => {
  const [displayedSolution, setDisplayedSolution] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Effect for the typewriter animation
  useEffect(() => {
    setDisplayedSolution(""); // Reset on new solution
    setIsTyping(true);

    if (solution) {
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < solution.length) {
          setDisplayedSolution((prev) => prev + solution.charAt(i));
          i++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, 10); // Adjust typing speed here (lower is faster)

      return () => clearInterval(intervalId);
    }
  }, [solution]);

  const skipAnimation = useCallback(() => {
    setIsTyping(false);
    setDisplayedSolution(solution);
  }, [solution]);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-green-500/30 rounded-2xl p-6 shadow-2xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-green-300 flex items-center gap-3">
          <Sparkles className="w-7 h-7 animate-pulse" />
          Solution
        </h3>
        {isTyping && (
          <button
            onClick={skipAnimation}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg transition-all"
          >
            <Zap size={14} /> Skip
          </button>
        )}
      </div>

      <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 leading-relaxed">
        <ReactMarkdown
          children={displayedSolution}
          remarkPlugins={[remarkGfm]}
          components={{
            // Override default 'code' rendering with our custom component
            // @ts-ignore
            code: CustomCodeBlock,
            // Override default 'li' rendering
            li: CheckableListItem,
          }}
        />
      </div>
    </div>
  );
};

export default GeminiSolutionCard;
