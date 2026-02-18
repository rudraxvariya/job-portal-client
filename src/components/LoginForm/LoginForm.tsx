import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { axiosInstance } from "../../config/axios";

export interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const defaultValues: LoginFormData = {
  email: "",
  password: "",
};

export function LoginForm() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema) as Resolver<LoginFormData>,
    defaultValues,
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      navigate("/update-profile", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const message = (err.response.data as { message?: string }).message;
        setSubmitError(message ?? `Request failed: ${err.response.status}`);
      } else {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} autoComplete="email" />
        {errors.email && (
          <span className="form-error">{errors.email.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password")}
          autoComplete="current-password"
        />
        {errors.password && (
          <span className="form-error">{errors.password.message}</span>
        )}
      </div>

      {submitError && (
        <span className="form-error" style={{ display: "block", marginBottom: "0.5rem" }}>
          {submitError}
        </span>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
