import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { axiosInstance } from "../../config/axios";
import { Button, Input } from "../../components/common";
import type { JobStatus, JobType } from "../../types/job";
import { JOB_STATUSES, JOB_TYPES } from "../../types/job";
import type { AxiosError } from "axios";

export interface CreateJobFormData {
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
  jobStatus: yup.string().oneOf(JOB_STATUSES as unknown as string[]).required(),
  jobType: yup.string().oneOf(JOB_TYPES as unknown as string[]).required(),
  jobLocation: yup.string().required("Location is required"),
  companyLogo: yup.mixed().optional(),
});

const defaultValues: CreateJobFormData = {
  company: "",
  position: "",
  jobStatus: "pending",
  jobType: "full-time",
  jobLocation: "my city",
};

export function CreateJob() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: yupResolver(schema) as Resolver<CreateJobFormData>,
    defaultValues,
  });

  const onSubmit = async (data: CreateJobFormData) => {
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("company", data.company);
      body.append("position", data.position);
      body.append("jobStatus", data.jobStatus);
      body.append("jobType", data.jobType);
      body.append("jobLocation", data.jobLocation);
      const file = data.companyLogo?.length ? data.companyLogo[0] : undefined;
      if (file) body.append("companyLogo", file);
      await axiosInstance.post("/jobs", body);
      toast.success("Job created.");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        "Failed to create job.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        ← Back to jobs
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create Job</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="create-job-company"
            label="Company"
            error={errors.company?.message}
            placeholder="e.g. Apple"
            {...register("company")}
          />
          <div className="w-full">
            <Input
              id="create-job-companyLogo"
              type="file"
              accept="image/*"
              label="Company logo"
              error={errors.companyLogo?.message as string | undefined}
              {...register("companyLogo")}
            />
          </div>
          <Input
            id="create-job-position"
            label="Position"
            error={errors.position?.message}
            placeholder="e.g. Backend Engineer"
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
            id="create-job-jobLocation"
            label="Location"
            error={errors.jobLocation?.message}
            placeholder="e.g. my city"
            {...register("jobLocation")}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
            <Link to="/">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
