"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";
import GithubFlow from "@/components/GithubFlow";
import PhabricatorFlow from "@/components/PhabricatorFlow";

type FlowType = "github" | "phabricator" | "loading" | "home";

const AnalysisPage = () => {
  const path = usePathname();
  const [flow, setFlow] = useState<FlowType>("loading");
  const [issueId, setIssueId] = useState<string | null>(null);

  useEffect(() => {
    const phabMatch = path.match(/\/T(\d+)/);
    if (phabMatch && phabMatch[1]) {
      setIssueId(phabMatch[1]);
      setFlow("phabricator");
    } else {
      // Basic check for a GitHub path structure
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        setFlow("github");
      } else {
        setFlow("home"); // Or some other default state
      }
    }
  }, [path]);

  const renderFlow = () => {
    switch (flow) {
      case "phabricator":
        return issueId ? <PhabricatorFlow issueId={issueId} /> : null;
      case "github":
        return <GithubFlow />;
      case "loading":
        return <div className="text-center text-white">Loading...</div>;
      case "home":
        // You could render the GithubFlow here by default for the root path '/'
        return <GithubFlow />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#111828] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Consistent Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <Code2 className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              DevCode
            </h1>
          </div>
          <p className="text-md text-gray-300 max-w-2xl mx-auto leading-relaxed">
            DevCode is a code architecture visualization tool designed for the
            MediaWiki ecosystem. It offers high- and low-level relational
            diagrams that demystify the core-extension structure, making it
            easier for new developers to contribute. ✨
          </p>
        </div>

        {/* Dynamic Content Area */}
        <main>{renderFlow()}</main>
      </div>
    </div>
  );
};

export default AnalysisPage;
