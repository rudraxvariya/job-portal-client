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

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  lastName: string;
  location: string;
}

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long"),
  lastName: yup.string().optional(),
  location: yup.string().required("Location is required"),
});

const defaultValues: SignupFormData = {
  name: "",
  email: "",
  password: "",
  lastName: "",
  location: "",
};

export function SignupForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema) as Resolver<SignupFormData>,
    defaultValues,
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        lastName: data.lastName || undefined,
        location: data.location,
      });
      toast.success("Account created successfully.");
      try {
        const loginRes = await axiosInstance.post<{
          token?: string;
          accessToken?: string;
          access_token?: string;
        }>("/auth/login", {
          email: data.email,
          password: data.password,
        });
        const token =
          loginRes.data?.token ??
          loginRes.data?.accessToken ??
          loginRes.data?.access_token;
        if (token) setAuthToken(token);
        setLoggedInThisSession();
        navigate("/", { replace: true });
      } catch {
        toast.info("Please sign in with your new account.");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        `Request failed: ${(err as AxiosError).response?.status}`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        id="signup-name"
        label="Name"
        placeholder="John"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="signup-email"
        type="email"
        label="Email"
        placeholder="john@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="signup-password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Input
        id="signup-lastName"
        label="Last name (optional)"
        placeholder="Doe"
        autoComplete="family-name"
        error={errors.lastName?.message}
        {...register("lastName")}
      />
      <Input
        id="signup-location"
        label="Location"
        placeholder="New York"
        autoComplete="address-level2"
        error={errors.location?.message}
        {...register("location")}
      />
      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Signing up..." : "Sign up"}
      </Button>
    </form>
  );
}
