"use client";
import React, { useState, useEffect, Fragment } from "react";
import {
  Code2,
  Sparkles,
  ChevronsUpDown, // New icon for the combobox button
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Combobox, Transition } from "@headlessui/react";

// Define the structure of a Phabricator task object
interface PhabricatorTask {
  id: number;
  phid: string;
  fields: {
    name: string;
    // You can add other fields you might need, like status, priority, etc.
  };
  // The task ID like "T12345"
  key: string;
}

// A helper type for our state
interface TaskSuggestion extends PhabricatorTask {
  // We add 'key' to the root for easier access, since the API nests it
  key: string;
}

const GitIngestClone = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // State for the user's search input
  const [tasks, setTasks] = useState<TaskSuggestion[]>([]); // State for API suggestions
  const [selectedTask, setSelectedTask] = useState<TaskSuggestion | null>(null);

  // --- API Configuration ---
  const API_TOKEN = "api-nhvap27hnnb6igtgizlu76mcuro5";
  const PHABRICATOR_URL =
    "https://phabricator.wikimedia.org/api/maniphest.search";

  // --- Debounced API Fetching ---
  useEffect(() => {
    // Don't search if the query is too short
    if (query.length < 3) {
      setTasks([]);
      return;
    }

    // This function now calls our internal API route
    const fetchTasks = async () => {
      try {
        // Call our own API endpoint, which acts as a proxy
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Send the search query in the body
          body: JSON.stringify({ query: query }),
        });

        if (!response.ok) {
          throw new Error(`API route failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error_info || result.error) {
          throw new Error(result.error_info || result.error);
        }

        // The data structure from the API is nested under result.data
        const formattedTasks = result.result.data.map(
          (task: PhabricatorTask) => ({
            ...task,
            key: `T${task.id}`, // Add the "T" prefix for display and navigation
          })
        );

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Failed to fetch Phabricator tasks:", error);
        setTasks([]); // Clear tasks on error
      }
    };
    // Debounce the API call to avoid firing on every keystroke
    const debounceTimeout = setTimeout(() => {
      fetchTasks();
    }, 5); // Wait 500ms after the user stops typing

    // Cleanup function to cancel the timeout if the user types again
    return () => clearTimeout(debounceTimeout);
  }, [query]); // This effect runs whenever the 'query' state changes

  const redirect = () => {
    if (!selectedTask) {
      // If no task is selected, try to use the query if it looks like a task ID
      if (query.trim().startsWith("T")) {
        router.push(`/${query.trim()}`);
      }
      return;
    }
    // Redirect using the selected task's key
    router.push(`/${selectedTask.key}`);
  };

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

        {/* Main Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col gap-6">
              {/* --- New Combobox Input --- */}
              <Combobox value={selectedTask} onChange={setSelectedTask}>
                <div className="relative">
                  <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-gray-50 text-left border-2 border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <img
                      src={"/logo.png"}
                      className="pointer-events-none absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                      alt="Logo"
                    />
                    <Combobox.Input
                      className="w-full border-none py-4 pl-12 pr-10 text-md leading-5 text-black bg-gray-50 placeholder-gray-500 focus:ring-0"
                      displayValue={(task: TaskSuggestion | null) =>
                        task ? `${task.key}: ${task.fields.name}` : query
                      }
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search Phabricator's task id or title..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          redirect();
                        }
                      }}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronsUpDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Combobox.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                  >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                      {tasks.length === 0 && query !== "" ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                          Nothing found.
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <Combobox.Option
                            key={task.phid}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? "bg-black text-white" : "text-gray-900"
                              }`
                            }
                            value={task}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {task.key}: {task.fields.name}
                                </span>
                                {selected ? (
                                  <span
                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                      active ? "text-white" : "text-black"
                                    }`}
                                  >
                                    <Check
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Transition>
                </div>
              </Combobox>

              {/* Action Button */}
              <button
                onClick={redirect}
                disabled={
                  loading || (!selectedTask && !query.trim().startsWith("T"))
                }
                className="bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin"></div>
                      Analyzing Issue...
                    </>
                  ) : (
                    <>
                      Analyze
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitIngestClone;

// The API token is now used inside the component, so this line is no longer needed here.
// const API_TOKEN = process.env.PHABRICATOR_API_TOKEN || "api-nhvap27hnnb6igtgizlu76mcuro5";
