import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../config/axios";
import type { Job } from "../../types/job";

type JobsResponse = Job[] | { jobs: Job[] };

export function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      try {
        const { data } = await axiosInstance.get<JobsResponse>("/jobs");
        const list = Array.isArray(data) ? data : (data.jobs ?? []);
        if (!cancelled) setJobs(list);
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    );
  }
  if (error) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Jobs</h1>
        <Link
          to="/jobs/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          Create Job
        </Link>
      </div>

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
            >
              <div className="shrink-0 w-14 h-14 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                {(() => {
                  const logoUrl = job.companyLogo ?? (job as Record<string, string | undefined>).company_logo;
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
                  Status: <span className="capitalize">{job.jobStatus ?? "—"}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
