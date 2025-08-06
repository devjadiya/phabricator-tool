"use client";
import React, { useState, useEffect } from "react";
import { Github, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import PhabricatorIssueCard from "./PhabricatorIssueCard";
import GeminiSolutionCard from "./GeminiSolutionCard";
import RepoSummaryCard from "./RepoSummaryCard";

interface PhabricatorFlowProps {
  issueId: string;
}

// Regex to find the first full GitHub URL in the Gemini response
const GITHUB_URL_REGEX = /(https:\/\/github\.com\/[\w-]+\/[\w-]+)/;

const PhabricatorFlow = ({ issueId }: PhabricatorFlowProps) => {
  const [phabData, setPhabData] = useState<any>(null);
  const [geminiSolution, setGeminiSolution] = useState<string | null>(null);
  const [relatedRepoData, setRelatedRepoData] = useState<any>(null);

  const [loadingState, setLoadingState] = useState<string>(
    "Fetching issue details..."
  );
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Phabricator issue details
  useEffect(() => {
    if (!issueId) return;

    setLoadingState(`Fetching Phabricator issue T${issueId}...`);
    setError(null);

    fetch("/api/phabissue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: `T${issueId}` }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch Phabricator issue.");
        return res.json();
      })
      .then((data) => setPhabData(data))
      .catch((err) => setError(err.message));
  }, [issueId]);

  // 2. When Phabricator data is available, get AI solution
  useEffect(() => {
    if (!phabData) return;

    setLoadingState("Generating AI solution...");

    const prompt = `
      You are an expert software engineering assistant. Below is a Phabricator ticket.
      Your task is to provide a clear, step-by-step plan to resolve this issue.
      Most importantly, you MUST identify the most likely relevant GitHub repository from the MediaWiki ecosystem and provide its full URL in your response, like this: "Related Repository: https://github.com/wikimedia/mediawiki-core".

      **Issue Title:** ${phabData.task.fields.name}
      **Status:** ${phabData.task.fields.status.name}
      **Priority:** ${phabData.task.fields.priority.name}
      **Description:**
      ${phabData.task.fields.description.raw}
    `;

    fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to get solution from AI assistant.");
        return res.json();
      })
      .then((data) => setGeminiSolution(data.result))
      .catch((err) => setError(err.message));
  }, [phabData]);

  // 3. When AI solution is ready, find the repo link and analyze it
  useEffect(() => {
    if (!geminiSolution) return;

    setLoadingState("Analyzing related repository...");
    const match = geminiSolution.match(GITHUB_URL_REGEX);

    if (match && match[1]) {
      const repoUrl = match[1];
      fetch("/api/gitingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_text: repoUrl,
          token: "",
          max_file_size: "50",
          pattern: "",
          pattern_type: "exclude",
        }),
      })
        .then((res) => {
          if (!res.ok)
            throw new Error("Failed to analyze the related GitHub repository.");
          return res.json();
        })
        .then((data) => setRelatedRepoData(data))
        .catch((err) => {
          console.warn(err.message); // Don't block the UI for this, just log a warning
          setRelatedRepoData({ error: "Could not analyze repository." });
        })
        .finally(() => setLoadingState("")); // Done
    } else {
      console.warn("No GitHub URL found in Gemini response.");
      setLoadingState(""); // Done, but no repo to show
    }
  }, [geminiSolution]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center p-4 border border-purple-500/30 bg-purple-900/20 rounded-2xl">
        <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-purple-400" />
          Phabricator Issue Resolution
        </h2>
        <p className="text-purple-300 mt-2">
          Solution generation for issue <strong>T{issueId}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/80 border border-red-400 text-white p-4 rounded-lg text-center font-semibold">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Issue and Solution */}
        <div className=" w-full space-y-6">
          {!phabData ? (
            <LoadingSpinner text={loadingState} />
          ) : (
            <PhabricatorIssueCard data={phabData} />
          )}

          <div className=" w-full space-y-6">
            {!relatedRepoData && geminiSolution && !error && (
              <LoadingSpinner text={loadingState} />
            )}
            {relatedRepoData && <RepoSummaryCard repoData={relatedRepoData} />}
          </div>
        </div>

        <div className="w-full">
          {" "}
          {!geminiSolution && phabData && !error && (
            <LoadingSpinner text={loadingState} />
          )}
          {geminiSolution && <GeminiSolutionCard solution={geminiSolution} />}
        </div>
      </div>
    </div>
  );
};

export default PhabricatorFlow;
