import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { Input, Button } from "../common";
import { axiosInstance } from "../../config/axios";

interface CurrentUserResponse {
  user?: {
    name?: string;
    email?: string;
    lastName?: string;
    last_name?: string;
    location?: string;
    avatar?: string;
  };
  name?: string;
  email?: string;
  lastName?: string;
  last_name?: string;
  location?: string;
  avatar?: string;
}

export interface UserProfileFormData {
  name: string;
  email: string;
  lastName: string;
  location: string;
  avatar?: FileList;
}

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  lastName: yup.string().required("Last name is required"),
  location: yup.string().required("Location is required"),
});

const defaultValues: Partial<UserProfileFormData> = {
  name: "",
  email: "",
  lastName: "",
  location: "",
};

export function UserProfileForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(schema) as Resolver<UserProfileFormData>,
    defaultValues,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchCurrentUser() {
      try {
        const { data } = await axiosInstance.get<CurrentUserResponse>(
          "/users/current-user",
        );
        const user = data.user ?? data;
        const u = user as {
          name?: string;
          email?: string;
          lastName?: string;
          last_name?: string;
          location?: string;
          avatar?: string;
        };
        if (!cancelled && user) {
          setAvatarUrl(u.avatar ?? null);
          reset({
            name: u.name ?? "",
            email: u.email ?? "",
            lastName: u.lastName ?? u.last_name ?? "",
            location: u.location ?? "",
          });
        }
      } catch {
        if (!cancelled) setSubmitError("Failed to load profile");
      } finally {
        if (!cancelled) setIsLoadingUser(false);
      }
    }
    fetchCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const photoSrc = avatarUrl;

  const onSubmit = async (data: UserProfileFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("lastName", data.lastName);
    formData.append("location", data.location);
    const file = data.avatar?.length ? data.avatar[0] : undefined;
    if (file) {
      formData.append("avatar", file);
    }

    try {
      await axiosInstance.patch("/users/update-user", formData);
      const { data } = await axiosInstance.get<CurrentUserResponse>(
        "/users/current-user",
      );
      const user = data.user ?? data;
      const u = user as { avatar?: string };
      setAvatarUrl(u?.avatar ?? null);
      toast.success("Profile updated successfully.");
    } catch (err) {
      const message =
        (err as AxiosError<{ msg?: string }>).response?.data?.msg ??
        `Request failed: ${(err as AxiosError<{ status?: number }>).response?.status}`;
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return <p className="max-w-md text-gray-600">Loading profile...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md mt-5">
      <div className="flex justify-center mb-6">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt="Profile"
            className="h-28 w-28 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
            No photo
          </div>
        )}
      </div>
      <Input
        id="profile-name"
        label="Name"
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="profile-email"
        type="email"
        label="Email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input
        id="profile-lastName"
        label="Last Name"
        error={errors.lastName?.message}
        {...register("lastName")}
      />
      <Input
        id="profile-location"
        label="Location"
        error={errors.location?.message}
        {...register("location")}
      />
      <div className="w-full">
        <Input
          id="profile-avatar"
          type="file"
          accept="image/*"
          label="Avatar (optional)"
          error={errors.avatar?.message}
          {...register("avatar")}
        />
        <span className="mt-1 block text-sm text-gray-500">
          Leave empty to keep current avatar
        </span>
      </div>
      {submitError && (
        <span className="block text-sm text-red-600">{submitError}</span>
      )}
      <Button type="submit" disabled={isSubmitting} fullWidth>
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
