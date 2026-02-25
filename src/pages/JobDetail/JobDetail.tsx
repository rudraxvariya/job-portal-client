import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { axiosInstance } from "../../config/axios";
import { Button, Input } from "../../components/common";
import type { Job, JobPayload } from "../../types/job";
import type { JobStatus, JobType } from "../../types/job";
import { JOB_STATUSES, JOB_TYPES } from "../../types/job";
import type { AxiosError } from "axios";

export interface EditJobFormData {
  company: string;
  position: string;
  jobStatus: JobStatus;
  jobType: JobType;
  jobLocation: string;
  companyLogo?: FileList;
}

const schema = yup.object({
  company: yup.string().required("Company is required"),
  position: yup.string().required("Position is required"),
  jobStatus: yup
    .string()
    .oneOf(JOB_STATUSES as unknown as string[])
    .required(),
  jobType: yup
    .string()
    .oneOf(JOB_TYPES as unknown as string[])
    .required(),
  jobLocation: yup.string().required("Location is required"),
  companyLogo: yup.mixed().optional(),
});

const defaultValues: EditJobFormData = {
  company: "",
  position: "",
  jobStatus: "pending",
  jobType: "full-time",
  jobLocation: "my city",
};

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditJobFormData>({
    resolver: yupResolver(schema) as Resolver<EditJobFormData>,
    defaultValues,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchJob() {
      try {
        const { data } = await axiosInstance.get<{ job?: Job } | Job>(
          `/jobs/${id}`,
        );
        const raw =
          data && "job" in data && data.job ? data.job : (data as Job);
        const r = raw as Record<string, unknown>;
        const jobData: Job | null = raw
          ? {
              ...raw,
              _id: (r._id as string) ?? id ?? "",
              company: (r.company as string) ?? "",
              position: (r.position as string) ?? "",
              jobStatus:
                (r.jobStatus as string) ??
                (r.job_status as string) ??
                "pending",
              jobType:
                (r.jobType as string) ?? (r.job_type as string) ?? "full-time",
              jobLocation:
                (r.jobLocation as string) ??
                (r.job_location as string) ??
                "my city",
              companyLogo:
                (r.companyLogo as string) ?? (r.company_logo as string) ?? "",
            }
          : null;
        if (!cancelled && jobData) {
          setJob(jobData);
          reset({
            company: jobData.company ?? "",
            position: jobData.position ?? "",
            jobStatus: (jobData.jobStatus as JobStatus) ?? "pending",
            jobType: (jobData.jobType as JobType) ?? "full-time",
            jobLocation: jobData.jobLocation ?? "my city",
          });
        } else if (!cancelled) {
          setError("Failed to load job");
        }
      } catch (err) {
        if (!cancelled) setError("Failed to load job");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchJob();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  const onSubmit = async (data: EditJobFormData) => {
    if (!id) return;
    setSaving(true);
    try {
      const file = data.companyLogo?.length ? data.companyLogo[0] : undefined;
      if (file) {
        const body = new FormData();
        body.append("company", data.company);
        body.append("position", data.position);
        body.append("jobStatus", data.jobStatus);
        body.append("jobType", data.jobType);
        body.append("jobLocation", data.jobLocation);
        body.append("companyLogo", file);
        await axiosInstance.patch(`/jobs/${id}`, body);
        const { data: getData } = await axiosInstance.get<{ job?: Job } | Job>(
          `/jobs/${id}`,
        );
        const raw =
          getData && "job" in getData && getData.job
            ? getData.job
            : (getData as Job);
        if (raw) {
          const r = raw as Record<string, unknown>;
          const jobData: Job = {
            ...raw,
            _id: (r._id as string) ?? id ?? "",
            company: (r.company as string) ?? "",
            position: (r.position as string) ?? "",
            jobStatus:
              (r.jobStatus as string) ??
              (r.job_status as string) ??
              "pending",
            jobType:
              (r.jobType as string) ?? (r.job_type as string) ?? "full-time",
            jobLocation:
              (r.jobLocation as string) ??
              (r.job_location as string) ??
              "my city",
            companyLogo:
              (r.companyLogo as string) ?? (r.company_logo as string) ?? "",
          };
          setJob(jobData);
          reset({
            company: jobData.company ?? "",
            position: jobData.position ?? "",
            jobStatus: (jobData.jobStatus as JobStatus) ?? "pending",
            jobType: (jobData.jobType as JobType) ?? "full-time",
            jobLocation: jobData.jobLocation ?? "my city",
          });
        }
      } else {
        const payload: JobPayload = {
          company: data.company,
          position: data.position,
          jobStatus: data.jobStatus,
          jobType: data.jobType,
          jobLocation: data.jobLocation,
        };
        await axiosInstance.patch(`/jobs/${id}`, payload);
        setJob((prev) => (prev ? { ...prev, ...payload } : null));
      }
      setEditing(false);
      toast.success("Job updated.");
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        "Failed to update job.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (job) {
      reset({
        company: job.company ?? "",
        position: job.position ?? "",
        jobStatus: (job.jobStatus as JobStatus) ?? "pending",
        jobType: (job.jobType as JobType) ?? "full-time",
        jobLocation: job.jobLocation ?? "my city",
      });
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this job?"))
      return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/jobs/${id}`);
      toast.success("Job deleted.");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        "Failed to delete job.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto w-full py-6 sm:py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto w-full py-6 sm:py-8">
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm sm:text-base">
          {error ?? "Job not found"}
        </div>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full py-4 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6"
      >
        ← Back to jobs
      </Link>

      {editing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 space-y-4"
        >
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Edit Job</h1>
          <Input
            id="edit-job-company"
            label="Company"
            error={errors.company?.message}
            {...register("company")}
          />
          <div className="w-full">
            {job.companyLogo && (
              <p className="mb-2 text-sm text-gray-500">
                Current logo:{" "}
                <img
                  src={job.companyLogo}
                  alt=""
                  className="h-8 inline-block align-middle rounded"
                />
              </p>
            )}
            <Input
              id="edit-job-companyLogo"
              type="file"
              accept="image/*"
              label="Company logo"
              optionalLabel="(optional)"
              error={errors.companyLogo?.message as string | undefined}
              {...register("companyLogo")}
            />
          </div>
          <Input
            id="edit-job-position"
            label="Position"
            error={errors.position?.message}
            {...register("position")}
          />
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              {...register("jobStatus")}
              aria-invalid={errors.jobStatus ? "true" : undefined}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.jobStatus && (
              <span className="mt-1 block text-sm text-red-600">
                {errors.jobStatus.message}
              </span>
            )}
          </div>
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              {...register("jobType")}
              aria-invalid={errors.jobType ? "true" : undefined}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.jobType && (
              <span className="mt-1 block text-sm text-red-600">
                {errors.jobType.message}
              </span>
            )}
          </div>
          <Input
            id="edit-job-jobLocation"
            label="Location"
            error={errors.jobLocation?.message}
            {...register("jobLocation")}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto min-h-[44px]">
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelEdit}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden self-start sm:self-auto">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company ?? "Company"} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-400">
                  {job.company?.charAt(0) ?? "?"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {job.jobType ?? "—"}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 capitalize">
                  {job.jobStatus ?? "—"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">
                {job.position ?? "Untitled"}
              </h1>
              {job.company && (
                <p className="mt-1 text-lg font-medium text-gray-600">
                  {job.company}
                </p>
              )}
              {job.jobLocation && (
                <p className="mt-1 text-sm text-gray-500">{job.jobLocation}</p>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setEditing(true)} className="w-full sm:w-auto min-h-[44px]">Edit</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting} className="w-full sm:w-auto min-h-[44px]">
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
