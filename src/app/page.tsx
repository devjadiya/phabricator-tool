"use client";
import React, { useState } from "react";
import {
  Search,
  Github,
  Code2,
  FileText,
  Folder,
  Star,
  GitBranch,
  Clock,
  Users,
  TrendingUp,
  Download,
  Copy,
  Check,
  Sparkles,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";

interface RepoData {
  repo_url: string;
  short_repo_url: string;
  summary: string;
  digest_url: string;
  tree: string;
  content: string;
  default_max_file_size: number;
  pattern_type: string;
  pattern: string;
}

interface RepoStats {
  files: number;
  tokens: string;
  structure: string[];
  languages: string[];
}

const GitIngestClone = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState("50");
  const [pattern, setPattern] = useState("");
  const [patternType, setPatternType] = useState("exclude");

  const parseRepoStats = (data: RepoData): RepoStats => {
    const summaryMatch = data.summary.match(/Files analyzed: (\d+)/);
    const tokensMatch = data.summary.match(/Estimated tokens: ([\d.]+k?)/);

    const treeLines = data.tree.split("\n").filter((line) => line.trim());
    const structure = treeLines.slice(1).map((line) =>
      line
        .trim()
        .replace(/[└├─│]/g, "")
        .trim()
    );

    const languages = [
      ...new Set(
        structure
          .filter((file) => file.includes("."))
          .map((file) => {
            const ext = file.split(".").pop()?.toLowerCase();
            switch (ext) {
              case "js":
              case "jsx":
                return "JavaScript";
              case "ts":
              case "tsx":
                return "TypeScript";
              case "py":
                return "Python";
              case "html":
                return "HTML";
              case "css":
                return "CSS";
              case "java":
                return "Java";
              case "cpp":
              case "cc":
                return "C++";
              case "c":
                return "C";
              case "php":
                return "PHP";
              case "rb":
                return "Ruby";
              case "go":
                return "Go";
              case "rs":
                return "Rust";
              default:
                return ext?.toUpperCase() || "Unknown";
            }
          })
          .filter(Boolean)
      ),
    ];

    return {
      files: parseInt(summaryMatch?.[1] || "0"),
      tokens: tokensMatch?.[1] || "0",
      structure,
      languages,
    };
  };

  const analyzeRepo = async () => {
    if (!inputText.trim()) {
      setError("Please enter a repository URL or username/repo");
      return;
    }

    setLoading(true);
    setError("");
    setRepoData(null);

    try {
      // Use Next.js API route as proxy to avoid CORS issues
      const response = await fetch("/api/gitingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_text: inputText.trim(),
          token: "",
          max_file_size: maxFileSize,
          pattern: pattern,
          pattern_type: patternType,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.error ||
            `Failed to analyze repository: ${response.statusText}`
        );
      }

      const data: RepoData = await response.json();
      setRepoData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while analyzing the repository"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadDigest = () => {
    if (repoData?.digest_url) {
      window.open(repoData.digest_url, "_blank");
    }
  };

  const stats = repoData ? parseRepoStats(repoData) : null;

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <Code2 className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              ArchiWiki
            </h1>
          </div>
          <p className="text-md text-gray-300 max-w-2xl mx-auto leading-relaxed">
            ArchiWiki is a code architecture visualization tool designed for the
            MediaWiki ecosystem. It offers high- and low-level relational
            diagrams that demystify the core-extension structure, making it
            easier for new developers to contribute. ✨
          </p>
        </div>

        {/* Main Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col gap-6">
              {/* Primary Input */}
              <div className="relative">
                <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter repository URL or username/repository (e.g., facebook/react)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-300 rounded-xl text-black placeholder-gray-500 focus:border-black focus:bg-white transition-all"
                  onKeyPress={(e) => e.key === "Enter" && analyzeRepo()}
                />
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-black focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pattern Type
                  </label>
                  <select
                    value={patternType}
                    onChange={(e) => setPatternType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-black focus:border-black transition-colors"
                  >
                    <option value="exclude">Exclude</option>
                    <option value="include">Include</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pattern
                  </label>
                  <input
                    type="text"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="*.test.js, node_modules"
                    className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={analyzeRepo}
                disabled={loading}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Analyzing Repository...
                    </>
                  ) : (
                    <>
                      Analyze Repository
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-500 border-2 border-red-600 rounded-xl p-4 text-white">
              <p className="font-medium">❌ {error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {repoData && stats && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center shadow-lg">
                <FileText className="w-8 h-8 text-black mx-auto mb-2" />
                <div className="text-2xl font-bold text-black">
                  {stats.files}
                </div>
                <div className="text-gray-600 text-sm">Files Analyzed</div>
              </div>
              <div className="bg-black border-2 border-gray-800 rounded-xl p-6 text-center shadow-lg">
                <TrendingUp className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.tokens}
                </div>
                <div className="text-gray-300 text-sm">Estimated Tokens</div>
              </div>
              <div className="bg-green-500 border-2 border-green-600 rounded-xl p-6 text-center shadow-lg">
                <Code2 className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {stats.languages.length}
                </div>
                <div className="text-green-100 text-sm">Languages</div>
              </div>
              <div className="bg-yellow-400 border-2 border-yellow-500 rounded-xl p-6 text-center shadow-lg">
                <Folder className="w-8 h-8 text-black mx-auto mb-2" />
                <div className="text-2xl font-bold text-black">
                  {stats.structure.length}
                </div>
                <div className="text-yellow-800 text-sm">Structure Items</div>
              </div>
            </div>

            {/* Repository Info */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center md:flex-row flex-col justify-between mb-6 gap-6">
                <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                  <Github className="w-6 h-6 text-gray-700" />
                  Repository Analysis
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(repoData.content)}
                    className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadDigest}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Repository Details */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-700" />
                    Repository Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">URL:</span>
                      <a
                        href={repoData.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-gray-700 transition-colors break-all font-medium"
                      >
                        {repoData.short_repo_url}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <span className="text-gray-700">Summary:</span>
                        <p className="text-gray-600 mt-1 text-sm">
                          {repoData.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages Used */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-gray-700" />
                    Languages Detected
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-black text-white border-2 border-gray-800 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* File Structure */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <Folder className="w-6 h-6 text-gray-700" />
                Directory Structure
              </h3>
              <div className="bg-black border-2 border-gray-800 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                <pre className="text-green-400 whitespace-pre-wrap">
                  {repoData.tree}
                </pre>
              </div>
            </div>

            {/* Content Preview */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-700" />
                Content Preview
              </h3>
              <div className="bg-black border-2 border-gray-800 rounded-xl p-6 max-h-96 overflow-y-auto">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                  {repoData.content}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitIngestClone;
