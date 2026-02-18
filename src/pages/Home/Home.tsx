import { useEffect, useState } from "react";
import { axiosInstance } from "../../config/axios";

export interface Job {
  _id: string;
  company: string;
  jobLocation: string;
  jobStatus: string;
  jobType: string;
  position: string;
  createdAt: string;
  [key: string]: unknown;
}

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

  if (loading) return <div className="home-page">Loading jobs...</div>;
  if (error) return <div className="home-page home-page-error">{error}</div>;

  return (
    <div className="home-page">
      <h1>Jobs</h1>
      <div className="jobs-list">
        {jobs.length === 0 ? (
          <p className="jobs-empty">No jobs found.</p>
        ) : (
          jobs.map((job) => (
            <article key={job._id} className="job-card">
              <h4 className="">{job.position ?? "Untitled"}</h4>
              {job.company && <p className="">{job.company}</p>}
              {job.jobLocation && <p className="">{job.jobLocation}</p>}
              {job.jobType && <p className="">{job.jobType}</p>}
              {job.jobStatus && <p className="">{job.jobStatus}</p>}
              {job.createdAt && <p className="">{job.createdAt}</p>}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
