import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Input, Button } from "../common";
import { setAuthToken, setLoggedInThisSession } from "../../lib/auth";
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

const DEMO_CREDENTIALS: LoginFormData = {
  email: "test@gmail.com",
  password: "test1234",
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

  const doLogin = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post<{ token?: string; accessToken?: string; access_token?: string }>(
        "/auth/login",
        { email: data.email, password: data.password },
      );
      const token =
        res.data?.token ?? res.data?.accessToken ?? res.data?.access_token;
      if (token) {
        setAuthToken(token);
      }
      setLoggedInThisSession();
      toast.success("Signed in successfully.");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        `Request failed: ${(err as AxiosError<{ status?: number }>).response?.status}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: LoginFormData) => doLogin(data);

  const onDemoLogin = () => doLogin(DEMO_CREDENTIALS);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        id="login-email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="login-password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {submitError && (
        <span className="block text-sm text-red-600">{submitError}</span>
      )}
      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={isSubmitting}
        fullWidth
        onClick={onDemoLogin}
      >
        Demo user login
      </Button>
    </form>
  );
}
