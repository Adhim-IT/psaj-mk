'use server';
import { RegisterSchema } from '@/lib/zod';
import { hashSync } from 'bcrypt-ts';
import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const signUpCredentials = async (prevState: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData);
  const validateFields = RegisterSchema.safeParse(rawFormData);

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten(),
    };
  }

  const { name, email, password } = validateFields.data;
  const hashedPassword = hashSync(password, 10);

  // Generate username dari email (ambil sebelum '@')
  const username = email.split('@')[0];

  try {
    // Buat user di tabel users
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
        role_id: 'cm7wzebiv0001fgnglebnmv99',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Tambahkan user ke tabel students
    await prisma.students.create({
      data: {
        id: crypto.randomUUID(),
        user_id: newUser.id,
        username,
        name,
        gender: null,
        occupation_type: null,
        profile_picture: null,
        occupation: null,
        phone: null,
        city: null,
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error) {
    // Cek apakah error adalah unique constraint pada email
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes('email')) {
        return {
          status: 'error',
          message: 'Email sudah terdaftar. Silakan gunakan email lain.',
        };
      }
    }

    return {
      status: 'error',
      message: 'Terjadi kesalahan saat registrasi',
    };
  }

  return {
    status: 'success',
    message: 'Registrasi berhasil! Silakan login.',
  };
};
