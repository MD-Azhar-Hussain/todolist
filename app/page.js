"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "todo_tasks_v1";
const THEME_KEY = "todo_theme_v1";
const MODE_KEY = "todo_mode_v1";

export default function Page() {
  const [task, setTask] = useState("");
  const [desc, setDesc] = useState("");
  const [mainTask, setMainTask] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [now, setNow] = useState(() => new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState("light");
  const [uiMode, setUiMode] = useState("normal");
  const [isStorageHydrated, setIsStorageHydrated] = useState(false);

  const triggerHaptic = (pattern = 18) => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setIsStorageHydrated(true);
        return;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map((item) => ({
          id: item.id || crypto.randomUUID(),
          task: typeof item.task === "string" ? item.task : "",
          desc: typeof item.desc === "string" ? item.desc : "",
          done: Boolean(item.done),
          createdAt: item.createdAt || Date.now(),
        }));
        setMainTask(normalized);
      }
    } catch {
      setMainTask([]);
    } finally {
      setIsStorageHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isStorageHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mainTask));
  }, [mainTask, isStorageHydrated]);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    const savedMode = localStorage.getItem(MODE_KEY);
    if (
      savedMode === "retro" ||
      savedMode === "normal" ||
      savedMode === "futuristic" ||
      savedMode === "neon"
    ) {
      setUiMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(MODE_KEY, uiMode);
  }, [uiMode]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();

    const cleanTask = task.trim();
    const cleanDesc = desc.trim();

    if (!cleanTask) {
      return;
    }

    setMainTask((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        task: cleanTask,
        desc: cleanDesc,
        done: false,
        createdAt: Date.now(),
      },
    ]);

    setDesc("");
    setTask("");
    triggerHaptic([16, 10, 16]);
  };

  const handleComposerKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      submitHandler(e);
    }
  };

  const deleteAllHandler = () => {
    setMainTask([]);
    triggerHaptic(35);
  };

  const deleteHandler = (id) => {
    setMainTask((prev) => prev.filter((item) => item.id !== id));
    triggerHaptic(22);
  };

  const toggleDoneHandler = (id) => {
    setMainTask((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
    triggerHaptic(12);
  };

  const clearCompletedHandler = () => {
    setMainTask((prev) => prev.filter((item) => !item.done));
    triggerHaptic([8, 8, 8]);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    triggerHaptic(20);
  };

  const handleModeChange = (mode) => {
    setUiMode(mode);
    triggerHaptic([20, 8, 20]);
  };

  const taskStats = useMemo(() => {
    const total = mainTask.length;
    const completed = mainTask.filter((item) => item.done).length;
    const active = total - completed;
    const completion = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, completion };
  }, [mainTask]);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = mainTask.filter((item) => {
      const matchesFilter = filter === "all" || (filter === "active" ? !item.done : item.done);
      const matchesQuery =
        !normalizedQuery ||
        item.task.toLowerCase().includes(normalizedQuery) ||
        item.desc.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    if (sortBy === "a-z") {
      return [...filtered].sort((a, b) => a.task.localeCompare(b.task));
    }

    if (sortBy === "z-a") {
      return [...filtered].sort((a, b) => b.task.localeCompare(a.task));
    }

    if (sortBy === "oldest") {
      return [...filtered].sort((a, b) => a.createdAt - b.createdAt);
    }

    return [...filtered].sort((a, b) => b.createdAt - a.createdAt);
  }, [mainTask, query, filter, sortBy]);

  const dayLabel = isMounted
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }).format(now)
    : "";
  const timeLabel = isMounted
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }).format(now)
    : "";

  const isDark = theme === "dark";
  const isRetro = uiMode === "retro";
  const isFuturistic = uiMode === "futuristic";
  const isNeon = uiMode === "neon";
  const shellThemeClass = isRetro
    ? "theme-retro retro-mode"
    : isFuturistic
      ? "theme-futuristic futuristic-mode"
      : isNeon
        ? "theme-neon neon-mode"
      : isDark
        ? "theme-dark"
        : "theme-light";
  const title = isRetro
    ? "CRT Task Terminal"
    : isFuturistic
      ? "Neural Task Grid"
      : isNeon
        ? "Neon Circuit Board"
        : "My List-of-Things";
  const subtitle = isRetro
    ? "Retro Command Deck"
    : isFuturistic
      ? "Quantum Planner"
      : isNeon
        ? "Pulse Workflow Matrix"
        : "Daily Planner";
  const quickTip = isRetro
    ? "Tip: Ctrl/Cmd + Enter to queue task"
    : isFuturistic
      ? "Tip: Ctrl/Cmd + Enter to deploy task"
      : isNeon
        ? "Tip: Ctrl/Cmd + Enter to spark task"
      : "Tip: press Ctrl/Cmd + Enter to add quickly";

  return (
    <main className={`theme-shell min-h-screen bg-grid p-3 sm:p-4 md:p-6 xl:p-8 2xl:p-10 ${shellThemeClass}`}>
      <section
        className={`mode-panel mode-${uiMode} relative mx-auto w-full max-w-[96rem] overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-bg)] p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-5 md:p-7 xl:p-8 2xl:p-10`}
      >
        <div className="mode-zone mode-topbar mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full min-w-0 sm:w-52 sm:max-w-[13rem]">
            <label htmlFor="ui-mode" className="sr-only">
              Select interface mode
            </label>
            <select
              id="ui-mode"
              value={uiMode}
              onChange={(e) => handleModeChange(e.target.value)}
              className={`w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-main)] outline-none transition focus:border-[var(--accent-a)] focus:ring-2 focus:ring-[var(--focus-ring)] ${
                isRetro ? "retro-toggle" : isFuturistic ? "futuristic-toggle" : isNeon ? "neon-toggle" : ""
              }`}
              aria-label="Select interface mode"
            >
              <option value="normal">Normal</option>
              <option value="retro">Retro</option>
              <option value="futuristic">Futuristic</option>
              <option value="neon">Neon</option>
            </select>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-2 text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-[var(--text-main)] transition hover:scale-[1.02] sm:w-auto sm:max-w-full sm:shrink-0 sm:text-xs"
            aria-label={`Switch to ${isDark ? "white" : "black"} mode`}
          >
            {isRetro
              ? "Signal Filter"
              : isFuturistic
                ? "Phase Shift"
                : isNeon
                  ? "Glow Switch"
                  : isDark
                    ? "White Mode"
                    : "Black Mode"}
          </button>
        </div>

        <div className="mode-zone mode-hero mb-6 flex flex-col gap-4 md:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">{subtitle}</p>
            <h1 className="break-words font-[family-name:var(--font-geist-mono)] text-3xl font-black leading-tight text-[var(--text-main)] sm:text-4xl md:text-5xl 2xl:text-6xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-soft)]" suppressHydrationWarning>
              {isMounted
                ? `${dayLabel} | ${timeLabel}${
                    isRetro
                      ? " | SYSTEM ONLINE"
                      : isFuturistic
                        ? " | NEXUS STABLE"
                        : isNeon
                          ? " | PULSE LIVE"
                          : ""
                  }`
                : "Loading date and time..."}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 shadow-sm lg:w-auto">
            <p className="text-xs uppercase tracking-wider text-[var(--text-soft)]">Progress</p>
            <p className="text-xl font-bold text-[var(--text-main)] sm:text-2xl">
              {taskStats.completion}% done
            </p>
            <div className="mt-2 h-2 w-full max-w-80 rounded bg-[var(--track-bg)] lg:w-56 2xl:w-72">
              <div
                className="h-2 rounded bg-gradient-to-r from-[var(--accent-a)] to-[var(--accent-b)] transition-all duration-500"
                style={{ width: `${taskStats.completion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mode-zone mode-controls mb-5 space-y-5">
          <form
            onSubmit={submitHandler}
            onKeyDown={handleComposerKeyDown}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12"
          >
            <input
              id="task"
              type="text"
              placeholder={
                isRetro
                  ? "Transmit objective..."
                  : isFuturistic
                    ? "Inject mission parameter..."
                    : isNeon
                      ? "Ignite a task signal..."
                    : "What needs to be done?"
              }
              className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--accent-a)] focus:ring-2 focus:ring-[var(--focus-ring)] sm:col-span-1 md:text-lg xl:col-span-4"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <input
              id="desc"
              type="text"
              placeholder={
                isRetro
                  ? "Optional signal note"
                  : isFuturistic
                    ? "Attach metadata"
                    : isNeon
                      ? "Attach glow note"
                      : "Add a quick note"
              }
              className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-base text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--accent-a)] focus:ring-2 focus:ring-[var(--focus-ring)] sm:col-span-1 md:text-lg xl:col-span-5"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              className="rounded-xl bg-[var(--btn-primary-bg)] px-4 py-3 text-base font-bold leading-tight text-[var(--btn-primary-text)] transition hover:scale-[1.01] hover:brightness-110 sm:col-span-2 md:text-lg xl:col-span-3"
              type="submit"
            >
              {isRetro ? "Queue Task" : isFuturistic ? "Deploy Task" : isNeon ? "Spark Task" : "Add Task"}
            </button>
          </form>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <input
              type="text"
              placeholder={
                isRetro
                  ? "Scan queued tasks..."
                  : isFuturistic
                    ? "Query mission logs..."
                    : isNeon
                      ? "Scan glow board..."
                      : "Search tasks"
              }
              className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--text-main)] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--accent-a)] focus:ring-2 focus:ring-[var(--focus-ring)] lg:col-span-5"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2 lg:col-span-4">
              {["all", "active", "done"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFilter(type);
                    triggerHaptic(10);
                  }}
                  className={`min-w-0 rounded-xl px-2 py-2 text-xs font-semibold capitalize leading-tight transition sm:px-3 sm:text-sm ${
                    filter === type
                      ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
                      : "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-soft)] hover:brightness-95"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:col-span-3">
              <button
                className="w-full rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold leading-tight text-[var(--danger-text)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={clearCompletedHandler}
                type="button"
                disabled={taskStats.completed === 0}
              >
                {isRetro ? "Flush Completed" : isFuturistic ? "Purge Completed" : isNeon ? "Fade Completed" : "Clear Completed"}
              </button>
              <button
                className="w-full rounded-xl border border-[var(--danger-border)] bg-[var(--danger-strong)] px-3 py-2 text-sm font-semibold leading-tight text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={deleteAllHandler}
                type="button"
                disabled={taskStats.total === 0}
              >
                {isRetro ? "Wipe Board" : isFuturistic ? "Reset Grid" : isNeon ? "Clear Grid" : "Delete All"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="px-1 text-xs uppercase tracking-wider text-[var(--text-soft)]">{quickTip}</p>
            </div>
            <div className="lg:col-span-4">
              <select
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] outline-none transition focus:border-[var(--accent-a)] focus:ring-2 focus:ring-[var(--focus-ring)]"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  triggerHaptic(10);
                }}
              >
                <option value="newest">
                  {isRetro
                    ? "Sort: Latest signal"
                    : isFuturistic
                      ? "Sort: Latest pulse"
                      : isNeon
                        ? "Sort: Fresh glow"
                        : "Sort: Newest first"}
                </option>
                <option value="oldest">
                  {isRetro
                    ? "Sort: Earliest signal"
                    : isFuturistic
                      ? "Sort: Earliest pulse"
                      : isNeon
                        ? "Sort: Old glow"
                        : "Sort: Oldest first"}
                </option>
                <option value="a-z">
                  {isRetro ? "Sort: Alpha up" : isFuturistic ? "Sort: Lexi asc" : isNeon ? "Sort: A -> Z" : "Sort: A to Z"}
                </option>
                <option value="z-a">
                  {isRetro
                    ? "Sort: Alpha down"
                    : isFuturistic
                      ? "Sort: Lexi desc"
                      : isNeon
                        ? "Sort: Z -> A"
                        : "Sort: Z to A"}
                </option>
              </select>
            </div>
            <div className="hidden lg:col-span-3 lg:block" />
          </div>
        </div>

        <div className="mode-zone mode-stats mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-[var(--btn-primary-bg)] px-3 py-1 font-semibold text-[var(--btn-primary-text)]">
            Total: {taskStats.total}
          </span>
          <span className="rounded-full bg-[var(--chip-active-bg)] px-3 py-1 font-semibold text-[var(--chip-active-text)]">
            Active: {taskStats.active}
          </span>
          <span className="rounded-full bg-[var(--chip-done-bg)] px-3 py-1 font-semibold text-[var(--chip-done-text)]">
            Completed: {taskStats.completed}
          </span>
        </div>

        <section className="mode-zone mode-list min-h-64 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3 shadow-inner sm:p-4 lg:p-5">
          {visibleTasks.length === 0 ? (
            <div className="py-12 text-center">
              <h2 className="text-lg font-semibold text-[var(--text-soft)]">No tasks for this view</h2>
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    triggerHaptic(10);
                  }}
                  className="mt-3 rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:brightness-95"
                >
                  {isRetro ? "Reset Scan" : isFuturistic ? "Clear Query" : isNeon ? "Reset Beam" : "Clear search"}
                </button>
              ) : null}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {visibleTasks.map((t, index) => (
                <li
                  key={t.id}
                  className={`task-pop rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] p-4 shadow-sm transition hover:shadow-md ${
                    isRetro ? "retro-item" : isFuturistic ? "futuristic-item" : isNeon ? "neon-item" : ""
                  }`}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <button
                        onClick={() => toggleDoneHandler(t.id)}
                        type="button"
                        className={`mt-1 h-5 w-5 rounded-full border-2 transition ${
                          t.done
                            ? "border-[var(--success-dot)] bg-[var(--success-dot)]"
                            : "border-[var(--text-soft)] bg-[var(--input-bg)] hover:border-[var(--accent-a)]"
                        }`}
                        aria-label={`Mark ${t.task} as ${t.done ? "active" : "done"}`}
                      />
                      <div className="min-w-0">
                        <h3
                          className={`break-words text-lg font-semibold sm:text-xl ${
                            t.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text-main)]"
                          }`}
                        >
                          {t.task}
                        </h3>
                        {t.desc ? (
                          <p
                            className={`break-words text-sm sm:text-base ${
                              t.done ? "text-[var(--text-muted)]" : "text-[var(--text-soft)]"
                            }`}
                          >
                            {t.desc}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <button
                      className="w-full rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-2 font-bold text-[var(--danger-text)] transition hover:brightness-95 sm:w-auto"
                      onClick={() => deleteHandler(t.id)}
                      type="button"
                    >
                      {isRetro ? "Drop" : isFuturistic ? "Eject" : isNeon ? "Zap" : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
