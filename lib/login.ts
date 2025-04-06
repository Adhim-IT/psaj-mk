import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import { LoginSchema } from './zod';

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
    // Add error handling for the signIn call
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Avoid automatic redirect to handle role
      });

      if (result?.error) {
        return {
          status: 'error',
          message: 'Email atau password salah',
        };
      }

      // Get session or user after sign in to get role_id
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`);
        }

        const session = await response.json();

        const allowedRoleIds = ['cm7wzebij0000fgngw776djak', 'cm7wzebj10002fgngkkc6rkdk', 'cm7wzebj60003fgngf5yl85ka'];

        let redirectUrl = '/';
        if (allowedRoleIds.includes(session?.user?.role_id ?? '')) {
          redirectUrl = '/admin/dashboard';
        }

        return {
          status: 'success',
          message: 'Login berhasil! Anda akan dialihkan.',
          redirectUrl: redirectUrl,
        };
      } catch (sessionError) {
        console.error('Error fetching session:', sessionError);
        // If we can't get the session, redirect to home as fallback
        return {
          status: 'success',
          message: 'Login berhasil! Anda akan dialihkan.',
          redirectUrl: '/',
        };
      }
    } catch (signInError) {
      console.error('Sign in error:', signInError);
      return {
        status: 'error',
        message: 'Terjadi kesalahan saat login. Silakan coba lagi.',
      };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            status: 'error',
            message: 'Email atau password salah',
          };
        default:
          return {
            status: 'error',
            message: 'Terjadi kesalahan. Silakan coba lagi.',
          };
      }
    }
    console.error('Authentication error:', error);
    return {
      status: 'error',
      message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
    };
  }
};
