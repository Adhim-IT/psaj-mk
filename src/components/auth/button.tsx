"use client";

import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export const LoginButton = ({ isPending }: { isPending: boolean }) => {
  return (
    <Button
      type="submit"
      className="w-full h-10 sm:h-12 bg-[#3182CE] hover:bg-[#2c5282] text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg mt-2"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          Sedang Masuk...
        </>
      ) : (
        "Masuk"
      )}
    </Button>
  );
};

export const RegisterButton = ({ isPending }: { isPending: boolean }) => {
  return (
    <Button
      type="submit"
      className="w-full h-10 sm:h-12 bg-[#3182CE] hover:bg-[#2c5282] text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg mt-2"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          Sedang Membuat Akun...
        </>
      ) : (
        "Buat Akun"
      )}
    </Button>
  );
};
