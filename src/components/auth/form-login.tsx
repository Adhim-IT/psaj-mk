'use client';

import { signInCredentials } from '@/lib/login';
import { useActionState } from 'react';
import { LoginButton } from './button';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Swal from 'sweetalert2';

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(signInCredentials, null);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // This helps prevent hydration errors by ensuring the component
  // only fully renders on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle success and error messages with SweetAlert
  useEffect(() => {
    if (state?.status === 'success') {
      Swal.fire({
        title: 'Berhasil!',
        text: state.message,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3182CE',
      }).then(() => {
        // Redirect after SweetAlert is closed
        if (state.redirectUrl) {
          window.location.href = state.redirectUrl;
        }
      });
    }
  }, [state]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (!isClient) {
    return (
      <div className="w-full mx-auto min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Masuk ke Akun</h1>
        <p className="text-sm sm:text-base text-gray-600">Lanjutkan perjalanan belajar IT Anda dengan TeenCode</p>
      </div>

      <form action={formAction} className="space-y-3 sm:space-y-4">
        {/* Display general error message when both credentials are wrong */}
        {state?.message && state.status === 'error' && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 py-2">
            <AlertDescription className="text-sm font-medium">{state.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <svg className="w-4 h-4 text-[#3182CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <label htmlFor="email" className="text-sm sm:text-base text-gray-700">
              Email
            </label>
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Masukkan alamat email Anda"
            className="w-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border-gray-200 focus:border-[#3182CE] focus:ring-[#3182CE] pr-10 transition-all duration-200"
            autoComplete="email"
            suppressHydrationWarning
          />
          {state?.error && typeof state.error !== 'string' && state.error.fieldErrors?.email && <p className="text-xs sm:text-sm font-medium text-red-500 mt-1">{state.error.fieldErrors.email[0]}</p>}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <svg className="w-4 h-4 text-[#3182CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <label htmlFor="password" className="text-sm sm:text-base text-gray-700">
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password Anda"
              className="w-full h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base rounded-lg sm:rounded-xl border-gray-200 focus:border-[#3182CE] focus:ring-[#3182CE] pr-10 transition-all duration-200"
              autoComplete="current-password"
              suppressHydrationWarning
            />
            <button type="button" className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3182CE] transition-colors" onClick={togglePasswordVisibility} tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />}
            </button>
          </div>
          {state?.error && typeof state.error !== 'string' && state.error.fieldErrors?.password && <p className="text-xs sm:text-sm font-medium text-red-500 mt-1">{state.error.fieldErrors.password[0]}</p>}
        </div>

        <LoginButton isPending={isPending} />
      </form>

      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-[#3182CE] font-medium hover:underline transition-colors">
            Daftar
          </Link>
        </p>
      </div>

      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm text-gray-500">Didukung oleh</span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7  rounded-full flex items-center justify-center">
              <img src="/images/logo/logo-teencode.png" alt="TeenCode Learning Platform" width={40} height={40} className="rounded-lg shadow-lg max-w-full h-auto object-cover opacity-90" />
            </div>

            <span className="text-sm sm:text-base font-medium">TeenCode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
