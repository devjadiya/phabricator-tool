"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Github,
  FileText,
  Code2,
  Folder,
  ChevronRight,
  Wand2,
} from "lucide-react";
import InteractiveFlowchart from "./Interactiveflowchart"; // <-- IMPORT new component
import type { Node, Edge } from "reactflow"; // <-- IMPORT React Flow types

// --- TYPE DEFINITIONS AND HELPER FUNCTIONS (Unchanged) ---
interface FileTreeNodeData {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNodeData[];
}
const parseFileContents = (contentString: string): Map<string, string> => {
  const contents = new Map<string, string>();
  if (!contentString) return contents;
  const fileMarkerRegex = /^FILE: (.+)/gm;
  const matches = [...contentString.matchAll(fileMarkerRegex)];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    const filePath = currentMatch[1].trim();
    const contentStartIndex = currentMatch.index! + currentMatch[0].length;
    const contentEndIndex = nextMatch ? nextMatch.index : contentString.length;
    const fileContent = contentString
      .substring(contentStartIndex, contentEndIndex)
      .trim();
    if (filePath) contents.set(filePath, fileContent);
  }
  return contents;
};
const buildFileTree = (paths: string[]): FileTreeNodeData[] => {
  const root: { children: FileTreeNodeData[] } = { children: [] };
  paths.forEach((path) => {
    let currentNode = root;
    const parts = path.split("/");
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let childNode = currentNode.children.find(
        (child) => child.name === part && child.type === "folder"
      );
      if (!childNode) {
        const newPath = parts.slice(0, index + 1).join("/");
        childNode = {
          name: part,
          path: newPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        currentNode.children.push(childNode);
      }
      currentNode = childNode;
    });
  });
  const sortNodes = (nodes: FileTreeNodeData[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => {
      if (node.children) sortNodes(node.children);
    });
  };
  sortNodes(root.children);
  return root.children;
};

// --- REACT COMPONENTS (FileTreeNode is Unchanged) ---
const FileTreeNode: React.FC<{
  node: FileTreeNodeData;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  depth?: number;
}> = ({
  node,
  selectedFile,
  onFileSelect,
  expandedFolders,
  onToggleFolder,
  depth = 0,
}) => {
  const isExpanded = expandedFolders.has(node.path);
  const indentStyle = { paddingLeft: `${depth * 20}px` };
  if (node.type === "folder") {
    return (
      <>
        <button
          onClick={() => onToggleFolder(node.path)}
          className="w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors text-gray-300 hover:bg-white/10"
          style={indentStyle}
        >
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
          <Folder className="w-4 h-4 flex-shrink-0 text-sky-400" />
          <span>{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                {...{
                  selectedFile,
                  onFileSelect,
                  expandedFolders,
                  onToggleFolder,
                }}
              />
            ))}
          </div>
        )}
      </>
    );
  }
  return (
    <button
      onClick={() => onFileSelect(node.path)}
      title={node.path}
      className={`w-full text-left flex items-center gap-1.5 px-2 py-1.5 rounded transition-colors truncate ${
        selectedFile === node.path
          ? "bg-blue-500/30 text-white"
          : "text-gray-400 hover:bg-white/10"
      }`}
      style={indentStyle}
    >
      <FileText className="w-4 h-4 flex-shrink-0 text-gray-500 ml-1" />
      <span>{node.name}</span>
    </button>
  );
};

// --- MAIN CARD COMPONENT (Updated) ---
interface FlowchartData {
  nodes: Node[];
  edges: Edge[];
}

const RepoSummaryCard = ({ repoData }: { repoData: any }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  // NEW: State for structured JSON data
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(
    null
  );
  const [activeView, setActiveView] = useState<"code" | "flowchart">("code");

  const fileContents = useMemo(
    () => parseFileContents(repoData?.content || ""),
    [repoData?.content]
  );
  const fileTree = useMemo(
    () => buildFileTree(Array.from(fileContents.keys())),
    [fileContents]
  );

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.has(folderPath)
        ? newSet.delete(folderPath)
        : newSet.add(folderPath);
      return newSet;
    });
  };

  useEffect(() => {
    setFlowchartData(null);
    setGenerationError(null);
    setActiveView("code");
  }, [selectedFile]);

  // UPDATED: Gemini Prompt and API Handling
  const handleGenerateFlowchart = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setFlowchartData(null);

    let analysisTarget: string;
    let prompt: string;

    const jsonPromptInstructions = `
      Analyze the following and generate a JSON object representing a flowchart or architectural diagram.
      **CRITICAL Instructions:**
      1.  Your entire response MUST be ONLY the JSON object, perfectly formatted and enclosed in a single \`\`\`json code block.
      2.  DO NOT include any explanation, introduction, or text outside the JSON block.
      3.  The JSON object must have two top-level keys: "nodes" and "edges".
      4.  "nodes": An array of objects. Each object needs:
          - "id": A unique string identifier for the node (e.g., "1", "2", "process-A").
          - "data": An object containing a "label" key with the string text for the node.
          - "position": An object with "x" and "y" keys, BOTH SET TO 0.
      5.  "edges": An array of objects. Each object needs:
          - "id": A unique string identifier for the edge (e.g., "e1-2").
          - "source": The "id" of the starting node.
          - "target": The "id" of the ending node.

      **Example JSON Structure:**
      \`\`\`json
      {
        "nodes": [
          { "id": "1", "data": { "label": "Start Process" }, "position": { "x": 0, "y": 0 } },
          { "id": "2", "data": { "label": "Execute Step A" }, "position": { "x": 0, "y": 0 } }
        ],
        "edges": [
          { "id": "e1-2", "source": "1", "target": "2" }
        ]
      }
      \`\`\`
    `;

    if (selectedFile && fileContents.has(selectedFile)) {
      analysisTarget = fileContents.get(selectedFile)!;
      prompt = `${jsonPromptInstructions}\n**Code from file "${selectedFile}" to Analyze:**\n\`\`\`\n${analysisTarget}\n\`\`\``;
    } else {
      analysisTarget = JSON.stringify(fileTree, null, 2);
      prompt = `${jsonPromptInstructions}\n**Project File Structure to Analyze:**\n\`\`\`json\n${analysisTarget}\n\`\`\``;
    }

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok)
        throw new Error(`API request failed: ${response.statusText}`);

      const data = await response.json();
      const rawText = data.result || "";
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : rawText.trim();

      if (!jsonString) throw new Error("API returned an empty response.");

      let parsedData;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error(
          "JSON Parsing Error:",
          parseError,
          "Raw string:",
          jsonString
        );
        throw new Error("Failed to parse flowchart data from the API.");
      }

      if (parsedData && parsedData.nodes && parsedData.edges) {
        setFlowchartData(parsedData);
        setActiveView("flowchart");
      } else {
        throw new Error("Received invalid or incomplete flowchart data.");
      }
    } catch (error: any) {
      setGenerationError(error.message || "An unknown error occurred.");
      setActiveView("code");
    } finally {
      setIsGenerating(false);
    }
  };

  // (Error boundary and main layout JSX is mostly unchanged)
  if (!repoData || repoData.error) {
    /* ... */
  }

  return (
    <div className="bg-white/5 border border-gray-700 rounded-2xl p-6 shadow-lg text-white font-sans">
      <div className="flex items-start gap-3">
        <Github className="w-7 h-7 text-blue-300 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-blue-300">
            Repository Analysis Summary
          </h3>
          <a
            href={repoData.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-blue-400 hover:underline break-all"
          >
            {repoData.short_repo_url}
          </a>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-600 pt-6">
        <h4 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
          <Code2 className="w-5 h-5" />
          Repository Explorer
        </h4>
        <div className="flex flex-col md:flex-row border border-gray-600 rounded-lg bg-black/30 h-[500px] overflow-hidden">
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700/50 overflow-y-auto font-mono text-sm p-2">
            {fileTree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                {...{ selectedFile, expandedFolders }}
                onFileSelect={setSelectedFile}
                onToggleFolder={toggleFolder}
              />
            ))}
          </div>
          <div className="w-full md:w-2/3 flex flex-col overflow-y-auto">
            {selectedFile ? (
              <>
                <div className="p-2 bg-black/20 border-b border-gray-700/50 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView("code")}
                      className={`px-3 py-1 text-xs rounded-md ${
                        activeView === "code"
                          ? "bg-blue-500/30 text-white"
                          : "text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      Code
                    </button>
                    {flowchartData && (
                      <button
                        onClick={() => setActiveView("flowchart")}
                        className={`px-3 py-1 text-xs rounded-md ${
                          activeView === "flowchart"
                            ? "bg-blue-500/30 text-white"
                            : "text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        Flowchart
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateFlowchart}
                    disabled={isGenerating}
                    className="px-3 py-1 text-xs rounded-md flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-500 disabled:cursor-wait transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    {isGenerating ? "Generating..." : "Magic Flowchart"}
                  </button>
                </div>
                <div className="flex-grow p-4">
                  {isGenerating && (
                    <div className="flex justify-center items-center h-full text-gray-400">
                      Generating diagram...
                    </div>
                  )}
                  {generationError && (
                    <div className="flex justify-center items-center h-full text-red-400">
                      Error: {generationError}
                    </div>
                  )}
                  <div
                    style={{
                      display: activeView === "code" ? "block" : "none",
                    }}
                  >
                    <pre className="text-gray-300 text-xs font-mono whitespace-pre-wrap -m-4 p-4">
                      <code>{fileContents.get(selectedFile)}</code>
                    </pre>
                  </div>
                  {/* UPDATED: Rendering logic for flowchart */}
                  <div
                    style={{
                      display:
                        activeView === "flowchart" && flowchartData
                          ? "block"
                          : "none",
                      height: "100%",
                      margin: "-1rem",
                    }}
                  >
                    {flowchartData && (
                      <InteractiveFlowchart data={flowchartData} />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 p-4">
                {isGenerating ? (
                  <div className="text-center text-gray-400">
                    Generating project architecture diagram...
                  </div>
                ) : generationError ? (
                  <div className="text-center text-red-400">
                    Error: {generationError}
                  </div>
                ) : flowchartData ? (
                  /* UPDATED: Rendering logic for project-wide flowchart */
                  <div className="w-full h-full">
                    <InteractiveFlowchart data={flowchartData} />
                  </div>
                ) : (
                  <>
                    <span>Select a file to view its content or</span>
                    <button
                      onClick={handleGenerateFlowchart}
                      disabled={isGenerating}
                      className="px-4 py-2 text-sm rounded-md flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-500 disabled:cursor-wait transition-colors text-white"
                    >
                      <Wand2 className="w-5 h-5" />
                      Generate Project Flowchart
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoSummaryCard;
