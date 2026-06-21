import React from "react";
import { Metadata } from "next";
import BookingFlowClient from "./BookingFlowClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBusiness(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    const res = await fetch(`${API_URL}/businesses/slug/${slug}`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching business in server component:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const business = await getBusiness(resolvedParams.slug);
  
  if (!business) {
    return {
      title: "Barbería - Reservas Online",
      description: "Reserva de citas online de estética y belleza.",
    };
  }

  return {
    title: `${business.name} | Reservas Online`,
    description: `Reserva tu cita en ${business.name}. Consulta servicios, horarios, barberos y disponibilidad en tiempo real.`,
    openGraph: {
      title: `${business.name} | Reservas Online`,
      description: `Reserva tu cita online en ${business.name}.`,
    },
  };
}

export default async function BusinessPage({ params }: PageProps) {
  const resolvedParams = await params;
  const business = await getBusiness(resolvedParams.slug);

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#0e0d0c] text-[#e5e2e1]">
        <h1 className="text-4xl text-[#c8902a] mb-4 font-bold">Error</h1>
        <p className="mb-6">No se pudo encontrar la barbería o salón solicitado.</p>
      </div>
    );
  }

  return <BookingFlowClient initialBusiness={business} />;
}
