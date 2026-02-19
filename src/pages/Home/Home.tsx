import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { axiosInstance } from "../../config/axios";
import type { Job } from "../../types/job";
import { JOB_STATUSES, JOB_TYPES } from "../../types/job";

const DEFAULT_LIMIT = 10;
const SORT_OPTIONS = [
  { value: "a-z", label: "Name (A-Z)" },
  { value: "z-a", label: "Name (Z-A)" },
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
] as const;

type JobsApiResponse = {
  jobs: Job[];
  numOfPages: number;
  totalJobs: number;
};

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));
  const search = searchParams.get("search") ?? "";
  const jobStatus = searchParams.get("jobStatus") ?? "";
  const jobType = searchParams.get("jobType") ?? "";
  const sort = searchParams.get("sort") ?? "a-z";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [numOfPages, setNumOfPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          const s = String(value).trim();
          if (s === "" || (key === "page" && s === "1")) next.delete(key);
          else next.set(key, s);
        });
        if (next.get("limit") === String(DEFAULT_LIMIT)) next.delete("limit");
        return next;
      });
    },
    [setSearchParams],
  );

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (search) params.set("search", search);
        if (jobStatus) params.set("jobStatus", jobStatus);
        if (jobType) params.set("jobType", jobType);
        if (sort) params.set("sort", sort);

        const { data } = await axiosInstance.get<JobsApiResponse | { jobs: Job[] }>(
          `/jobs?${params.toString()}`,
        );

        if (cancelled) return;

        const list = Array.isArray(data) ? data : (data as JobsApiResponse).jobs ?? [];
        setJobs(list);

        if (data && !Array.isArray(data) && "numOfPages" in data) {
          setNumOfPages((data as JobsApiResponse).numOfPages ?? 0);
          setTotalJobs((data as JobsApiResponse).totalJobs ?? list.length);
        } else {
          setNumOfPages(1);
          setTotalJobs(list.length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err && typeof err === "object" && "message" in err
              ? String((err as Error).message)
              : "Failed to load jobs",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, [page, limit, search, jobStatus, jobType, sort]);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= numOfPages) setParams({ page: p });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }
  if (error && jobs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        <Link
          to="/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          Create Job
        </Link>
      </div>

      {/* Search, filters, sort */}
      <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="home-search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              id="home-search"
              type="search"
              placeholder="Position, company..."
              value={search}
              onChange={(e) => setParams({ search: e.target.value, page: 1 })}
              className="mt-0 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="home-jobStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="home-jobStatus"
              value={jobStatus}
              onChange={(e) => setParams({ jobStatus: e.target.value, page: 1 })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="home-jobType" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="home-jobType"
              value={jobType}
              onChange={(e) => setParams({ jobType: e.target.value, page: 1 })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="home-sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort
            </label>
            <select
              id="home-sort"
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value, page: 1 })}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500 mb-4">No jobs found.</p>
          <Link
            to="/jobs/new"
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first job
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Showing {jobs.length} of {totalJobs} job{totalJobs !== 1 ? "s" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
              >
                <div className="shrink-0 w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const logoUrl =
                      job.companyLogo ??
                      (job as Record<string, string | undefined>).company_logo;
                    return logoUrl ? (
                      <img
                        src={logoUrl}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-gray-400">
                        {job.company?.charAt(0) ?? "?"}
                      </span>
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 truncate">
                      {job.position ?? "Untitled"}
                    </h2>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {job.jobType ?? "—"}
                    </span>
                  </div>
                  {job.company && (
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {job.company}
                    </p>
                  )}
                  {job.jobLocation && (
                    <p className="mt-1 text-sm text-gray-500">{job.jobLocation}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Status:{" "}
                    <span className="capitalize">{job.jobStatus ?? "—"}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {numOfPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Previous
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: numOfPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium ${
                        p === page
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= numOfPages}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
