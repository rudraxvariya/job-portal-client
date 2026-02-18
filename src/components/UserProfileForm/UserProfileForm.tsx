import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
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
      const { data } = await axiosInstance.get<CurrentUserResponse>("/users/current-user");
      const user = data.user ?? data;
      const u = user as { avatar?: string };
      setAvatarUrl(u?.avatar ?? null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const message = (err.response.data as { message?: string }).message;
        setSubmitError(message ?? `Request failed: ${err.response.status}`);
      } else {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return <p className="user-profile-form">Loading profile...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="user-profile-form">
      <div className="profile-photo-wrap">
        {photoSrc ? (
          <img src={photoSrc} alt="Profile" className="profile-photo" />
        ) : (
          <div className="profile-photo profile-photo-placeholder">No photo</div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input id="name" {...register("name")} />
        {errors.name && (
          <span className="form-error">{errors.name.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && (
          <span className="form-error">{errors.email.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input id="lastName" {...register("lastName")} />
        {errors.lastName && (
          <span className="form-error">{errors.lastName.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input id="location" {...register("location")} />
        {errors.location && (
          <span className="form-error">{errors.location.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="avatar">Avatar</label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          {...register("avatar")}
        />
        <span className="form-hint">Leave empty to keep current avatar</span>
        {errors.avatar && (
          <span className="form-error">{errors.avatar.message}</span>
        )}
      </div>

      {submitError && (
        <span
          className="form-error"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          {submitError}
        </span>
      )}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
