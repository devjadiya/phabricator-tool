"use client";
import React, { useEffect, useState } from "react";
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
import { usePathname } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";
import RepoSummaryCard from "./RepoSummaryCard";

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

const GithubFlow = () => {
  const path = usePathname();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [maxFileSize, setMaxFileSize] = useState("50");
  const [pattern, setPattern] = useState("");
  const [patternType, setPatternType] = useState("exclude");
  const [loadingState, setLoadingState] = useState<string>(
    "Fetching repo details..."
  );
  const parseRepoStats = (data: RepoData): RepoStats => {
    if (!data) {
      setRepoData(null);
    }
    const issueMatch = path.match(/\/T(\d+)/);
    const issueId = issueMatch ? `T${issueMatch[1]}` : null;
    if (!inputText.trim() && issueId) {
      setError("Please enter a repository URL or username/repo");
    }

    const summaryMatch = data?.summary?.match(/Files analyzed: (\d+)/);
    const tokensMatch = data?.summary?.match(/Estimated tokens: ([\d.]+k?)/);

    const treeLines = data?.tree?.split("\n").filter((line) => line.trim());
    const structure = treeLines?.slice(1).map((line) =>
      line
        .trim()
        .replace(/[└├─│]/g, "")
        .trim()
    );

    const languages = [
      ...new Set(
        structure
          .filter((file) => file && file?.includes("."))
          .map((file) => {
            const ext = file?.split(".").pop()?.toLowerCase();
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
    const issueMatch = path.match(/\/T(\d+)/);
    const issueId = issueMatch ? `T${issueMatch[1]}` : null;
    if (!inputText.trim() && issueId) {
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
        setRepoData(null);
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
      setRepoData(null);
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

  useEffect(() => {
    // Set initial text from path, but only if it's a valid repo path
    const pathParts = path.split("/").filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] !== "T") {
      setInputText(`https://github.com/${pathParts[0]}/${pathParts[1]}`);
    }
  }, [path]);

  // Optional: trigger analysis when inputText is valid and changes
  useEffect(() => {
    if (inputText.startsWith("https://github.com/")) {
      analyzeRepo();
    }
  }, [inputText]);

  // This remains null here, as it's not part of this flow.
  const stats: RepoStats | null = repoData ? ({} as RepoStats) : null; // Replace with your actual parseRepoStats call

  return (
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

      <div className=" w-full mt-5">
        {!repoData && !error && <LoadingSpinner text={loadingState} />}
        {repoData && <RepoSummaryCard repoData={repoData} />}
      </div>
    </div>
  );
};

export default GithubFlow;
