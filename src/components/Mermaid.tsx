"use client";

import { useEffect, useState } from "react";

/**
 * Parses a dynamic Mermaid chart string to ensure all node labels are correctly quoted.
 * This prevents syntax errors for labels containing special characters.
 * @param {string} chartCode The raw Mermaid chart code.
 * @returns {string} The corrected Mermaid chart code.
 */
const parseDynamicMermaidChart = (chartCode: string): string => {
  // Only process nodes that don't already have quoted content
  const nodeRegex =
    /(\b\w+\b)(?:(\[)([^"\]]+?)(\])|(\{)([^"\}]+?)(\})|(\()([^"\)]+?)(\)))/g;

  return chartCode.replace(
    nodeRegex,
    (
      match,
      nodeId,
      openBracket,
      bracketContent,
      closeBracket,
      openBrace,
      braceContent,
      closeBrace,
      openParen,
      parenContent,
      closeParen
    ) => {
      const open = openBracket || openBrace || openParen;
      const content = bracketContent || braceContent || parenContent;
      const close = closeBracket || closeBrace || closeParen;

      // If content is already quoted or contains only simple text, leave it as-is
      if (
        !content ||
        (content.trim().startsWith('"') && content.trim().endsWith('"')) ||
        /^[a-zA-Z0-9\s]+$/.test(content.trim())
      ) {
        return match;
      }

      // Only add quotes if the content has special characters that need them
      if (/[^\w\s]/.test(content)) {
        return `${nodeId}${open}"${content}"${close}`;
      }

      return match;
    }
  );
};

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const renderMermaid = async (code: string): Promise<string> => {
    const response = await fetch("/api/render-mermaid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error("Failed to render Mermaid diagram");
    }

    return await response.text();
  };

  useEffect(() => {
    if (!chart) return;

    setError(null);

    // For most cases, you probably don't need to parse the chart at all
    // if it's already properly formatted. Let's try the original first.
    const processChart = async () => {
      try {
        // Try with original chart first
        console.log("Original chart:", chart);
        const renderedSvg = await renderMermaid(chart);
        setSvg(renderedSvg);
      } catch (originalError) {
        try {
          // If original fails, try with parsed version
          const correctedChart = parseDynamicMermaidChart(chart);
          console.log("Corrected chart:", correctedChart);
          const renderedSvg = await renderMermaid(correctedChart);
          setSvg(renderedSvg);
        } catch (parsedError) {
          console.error("Both attempts failed:", {
            originalError,
            parsedError,
          });
          setError("Failed to render Mermaid diagram");
        }
      }
    };

    processChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-700">Error: {error}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-red-600">
            Show chart code
          </summary>
          <pre className="mt-2 p-2 bg-red-100 text-red-500 rounded text-xs overflow-auto">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  return svg ? (
    <div dangerouslySetInnerHTML={{ __html: svg }} />
  ) : (
    <div className="p-4 text-gray-500">Loading diagram...</div>
  );
};

export default Mermaid;
