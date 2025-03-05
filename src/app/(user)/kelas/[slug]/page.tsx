"use client";
import { useParams } from "next/navigation";

export default function SlugPage() {
  const params = useParams();

  return (
    <main className="min-h-screen overflow-hidden">
    {/* Hero Section */}
    <section className="bg-gradient-to-br from-[#4A90E2] to-[#3178c6] text-white relative overflow-hidden mt-25">
      {/* Animated background elements */}
      <h1 className="text-2xl font-bold">Detail Kursus: {params.slug}</h1>
    </section>
  </main>
  );
}
