import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Cpu,
  Database,
  Eye,
  FileText,
  GitBranch,
  History,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Menu,
  Network,
  Play,
  Radio,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Trash2,
  Users,
  Workflow,
  X,
  Zap,
  CircleDot,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = "/api/run-agent/";
const HISTORY_API_URL = "/api/history/";

/* =========================================================
   AGENTS
========================================================= */

const agents = [
  {
    name: "Manager",
    role: "Task orchestration",
    description:
      "Analyzes the task and coordinates the workflow execution.",
    icon: GitBranch,
    accent: "teal",
  },
  {
    name: "Researcher",
    role: "Knowledge gathering",
    description:
      "Collects accurate and structured research for the task.",
    icon: Search,
    accent: "purple",
  },
  {
    name: "Writer",
    role: "Content generation",
    description:
      "Transforms research into a professional structured draft.",
    icon: FileText,
    accent: "pink",
  },
  {
    name: "Reviewer",
    role: "Quality control",
    description:
      "Checks accuracy, clarity and professional quality.",
    icon: Check,
    accent: "orange",
  },
  {
    name: "Publisher",
    role: "Finalization",
    description:
      "Prepares the approved content for final delivery.",
    icon: Zap,
    accent: "gold",
  },
];

/* =========================================================
   ACCENT STYLES
========================================================= */

const styles = {
  teal: {
    icon: "text-[#087F75]",
    bg: "bg-[#087F75]/[0.08]",
    border: "border-[#087F75]/20",
    line: "bg-[#087F75]",
    glow: "shadow-[0_0_25px_rgba(8,127,117,0.12)]",
  },

  purple: {
    icon: "text-[#594BB7]",
    bg: "bg-[#594BB7]/[0.08]",
    border: "border-[#594BB7]/20",
    line: "bg-[#594BB7]",
    glow: "shadow-[0_0_25px_rgba(89,75,183,0.12)]",
  },

  pink: {
    icon: "text-[#A83F6B]",
    bg: "bg-[#A83F6B]/[0.08]",
    border: "border-[#A83F6B]/20",
    line: "bg-[#A83F6B]",
    glow: "shadow-[0_0_25px_rgba(168,63,107,0.12)]",
  },

  orange: {
    icon: "text-[#A9542D]",
    bg: "bg-[#A9542D]/[0.08]",
    border: "border-[#A9542D]/20",
    line: "bg-[#A9542D]",
    glow: "shadow-[0_0_25px_rgba(169,84,45,0.12)]",
  },

  gold: {
    icon: "text-[#806019]",
    bg: "bg-[#806019]/[0.08]",
    border: "border-[#806019]/20",
    line: "bg-[#806019]",
    glow: "shadow-[0_0_25px_rgba(128,96,25,0.12)]",
  },
};

/* =========================================================
   STORAGE
========================================================= */

const HISTORY_KEY = "multiAgentHistory";
const SETTINGS_KEY = "multiAgentSettings";

const defaultSettings = {
  notifications: true,
  autoSave: true,
  compactMode: false,
};
/* =========================================================
   LOCAL STORAGE
========================================================= */

function readLocalStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/* =========================================================
   FETCH HISTORY FROM DJANGO API
========================================================= */

async function fetchHistoryFromAPI() {
  const response = await fetch(HISTORY_API_URL);

  const data = await response.json();

  if (!response.ok || data?.success !== true) {
    throw new Error(
      data?.error || "Failed to load execution history."
    );
  }

  return Array.isArray(data.executions)
    ? data.executions.map((execution) => ({
        ...execution,
        success: true,
        status: String(
          execution.review_status || "PASS"
        ).toUpperCase(),
      }))
    : [];
}
/* =========================================================
   AGENT STATUS
========================================================= */

function getAgentStatuses(result, running) {
  if (running) {
    return [
      {
        status: "Processing",
        completed: false,
        active: true,
      },
      {
        status: "Queued",
        completed: false,
        active: false,
      },
      {
        status: "Queued",
        completed: false,
        active: false,
      },
      {
        status: "Queued",
        completed: false,
        active: false,
      },
      {
        status: "Queued",
        completed: false,
        active: false,
      },
    ];
  }

  if (!result) {
    return [
      {
        status: "Ready to execute",
        completed: false,
        active: false,
      },
      {
        status: "Waiting",
        completed: false,
        active: false,
      },
      {
        status: "Waiting",
        completed: false,
        active: false,
      },
      {
        status: "Waiting",
        completed: false,
        active: false,
      },
      {
        status: "Waiting",
        completed: false,
        active: false,
      },
    ];
  }

  const retryCount = Number(
    result.retry_count || 0
  );

  const reviewStatus = String(
    result.review_status || ""
  ).toUpperCase();

  return [
    {
      status: "Completed",
      completed: true,
      active: false,
    },
    {
      status: "Completed",
      completed: true,
      active: false,
    },
    {
      status:
        retryCount > 0
          ? `Revised ${retryCount}x`
          : "Completed",
      completed: true,
      active: false,
    },
    {
      status:
        reviewStatus === "REVISE"
          ? "Revision required"
          : "Passed",
      completed: true,
      active: false,
    },
    {
      status: "Completed",
      completed: true,
      active: false,
    },
  ];
}
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Overview");

  const [task, setTask] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  const [settings, setSettings] =
    useState(defaultSettings);

  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");

  const navigation = [
    {
      name: "Overview",
      icon: LayoutDashboard,
    },
    {
      name: "Run Workflow",
      icon: Play,
    },
    {
      name: "Agents",
      icon: Users,
    },
    {
      name: "Execution History",
      icon: Clock3,
    },
  ];

  /* =======================================================
     LOAD DATA
  ======================================================= */
useEffect(() => {
  const loadData = async () => {
    const savedSettings = readLocalStorage(
      SETTINGS_KEY,
      defaultSettings
    );

    setSettings({
      ...defaultSettings,
      ...(savedSettings || {}),
    });

    try {
      const executions = await fetchHistoryFromAPI();

      setHistory(executions);

      if (executions.length > 0) {
        setSelectedRun(executions[0]);
      }
    } catch (historyError) {
      console.error(
        "Failed to load history from API:",
        historyError
      );

      const savedHistory = readLocalStorage(
        HISTORY_KEY,
        []
      );

      if (Array.isArray(savedHistory)) {
        setHistory(savedHistory);

        if (savedHistory.length > 0) {
          setSelectedRun(savedHistory[0]);
        }
      }
    }
  };

  loadData();
}, []);
  /* =======================================================
     NOTICE AUTO CLEAR
  ======================================================= */

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = setTimeout(() => {
      setNotice("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [notice]);

  /* =======================================================
     COPY FEEDBACK
  ======================================================= */

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => {
      setCopied("");
    }, 1800);

    return () => clearTimeout(timer);
  }, [copied]);

  /* =======================================================
     SAVE HISTORY
  ======================================================= */

  const saveHistory = (newHistory) => {
    setHistory(newHistory);

    if (settings.autoSave) {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(newHistory)
      );
    }
  };

  /* =======================================================
     COPY
  ======================================================= */

  const copyText = async (content, label) => {
    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);

      setCopied(label);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice(
        "Clipboard access is unavailable in this browser."
      );
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (page === "Run Workflow") {
      setTimeout(() => {
        document
          .getElementById("workflow-runner")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    }
  };

  const scrollToRunner = () => {
    handleNavigation("Run Workflow");
  };

  /* =======================================================
     REAL WORKFLOW
  ======================================================= */

  const executeWorkflow = async () => {
    const cleanTask = task.trim();

    if (!cleanTask || running) {
      return;
    }

    setRunning(true);
    setError("");
    setResult(null);
    setNotice("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          task: cleanTask,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The Django server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            `Workflow execution failed with status ${response.status}.`
        );
      }

      if (data?.success !== true) {
        throw new Error(
          data?.error ||
            "The multi-agent workflow was not completed successfully."
        );
      }

      const normalizedResult = {
        success: true,

        task: data?.task || cleanTask,

        research_notes:
          data?.research_notes || "",

        draft:
          data?.draft || "",

        review_feedback:
          data?.review_feedback || "",

        review_status: String(
          data?.review_status || "PASS"
        ).toUpperCase(),

        retry_count: Number(
          data?.retry_count || 0
        ),

        final_output:
          data?.final_output || "",
      };

      setResult(normalizedResult);

      const newRun = {
        id: Date.now(),

        task: normalizedResult.task,

        success: true,

        status:
          normalizedResult.review_status,

        review_status:
          normalizedResult.review_status,

        retry_count:
          normalizedResult.retry_count,

        research_notes:
          normalizedResult.research_notes,

        draft:
          normalizedResult.draft,

        review_feedback:
          normalizedResult.review_feedback,

        final_output:
          normalizedResult.final_output,

        created_at:
          new Date().toLocaleString(),
      };

      try {
  const executions = await fetchHistoryFromAPI();

  setHistory(executions);

  if (executions.length > 0) {
    setSelectedRun(executions[0]);
  }
} catch (historyError) {
  console.error(
    "Failed to refresh history:",
    historyError
  );

  const updatedHistory = [
    newRun,
    ...history,
  ].slice(0, 30);

  saveHistory(updatedHistory);
  setSelectedRun(newRun);
}
      if (
        normalizedResult.review_status ===
        "PASS"
      ) {
        setNotice(
          "Workflow completed and passed review."
        );
      } else {
        const count =
          normalizedResult.retry_count;

        setNotice(
          `Workflow completed after ${count} revision${
            count === 1 ? "" : "s"
          }.`
        );
      }

      if (settings.notifications) {
        console.log(
          "Multi-Agent workflow completed:",
          normalizedResult
        );
      }
    } catch (err) {
      console.error(
        "Multi-Agent workflow error:",
        err
      );

      setError(
        err?.message ||
          "Unable to connect to the Django backend."
      );

      setNotice(
        "Workflow execution failed."
      );
    } finally {
      setRunning(false);
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  const handleTaskKeyDown = (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      executeWorkflow();
    }
  };

  /* =======================================================
     CLEAR HISTORY
  ======================================================= */

  const clearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all execution history?"
    );

    if (!confirmed) {
      return;
    }

    setHistory([]);
    setSelectedRun(null);

    localStorage.removeItem(HISTORY_KEY);

    setNotice(
      "Execution history cleared."
    );
  };

  /* =======================================================
     DELETE RUN
  ======================================================= */

  const deleteRun = (id) => {
    const updatedHistory =
      history.filter(
        (item) => item.id !== id
      );

    setHistory(updatedHistory);

    if (settings.autoSave) {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    }

    if (selectedRun?.id === id) {
      setSelectedRun(null);
    }

    setNotice("Execution removed.");
  };

  /* =======================================================
     SETTINGS
  ======================================================= */

  const updateSetting = (key) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(updated);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(updated)
    );

    if (
      key === "autoSave" &&
      updated.autoSave
    ) {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
      );

      setNotice(
        "Auto-save enabled. Existing history has been saved."
      );
    } else {
      const readableKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) =>
          char.toUpperCase()
        );

      setNotice(
        `${readableKey} ${
          updated[key]
            ? "enabled"
            : "disabled"
        }.`
      );
    }
  };

  /* =======================================================
     REAL STATS
  ======================================================= */

  const stats = useMemo(() => {
    const successful =
      history.filter(
        (item) =>
          item.success === true &&
          String(
            item.review_status ||
              item.status ||
              ""
          ).toUpperCase() === "PASS"
      ).length;

    const revisions =
      history.reduce(
        (total, item) =>
          total +
          Number(
            item.retry_count || 0
          ),
        0
      );

    const passRate =
      history.length > 0
        ? Math.round(
            (successful /
              history.length) *
              100
          )
        : 0;

    return {
      executions: history.length,
      successful,
      revisions,
      passRate,
    };
  }, [history]);

  /* =======================================================
     REAL AGENT DATA
     Derived from actual workflow executions.
  ======================================================= */

  const agentMetrics = useMemo(() => {
    const totalRuns = history.length;

    const passedRuns = history.filter(
      (run) =>
        String(
          run.review_status ||
            run.status ||
            ""
        ).toUpperCase() === "PASS"
    ).length;

    const revisedRuns = history.filter(
      (run) =>
        Number(run.retry_count || 0) > 0
    ).length;

    const totalRevisions = history.reduce(
      (sum, run) =>
        sum +
        Number(run.retry_count || 0),
      0
    );

    const lastRun = history[0];

    return agents.map(
      (agent, index) => {
        let completedRuns = totalRuns;
        let status = totalRuns
          ? "Active"
          : "Ready";

        let detail =
          "Waiting for first workflow.";

        if (agent.name === "Reviewer") {
          completedRuns = totalRuns;

          if (lastRun) {
            status =
              String(
                lastRun.review_status ||
                  lastRun.status ||
                  ""
              ).toUpperCase() ===
              "PASS"
                ? "Passed"
                : "Revision";

            detail =
              lastRun.review_status ===
              "REVISE"
                ? "Revision requested by reviewer."
                : "Latest workflow passed review.";
          }
        } else if (
          agent.name === "Writer"
        ) {
          completedRuns = totalRuns;

          if (revisedRuns > 0) {
            status = "Revised";

            detail = `${totalRevisions} revision${
              totalRevisions === 1
                ? ""
                : "s"
            } recorded.`;
          } else if (totalRuns) {
            status = "Completed";

            detail =
              "Draft generation completed across workflow runs.";
          }
        } else if (
          agent.name === "Publisher"
        ) {
          completedRuns = passedRuns;

          if (passedRuns > 0) {
            status = "Published";

            detail = `${passedRuns} passed workflow${
              passedRuns === 1
                ? ""
                : "s"
            } finalized.`;
          } else if (totalRuns) {
            status = "Waiting";

            detail =
              "Awaiting a passed review.";
          }
        } else {
          if (totalRuns) {
            status = "Completed";

            detail =
              index === 0
                ? "Task routing executed from backend workflow."
                : "Knowledge gathering executed from backend workflow.";
          }
        }

        return {
          ...agent,
          executions: totalRuns,
          completedRuns,
          revisions:
            agent.name === "Writer"
              ? totalRevisions
              : agent.name === "Reviewer"
              ? revisedRuns
              : 0,
          status,
          detail,
          lastActivity: lastRun
            ? lastRun.created_at
            : "No execution yet",
        };
      }
    );
  }, [history]);

  /* =======================================================
     OVERVIEW
  ======================================================= */

  const renderOverview = () => (
    <>
      <section className="relative overflow-hidden rounded-[30px] border border-[#D9E1E7] bg-white shadow-[0_24px_75px_rgba(16,24,40,0.07)]">
        <div className="pointer-events-none absolute -left-28 -top-28 h-[320px] w-[320px] rounded-full bg-[#16B8A6]/[0.055] blur-3xl" />

        <div className="relative grid min-h-[420px] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10 flex flex-col justify-center px-7 py-11 sm:px-10 lg:px-12 xl:px-14">
            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-[#DDE5EA] bg-[#F8FAFB] px-3 py-1.5 shadow-sm">
              <Sparkles
                size={11}
                className="text-[#7667E8]"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#68758A]">
                Intelligent Workflow Engine
              </span>
            </div>

            <h1 className="max-w-[650px] text-[39px] font-bold leading-[1.03] tracking-[-0.055em] text-[#172033] sm:text-[47px] lg:text-[53px] xl:text-[58px]">
              Orchestrate
              <br />

              <span className="bg-gradient-to-r from-[#0E9F91] via-[#4286CF] to-[#7667E8] bg-clip-text text-transparent">
                intelligent agents.
              </span>
            </h1>

            <p className="mt-5 max-w-[590px] text-[13px] leading-6 text-[#718096] sm:text-[14px]">
              A LangGraph-powered multi-agent
              system that turns complex tasks
              into structured results through
              research, generation, review,
              revision, and publishing.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={scrollToRunner}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#172033] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_10px_25px_rgba(23,32,51,0.17)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(23,32,51,0.22)]"
              >
                <Play
                  size={12}
                  fill="currentColor"
                />

                Run Workflow

                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={() =>
                  handleNavigation("Agents")
                }
                className="group inline-flex items-center gap-2 rounded-xl border border-[#D9E1E7] bg-white px-5 py-3 text-[12px] font-semibold text-[#526075] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C3CED7] hover:shadow-md"
              >
                Explore Agents

                <ChevronRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <FeaturePill
                icon={CircleDot}
                text="Conditional routing"
                accent="teal"
              />

              <FeaturePill
                icon={RefreshCw}
                text="Reviewer-driven revision"
                accent="purple"
              />

              <FeaturePill
                icon={ShieldCheck}
                text="Quality controlled"
                accent="orange"
              />
            </div>
          </div>

          <AgentNetworkVisual />
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Architecture"
          title="Agent Pipeline"
          description="Sequential execution with conditional review and revision."
          icon={Network}
          badge="Sequential + Conditional"
        />

        <div className="relative mt-5 overflow-hidden rounded-[26px] border border-[#CBD6DE] bg-gradient-to-br from-[#FDFEFE] via-[#F7F9FA] to-[#EEF2F5] p-4 shadow-[0_18px_55px_rgba(16,24,40,0.065)] sm:p-5">
          <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              const style =
                styles[agent.accent];

              return (
                <div
                  key={agent.name}
                  className="group relative"
                >
                  {index <
                    agents.length - 1 && (
                    <div className="absolute -right-[17px] top-1/2 z-20 hidden items-center xl:flex">
                      <div className="h-px w-[25px] bg-gradient-to-r from-[#AAB6C1] to-[#C9D1D8]" />

                      <ChevronRight
                        size={10}
                        className="absolute right-[-4px] text-[#9BA7B4]"
                      />
                    </div>
                  )}

                  <div className="relative min-h-[218px] overflow-hidden rounded-[20px] border border-[#CBD5DD] bg-white/90 p-5 shadow-[0_8px_28px_rgba(16,24,40,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-[#B5C1CB] hover:shadow-[0_18px_42px_rgba(16,24,40,0.11)]">
                    <div
                      className={`absolute left-0 right-0 top-0 h-[2px] ${style.line}`}
                    />

                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.icon} ${style.glow}`}
                      >
                        <Icon size={18} />
                      </div>

                      <span className="text-[8px] font-bold uppercase tracking-wider text-[#A0AAB6]">
                        NODE 0{index + 1}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#172033]">
                      {agent.name}
                    </div>

                    <div
                      className={`mt-1 text-[9px] font-bold uppercase tracking-[0.09em] ${style.icon}`}
                    >
                      {agent.role}
                    </div>

                    <p className="mt-3 text-[10.5px] leading-5 text-[#69778B]">
                      {agent.description}
                    </p>

                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between border-t border-[#EDF0F2] pt-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${style.line}`}
                        />

                        <span className="text-[8px] font-semibold text-[#8995A5]">
                          Agent ready
                        </span>
                      </div>

                      <span className="text-[7px] uppercase tracking-wider text-[#B0B8C2]">
                        Autonomous
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <QuickStats
        stats={stats}
        onHistory={() =>
          handleNavigation(
            "Execution History"
          )
        }
        onRun={scrollToRunner}
      />

      {renderWorkflowRunner()}
    </>
  );

  /* =======================================================
     WORKFLOW RUNNER
  ======================================================= */

  const renderWorkflowRunner = () => {
    const agentStatuses =
      getAgentStatuses(
        result,
        running
      );

    return (
      <section
        id="workflow-runner"
        className="mt-10 scroll-mt-24"
      >
        <div className="relative overflow-hidden rounded-[28px] border border-[#C8D3DC] bg-white shadow-[0_22px_65px_rgba(16,24,40,0.085)]">
          <div className="relative border-b border-[#D8E1E7] bg-gradient-to-r from-white via-[#FBFCFD] to-[#F6F8F9] px-6 py-5 sm:px-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#172033] to-[#30425A] text-white shadow-[0_8px_24px_rgba(23,32,51,0.20)]">
                  <Workflow size={17} />

                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#087F75]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#172033]">
                      Start a workflow
                    </h2>

                    <span className="rounded-md border border-[#DCE3E8] bg-[#F7F9FA] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider text-[#8792A1]">
                      AI Runtime
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] text-[#7A8799]">
                    Submit a task and let the
                    agent graph handle the rest.
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-full border border-[#C9D4DE] bg-white px-3 py-1.5 shadow-sm">
                <RefreshCw
                  size={10}
                  className="text-[#594BB7]"
                />

                <span className="text-[9px] font-semibold text-[#59667A]">
                  Max 3 reviewer revisions
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_0.9fr]">
            <div className="border-b border-[#DCE4E9] bg-white p-6 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#172033] text-white">
                    <Terminal size={10} />
                  </div>

                  <label className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F5D72]">
                    Task Input
                  </label>
                </div>

                <span className="rounded-md border border-[#E1E6EA] bg-[#F7F9FA] px-2 py-1 text-[9px] text-[#929DAC]">
                  {task.length} characters
                </span>
              </div>

              <div className="relative">
                <textarea
                  value={task}
                  onChange={(event) =>
                    setTask(event.target.value)
                  }
                  onKeyDown={handleTaskKeyDown}
                  disabled={running}
                  placeholder="Describe the task you want the multi-agent system to execute..."
                  className="min-h-[165px] w-full resize-none rounded-2xl border border-[#C5D0D9] bg-[#F7F9FA] px-4 py-4 pb-12 text-sm leading-6 text-[#172033] outline-none transition-all placeholder:text-[#9AA5B3] focus:border-[#087F75] focus:bg-white focus:ring-4 focus:ring-[#087F75]/[0.07] disabled:cursor-wait disabled:opacity-70"
                />

                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-[#D3DCE4] bg-white px-2.5 py-1.5 shadow-sm">
                  <Bot
                    size={10}
                    className="text-[#594BB7]"
                  />

                  <span className="text-[8px] font-semibold text-[#778397]">
                    Ctrl + Enter to run
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-red-700">
                      Execution failed
                    </p>

                    <p className="mt-1 break-words text-[9px] leading-4 text-red-600">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div
                  className={`mt-4 rounded-xl border p-3 ${
                    result.review_status ===
                    "PASS"
                      ? "border-[#BFE2DC] bg-[#F2FBF9]"
                      : "border-[#E8D7DE] bg-[#FBF5F7]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.review_status ===
                    "PASS" ? (
                      <CheckCircle2
                        size={15}
                        className="text-[#087F75]"
                      />
                    ) : (
                      <RefreshCw
                        size={15}
                        className="text-[#A83F6B]"
                      />
                    )}

                    <span
                      className={`text-[10px] font-bold ${
                        result.review_status ===
                        "PASS"
                          ? "text-[#087F75]"
                          : "text-[#A83F6B]"
                      }`}
                    >
                      Workflow completed
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#647084]">
                      Review:{" "}
                      {result.review_status}
                    </span>

                    <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-semibold text-[#647084]">
                      Revisions:{" "}
                      {result.retry_count}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch
                    size={11}
                    className="text-[#087F75]"
                  />

                  <span className="text-[9px] text-[#8B97A6]">
                    Manager will analyze and
                    route the task.
                  </span>
                </div>

                <button
                  onClick={executeWorkflow}
                  disabled={
                    !task.trim() ||
                    running
                  }
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#172033] to-[#263A52] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(23,32,51,0.16)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {running ? (
                    <>
                      <Loader2
                        size={12}
                        className="animate-spin"
                      />

                      Running Agents...
                    </>
                  ) : (
                    <>
                      <Play
                        size={11}
                        fill="currentColor"
                      />

                      Execute Workflow

                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#F1F4F6] via-[#F8FAFB] to-[#EDF1F4] p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Network
                      size={12}
                      className="text-[#087F75]"
                    />

                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F5D72]">
                      Execution Graph
                    </div>
                  </div>

                  <div className="mt-1 text-[10px] text-[#8A96A5]">
                    {running
                      ? "Workflow is running on the Django backend..."
                      : result
                      ? "Workflow execution completed"
                      : "Awaiting workflow execution"}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border border-[#C5D1D9] bg-white px-2.5 py-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      running
                        ? "animate-pulse bg-[#594BB7]"
                        : result
                        ? result.review_status ===
                          "PASS"
                          ? "bg-[#087F75]"
                          : "bg-[#A83F6B]"
                        : "bg-[#AAB4BF]"
                    }`}
                  />

                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#68758A]">
                    {running
                      ? "Running"
                      : result
                      ? "Completed"
                      : "Ready"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {agents.map(
                  (agent, index) => {
                    const Icon = agent.icon;

                    const style =
                      styles[
                        agent.accent
                      ];

                    const agentState =
                      agentStatuses[index];

                    const completed =
                      agentState.completed;

                    const activeNode =
                      running
                        ? index === 0
                        : completed;

                    const isReviewer =
                      agent.name ===
                      "Reviewer";

                    const isRevision =
                      isReviewer &&
                      result?.review_status ===
                        "REVISE";

                    return (
                      <div
                        key={agent.name}
                        className="relative"
                      >
                        {index <
                          agents.length -
                            1 && (
                          <div className="absolute left-[19px] top-[51px] z-0 h-4 w-px bg-[#C5CED7]" />
                        )}

                        <div
                          className={`relative z-10 flex items-center gap-3 rounded-xl border p-3 transition-all ${
                            activeNode
                              ? "border-[#A6D0CB] bg-white shadow-sm"
                              : "border-[#D0D9E0] bg-white/80"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              activeNode
                                ? `${style.bg} ${style.icon}`
                                : "bg-[#EEF1F4] text-[#7C899A]"
                            }`}
                          >
                            <Icon size={14} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-[#273247]">
                              {agent.name}
                            </div>

                            <div className="mt-0.5 text-[8px] uppercase tracking-wider text-[#929DAC]">
                              {
                                agentState.status
                              }
                            </div>
                          </div>

                          {running &&
                          index === 0 ? (
                            <Loader2
                              size={14}
                              className="animate-spin text-[#087F75]"
                            />
                          ) : completed ? (
                            isRevision ? (
                              <RefreshCw
                                size={14}
                                className="text-[#A83F6B]"
                              />
                            ) : (
                              <CheckCircle2
                                size={14}
                                className="text-[#087F75]"
                              />
                            )
                          ) : (
                            <ChevronRight
                              size={13}
                              className="text-[#A3ADBA]"
                            />
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {result && (
            <div className="border-t border-[#DCE4E9] bg-[#FBFCFD] p-6 sm:p-7">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={14}
                      className="text-[#594BB7]"
                    />

                    <h3 className="text-sm font-bold text-[#172033]">
                      Workflow Output
                    </h3>
                  </div>

                  <p className="mt-1 text-[10px] text-[#8490A3]">
                    Results returned by the
                    multi-agent pipeline.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1 text-[8px] font-bold uppercase ${
                    result.review_status ===
                    "PASS"
                      ? "border-[#BFE2DC] bg-[#F2FBF9] text-[#087F75]"
                      : "border-[#E8D7DE] bg-[#FBF5F7] text-[#A83F6B]"
                  }`}
                >
                  {result.review_status}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <OutputCard
                  title="Research Notes"
                  icon={Search}
                  content={
                    result.research_notes
                  }
                  onCopy={() =>
                    copyText(
                      result.research_notes,
                      "Research notes"
                    )
                  }
                  copied={
                    copied ===
                    "Research notes"
                  }
                />

                <OutputCard
                  title="Draft"
                  icon={FileText}
                  content={result.draft}
                  onCopy={() =>
                    copyText(
                      result.draft,
                      "Draft"
                    )
                  }
                  copied={
                    copied === "Draft"
                  }
                />

                <OutputCard
                  title="Review Feedback"
                  icon={ShieldCheck}
                  content={
                    result.review_feedback
                  }
                  onCopy={() =>
                    copyText(
                      result.review_feedback,
                      "Review feedback"
                    )
                  }
                  copied={
                    copied ===
                    "Review feedback"
                  }
                />

                <OutputCard
                  title="Final Output"
                  icon={CheckCircle2}
                  content={
                    result.final_output
                  }
                  featured
                  onCopy={() =>
                    copyText(
                      result.final_output,
                      "Final output"
                    )
                  }
                  copied={
                    copied === "Final output"
                  }
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  /* =======================================================
     AGENTS PAGE - REAL DATA
  ======================================================= */

  const renderAgents = () => (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="AI Agent Network"
        title="Your intelligent agent team"
        description="Live agent information derived from your actual Django workflow executions and local execution history."
        icon={Network}
        badge={`${agents.length} Nodes Connected`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Bot}
          value={agents.length}
          label="AI Agents"
          status="Active"
          accent="teal"
        />

        <MetricCard
          icon={Workflow}
          value={stats.executions}
          label="Real Workflow Runs"
          status={
            stats.executions
              ? "Live Data"
              : "No Runs"
          }
          accent="purple"
        />

        <MetricCard
          icon={RefreshCw}
          value={stats.revisions}
          label="Total Revisions"
          status={
            stats.revisions
              ? "Recorded"
              : "None"
          }
          accent="orange"
        />

        <MetricCard
          icon={GitBranch}
          value={`${stats.passRate}%`}
          label="Review Pass Rate"
          status={
            stats.executions
              ? "Calculated"
              : "Waiting"
          }
          accent="pink"
        />
      </div>

      {/* REAL AGENT DATA */}

      <div className="rounded-[28px] border border-[#CBD6DE] bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,0.065)] lg:p-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={16}
                className="text-[#087F75]"
              />

              <h2 className="text-base font-bold text-[#172033]">
                Live Agent Performance
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-[#8490A3]">
              Metrics below are calculated from actual workflow executions.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#BFE2DC] bg-[#F2FBF9] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#16B8A6]" />

            <span className="text-[8px] font-bold uppercase tracking-wider text-[#087F75]">
              Backend Data
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {agentMetrics.map(
            (agent, index) => {
              const Icon = agent.icon;
              const style =
                styles[agent.accent];

              return (
                <div
                  key={agent.name}
                  className="group relative overflow-hidden rounded-2xl border border-[#D5DEE5] bg-[#FBFCFD] p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(16,24,40,0.09)]"
                >
                  <div
                    className={`absolute left-0 right-0 top-0 h-[2px] ${style.line}`}
                  />

                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.icon}`}
                    >
                      <Icon size={19} />
                    </div>

                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#A0AAB6]">
                      NODE 0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#172033]">
                    {agent.name}
                  </h3>

                  <p
                    className={`mt-1 text-[8px] font-bold uppercase tracking-[0.12em] ${style.icon}`}
                  >
                    {agent.role}
                  </p>

                  {/* REAL METRICS */}

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <MiniMetric
                      label="Runs"
                      value={
                        agent.executions
                      }
                    />

                    <MiniMetric
                      label="Completed"
                      value={
                        agent.completedRuns
                      }
                    />

                    <MiniMetric
                      label="Revisions"
                      value={
                        agent.revisions
                      }
                    />

                    <MiniMetric
                      label="Status"
                      value={
                        agent.status
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-[#E7ECEF] bg-white p-3">
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[#9AA5B3]">
                      Activity
                    </p>

                    <p className="mt-1 text-[9px] leading-4 text-[#69778B]">
                      {agent.detail}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-[#E9EDF0] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[7px] font-bold uppercase tracking-wider text-[#A0AAB6]">
                        Last activity
                      </span>

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${style.line}`}
                      />
                    </div>

                    <p className="mt-1 truncate text-[8px] text-[#7A8799]">
                      {agent.lastActivity}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* NETWORK */}

      <div className="rounded-[28px] border border-[#CBD6DE] bg-white p-6 shadow-[0_18px_55px_rgba(16,24,40,0.065)] lg:p-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit
                size={16}
                className="text-[#087F75]"
              />

              <h2 className="text-base font-bold text-[#172033]">
                Agent orchestration network
              </h2>
            </div>

            <p className="mt-1 text-[10px] text-[#8490A3]">
              Five specialized agents collaborate through the Django/LangGraph workflow.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#D7E0E7] bg-[#F8FAFB] px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#087F75]" />

            <span className="text-[8px] font-bold uppercase tracking-wider text-[#68758A]">
              All Systems Online
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {agents.map(
            (agent, index) => {
              const Icon = agent.icon;

              const style =
                styles[agent.accent];

              const metrics =
                agentMetrics[index];

              return (
                <div
                  key={agent.name}
                  className="group relative overflow-hidden rounded-2xl border border-[#D5DEE5] bg-[#FBFCFD] p-5 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(16,24,40,0.09)]"
                >
                  <div
                    className={`absolute left-0 right-0 top-0 h-[2px] ${style.line}`}
                  />

                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.icon}`}
                    >
                      <Icon size={19} />
                    </div>

                    <span className="text-[8px] font-bold uppercase tracking-wider text-[#A0AAB6]">
                      NODE 0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#172033]">
                    {agent.name}
                  </h3>

                  <p
                    className={`mt-1 text-[8px] font-bold uppercase tracking-[0.12em] ${style.icon}`}
                  >
                    {agent.role}
                  </p>

                  <p className="mt-4 text-[10px] leading-5 text-[#69778B]">
                    {agent.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white px-2.5 py-2">
                      <p className="text-[7px] uppercase text-[#A0AAB6]">
                        Runs
                      </p>

                      <p className="mt-1 text-[10px] font-bold text-[#273247]">
                        {metrics.executions}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-2.5 py-2">
                      <p className="text-[7px] uppercase text-[#A0AAB6]">
                        Status
                      </p>

                      <p
                        className={`mt-1 text-[9px] font-bold ${style.icon}`}
                      >
                        {metrics.status}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#E9EDF0] pt-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${style.line}`}
                    />

                    <span className="text-[8px] font-semibold text-[#8490A3]">
                      Online
                    </span>

                    <span className="ml-auto text-[7px] uppercase tracking-wider text-[#B0B8C2]">
                      Autonomous
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)]">
          <div className="mb-5 flex items-center gap-2">
            <GitBranch
              size={15}
              className="text-[#087F75]"
            />

            <h3 className="text-sm font-bold text-[#172033]">
              Execution Logic
            </h3>
          </div>

          <div className="space-y-3">
            {agents.map(
              (agent, index) => {
                const style =
                  styles[agent.accent];

                const metrics =
                  agentMetrics[index];

                return (
                  <div
                    key={agent.name}
                    className="flex items-center gap-3 rounded-xl border border-[#E1E7EB] bg-[#FAFBFC] p-3 transition hover:border-[#CBD6DE] hover:bg-white"
                  >
                    <span className="text-[8px] font-bold text-[#A0AAB6]">
                      0{index + 1}
                    </span>

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.bg}`}
                    >
                      <CircleDot
                        size={12}
                        className={
                          style.icon
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-[#273247]">
                        {agent.name}
                      </div>

                      <div className="mt-0.5 text-[8px] text-[#8A96A5]">
                        {agent.description}
                      </div>
                    </div>

                    <div className="hidden text-right sm:block">
                      <div
                        className={`text-[8px] font-bold ${style.icon}`}
                      >
                        {metrics.executions} runs
                      </div>

                      <div className="mt-0.5 text-[7px] text-[#A0AAB6]">
                        {metrics.status}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D4DDE4] bg-gradient-to-br from-[#F8FBFB] to-[#F7F6FC] p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={15}
              className="text-[#594BB7]"
            />

            <h3 className="text-sm font-bold text-[#172033]">
              Conditional Routing
            </h3>
          </div>

          <div className="mt-6 rounded-2xl border border-[#DDE4E9] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A9542D]/10">
                <Check
                  size={15}
                  className="text-[#A9542D]"
                />
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#273247]">
                  Reviewer decision
                </div>

                <div className="text-[8px] text-[#8995A5]">
                  Quality control checkpoint
                </div>
              </div>
            </div>

            <div className="my-4 h-px bg-[#E8EDF0]" />

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-[#F1FBF9] px-3 py-2.5">
                <span className="text-[9px] font-semibold text-[#526075]">
                  PASS
                </span>

                <span className="text-[8px] font-bold text-[#087F75]">
                  → Publisher
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#F9F3F6] px-3 py-2.5">
                <span className="text-[9px] font-semibold text-[#526075]">
                  REVISE
                </span>

                <span className="text-[8px] font-bold text-[#A83F6B]">
                  → Writer
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-[#F7F9FA] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-wider text-[#8995A5]">
                  Real pass rate
                </span>

                <span className="text-sm font-bold text-[#087F75]">
                  {stats.passRate}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8EDF0]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#087F75] to-[#594BB7] transition-all duration-500"
                  style={{
                    width: `${stats.passRate}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     HISTORY
  ======================================================= */

  const renderHistory = () => (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Execution Observability"
          title="Execution History"
          description="Review previous multi-agent workflow executions and outputs."
          icon={History}
          badge={`${history.length} Runs`}
        />

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex w-fit items-center gap-2 rounded-xl border border-[#E1D3D8] bg-white px-4 py-2.5 text-[10px] font-semibold text-[#A83F6B] transition hover:bg-[#A83F6B]/5"
          >
            <Trash2 size={13} />
            Clear History
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <MetricCard
          icon={History}
          value={stats.executions}
          label="Total Executions"
          status="Tracked"
          accent="purple"
        />

        <MetricCard
          icon={CheckCircle2}
          value={stats.successful}
          label="Successful Reviews"
          status="Passed"
          accent="teal"
        />

        <MetricCard
          icon={RefreshCw}
          value={stats.revisions}
          label="Total Revisions"
          status="Logged"
          accent="orange"
        />

        <MetricCard
          icon={Activity}
          value={`${stats.passRate}%`}
          label="Review Pass Rate"
          status="Calculated"
          accent="pink"
        />
      </div>

      {history.length === 0 ? (
        <EmptyHistory
          onRun={() =>
            handleNavigation(
              "Run Workflow"
            )
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
          <div className="space-y-3">
            {history.map((run) => {
              const isSelected =
                selectedRun?.id === run.id;

              const isSuccess =
                run.success === true &&
                String(
                  run.review_status ||
                    run.status ||
                    ""
                ).toUpperCase() ===
                  "PASS";

              return (
                <div
                  key={run.id}
                  className={`rounded-2xl border bg-white p-5 transition-all ${
                    isSelected
                      ? "border-[#594BB7]/40 shadow-[0_8px_25px_rgba(89,75,183,0.08)]"
                      : "border-[#D9E2E8] hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(16,24,40,0.08)]"
                  }`}
                >
                  <button
                    onClick={() =>
                      setSelectedRun(
                        run
                      )
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#594BB7]/10">
                            <Terminal
                              size={12}
                              className="text-[#594BB7]"
                            />
                          </span>

                          <span className="text-[8px] font-bold uppercase tracking-wider text-[#9AA5B3]">
                            Workflow Run
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-[#273247]">
                          {run.task}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-bold ${
                          isSuccess
                            ? "border-[#BFE2DC] bg-[#F2FBF9] text-[#087F75]"
                            : "border-[#E8D7DE] bg-[#FBF5F7] text-[#A83F6B]"
                        }`}
                      >
                        {run.review_status ||
                          run.status ||
                          "COMPLETED"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#EDF0F2] pt-3">
                      <span className="flex items-center gap-1.5 text-[8px] text-[#8A96A5]">
                        <Clock3 size={10} />
                        {run.created_at}
                      </span>

                      <span className="flex items-center gap-1.5 text-[8px] text-[#8A96A5]">
                        <RefreshCw size={10} />
                        {run.retry_count || 0}{" "}
                        revisions
                      </span>
                    </div>
                  </button>

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() =>
                        deleteRun(
                          run.id
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[8px] font-semibold text-[#A83F6B] transition hover:bg-[#A83F6B]/5"
                    >
                      <Trash2 size={10} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-fit rounded-[24px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)] lg:sticky lg:top-[100px]">
            {selectedRun ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye
                      size={15}
                      className="text-[#087F75]"
                    />

                    <h3 className="text-sm font-bold text-[#172033]">
                      Run Details
                    </h3>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedRun(null)
                    }
                    className="rounded-lg p-1.5 text-[#9AA5B3] hover:bg-[#F4F6F8]"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-5 rounded-xl bg-[#F7F9FA] p-4">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#929DAC]">
                    Task
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#273247]">
                    {selectedRun.task}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#E1E7EB] p-3">
                    <p className="text-[8px] uppercase tracking-wider text-[#929DAC]">
                      Status
                    </p>

                    <p
                      className={`mt-1 text-xs font-bold ${
                        String(
                          selectedRun.review_status ||
                            selectedRun.status ||
                            ""
                        ).toUpperCase() ===
                        "PASS"
                          ? "text-[#087F75]"
                          : "text-[#A83F6B]"
                      }`}
                    >
                      {selectedRun.review_status ||
                        selectedRun.status}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E1E7EB] p-3">
                    <p className="text-[8px] uppercase tracking-wider text-[#929DAC]">
                      Revisions
                    </p>

                    <p className="mt-1 text-xs font-bold text-[#273247]">
                      {selectedRun.retry_count ||
                        0}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <OutputCard
                    title="Research Notes"
                    icon={Search}
                    content={
                      selectedRun.research_notes
                    }
                    onCopy={() =>
                      copyText(
                        selectedRun.research_notes,
                        "Research notes"
                      )
                    }
                    copied={
                      copied ===
                      "Research notes"
                    }
                  />
                </div>

                <div className="mt-4">
                  <OutputCard
                    title="Final Output"
                    icon={CheckCircle2}
                    content={
                      selectedRun.final_output
                    }
                    featured
                    onCopy={() =>
                      copyText(
                        selectedRun.final_output,
                        "Final output"
                      )
                    }
                    copied={
                      copied ===
                      "Final output"
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <Eye
                  size={24}
                  className="text-[#C1CAD3]"
                />

                <p className="mt-4 text-xs font-semibold text-[#69778B]">
                  Select an execution
                </p>

                <p className="mt-1 max-w-[220px] text-[9px] leading-4 text-[#9AA5B3]">
                  Choose a workflow run
                  to inspect its details
                  and final output.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  /* =======================================================
     SETTINGS PAGE
  ======================================================= */

  const renderSettings = () => (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Workspace Configuration"
        title="Settings"
        description="Configure how your multi-agent workspace behaves."
        icon={Settings}
        badge="Local Preferences"
      />

      <div className="relative overflow-hidden rounded-[26px] border border-[#CBD6DE] bg-white p-6 shadow-[0_15px_45px_rgba(16,24,40,0.055)]">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087F75] to-[#594BB7] text-white">
              <BrainCircuit size={21} />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#16B8A6]" />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#8995A5]">
                Workspace Status
              </p>

              <h2 className="mt-1 text-base font-bold text-[#172033]">
                Multi-Agent Intelligence
              </h2>

              <p className="mt-1 text-[10px] text-[#8490A3]">
                Your AI orchestration
                environment is ready.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-[#BFE2DC] bg-[#F2FBF9] px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16B8A6]" />

            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-[#087F75]">
              System Online
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
        <div className="rounded-[26px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)]">
          <div className="mb-2 flex items-center gap-2">
            <SlidersHorizontal
              size={15}
              className="text-[#594BB7]"
            />

            <h2 className="text-sm font-bold text-[#172033]">
              Workspace Preferences
            </h2>
          </div>

          <p className="mb-2 text-[9px] leading-4 text-[#929DAC]">
            These preferences are stored
            in your browser.
          </p>

          <SettingRow
            icon={Bell}
            title="Execution notifications"
            description="Enable completion and execution status feedback."
            enabled={
              settings.notifications
            }
            onClick={() =>
              updateSetting(
                "notifications"
              )
            }
          />

          <SettingRow
            icon={Database}
            title="Auto-save execution history"
            description="Keep completed workflow runs in browser storage."
            enabled={settings.autoSave}
            onClick={() =>
              updateSetting("autoSave")
            }
          />

          <SettingRow
            icon={Activity}
            title="Compact workspace"
            description="Use a denser visual layout for monitoring."
            enabled={
              settings.compactMode
            }
            onClick={() =>
              updateSetting(
                "compactMode"
              )
            }
          />
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)]">
            <div className="flex items-center gap-2">
              <Server
                size={15}
                className="text-[#087F75]"
              />

              <h3 className="text-sm font-bold text-[#172033]">
                Runtime
              </h3>
            </div>

            <div className="mt-5 space-y-3">
              <InfoRow
                label="Backend"
                value="Django API"
              />

              <InfoRow
                label="Graph Engine"
                value="LangGraph"
              />

              <InfoRow
                label="Agents"
                value="5 active"
              />

              <InfoRow
                label="Routing"
                value="Conditional"
              />

              <InfoRow
                label="Executions"
                value={String(
                  stats.executions
                )}
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-[#D4DDE4] bg-gradient-to-br from-[#F8FBFB] to-[#F7F6FC] p-6">
            <div className="flex items-center gap-2">
              <KeyRound
                size={15}
                className="text-[#594BB7]"
              />

              <h3 className="text-sm font-bold text-[#172033]">
                API Connection
              </h3>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#BFE2DC] bg-white p-3">
              <span className="h-2 w-2 rounded-full bg-[#16B8A6]" />

              <div>
                <p className="text-[9px] font-bold text-[#273247]">
                  Django API
                </p>

                <p className="mt-0.5 text-[8px] text-[#8995A5]">
                  /api/run-agent/
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[24px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)]">
          <div className="flex items-center gap-2">
            <Database
              size={15}
              className="text-[#087F75]"
            />

            <h3 className="text-sm font-bold text-[#172033]">
              Local Storage
            </h3>
          </div>

          <p className="mt-2 text-[9px] leading-4 text-[#8995A5]">
            Your execution history is
            stored locally when Auto-save
            is enabled.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-[#E1E7EB] bg-[#F8FAFB] px-3 py-2.5">
            <span className="text-[9px] font-semibold text-[#68758A]">
              Stored executions
            </span>

            <span className="rounded-full bg-[#087F75]/10 px-2.5 py-1 text-[8px] font-bold text-[#087F75]">
              {history.length}
            </span>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#D4DDE4] bg-white p-6 shadow-[0_10px_35px_rgba(16,24,40,0.045)]">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={15}
              className="text-[#594BB7]"
            />

            <h3 className="text-sm font-bold text-[#172033]">
              Current Configuration
            </h3>
          </div>

          <div className="mt-5 space-y-3">
            <StatusLine
              label="Notifications"
              enabled={
                settings.notifications
              }
            />

            <StatusLine
              label="Auto-save"
              enabled={settings.autoSave}
            />

            <StatusLine
              label="Compact Mode"
              enabled={
                settings.compactMode
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#172033]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#020817]/75 backdrop-blur-md lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[278px] flex-col overflow-hidden border-r border-white/[0.07] bg-[#060D18] text-white shadow-[15px_0_60px_rgba(2,8,23,0.18)] transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-[#087F75]/[0.11] blur-[90px]" />

        <div className="pointer-events-none absolute -right-28 bottom-16 h-72 w-72 rounded-full bg-[#594BB7]/[0.12] blur-[95px]" />

        <div className="relative flex h-[84px] items-center justify-between border-b border-white/[0.07] px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.12] bg-gradient-to-br from-[#087F75] via-[#276B91] to-[#594BB7]">
              <BrainCircuit
                size={20}
                strokeWidth={1.8}
              />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#060D18] bg-[#4DE0D0]" />
            </div>

            <div>
              <div className="text-[15px] font-bold">
                Multi-Agent
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Intelligence

                <span className="h-1 w-1 rounded-full bg-[#087F75]" />

                <span className="text-[#45CFC2]">
                  AI
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative px-4 pt-6">
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
              AI Workspace
            </span>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3ED6C4]" />

              <span className="text-[7px] font-bold uppercase tracking-wider text-[#4C9C94]">
                Live
              </span>
            </div>
          </div>

          <div className="mb-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <Radio
                size={13}
                className="text-[#49D5C8]"
              />

              <span className="text-[9px] font-semibold text-slate-300">
                Agent Network
              </span>

              <span className="ml-auto text-[8px] text-slate-600">
                {agents.length} nodes
              </span>
            </div>

            <div className="relative h-[42px]">
              <div className="absolute left-[12%] top-1/2 h-px w-[76%] bg-gradient-to-r from-[#087F75]/40 via-[#594BB7]/30 to-[#806019]/30" />

              {agents.map(
                (_, index) => (
                  <div
                    key={index}
                    className="absolute top-1/2 flex -translate-y-1/2"
                    style={{
                      left: `${
                        8 +
                        index * 21
                      }%`,
                    }}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full border-2 border-[#060D18] ${
                        index === 0
                          ? "bg-[#3ED6C4] shadow-[0_0_9px_#3ED6C4]"
                          : "bg-slate-600"
                      }`}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
            Navigation
          </div>

          <nav className="space-y-1">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  activePage ===
                  item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() =>
                      handleNavigation(
                        item.name
                      )
                    }
                    className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-[13px] font-medium transition-all ${
                      active
                        ? "border-white/[0.08] bg-gradient-to-r from-[#087F75]/[0.13] via-white/[0.055] to-[#594BB7]/[0.06] text-white"
                        : "border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-slate-200"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#43DED0] to-[#7468E8]" />
                    )}

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        active
                          ? "bg-gradient-to-br from-[#087F75]/25 to-[#594BB7]/20 shadow-[0_0_18px_rgba(67,222,208,0.10)]"
                          : "bg-white/[0.025] group-hover:bg-white/[0.05]"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={
                          active
                            ? "text-[#43DED0] drop-shadow-[0_0_6px_rgba(67,222,208,0.35)]"
                            : "text-slate-500 group-hover:text-slate-300"
                        }
                      />
                    </div>

                    {item.name}

                    {item.name ===
                      "Run Workflow" && (
                      <span className="ml-auto rounded-md border border-[#087F75]/25 bg-[#087F75]/10 px-1.5 py-0.5 text-[7px] font-bold tracking-[0.12em] text-[#5DE0D2]">
                        RUN
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </nav>
        </div>

        <div className="relative mt-auto px-4 pb-5">
          <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
            Runtime
          </div>

          <div className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#087F75]/20 bg-[#087F75]/10">
                <Cpu
                  size={16}
                  className="text-[#4BD8CA]"
                />
              </div>

              <div>
                <div className="text-[11px] font-semibold text-white">
                  System Online
                </div>

                <div className="mt-0.5 text-[9px] text-slate-500">
                  LangGraph runtime ready
                </div>
              </div>

              <span className="ml-auto h-2 w-2 rounded-full bg-[#3ED6A8]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.055] bg-black/20 px-2.5 py-2">
                <div className="text-[7px] uppercase text-slate-600">
                  Agents
                </div>

                <div className="mt-1 text-[10px] font-semibold text-slate-300">
                  5 active
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.055] bg-black/20 px-2.5 py-2">
                <div className="text-[7px] uppercase text-slate-600">
                  Runs
                </div>

                <div className="mt-1 text-[10px] font-semibold text-slate-300">
                  {history.length}
                </div>
              </div>
            </div>
          </div>

          {/* SETTINGS ICON - COLORED */}

          <button
            onClick={() =>
              handleNavigation(
                "Settings"
              )
            }
            className={`group mt-3 flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all ${
              activePage === "Settings"
                ? "border-[#087F75]/20 bg-gradient-to-r from-[#087F75]/[0.12] to-[#594BB7]/[0.08] text-white shadow-[0_0_22px_rgba(8,127,117,0.08)]"
                : "border-transparent text-slate-400 hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                activePage === "Settings"
                  ? "bg-gradient-to-br from-[#087F75]/25 to-[#594BB7]/20"
                  : "bg-white/[0.025] group-hover:bg-white/[0.05]"
              }`}
            >
              <Settings
                size={17}
                className={
                  activePage === "Settings"
                    ? "text-[#43DED0] drop-shadow-[0_0_7px_rgba(67,222,208,0.40)]"
                    : "text-slate-500 group-hover:text-[#43DED0]"
                }
              />
            </div>

            <span className="flex-1 text-left">
              Settings
            </span>

            {activePage ===
              "Settings" && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#43DED0] shadow-[0_0_8px_#43DED0]" />
            )}
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="lg:ml-[278px]">
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#DDE4EA] bg-[#F4F6F8]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl border border-[#D8E0E7] bg-white p-2.5 text-[#596579] shadow-sm lg:hidden"
            >
              <Menu size={18} />
            </button>

            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8994A5]">
                AI Orchestration
              </div>

              <div className="mt-0.5 text-sm font-semibold text-[#172033]">
                {activePage}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[#D7E0E7] bg-white px-3.5 py-1.5 shadow-sm sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#087F75]" />

              <span className="text-[10px] font-semibold text-[#647084]">
                System Online
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#172033] to-[#344054] text-[10px] font-bold text-white">
              IB
            </div>
          </div>
        </header>

        <div
          className={`mx-auto max-w-[1480px] px-5 sm:px-8 lg:px-10 ${
            settings.compactMode
              ? "py-4"
              : "py-7 lg:py-8"
          }`}
        >
          {notice && (
            <div className="fixed right-5 top-20 z-[60] flex max-w-[360px] items-center gap-3 rounded-xl border border-[#BFE2DC] bg-white px-4 py-3 shadow-[0_15px_40px_rgba(16,24,40,0.14)]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#087F75]/10">
                <CheckCircle2
                  size={14}
                  className="text-[#087F75]"
                />
              </div>

              <span className="text-[10px] font-semibold text-[#526075]">
                {notice}
              </span>

              <button
                onClick={() =>
                  setNotice("")
                }
                className="ml-auto rounded-md p-1 text-[#9AA5B3] hover:bg-[#F4F6F8]"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {activePage ===
            "Overview" &&
            renderOverview()}

          {activePage ===
            "Run Workflow" && (
            <div className="-mt-1">
              {renderWorkflowRunner()}
            </div>
          )}

          {activePage === "Agents" &&
            renderAgents()}

          {activePage ===
            "Execution History" &&
            renderHistory()}

          {activePage ===
            "Settings" &&
            renderSettings()}

          <footer className="flex flex-col justify-between gap-3 px-1 py-8 text-[9px] text-[#98A2B1] sm:flex-row sm:items-center">
            <div>
              Multi-Agent Intelligence ·
              LangGraph orchestration
              engine
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span>5 Agents</span>

              <span className="h-1 w-1 rounded-full bg-[#C5CBD3]" />

              <span>
                Conditional Routing
              </span>

              <span className="h-1 w-1 rounded-full bg-[#C5CBD3]" />

              <span>
                API Connected
              </span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   AGENT NETWORK VISUAL
========================================================= */

function AgentNetworkVisual() {
  const nodes = [
    {
      name: "Manager",
      role: "Orchestration",
      position: "left-[8%] top-[29%]",
      color: "text-[#46D5C8]",
      icon: GitBranch,
    },
    {
      name: "Researcher",
      role: "Knowledge",
      position: "right-[8%] top-[28%]",
      color: "text-[#A59AF4]",
      icon: Search,
    },
    {
      name: "Writer",
      role: "Generation",
      position: "left-[8%] bottom-[27%]",
      color: "text-[#E995B5]",
      icon: FileText,
    },
    {
      name: "Reviewer",
      role: "Quality",
      position: "right-[8%] bottom-[25%]",
      color: "text-[#F0A574]",
      icon: Check,
    },
  ];

  return (
    <div className="relative min-h-[390px] overflow-hidden bg-[#07111F] lg:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(22,184,166,0.18),transparent_27%),radial-gradient(circle_at_82%_18%,rgba(129,114,234,0.17),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(214,109,154,0.09),transparent_25%)]" />

      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px)",
          backgroundSize:
            "30px 30px",
        }}
      />

      <div className="absolute left-6 top-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]">
          <Bot
            size={15}
            className="text-[#65DDD2]"
          />
        </div>

        <div>
          <div className="text-[10px] font-semibold text-white">
            Autonomous Agent Network
          </div>

          <div className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.18em] text-slate-500">
            LangGraph orchestration
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-5 flex items-center gap-1.5 rounded-full border border-[#16B8A6]/20 bg-[#16B8A6]/[0.08] px-2.5 py-1">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#37D4BE] shadow-[0_0_8px_#37D4BE]" />

        <span className="text-[7px] font-bold uppercase tracking-wider text-[#65DCCF]">
          Active
        </span>
      </div>

      <div className="absolute left-1/2 top-[51%] h-[285px] w-[285px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#16B8A6]/10" />

      <div className="absolute left-1/2 top-[51%] h-[215px] w-[215px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8172EA]/15" />

      <div className="absolute left-1/2 top-[51%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />

      <div className="absolute left-1/2 top-[51%] h-[125px] w-[125px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#16B8A6]/10 blur-3xl" />

      <div className="absolute left-1/2 top-[51%] flex h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] border border-white/[0.15] bg-white/[0.065] shadow-[0_0_55px_rgba(22,184,166,0.22)] backdrop-blur-xl">
        <div className="relative flex h-[62px] w-[62px] items-center justify-center rounded-2xl border border-white/[0.09] bg-[#0A1524]/70">
          <Bot
            size={37}
            strokeWidth={1.25}
            className="text-white"
          />

          <div className="absolute left-[20px] top-[27px] h-1.5 w-1.5 rounded-full bg-[#52DED0] shadow-[0_0_7px_#52DED0]" />

          <div className="absolute right-[20px] top-[27px] h-1.5 w-1.5 rounded-full bg-[#9C91F2] shadow-[0_0_7px_#9C91F2]" />
        </div>

        <div className="absolute -bottom-6 rounded-full border border-white/10 bg-[#07111F]/90 px-2.5 py-1">
          <span className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-400">
            AI Core
          </span>
        </div>
      </div>

      {nodes.map(
        ({
          name,
          role,
          position,
          color,
          icon: Icon,
        }) => (
          <div
            key={name}
            className={`absolute ${position} flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-2.5 py-2 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.12)]`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
              <Icon
                size={12}
                className={color}
              />
            </div>

            <div className="hidden sm:block">
              <div className="text-[8px] font-semibold text-slate-200">
                {name}
              </div>

              <div className="text-[6px] uppercase tracking-wider text-slate-600">
                {role}
              </div>
            </div>
          </div>
        )
      )}

      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.05]">
            <Workflow
              size={11}
              className="text-[#65DCCF]"
            />
          </div>

          <div>
            <div className="text-[8px] font-semibold text-slate-300">
              LangGraph Engine
            </div>

            <div className="text-[6px] uppercase tracking-wider text-slate-600">
              Workflow runtime
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38D5AE] shadow-[0_0_8px_#38D5AE]" />

          <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK STATS
========================================================= */

function QuickStats({
  stats,
  onHistory,
  onRun,
}) {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      <MetricCard
        icon={Activity}
        value={stats.executions}
        label="Workflow Executions"
        status="Tracked"
        accent="teal"
      />

      <MetricCard
        icon={CheckCircle2}
        value={stats.successful}
        label="Passed Reviews"
        status="Verified"
        accent="purple"
      />

      <button
        onClick={
          stats.executions
            ? onHistory
            : onRun
        }
        className="group rounded-2xl border border-[#DDE4EA] bg-white p-5 text-left shadow-[0_8px_30px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(16,24,40,0.08)]"
      >
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A83F6B]/[0.08]">
            <History
              size={19}
              className="text-[#A83F6B]"
            />
          </div>

          <ArrowRight
            size={14}
            className="text-[#A0AAB6] transition-transform group-hover:translate-x-1"
          />
        </div>

        <p className="mt-5 text-sm font-bold text-[#172033]">
          {stats.executions
            ? "Inspect executions"
            : "Run your first workflow"}
        </p>

        <p className="mt-1 text-[10px] text-[#718096]">
          {stats.executions
            ? "Open execution history and inspect outputs."
            : "Start with a task and let the agent graph execute it."}
        </p>
      </button>
    </section>
  );
}

/* =========================================================
   FEATURE PILL
========================================================= */

function FeaturePill({
  icon: Icon,
  text,
  accent,
}) {
  const colorMap = {
    teal: "text-[#16B8A6]",
    purple: "text-[#7667E8]",
    orange: "text-[#D98B57]",
  };

  return (
    <div className="flex items-center gap-1.5">
      <Icon
        size={10}
        className={colorMap[accent]}
      />

      <span className="text-[9px] font-medium text-[#788497]">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  badge,
}) {
  return (
    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#087F75]/10">
            <Icon
              size={15}
              className="text-[#087F75]"
            />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#087F75]">
            {eyebrow}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#172033]">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718096]">
          {description}
        </p>
      </div>

      {badge && (
        <div className="flex w-fit items-center gap-2 rounded-full border border-[#D7E0E7] bg-white px-3.5 py-2 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#087F75]" />

          <span className="text-[9px] font-bold uppercase tracking-wider text-[#68758A]">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  icon: Icon,
  value,
  label,
  status,
  accent = "teal",
}) {
  const style = styles[accent];

  return (
    <div className="rounded-2xl border border-[#DDE4EA] bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(16,24,40,0.07)]">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}
        >
          <Icon
            size={19}
            className={style.icon}
          />
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.icon}`}
        >
          {status}
        </span>
      </div>

      <p className="mt-5 text-2xl font-bold text-[#172033]">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#718096]">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-[#E7ECEF] bg-white px-2.5 py-2">
      <p className="text-[7px] font-semibold uppercase tracking-wider text-[#A0AAB6]">
        {label}
      </p>

      <p className="mt-1 truncate text-[9px] font-bold text-[#273247]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   OUTPUT CARD
========================================================= */

function OutputCard({
  title,
  icon: Icon,
  content,
  featured = false,
  onCopy,
  copied = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        featured
          ? "border-[#BFE2DC] bg-[#F7FCFB]"
          : "border-[#DDE5EA] bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              featured
                ? "bg-[#087F75]/10"
                : "bg-[#F1F3F5]"
            }`}
          >
            <Icon
              size={13}
              className={
                featured
                  ? "text-[#087F75]"
                  : "text-[#68758A]"
              }
            />
          </div>

          <h3 className="text-[10px] font-bold text-[#273247]">
            {title}
          </h3>
        </div>

        {content && onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#E1E7EB] bg-white px-2 py-1.5 text-[8px] font-semibold text-[#7A8799] transition hover:border-[#CBD6DE] hover:text-[#087F75]"
          >
            {copied ? (
              <Check size={10} />
            ) : (
              <Copy size={10} />
            )}

            {copied
              ? "Copied"
              : "Copy"}
          </button>
        )}
      </div>

      <div className="mt-4 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-xl bg-[#F7F9FA] p-4 text-[10px] leading-5 text-[#59667A]">
        {content ||
          "No content returned."}
      </div>
    </div>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onClick,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#EDF0F2] py-5 last:border-b-0">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
            enabled
              ? "bg-gradient-to-br from-[#087F75]/10 to-[#594BB7]/10"
              : "bg-[#F1F4F6]"
          }`}
        >
          <Icon
            size={15}
            className={
              enabled
                ? "text-[#087F75]"
                : "text-[#68758A]"
            }
          />
        </div>

        <div>
          <p className="text-[11px] font-bold text-[#273247]">
            {title}
          </p>

          <p className="mt-1 max-w-md text-[9px] leading-4 text-[#8995A5]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-pressed={enabled}
        onClick={onClick}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-gradient-to-r from-[#087F75] to-[#594BB7]"
            : "bg-[#CBD4DC]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =========================================================
   STATUS LINE
========================================================= */

function StatusLine({
  label,
  enabled,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#F7F9FA] px-3 py-2.5">
      <span className="text-[9px] text-[#68758A]">
        {label}
      </span>

      <span
        className={`flex items-center gap-1.5 text-[8px] font-bold ${
          enabled
            ? "text-[#087F75]"
            : "text-[#929DAC]"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            enabled
              ? "bg-[#16B8A6]"
              : "bg-[#AAB4BF]"
          }`}
        />

        {enabled
          ? "Enabled"
          : "Disabled"}
      </span>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#EDF0F2] pb-3 last:border-0 last:pb-0">
      <span className="text-[9px] text-[#8995A5]">
        {label}
      </span>

      <span className="text-[9px] font-bold text-[#526075]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   EMPTY HISTORY
========================================================= */

function EmptyHistory({
  onRun,
}) {
  return (
    <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-[#CBD6DE] bg-white px-6 text-center">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#594BB7]/[0.06] blur-3xl" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#594BB7]/10">
        <History
          size={27}
          className="text-[#594BB7]"
        />
      </div>

      <h2 className="relative mt-5 text-lg font-bold text-[#172033]">
        No executions yet
      </h2>

      <p className="relative mt-2 max-w-md text-xs leading-5 text-[#8490A3]">
        Run your first workflow and
        completed executions will
        appear here.
      </p>

      <button
        type="button"
        onClick={onRun}
        className="relative mt-5 flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(23,32,51,0.14)] transition hover:-translate-y-0.5"
      >
        <Play
          size={11}
          fill="currentColor"
        />

        Run First Workflow
      </button>
    </div>
  );
}

export default App;