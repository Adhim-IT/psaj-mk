import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";
import { LoginSchema } from "./zod";

export const signInCredentials = async (prevState: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData);
  const validateFields = LoginSchema.safeParse(rawFormData);

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten(),
    };
  }

  const { email, password } = validateFields.data;
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Hindari redirect otomatis untuk menangani role
    });

    if (result?.error) {
      return { message: "Email atau password salah" };
    }

    // Ambil sesi atau user setelah sign in untuk mendapatkan role_id
    const response = await fetch("/api/auth/session");
    const session = await response.json();

    if (session?.user?.role_id === "cm7wzebij0000fgngw776djak") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/";
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau password salah" };
        default:
          return { message: "Terjadi kesalahan. Silakan coba lagi." };
      }
    }
    throw error;
  }
};
