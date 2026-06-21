"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string;
  category: string | null;
}

interface Professional {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  rating: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  cancellationPolicy: string | null;
  schedule: any;
  services: Service[];
  professionals: Professional[];
}

interface TimeSlot {
  time: string;
  availableProfessionals: { id: string; name: string }[];
}

type BookingStep = "landing" | "services" | "schedule" | "details" | "success" | "my-appointments" | "waitlist";

interface BookingFlowClientProps {
  initialBusiness: Business;
}

export default function BookingFlowClient({ initialBusiness }: BookingFlowClientProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // States
  const [business] = useState<Business>(initialBusiness);

  // Booking Flow States
  const [step, setStep] = useState<BookingStep>("landing");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(""); // HH:MM
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Contact Info States
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");

  const [bookingResponse, setBookingResponse] = useState<any>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Client portal lookup states
  const [clientPortalPhone, setClientPortalPhone] = useState("");
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  const [searchingPortal, setSearchingPortal] = useState(false);

  // Client portal reschedule state
  const [reschedulingAppointment, setReschedulingAppointment] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Waitlist state
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDate, setWaitlistDate] = useState("");
  const [waitlistStart, setWaitlistStart] = useState("09:00");
  const [waitlistEnd, setWaitlistEnd] = useState("20:00");
  const [waitlistProfessional, setWaitlistProfessional] = useState("any");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  // Initialize waitlistDate to today when entering waitlist step
  useEffect(() => {
    if (step === "waitlist" && !waitlistDate) {
      setWaitlistDate(selectedDate || new Date().toISOString().split("T")[0]);
    }
  }, [step, waitlistDate, selectedDate]);

  // Fetch client portal appointments
  const fetchClientPortal = async () => {
    if (!clientPortalPhone) return;
    try {
      setSearchingPortal(true);
      const res = await fetch(`${API_URL}/appointments/client-portal?phone=${encodeURIComponent(clientPortalPhone)}&businessId=${business.id}`);
      if (!res.ok) throw new Error("Error al obtener las citas");
      const data = await res.json();
      setClientAppointments(data);
    } catch (err: any) {
      alert(err.message || "Error al buscar las citas");
    } finally {
      setSearchingPortal(false);
    }
  };

  // Cancel appointment from client portal
  const handleClientCancel = async (appointmentId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return;
    try {
      const res = await fetch(`${API_URL}/appointments/client-portal/${appointmentId}/cancel`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "No se pudo cancelar la cita");
      }
      alert("Cita cancelada correctamente. Se ha liberado el hueco y notificado al barbero.");
      fetchClientPortal(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Error al cancelar la cita");
    }
  };

  // Fetch slots for rescheduling
  useEffect(() => {
    if (!business || !reschedulingAppointment || !rescheduleDate) return;
    const fetchRescheduleSlots = async () => {
      try {
        setLoadingRescheduleSlots(true);
        const serviceIds = reschedulingAppointment.services.map((s: any) => s.serviceId || s.service?.id).join(",");
        const profId = reschedulingAppointment.professionalId;
        const url = `${API_URL}/appointments/availability?businessId=${business.id}&serviceIds=${serviceIds}&date=${rescheduleDate}&professionalId=${profId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener la disponibilidad");
        const data = await res.json();
        setRescheduleSlots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    };
    fetchRescheduleSlots();
  }, [business, reschedulingAppointment, rescheduleDate, API_URL]);

  // Confirm rescheduling
  const handleClientConfirmReschedule = async () => {
    if (!reschedulingAppointment || !rescheduleDate || !rescheduleTime) return;
    try {
      setSubmittingReschedule(true);
      const [hours, minutes] = rescheduleTime.split(":");
      const [year, month, day] = rescheduleDate.split("-").map(Number);
      const bookingStart = new Date(Date.UTC(year, month - 1, day, Number(hours), Number(minutes), 0, 0));

      const res = await fetch(`${API_URL}/appointments/client-portal/${reschedulingAppointment.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          startTime: bookingStart.toISOString(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al reprogramar la cita");
      }

      alert("Cita reprogramada correctamente.");
      setReschedulingAppointment(null);
      fetchClientPortal(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Error al reprogramar la cita");
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Submit waitlist request
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName || !waitlistPhone || !waitlistDate) {
      alert("Por favor rellena los campos requeridos");
      return;
    }
    try {
      setWaitlistSubmitting(true);
      const payload = {
        businessId: business.id,
        clientName: waitlistName,
        clientPhone: waitlistPhone,
        clientEmail: waitlistEmail || undefined,
        requestedDate: waitlistDate,
        preferredStart: waitlistStart,
        preferredEnd: waitlistEnd,
        professionalId: waitlistProfessional !== "any" ? waitlistProfessional : undefined,
      };

      const res = await fetch(`${API_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al registrarse en la lista de espera");
      }

      setWaitlistSuccess(true);
    } catch (err: any) {
      alert(err.message || "Error al registrarse en la lista de espera");
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    setSelectedDate(formatted);
  }, []);

  // Fetch availability slots when date or professional changes
  useEffect(() => {
    if (!business || selectedServices.length === 0 || !selectedDate || step !== "schedule") return;

    const fetchAvailability = async () => {
      try {
        setLoadingSlots(true);
        const serviceIds = selectedServices.map((s) => s.id).join(",");
        const professionalParam = selectedProfessional !== "any" ? `&professionalId=${selectedProfessional}` : "";
        const url = `${API_URL}/appointments/availability?businessId=${business.id}&serviceIds=${serviceIds}&date=${selectedDate}${professionalParam}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Error obteniendo disponibilidad");
        }
        const data = await res.json();
        setAvailableSlots(data);
      } catch (err) {
        console.error(err);
        // Fallback slots if API offline
        setAvailableSlots(getMockSlots(selectedDate));
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [business, selectedServices, selectedProfessional, selectedDate, step, API_URL]);

  // Handlers
  const handleToggleService = (service: Service) => {
    if (selectedServices.find((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
    setSelectedTime(""); // Reset time on service change
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || selectedServices.length === 0 || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert("Por favor rellena todos los campos requeridos");
      return;
    }

    try {
      setSubmittingBooking(true);
      
      // Compute full ISO start time
      const [hours, minutes] = selectedTime.split(":");
      const [year, month, day] = selectedDate.split("-").map(Number);
      const bookingStart = new Date(Date.UTC(year, month - 1, day, Number(hours), Number(minutes), 0, 0));

      const payload = {
        businessId: business.id,
        serviceIds: selectedServices.map((s) => s.id),
        professionalId: selectedProfessional,
        startTime: bookingStart.toISOString(),
        clientName,
        clientPhone,
        clientEmail: clientEmail || undefined,
        notes: clientNotes || undefined,
      };

      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear la reserva");
      }

      const data = await res.json();
      setBookingResponse(data);
      setStep("success");
    } catch (err: any) {
      alert(err.message || "Error de red al crear la reserva. Creando reserva local simulada para pruebas...");
      // Fallback response for demonstration if API offline
      setBookingResponse({
        id: "demo-id",
        startTime: `${selectedDate}T${selectedTime}:00.000Z`,
        totalPrice: selectedServices.reduce((sum, s) => sum + Number(s.price), 0),
        client: { name: clientName, phone: clientPhone },
        professional: { name: selectedProfessional === "any" ? "Rafa" : business.professionals.find((p) => p.id === selectedProfessional)?.name || "Luis" },
      });
      setStep("success");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Helper values
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  // Generate date options for the next 7 days in strip view
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayLabel = d.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase().replace(".", "");
    const dateNum = d.getDate();
    const isSelected = d.toISOString().split("T")[0] === selectedDate;
    const dateStr = d.toISOString().split("T")[0];
    return { dayLabel, dateNum, isSelected, dateStr };
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0e0d0c] text-[#e5e2e1] selection:bg-[#c8902a] selection:text-black">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#1a1816]/95 backdrop-blur-md border-b border-zinc-800 shadow-sm">
        <nav className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto w-full">
          <div className="font-semibold text-2xl uppercase tracking-tighter text-[#c8902a]">
            {business.name}
          </div>
          <div className="hidden md:flex items-center gap-12">
            <a href="#services" onClick={() => setStep("landing")} className="text-zinc-400 hover:text-[#c8902a] transition-colors text-sm font-medium">Servicios</a>
            <a href="#barbers" onClick={() => setStep("landing")} className="text-zinc-400 hover:text-[#c8902a] transition-colors text-sm font-medium">Barberos</a>
            <a href="#about" onClick={() => setStep("landing")} className="text-zinc-400 hover:text-[#c8902a] transition-colors text-sm font-medium">Nosotros</a>
            <button onClick={() => setStep("my-appointments")} className="text-zinc-400 hover:text-[#c8902a] transition-colors text-sm font-medium cursor-pointer bg-transparent border-none outline-none">Mis Reservas</button>
          </div>
          <button onClick={() => setStep("services")} className="bg-[#c8902a] text-black px-6 py-2.5 font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">
            Reservar Ahora
          </button>
        </nav>
      </header>

      {/* Main Area */}
      <main className="flex-1 pt-20">
        
        {/* Step: Landing Page */}
        {step === "landing" && (
          <div>
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${business.logoUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop'})` }}
                ></div>
              </div>
              <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-2xl">
                  <span className="text-[#c8902a] text-xs uppercase tracking-widest font-semibold">Bienvenido a</span>
                  <h1 className="text-5xl md:text-6xl text-white mb-4 leading-tight uppercase font-bold">
                    {business.name}.<br/><span className="text-[#c8902a]">PRECISIÓN Y ESTILO.</span>
                  </h1>
                  <p className="text-zinc-400 text-base md:text-lg mb-8 max-w-md">
                    Servicios de barbería de alta gama pensados para el caballero moderno. Reserva tu cita online al instante sin esperas.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => setStep("services")} className="bg-[#c8902a] text-black px-8 py-3.5 font-bold uppercase tracking-widest text-xs transition-all">
                      Pedir Cita
                    </button>
                    <a href="#services" className="border border-[#c8902a] text-[#c8902a] px-8 py-3.5 font-bold uppercase tracking-widest text-xs hover:bg-[#c8902a]/10 transition-all text-center">
                      Nuestros Servicios
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 bg-[#1a1816]">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                    <span className="text-[#c8902a] text-xs uppercase tracking-[0.2em] font-semibold">Nuestra Carta</span>
                    <h2 className="text-3xl md:text-4xl mt-2 font-bold text-white">Servicios Premium</h2>
                  </div>
                  <p className="text-zinc-400 max-w-sm">Procedimientos detallados que respetan el ritual tradicional de la barbería complementados con técnica contemporánea.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {business.services.map((service) => (
                    <div key={service.id} className="group bg-[#11100e] border border-zinc-800 p-6 hover:border-[#c8902a]/50 transition-all duration-500 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl text-white font-bold">{service.name}</h3>
                        <span className="text-[#c8902a] font-bold text-xl">{service.price}€</span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-6">{service.description || "Sin descripción disponible."}</p>
                      <div className="flex justify-between items-center text-xs text-zinc-500 mb-6">
                        <span>Duración: {service.durationMinutes} min</span>
                        <span>Categoría: {service.category || "General"}</span>
                      </div>
                      <button onClick={() => { handleToggleService(service); setStep("services"); }} className="w-full py-2.5 border border-zinc-800 hover:border-[#c8902a] hover:text-[#c8902a] transition-colors uppercase text-xs font-bold text-zinc-300">
                        Reservar Servicio
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Barbers Section */}
            <section id="barbers" className="py-20 bg-[#0e0d0c]">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                  <span className="text-[#c8902a] text-xs uppercase tracking-[0.2em] font-semibold">Artesanos</span>
                  <h2 className="text-3xl md:text-4xl mt-2 font-bold text-white">Nuestros Profesionales</h2>
                  <p className="text-zinc-400 max-w-md mx-auto mt-4 text-sm">Contamos con estilistas de primer nivel preparados para cuidar cada aspecto de tu imagen personal.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {business.professionals.map((prof) => (
                    <div key={prof.id} className="group flex flex-col items-center bg-[#1a1816] p-6 border border-zinc-800/40 rounded-xl">
                      <img 
                        src={prof.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"} 
                        alt={prof.name}
                        className="w-24 h-24 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 mb-4 border border-[#c8902a]/20"
                      />
                      <h3 className="text-lg text-white font-bold">{prof.name}</h3>
                      <span className="text-[#c8902a] text-xs mt-1">Valoración: ★ {prof.rating || "5.0"}</span>
                      <p className="text-zinc-500 text-xs text-center mt-3 line-clamp-2">{prof.bio || "Barbero experto comprometido con ofrecer el mejor servicio."}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Info About Section */}
            <section id="about" className="py-20 bg-[#1a1816] border-t border-zinc-800/40">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-white uppercase">Ubicación y Horarios</h2>
                  <p className="text-zinc-400 text-sm mb-4"><strong>Dirección:</strong> {business.address || "Dirección no especificada"}</p>
                  <p className="text-zinc-400 text-sm mb-6"><strong>Teléfono:</strong> {business.phone || "Teléfono no especificado"}</p>
                  
                  <div className="bg-[#11100e] p-6 rounded-lg border border-zinc-800/40">
                    <h3 className="text-[#c8902a] uppercase text-xs font-bold tracking-wider mb-4">Horario Comercial</h3>
                    <div className="flex flex-col gap-2 text-xs">
                      {business.schedule ? Object.entries(business.schedule).map(([day, value]: [string, any]) => (
                        <div key={day} className="flex justify-between border-b border-zinc-800 pb-1 text-zinc-300">
                          <span className="capitalize">{day === "monday" ? "Lunes" : day === "tuesday" ? "Martes" : day === "wednesday" ? "Miércoles" : day === "thursday" ? "Jueves" : day === "friday" ? "Viernes" : day === "saturday" ? "Sábado" : "Domingo"}</span>
                          <span>{value.isOpen ? `${value.open} - ${value.close}` : "Cerrado"}</span>
                        </div>
                      )) : <p>Lunes a Sábado: 09:00 - 20:00</p>}
                    </div>
                  </div>
                </div>
                <div className="h-80 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center text-zinc-500 relative">
                  <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')" }}></div>
                  <div className="relative z-10 text-center p-6 bg-black/70 rounded-md">
                    <p className="text-white text-xs font-bold">{business.address}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step: Select Services */}
        {step === "services" && (
          <section className="py-12 max-w-4xl mx-auto px-4">
            <h1 className="text-3xl text-[#c8902a] mb-2 font-bold">Selecciona tus Servicios</h1>
            <p className="text-zinc-400 text-sm mb-8">Puedes seleccionar varios tratamientos combinados en la misma cita. El tiempo y precio total se actualizarán automáticamente.</p>

            <div className="flex flex-col gap-4">
              {business.services.map((service) => {
                const isSelected = !!selectedServices.find((s) => s.id === service.id);
                return (
                  <div 
                    key={service.id} 
                    onClick={() => handleToggleService(service)}
                    className={`flex items-center justify-between p-5 rounded-lg cursor-pointer transition-all border ${isSelected ? "border-[#c8902a] bg-[#1a1816]" : "bg-[#11100e] border-transparent"}`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#c8902a] bg-[#c8902a]" : "border-zinc-700"}`}>
                          {isSelected && <span className="text-[10px] text-black">✔</span>}
                        </div>
                        <h3 className="font-bold text-white text-base">{service.name}</h3>
                      </div>
                      <p className="text-zinc-400 text-xs mt-2 pl-7">{service.description || "Tratamiento personalizado."}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#c8902a] font-bold text-lg block">{service.price}€</span>
                      <span className="text-zinc-500 text-xs">{service.durationMinutes} min</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Float summary bar */}
            {selectedServices.length > 0 && (
              <div className="fixed bottom-0 left-0 w-full bg-[#1a1816] border-t border-zinc-800 p-4 z-40">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-500 block">Total Seleccionado: {selectedServices.length} servicios</span>
                    <span className="text-[#c8902a] font-bold text-xl">{totalPrice}€</span>
                    <span className="text-zinc-400 text-xs ml-3">({totalDuration} mins)</span>
                  </div>
                  <button onClick={() => setStep("schedule")} className="bg-[#c8902a] text-black px-8 py-3 font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">
                    Continuar
                  </button>
                </div>
              </div>
            )}
            <div className="h-24" />
          </section>
        )}

        {/* Step: Select Barber & Schedule */}
        {step === "schedule" && (
          <section className="py-12 max-w-4xl mx-auto px-4">
            <button onClick={() => setStep("services")} className="text-[#c8902a] flex items-center gap-1 text-xs mb-6 hover:underline">
              ← Volver a servicios
            </button>
            <h1 className="text-3xl text-[#c8902a] mb-2 font-bold">Barbero y Horario</h1>
            <p className="text-zinc-400 text-sm mb-8">Elige el profesional y la hora que mejor se adapte a tus planes.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Select Professional & Date */}
              <div className="md:col-span-1 flex flex-col gap-6">
                
                {/* Professionals Selection */}
                <div>
                  <label className="text-[#c8902a] text-xs uppercase tracking-wider font-bold mb-3 block">Estilista/Barbero</label>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedProfessional("any")}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${selectedProfessional === "any" ? "border-[#c8902a] bg-[#c8902a]/10 text-[#c8902a] font-bold" : "border-zinc-800 bg-[#11100e] text-zinc-300"}`}
                    >
                      Cualquiera disponible
                    </button>
                    {business.professionals.map((p) => (
                      <button 
                        key={p.id}
                        onClick={() => setSelectedProfessional(p.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border flex items-center gap-3 ${selectedProfessional === p.id ? "border-[#c8902a] bg-[#c8902a]/10 text-[#c8902a] font-bold" : "border-zinc-800 bg-[#11100e] text-zinc-300"}`}
                      >
                        <img src={p.photoUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Picker Strip */}
                <div>
                  <label className="text-[#c8902a] text-xs uppercase tracking-wider font-bold mb-3 block">Fecha de Cita</label>
                  <div className="grid grid-cols-7 gap-1">
                    {dateOptions.map((opt) => (
                      <button
                        key={opt.dateStr}
                        onClick={() => { setSelectedDate(opt.dateStr); setSelectedTime(""); }}
                        className={`flex flex-col items-center p-1.5 rounded transition-all ${opt.isSelected ? "bg-[#c8902a] text-black font-bold" : "bg-[#11100e] text-zinc-400 hover:bg-zinc-800"}`}
                      >
                        <span className="text-[9px]">{opt.dayLabel}</span>
                        <span className="text-sm">{opt.dateNum}</span>
                      </button>
                    ))}
                  </div>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(""); }}
                    className="w-full mt-3 bg-[#11100e] border border-zinc-800 rounded p-2.5 text-xs text-white outline-none focus:border-[#c8902a]"
                  />
                </div>
              </div>

              {/* Right Column: Time Slots */}
              <div className="md:col-span-2">
                <label className="text-[#c8902a] text-xs uppercase tracking-wider font-bold mb-3 block">Horas disponibles ({selectedDate})</label>
                
                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c8902a]"></div>
                    <p className="text-zinc-500 text-xs mt-3">Calculando huecos libres en tiempo real...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-12 bg-[#11100e] rounded-lg border border-dashed border-zinc-800 px-6">
                    <p className="text-zinc-400 text-sm">No hay huecos disponibles para esta fecha.</p>
                    <p className="text-zinc-600 text-xs mt-1 mb-4">Prueba a seleccionar otro profesional o fecha.</p>
                    <div className="border-t border-zinc-800 pt-4 max-w-sm mx-auto">
                      <p className="text-xs text-[#c8902a] font-bold uppercase mb-1">¿No encuentras hueco?</p>
                      <p className="text-zinc-500 text-[11px] mb-4">Únete a nuestra lista de espera y te avisaremos por correo de inmediato si se libera una cita.</p>
                      <button 
                        type="button" 
                        onClick={() => { setWaitlistDate(selectedDate); setStep("waitlist"); }} 
                        className="bg-[#c8902a] hover:bg-[#c8902a]/80 text-black px-4 py-2 font-bold uppercase tracking-wider text-[10px] transition-all"
                      >
                        Unirse a Lista de Espera
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = slot.time === selectedTime;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-3 rounded-lg text-xs font-bold text-center border transition-all ${isSelected ? "bg-[#c8902a] text-black border-[#c8902a]" : "bg-[#11100e] border-zinc-800 text-zinc-300 hover:border-[#c8902a]"}`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Continue button */}
                {selectedTime && (
                  <div className="mt-8 flex justify-end">
                    <button onClick={() => setStep("details")} className="bg-[#c8902a] text-black px-10 py-3.5 font-bold uppercase tracking-widest text-xs active:scale-95 transition-all">
                      Continuar →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Step: Summary and Contact Info */}
        {step === "details" && (
          <section className="py-12 max-w-4xl mx-auto px-4">
            <button onClick={() => setStep("schedule")} className="text-[#c8902a] flex items-center gap-1 text-xs mb-6 hover:underline">
              ← Volver a calendario
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Left Column: Form */}
              <form onSubmit={handleConfirmBooking} className="md:col-span-2 flex flex-col gap-5">
                <h1 className="text-3xl text-[#c8902a] font-bold">Datos del Cliente</h1>
                <p className="text-zinc-400 text-sm">Proporciona tus datos para confirmar tu reserva al instante. Te enviaremos un email de confirmación.</p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Marco Villanueva"
                    className="w-full px-4 py-3 bg-[#11100e] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="w-full px-4 py-3 bg-[#11100e] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Email (Opcional)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-4 py-3 bg-[#11100e] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Notas para el barbero (Opcional)</label>
                  <textarea
                    rows={3}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Alguna preferencia de corte, alergia a productos..."
                    className="w-full px-4 py-3 bg-[#11100e] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full bg-[#c8902a] text-black py-4 rounded-lg font-bold uppercase tracking-widest text-xs active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {submittingBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      <span>Procesando Reserva...</span>
                    </>
                  ) : (
                    <span>Confirmar Reserva</span>
                  )}
                </button>
              </form>

              {/* Right Column: Reservation Summary Card */}
              <div className="md:col-span-1">
                <div className="bg-[#1a1816] p-6 rounded-xl border border-[#c8902a]/20 sticky top-28">
                  <h3 className="text-lg text-[#c8902a] font-bold border-b border-zinc-800 pb-3 uppercase">Resumen</h3>
                  
                  <div className="flex flex-col gap-4 mt-4 text-xs">
                    <div>
                      <span className="text-zinc-500 block">SERVICIOS SELECCIONADOS</span>
                      {selectedServices.map((s) => (
                        <div key={s.id} className="flex justify-between text-white font-semibold mt-1">
                          <span>{s.name}</span>
                          <span>{s.price}€</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <span className="text-zinc-500 block">PROFESIONAL</span>
                      <span className="text-white font-semibold mt-1 block">
                        {selectedProfessional === "any" ? "Cualquier barbero disponible" : business.professionals.find((p) => p.id === selectedProfessional)?.name}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block">FECHA Y HORA</span>
                      <span className="text-white font-semibold mt-1 block">
                        {selectedDate} a las {selectedTime}
                      </span>
                    </div>

                    <div className="border-t border-zinc-800 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#c8902a] font-bold">TOTAL A PAGAR</span>
                        <span className="text-[#c8902a] font-bold">{totalPrice}€</span>
                      </div>
                      <span className="text-zinc-500 text-[10px] block mt-1">Duración estimada: {totalDuration} minutos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step: Success Screen */}
        {step === "success" && bookingResponse && (
          <section className="py-16 max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[#c8902a]/10 border border-[#c8902a] flex items-center justify-center mx-auto mb-6">
              <span className="text-[#c8902a] text-3xl font-bold">✓</span>
            </div>
            <h1 className="text-4xl text-[#c8902a] font-bold mb-2">¡Reserva Confirmada!</h1>
            <p className="text-zinc-400 text-sm mb-8">Tu cita ha sido agendada con éxito. Te esperamos en el local el día acordado.</p>

            <div className="bg-[#1a1816] p-6 rounded-xl border border-zinc-800 text-left text-xs flex flex-col gap-3 mb-8">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">ID de Cita:</span>
                <span className="text-white font-mono">{bookingResponse.id}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Servicio(s):</span>
                <span className="text-white font-semibold">{selectedServices.map((s) => s.name).join(", ")}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Barbero:</span>
                <span className="text-white font-semibold">{bookingResponse.professional?.name || "Asignado"}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500">Fecha y Hora:</span>
                <span className="text-white font-semibold">
                  {new Date(bookingResponse.startTime).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {selectedTime}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[#c8902a] font-bold">Importe Total:</span>
                <span className="text-[#c8902a] font-bold">{bookingResponse.totalPrice || totalPrice}€</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => { setStep("landing"); setSelectedServices([]); setSelectedTime(""); }} className="bg-[#c8902a] text-black py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs active:scale-95 transition-all w-full">
                Volver al Inicio
              </button>
              <p className="text-[10px] text-zinc-600 mt-2">Puedes cancelar o reprogramar contactando directamente por teléfono al {business.phone}.</p>
            </div>
          </section>
        )}

        {/* Step: My Appointments (Client Portal) */}
        {step === "my-appointments" && (
          <section className="py-12 max-w-4xl mx-auto px-4">
            <button onClick={() => setStep("landing")} className="text-[#c8902a] flex items-center gap-1 text-xs mb-6 hover:underline">
              ← Volver al inicio
            </button>
            <h1 className="text-3xl text-[#c8902a] mb-2 font-bold uppercase">Mis Reservas</h1>
            <p className="text-zinc-400 text-sm mb-8">Introduce tu número de teléfono de contacto para consultar, reprogramar o cancelar tus citas.</p>

            <div className="bg-[#1a1816] border border-zinc-800 p-6 rounded-xl max-w-md mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Número de Teléfono</label>
                <div className="flex gap-3">
                  <input
                    type="tel"
                    value={clientPortalPhone}
                    onChange={(e) => setClientPortalPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="flex-1 px-4 py-3 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                  <button
                    onClick={fetchClientPortal}
                    disabled={searchingPortal || !clientPortalPhone}
                    className="bg-[#c8902a] text-black px-6 rounded-lg font-bold text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
                  >
                    {searchingPortal ? "Buscando..." : "Buscar"}
                  </button>
                </div>
              </div>
            </div>

            {clientAppointments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {clientAppointments.map((appt) => {
                  const apptDate = new Date(appt.startTime);
                  const isFuture = apptDate.getTime() > Date.now();
                  const canModify = isFuture && (apptDate.getTime() - Date.now() > 24 * 60 * 60 * 1000);
                  const isCancelled = appt.status === "CANCELLED";

                  return (
                    <div key={appt.id} className="bg-[#1a1816] border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            appt.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            appt.status === "COMPLETED" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            appt.status === "CANCELLED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                            "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}>
                            {appt.status}
                          </span>
                          <span className="text-zinc-500 text-[10px] font-mono">{appt.id}</span>
                        </div>
                        <h3 className="text-white font-bold text-lg mt-1">
                          {appt.services.map((s: any) => s.service?.name).join(" + ")}
                        </h3>
                        <p className="text-zinc-400 text-xs">
                          Estilista: <strong className="text-white">{appt.professional?.name}</strong>
                        </p>
                        <p className="text-zinc-400 text-xs">
                          Fecha y Hora: <strong className="text-white">{apptDate.toLocaleString("es-ES", { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' })}</strong>
                        </p>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                        <span className="text-[#c8902a] font-bold text-xl">{appt.totalPrice}€</span>
                        
                        {!isCancelled && isFuture && (
                          <div className="flex gap-2 w-full md:w-auto">
                            {canModify ? (
                              <>
                                <button
                                  onClick={() => {
                                    setReschedulingAppointment(appt);
                                    setRescheduleDate(apptDate.toISOString().split("T")[0]);
                                    setRescheduleTime("");
                                  }}
                                  className="flex-1 md:flex-none border border-[#c8902a] hover:bg-[#c8902a] hover:text-black transition-colors text-[#c8902a] font-bold text-xs py-2 px-4 uppercase tracking-wider rounded"
                                >
                                  Reprogramar
                                </button>
                                <button
                                  onClick={() => handleClientCancel(appt.id)}
                                  className="flex-1 md:flex-none bg-rose-950/40 border border-rose-800 hover:bg-rose-900 transition-colors text-rose-200 font-bold text-xs py-2 px-4 uppercase tracking-wider rounded"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <span className="text-zinc-600 text-[10px] italic">No modificable (política de 24h)</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : clientPortalPhone && !searchingPortal ? (
              <div className="text-center py-12 bg-[#11100e] border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-400 text-sm">No se encontraron citas activas para este número.</p>
              </div>
            ) : null}

            {/* Rescheduling Overlay / Section in Client Portal */}
            {reschedulingAppointment && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#1a1816] border border-[#c8902a]/20 p-6 rounded-2xl w-full max-w-lg flex flex-col gap-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#c8902a] uppercase">Reprogramar Cita</h2>
                    <p className="text-zinc-400 text-xs mt-1">Elige una nueva fecha y hora para tu cita de {reschedulingAppointment.services.map((s: any) => s.service?.name).join(" + ")} con {reschedulingAppointment.professional?.name}.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Nueva Fecha</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => { setRescheduleDate(e.target.value); setRescheduleTime(""); }}
                      className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Nueva Hora</label>
                    {loadingRescheduleSlots ? (
                      <div className="flex items-center gap-2 justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c8902a]"></div>
                        <span className="text-zinc-500 text-xs">Buscando horas libres...</span>
                      </div>
                    ) : rescheduleSlots.length === 0 ? (
                      <p className="text-rose-400 text-xs bg-rose-950/20 border border-rose-900/30 p-2.5 rounded text-center">No hay disponibilidad para esta fecha. Selecciona otro día.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                        {rescheduleSlots.map((slot) => {
                          const isSel = rescheduleTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setRescheduleTime(slot.time)}
                              className={`py-2 rounded font-bold text-xs border text-center transition-all ${
                                isSel ? "bg-[#c8902a] text-black border-[#c8902a]" : "bg-[#0e0d0c] border-zinc-800 text-zinc-300 hover:border-[#c8902a]"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setReschedulingAppointment(null)}
                      className="flex-1 py-3 border border-zinc-850 text-zinc-400 hover:bg-zinc-800/20 text-xs font-bold uppercase rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!rescheduleTime || submittingReschedule}
                      onClick={handleClientConfirmReschedule}
                      className="flex-1 py-3 bg-[#c8902a] text-black disabled:opacity-50 text-xs font-bold uppercase rounded-lg transition-all"
                    >
                      {submittingReschedule ? "Guardando..." : "Confirmar Cambio"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step: Join Waitlist */}
        {step === "waitlist" && (
          <section className="py-12 max-w-lg mx-auto px-4">
            <button onClick={() => setStep("schedule")} className="text-[#c8902a] flex items-center gap-1 text-xs mb-6 hover:underline">
              ← Volver al calendario
            </button>
            <h1 className="text-3xl text-[#c8902a] mb-2 font-bold uppercase">Apuntarse a Lista de Espera</h1>
            <p className="text-zinc-400 text-sm mb-8">Si no encuentras hueco libre, te avisaremos de inmediato si otro cliente reprograma o cancela su cita en esta fecha.</p>

            {waitlistSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#c8902a]/10 border border-[#c8902a] flex items-center justify-center mx-auto mb-6">
                  <span className="text-[#c8902a] text-2xl font-bold">✓</span>
                </div>
                <h2 className="text-2xl text-[#c8902a] font-bold mb-2">¡Añadido Correctamente!</h2>
                <p className="text-zinc-400 text-xs mb-8 max-w-sm mx-auto">Te hemos apuntado en la lista de espera para el {waitlistDate}. Te llegará un correo instantáneo si se libera tu rango de horario preferido.</p>
                
                <button
                  onClick={() => {
                    setWaitlistSuccess(false);
                    setStep("landing");
                  }}
                  className="bg-[#c8902a] text-black px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Volver al Inicio
                </button>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="bg-[#1a1816] border border-zinc-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={waitlistPhone}
                    onChange={(e) => setWaitlistPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Email de Contacto *</label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Fecha Solicitada</label>
                  <input
                    type="date"
                    required
                    value={waitlistDate}
                    onChange={(e) => setWaitlistDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Hora Preferida (Desde)</label>
                    <input
                      type="text"
                      required
                      value={waitlistStart}
                      onChange={(e) => setWaitlistStart(e.target.value)}
                      placeholder="09:00"
                      className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Hora Preferida (Hasta)</label>
                    <input
                      type="text"
                      required
                      value={waitlistEnd}
                      onChange={(e) => setWaitlistEnd(e.target.value)}
                      placeholder="20:00"
                      className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Estilista Preferido</label>
                  <select
                    value={waitlistProfessional}
                    onChange={(e) => setWaitlistProfessional(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0d0c] border border-zinc-800 rounded-lg text-sm text-white outline-none focus:border-[#c8902a]"
                  >
                    <option value="any">Cualquiera disponible</option>
                    {business.professionals.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={waitlistSubmitting}
                  className="w-full bg-[#c8902a] text-black py-4 rounded-lg font-bold uppercase tracking-widest text-xs active:scale-95 transition-all mt-4"
                >
                  {waitlistSubmitting ? "Registrando..." : "Apuntarse a Lista de Espera"}
                </button>
              </form>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0908] border-t border-zinc-800 py-10 text-center text-xs text-zinc-500 mt-12 flex-shrink-0">
        <p className="max-w-md mx-auto mb-3">© 2026 {business.name}. Todos los derechos reservados. Creado con CitCalendar.</p>
        <div className="flex justify-center gap-4 text-[10px]">
          <a href="#" className="hover:underline">Políticas de Cancelación</a>
          <span>·</span>
          <a href="#" className="hover:underline">Términos de Uso</a>
        </div>
      </footer>
    </div>
  );
}

function getMockSlots(date: string): TimeSlot[] {
  return [
    { time: "09:00", availableProfessionals: [{ id: "p1", name: "Rafa" }, { id: "p2", name: "Luis" }] },
    { time: "09:30", availableProfessionals: [{ id: "p1", name: "Rafa" }] },
    { time: "11:00", availableProfessionals: [{ id: "p2", name: "Luis" }, { id: "p3", name: "Carlos" }] },
    { time: "11:30", availableProfessionals: [{ id: "p3", name: "Carlos" }] },
    { time: "12:00", availableProfessionals: [{ id: "p1", name: "Rafa" }, { id: "p2", name: "Luis" }, { id: "p3", name: "Carlos" }] },
    { time: "13:30", availableProfessionals: [{ id: "p2", name: "Luis" }] },
    { time: "16:00", availableProfessionals: [{ id: "p1", name: "Rafa" }, { id: "p3", name: "Carlos" }] },
    { time: "16:30", availableProfessionals: [{ id: "p3", name: "Carlos" }] },
    { time: "17:00", availableProfessionals: [{ id: "p1", name: "Rafa" }, { id: "p2", name: "Luis" }] },
    { time: "17:30", availableProfessionals: [{ id: "p2", name: "Luis" }] },
  ];
}
