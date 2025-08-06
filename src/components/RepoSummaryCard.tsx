import React, { useState } from "react";
import { Github, FileText, Code2, Folder, TrendingUp } from "lucide-react";

const RepoSummaryCard = ({ repoData }: { repoData: any }) => {
  // State to manage which tab is currently active
  const [activeTab, setActiveTab] = useState("summary");

  if (!repoData || repoData.error) {
    return (
      <div className="bg-white/5 border border-red-700 rounded-2xl p-6 shadow-lg text-white">
        <h3 className="text-xl font-bold text-red-300 mb-2 flex items-center gap-3">
          <Github className="w-6 h-6" />
          Repository Analysis Failed
        </h3>
        <p className="text-red-400">
          {repoData?.error || "Could not retrieve repository details."}
        </p>
      </div>
    );
  }

  // --- Enhanced Data Parsing ---

  // Regex to find "Files analyzed: 123"
  const filesMatch = repoData.summary?.match(/Files analyzed: (\d+)/);

  // Regex to find "Estimated tokens: 1.23k"
  const tokensMatch = repoData.summary?.match(/Estimated tokens: ([\d.]+k?)/);

  // Get a unique list of language extensions from the directory tree
  // Example: .js, .tsx, .py etc.
  const languages = [
    ...new Set(
      repoData.tree
        ?.match(/\.([a-zA-Z0-9]+)/g)
        ?.map((ext: string) => ext.substring(1).toLowerCase()) || []
    ),
  ];

  return (
    <div className="bg-white/5 border border-gray-700 rounded-2xl p-6 shadow-lg text-white">
      {/* --- Header --- */}
      <h3 className="text-xl font-bold text-blue-300 mb-2 flex items-center gap-3">
        <Github className="w-6 h-6" />
        Related Repository Summary
      </h3>
      <a
        href={repoData.repo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-sm text-blue-400 hover:underline break-all block mb-4"
      >
        {repoData.short_repo_url}
      </a>

      {/* --- Tab Navigation --- */}
      <div className="flex border-b border-gray-600 mb-4">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "summary"
              ? "border-b-2 border-blue-400 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "directory"
              ? "border-b-2 border-blue-400 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Directory Structure
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "content"
              ? "border-b-2 border-blue-400 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Content Preview
        </button>
      </div>

      {/* --- Tab Content --- */}
      <div className="mt-4">
        {activeTab === "summary" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-black/20 p-4 rounded-lg">
                <FileText className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <div className="font-bold text-xl">
                  {filesMatch ? filesMatch[1] : "N/A"}
                </div>
                <div className="text-xs text-gray-400">Files Analyzed</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <div className="font-bold text-xl">
                  {tokensMatch ? tokensMatch[1] : "N/A"}
                </div>
                <div className="text-xs text-gray-400">Est. Tokens</div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg">
                <Code2 className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <div className="font-bold text-xl">{languages.length}</div>
                <div className="text-xs text-gray-400">Languages</div>
              </div>
            </div>

            {/* Languages List */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-3">
                Languages Detected
              </h4>
              {languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang: any) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-700 text-gray-200 rounded-full text-xs font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No distinct languages detected.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "directory" && (
          <div className="bg-black/40 rounded-lg p-4 max-h-96 overflow-auto animate-fadeIn">
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
              {repoData.tree || "No directory structure available."}
            </pre>
          </div>
        )}

        {activeTab === "content" && (
          <div className="bg-black/40 rounded-lg p-4 max-h-96 overflow-auto animate-fadeIn">
            <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap">
              {repoData.content || "No content available."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoSummaryCard;

// Optional: Add a simple fadeIn animation in your globals.css
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
*/
