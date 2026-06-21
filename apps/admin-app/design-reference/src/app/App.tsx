import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  Calendar,
  Users,
  DollarSign,
  BarChart2,
  MoreHorizontal,
  Plus,
  Phone,
  X,
  Check,
  Search,
  Star,
  Scissors,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  UserPlus,
} from "lucide-react";

type Screen =
  | "login"
  | "agenda"
  | "appt-detail"
  | "create-appt"
  | "clients"
  | "client-detail"
  | "caja"
  | "stats";

type NavTab = "agenda" | "clients" | "caja" | "stats" | "more";

// ── DATA ──────────────────────────────────────────────────────────────────────

const APPTS = [
  { id: 1, time: "09:00", client: "Marco Villanueva", service: "Corte + Barba", barber: "Rafa", price: 28, status: "completed", phone: "+34 612 345 678", notes: "Prefiere tijera en laterales, máquina 0 en nuca." },
  { id: 2, time: "10:00", client: "Diego Salmerón", service: "Corte Clásico", barber: "Luis", price: 18, status: "completed", phone: "+34 623 456 789", notes: "" },
  { id: 3, time: "10:30", client: "Andrés Molina", service: "Afeitado Navaja", barber: "Rafa", price: 22, status: "no-show", phone: "+34 634 567 890", notes: "Segundo no-show este mes. Avisado por WhatsApp." },
  { id: 4, time: "11:30", client: "Pablo Ruiz", service: "Corte + Barba", barber: "Carlos", price: 28, status: "confirmed", phone: "+34 645 678 901", notes: "" },
  { id: 5, time: "12:30", client: "Sergio Méndez", service: "Fade Bajo", barber: "Luis", price: 20, status: "confirmed", phone: "+34 656 789 012", notes: "VIP — siempre puntual." },
  { id: 6, time: "13:00", client: "Javier Torres", service: "Corte Clásico", barber: "Rafa", price: 18, status: "confirmed", phone: "+34 667 890 123", notes: "" },
  { id: 7, time: "16:00", client: "Tomás Herrera", service: "Corte + Barba", barber: "Carlos", price: 28, status: "confirmed", phone: "+34 678 901 234", notes: "" },
  { id: 8, time: "17:00", client: "Iván Castillo", service: "Degradado Máquina", barber: "Luis", price: 22, status: "confirmed", phone: "+34 689 012 345", notes: "" },
];

const CLIENTS = [
  { id: 1, name: "Marco Villanueva", phone: "+34 612 345 678", visits: 24, total: 612, vip: true, lastVisit: "Hoy", initials: "MV", inactive: false },
  { id: 2, name: "Diego Salmerón", phone: "+34 623 456 789", visits: 12, total: 216, vip: false, lastVisit: "Hoy", initials: "DS", inactive: false },
  { id: 3, name: "Andrés Molina", phone: "+34 634 567 890", visits: 3, total: 66, vip: false, lastVisit: "hace 2 meses", initials: "AM", inactive: true },
  { id: 4, name: "Pablo Ruiz", phone: "+34 645 678 901", visits: 18, total: 468, vip: true, lastVisit: "hace 1 sem.", initials: "PR", inactive: false },
  { id: 5, name: "Sergio Méndez", phone: "+34 656 789 012", visits: 31, total: 744, vip: true, lastVisit: "hace 3 días", initials: "SM", inactive: false },
  { id: 6, name: "Javier Torres", phone: "+34 667 890 123", visits: 7, total: 126, vip: false, lastVisit: "hace 3 sem.", initials: "JT", inactive: false },
  { id: 7, name: "Tomás Herrera", phone: "+34 678 901 234", visits: 2, total: 56, vip: false, lastVisit: "hace 4 meses", initials: "TH", inactive: true },
];

const CLIENT_HISTORY = [
  { date: "21 Jun 2025", service: "Corte + Barba", barber: "Rafa", price: 28 },
  { date: "07 Jun 2025", service: "Corte + Barba", barber: "Rafa", price: 28 },
  { date: "23 May 2025", service: "Corte Clásico", barber: "Luis", price: 18 },
  { date: "09 May 2025", service: "Corte + Barba", barber: "Rafa", price: 28 },
  { date: "24 Abr 2025", service: "Afeitado Navaja", barber: "Rafa", price: 22 },
];

const WEEKLY = [
  { day: "L", amount: 142 },
  { day: "M", amount: 98 },
  { day: "X", amount: 186 },
  { day: "J", amount: 124 },
  { day: "V", amount: 210 },
  { day: "S", amount: 278 },
  { day: "D", amount: 0 },
];

const CAJA_TXS = [
  { id: 1, client: "Marco Villanueva", service: "Corte + Barba", method: "tarjeta", amount: 28, time: "09:45" },
  { id: 2, client: "Diego Salmerón", service: "Corte Clásico", method: "efectivo", amount: 18, time: "10:50" },
  { id: 3, client: "Andrés Molina", service: "Afeitado Navaja", method: "efectivo", amount: 22, time: "11:10" },
  { id: 4, client: "Javier Torres", service: "Corte Clásico", method: "bizum", amount: 18, time: "13:45" },
  { id: 5, client: "Sergio Méndez", service: "Fade Bajo", method: "tarjeta", amount: 20, time: "14:00" },
];

// ── STYLE HELPERS ─────────────────────────────────────────────────────────────

const S = {
  label: { fontFamily: "'Barlow Condensed', sans-serif" } as React.CSSProperties,
  mono: { fontFamily: "'JetBrains Mono', monospace" } as React.CSSProperties,
  card: { background: "#1A1816", border: "1px solid rgba(255,255,255,0.06)" } as React.CSSProperties,
  goldBtn: { background: "linear-gradient(135deg, #C8902A, #E5A93C)" } as React.CSSProperties,
  goldBtnShadow: { background: "linear-gradient(135deg, #C8902A, #E5A93C)", boxShadow: "0 4px 24px rgba(200,144,42,0.35)" } as React.CSSProperties,
  inputBg: { background: "#1A1816", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Inter, sans-serif" } as React.CSSProperties,
};

const STATUS_CFG = {
  confirmed: {
    label: "Confirmada",
    bg: "#1E1710",
    border: "rgba(200,144,42,0.35)",
    leftBorder: "#C8902A",
    text: "#E5A93C",
    dotBg: "#C8902A",
  },
  completed: {
    label: "Completada",
    bg: "#0E1A13",
    border: "rgba(52,211,153,0.2)",
    leftBorder: "#34d399",
    text: "#34d399",
    dotBg: "#34d399",
  },
  "no-show": {
    label: "No-show",
    bg: "#1A0E0E",
    border: "rgba(248,113,113,0.2)",
    leftBorder: "#f87171",
    text: "#f87171",
    dotBg: "#f87171",
  },
};

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activeTab, setActiveTab] = useState<NavTab>("agenda");
  const [selectedAppt, setSelectedAppt] = useState(APPTS[0]);
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [showPw, setShowPw] = useState(false);
  const [agendaView, setAgendaView] = useState<"dia" | "semana">("dia");
  const [searchQ, setSearchQ] = useState("");

  const goHome = () => { setScreen("agenda"); setActiveTab("agenda"); };

  const nav = (s: Screen, tab?: NavTab) => {
    setScreen(s);
    if (tab) setActiveTab(tab);
  };

  const payIcon = (method: string) => {
    if (method === "tarjeta") return <CreditCard size={13} style={{ color: "#60a5fa" }} />;
    if (method === "bizum") return <Smartphone size={13} style={{ color: "#c084fc" }} />;
    return <Banknote size={13} style={{ color: "#34d399" }} />;
  };

  // ── BOTTOM NAV ──────────────────────────────────────────────────────────────

  const BottomNav = () => {
    const tabs: { id: NavTab; icon: React.ReactNode; label: string; screen: Screen }[] = [
      { id: "agenda", icon: <Calendar size={21} />, label: "Agenda", screen: "agenda" },
      { id: "clients", icon: <Users size={21} />, label: "Clientes", screen: "clients" },
      { id: "caja", icon: <DollarSign size={21} />, label: "Caja", screen: "caja" },
      { id: "stats", icon: <BarChart2 size={21} />, label: "Stats", screen: "stats" },
      { id: "more", icon: <MoreHorizontal size={21} />, label: "Más", screen: "agenda" },
    ];
    return (
      <div
        className="flex-shrink-0 flex items-center justify-around px-1 pt-2 pb-1"
        style={{ background: "#0A0908", borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all"
            style={{ color: activeTab === t.id ? "#C8902A" : "#4A4440" }}
            onClick={() => { setActiveTab(t.id); setScreen(t.screen); }}
          >
            {t.icon}
            <span className="text-[9px] font-semibold tracking-wide" style={S.label}>{t.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // ── STATUS BAR + BEZEL ──────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a1510 0%, #080706 60%)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Phone bezel */}
      <div
        className="relative flex flex-col overflow-hidden select-none"
        style={{
          width: 390,
          height: 844,
          background: "#0E0D0C",
          borderRadius: "2.75rem",
          boxShadow:
            "0 0 0 10px #1c1a16, 0 0 0 12px #2e2a22, 0 60px 120px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-7 pt-4 pb-1 flex-shrink-0">
          <span className="text-white/90 text-[12px] font-semibold" style={{ ...S.label, letterSpacing: "0.06em" }}>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="9" y="2.5" width="3" height="9.5" rx="0.5" fill="white" fillOpacity="0.9" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white" fillOpacity="0.9" />
            </svg>
            <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
              <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="white" strokeOpacity="0.55" />
              <rect x="2" y="2" width="17" height="9" rx="1.5" fill="white" fillOpacity="0.9" />
              <path d="M24 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.45" />
            </svg>
          </div>
        </div>

        {/* Dynamic island */}
        <div className="flex justify-center mb-0.5 flex-shrink-0">
          <div className="w-[110px] h-[30px] rounded-full" style={{ background: "#000" }} />
        </div>

        {/* Screen */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {screen === "login" && <LoginScreen />}
          {screen === "agenda" && <AgendaScreen />}
          {screen === "appt-detail" && <ApptDetailScreen />}
          {screen === "create-appt" && <CreateApptScreen />}
          {screen === "clients" && <ClientsScreen />}
          {screen === "client-detail" && <ClientDetailScreen />}
          {screen === "caja" && <CajaScreen />}
          {screen === "stats" && <StatsScreen />}
        </div>
      </div>
    </div>
  );

  // ── LOGIN ──────────────────────────────────────────────────────────────────

  function LoginScreen() {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-9 gap-5"
        style={{ background: "linear-gradient(170deg, #0E0D0C 0%, #161310 60%, #1A1610 100%)" }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3 mb-3">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #1C1A16, #252015)",
              border: "1px solid rgba(200,144,42,0.3)",
              boxShadow: "0 8px 32px rgba(200,144,42,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <Scissors size={40} color="#C8902A" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#7A6030", ...S.label }}>
              Barbería
            </p>
            <h1
              className="text-[28px] font-bold tracking-wider text-white leading-tight"
              style={{ ...S.label, letterSpacing: "0.1em" }}
            >
              EL VIEJO OFICIO
            </h1>
            <p className="text-[10px] text-zinc-600 mt-0.5 tracking-widest" style={S.label}>
              PANEL DE ADMINISTRACIÓN
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          <span className="text-[9px] text-zinc-700 tracking-widest" style={S.label}>ACCESO</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Fields */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-widest text-zinc-600" style={S.label}>
              Email
            </label>
            <input
              type="email"
              defaultValue="admin@elviejooficio.es"
              className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none"
              style={S.inputBg}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase tracking-widest text-zinc-600" style={S.label}>
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                defaultValue="contraseña123"
                className="w-full px-4 py-3.5 rounded-xl text-sm text-white outline-none pr-12"
                style={S.inputBg}
              />
              <button
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#5A5450" }}
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button
          className="w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase text-[#0E0D0C] active:opacity-90 transition-opacity"
          style={{ ...S.goldBtn, ...S.label, letterSpacing: "0.18em" }}
          onClick={goHome}
        >
          Entrar
        </button>

        <p className="text-xs" style={{ color: "#5A5450" }}>
          ¿Olvidaste tu contraseña?
        </p>
      </div>
    );
  }

  // ── AGENDA ─────────────────────────────────────────────────────────────────

  function AgendaScreen() {
    const days = ["L", "M", "X", "J", "V", "S", "D"];
    const dates = [16, 17, 18, 19, 20, 21, 22];
    const todayIdx = 5;

    const confirmed = APPTS.filter((a) => a.status === "confirmed").length;
    const completed = APPTS.filter((a) => a.status === "completed").length;
    const noShows = APPTS.filter((a) => a.status === "no-show").length;

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-[22px] font-bold text-white leading-tight" style={S.label}>
                Agenda
              </h1>
              <p className="text-[11px]" style={{ color: "#6A6460" }}>
                Sábado, 21 de junio de 2025
              </p>
            </div>
            {/* Day/Week toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ background: "#141210", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {(["dia", "semana"] as const).map((v) => (
                <button
                  key={v}
                  className="px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all"
                  style={{
                    ...S.label,
                    background: agendaView === v ? "#C8902A" : "transparent",
                    color: agendaView === v ? "#0E0D0C" : "#6A6460",
                  }}
                  onClick={() => setAgendaView(v)}
                >
                  {v === "dia" ? "Día" : "Semana"}
                </button>
              ))}
            </div>
          </div>

          {/* Week strip */}
          <div className="flex gap-1 justify-between mb-3">
            {days.map((d, i) => (
              <button key={d} className="flex flex-col items-center gap-0.5 flex-1">
                <span className="text-[9px] font-semibold" style={{ ...S.label, color: "#5A5450" }}>
                  {d}
                </span>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    ...S.label,
                    background: i === todayIdx ? "#C8902A" : "transparent",
                    color: i === todayIdx ? "#0E0D0C" : i === todayIdx - 1 || i === todayIdx - 2 ? "#4A4440" : "#9A9490",
                  }}
                >
                  {dates[i]}
                </span>
              </button>
            ))}
          </div>

          {/* Quick stats pills */}
          <div className="flex gap-2">
            {[
              { n: confirmed, label: "Pendientes", color: "#C8902A" },
              { n: completed, label: "Hechas", color: "#34d399" },
              { n: noShows, label: "No-show", color: "#f87171" },
            ].map(({ n, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "#1A1816", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-[10px] font-semibold" style={{ ...S.label, color }}>
                  {n}
                </span>
                <span className="text-[9px]" style={{ color: "#5A5450" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {APPTS.map((appt) => {
            const cfg = STATUS_CFG[appt.status as keyof typeof STATUS_CFG];
            return (
              <button
                key={appt.id}
                className="w-full text-left rounded-xl p-3 active:opacity-75 transition-opacity"
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.leftBorder}`,
                }}
                onClick={() => { setSelectedAppt(appt); setScreen("appt-detail"); }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 items-start">
                    <span
                      className="text-[13px] font-bold mt-0.5 w-10 flex-shrink-0"
                      style={{ ...S.label, color: "#C8902A", letterSpacing: "0.02em" }}
                    >
                      {appt.time}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-white leading-tight">
                        {appt.client}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#7A7470" }}>
                        {appt.service}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#5A5450" }}>
                        ↳ {appt.barber}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[15px] font-bold text-white" style={S.label}>
                      {appt.price}€
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wide"
                      style={{ ...S.label, color: cfg.text, background: "rgba(0,0,0,0.4)" }}
                    >
                      {cfg.label.toUpperCase()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          <div className="h-20" />
        </div>

        {/* FAB */}
        <button
          className="absolute bottom-20 right-5 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
          style={S.goldBtnShadow}
          onClick={() => setScreen("create-appt")}
        >
          <Plus size={24} color="#0E0D0C" strokeWidth={2.5} />
        </button>

        <BottomNav />
      </div>
    );
  }

  // ── APPOINTMENT DETAIL ──────────────────────────────────────────────────────

  function ApptDetailScreen() {
    const appt = selectedAppt;
    const cfg = STATUS_CFG[appt.status as keyof typeof STATUS_CFG];

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 pt-3 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={goHome}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style={S.card}
          >
            <ArrowLeft size={16} color="#C8902A" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-white leading-tight truncate" style={S.label}>
              Detalle de cita
            </h2>
            <p className="text-[11px]" style={{ color: "#6A6460" }}>
              Sáb. 21 jun · {appt.time}
            </p>
          </div>
          <span
            className="text-[10px] px-2 py-1 rounded-full font-bold tracking-wide flex-shrink-0"
            style={{ ...S.label, color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            {cfg.label.toUpperCase()}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {/* Client */}
          <div className="rounded-2xl p-4" style={S.card}>
            <p
              className="text-[9px] uppercase tracking-widest mb-2.5"
              style={{ ...S.label, color: "#5A5450" }}
            >
              Cliente
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-[15px] font-bold text-[#0E0D0C] flex-shrink-0"
                style={{ ...S.goldBtn, ...S.label }}
              >
                {appt.client.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">{appt.client}</p>
                <p className="text-[12px]" style={{ color: "#7A7470" }}>
                  {appt.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Details 2×2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Servicio", value: appt.service },
              { label: "Barbero", value: appt.barber },
              { label: "Hora", value: appt.time },
              { label: "Precio", value: `${appt.price}€` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3" style={S.card}>
                <p
                  className="text-[9px] uppercase tracking-widest mb-1"
                  style={{ ...S.label, color: "#5A5450" }}
                >
                  {label}
                </p>
                <p
                  className={`font-bold text-white ${label === "Precio" ? "text-[18px]" : "text-[13px]"}`}
                  style={label === "Precio" ? { ...S.label, color: "#C8902A" } : {}}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Notes */}
          {appt.notes ? (
            <div className="rounded-xl p-3" style={S.card}>
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ ...S.label, color: "#5A5450" }}>
                Notas internas
              </p>
              <p className="text-[12px]" style={{ color: "#9A9490" }}>
                {appt.notes}
              </p>
            </div>
          ) : null}

          {/* Primary action */}
          <button
            className="w-full py-4 rounded-xl font-bold text-[14px] text-[#0E0D0C] flex items-center justify-center gap-2 active:opacity-90 transition-opacity mt-1"
            style={{ ...S.goldBtn, ...S.label, letterSpacing: "0.1em" }}
          >
            <Check size={17} strokeWidth={2.5} />
            Marcar como completada
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <RefreshCw size={14} />, label: "Reprogramar", color: "#C4BAB0", borderColor: "rgba(255,255,255,0.1)" },
              { icon: <AlertTriangle size={14} />, label: "No-show", color: "#f87171", borderColor: "rgba(248,113,113,0.25)" },
              { icon: <Phone size={14} />, label: "Llamar", color: "#34d399", borderColor: "rgba(52,211,153,0.25)" },
              { icon: <X size={14} />, label: "Cancelar", color: "#f87171", borderColor: "rgba(248,113,113,0.2)" },
            ].map(({ icon, label, color, borderColor }) => (
              <button
                key={label}
                className="py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
                style={{ ...S.card, ...S.label, color, border: `1px solid ${borderColor}`, letterSpacing: "0.04em" }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  // ── CREATE APPOINTMENT ─────────────────────────────────────────────────────

  function CreateApptScreen() {
    const services = ["Corte Clásico", "Corte + Barba", "Fade Bajo", "Degradado Máquina", "Afeitado Navaja", "Arreglo Barba"];
    const barbers = ["Rafa", "Luis", "Carlos"];
    const slots = ["09:00", "09:30", "10:30", "11:00", "12:00", "13:30", "16:00", "17:30"];
    const busyIdx = [2, 5];

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 pt-3 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={goHome}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={S.card}
          >
            <ArrowLeft size={16} color="#C8902A" />
          </button>
          <h2 className="text-[20px] font-bold text-white" style={S.label}>
            Nueva cita
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Client selector */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Cliente
            </p>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#5A5450" }} />
              <input
                type="text"
                placeholder="Buscar cliente o crear nuevo..."
                className="w-full pl-9 pr-4 py-3 rounded-xl text-[13px] text-white outline-none"
                style={S.inputBg}
              />
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {CLIENTS.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                  style={{
                    background: i === 0 ? "rgba(200,144,42,0.1)" : "#1A1816",
                    borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                    style={{ ...S.label, background: i === 0 ? "#C8902A" : "#2A2825", color: i === 0 ? "#0E0D0C" : "#6A6460" }}
                  >
                    {c.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: i === 0 ? "#E5A93C" : "#C4BAB0" }}>
                      {c.name}
                    </p>
                    <p className="text-[10px]" style={{ color: "#5A5450" }}>
                      {c.phone}
                    </p>
                  </div>
                  {i === 0 && <Check size={14} style={{ color: "#C8902A", flexShrink: 0 }} />}
                </div>
              ))}
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5"
                style={{ background: "#1A1816", borderTop: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#252220", border: "1px dashed rgba(200,144,42,0.4)" }}
                >
                  <UserPlus size={13} color="#C8902A" />
                </div>
                <p className="text-[12px] font-medium" style={{ color: "#C8902A" }}>
                  Crear nuevo cliente
                </p>
              </button>
            </div>
          </div>

          {/* Service */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Servicio
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((s, i) => (
                <button
                  key={s}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  style={{
                    ...S.label,
                    background: i === 1 ? "#C8902A" : "#1A1816",
                    color: i === 1 ? "#0E0D0C" : "#7A7470",
                    border: i === 1 ? "none" : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Barber */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Barbero
            </p>
            <div className="flex gap-2">
              {barbers.map((b, i) => (
                <button
                  key={b}
                  className="flex-1 py-3 rounded-xl text-[13px] font-bold transition-all"
                  style={{
                    ...S.label,
                    background: i === 0 ? "#C8902A" : "#1A1816",
                    color: i === 0 ? "#0E0D0C" : "#7A7470",
                    border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Fecha
            </p>
            <button
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[13px] text-white"
              style={S.inputBg}
            >
              <span>Sábado, 21 de junio de 2025</span>
              <ChevronDown size={14} style={{ color: "#5A5450" }} />
            </button>
          </div>

          {/* Time slots */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Hora — huecos disponibles
            </p>
            <div className="grid grid-cols-4 gap-2">
              {slots.map((h, i) => {
                const busy = busyIdx.includes(i);
                const selected = i === 4;
                return (
                  <button
                    key={h}
                    disabled={busy}
                    className="py-2.5 rounded-xl text-[11px] font-bold text-center transition-all"
                    style={{
                      ...S.label,
                      background: selected ? "#C8902A" : busy ? "#141210" : "#1A1816",
                      color: selected ? "#0E0D0C" : busy ? "#3A3430" : "#9A9490",
                      border: selected ? "none" : busy ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(255,255,255,0.07)",
                      textDecoration: busy ? "line-through" : "none",
                      opacity: busy ? 0.45 : 1,
                    }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="w-full py-4 rounded-xl font-bold text-[14px] text-[#0E0D0C] active:opacity-90 transition-opacity"
            style={{ ...S.goldBtn, ...S.label, letterSpacing: "0.12em" }}
            onClick={goHome}
          >
            Confirmar cita
          </button>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  // ── CLIENTS LIST ───────────────────────────────────────────────────────────

  function ClientsScreen() {
    const filtered = CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.phone.includes(searchQ)
    );

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-5 pt-2 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-[22px] font-bold text-white" style={S.label}>
              Clientes
            </h1>
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={S.card}
            >
              <UserPlus size={16} color="#C8902A" />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#5A5450" }} />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[13px] text-white outline-none"
              style={S.inputBg}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {filtered.map((client) => (
            <button
              key={client.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left active:opacity-75 transition-opacity"
              style={S.card}
              onClick={() => { setSelectedClient(client); setScreen("client-detail"); }}
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                style={{
                  ...S.label,
                  background: client.vip ? "linear-gradient(135deg, #C8902A, #E5A93C)" : "#252220",
                  color: client.vip ? "#0E0D0C" : "#6A6460",
                }}
              >
                {client.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-[13px] font-semibold text-white truncate">
                    {client.name}
                  </p>
                  {client.vip && (
                    <Star size={10} fill="#C8902A" color="#C8902A" style={{ flexShrink: 0 }} />
                  )}
                  {client.inactive && (
                    <span
                      className="text-[8px] px-1 py-0.5 rounded font-bold flex-shrink-0"
                      style={{ ...S.label, background: "#1F1D1B", color: "#5A5450", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      INACTIVO
                    </span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: "#5A5450" }}>
                  {client.phone}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[12px] font-bold text-white" style={S.label}>
                  {client.visits} vis.
                </p>
                <p className="text-[10px]" style={{ color: "#5A5450" }}>
                  {client.lastVisit}
                </p>
              </div>
            </button>
          ))}
          <div className="h-20" />
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── CLIENT DETAIL ──────────────────────────────────────────────────────────

  function ClientDetailScreen() {
    const c = selectedClient;
    const ticket = Math.round(c.total / c.visits);

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 pt-3 pb-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => setScreen("clients")}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={S.card}
          >
            <ArrowLeft size={16} color="#C8902A" />
          </button>
          <h2 className="text-[20px] font-bold text-white" style={S.label}>
            Ficha del cliente
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Hero */}
          <div className="flex items-center gap-4">
            <div
              className="w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[18px] font-bold flex-shrink-0"
              style={{
                ...S.label,
                background: c.vip ? "linear-gradient(135deg, #C8902A, #E5A93C)" : "#252220",
                color: c.vip ? "#0E0D0C" : "#6A6460",
              }}
            >
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[18px] font-bold text-white truncate" style={S.label}>
                  {c.name}
                </h3>
                {c.vip && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                    style={{ ...S.label, background: "rgba(200,144,42,0.15)", color: "#C8902A", border: "1px solid rgba(200,144,42,0.3)" }}
                  >
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[12px]" style={{ color: "#7A7470" }}>{c.phone}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "#5A5450" }}>
                Última visita: {c.lastVisit}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Visitas", value: c.visits.toString() },
              { label: "Gasto total", value: `${c.total}€` },
              { label: "Ticket med.", value: `${ticket}€` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={S.card}>
                <p className="text-[18px] font-bold" style={{ ...S.label, color: "#C8902A" }}>
                  {value}
                </p>
                <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ ...S.label, color: "#5A5450" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="rounded-xl p-3.5" style={S.card}>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Notas internas
            </p>
            <p className="text-[12px]" style={{ color: "#7A7470" }}>
              {c.vip
                ? "Cliente frecuente. Reserva siempre con Rafa. Tijera en laterales, máquina 0 en nuca. Trato preferente."
                : "Sin notas registradas."}
            </p>
          </div>

          {/* History */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Historial de visitas
            </p>
            <div className="flex flex-col gap-2">
              {CLIENT_HISTORY.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={S.card}
                >
                  <div>
                    <p className="text-[12px] font-semibold text-white">{h.service}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#5A5450" }}>
                      {h.date} · {h.barber}
                    </p>
                  </div>
                  <span className="text-[15px] font-bold" style={{ ...S.label, color: "#C8902A" }}>
                    {h.price}€
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              className="py-3.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5"
              style={{ ...S.card, ...S.label, color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
            >
              <Phone size={14} />
              Llamar
            </button>
            <button
              className="py-3.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 text-[#0E0D0C]"
              style={{ ...S.goldBtn, ...S.label }}
              onClick={() => setScreen("create-appt")}
            >
              <Plus size={14} color="#0E0D0C" strokeWidth={2.5} />
              Nueva cita
            </button>
          </div>
          <div className="h-4" />
        </div>
      </div>
    );
  }

  // ── CAJA ──────────────────────────────────────────────────────────────────

  function CajaScreen() {
    const total = CAJA_TXS.reduce((s, t) => s + t.amount, 0);
    const efectivo = CAJA_TXS.filter((t) => t.method === "efectivo").reduce((s, t) => s + t.amount, 0);
    const tarjeta = CAJA_TXS.filter((t) => t.method === "tarjeta").reduce((s, t) => s + t.amount, 0);
    const bizum = CAJA_TXS.filter((t) => t.method === "bizum").reduce((s, t) => s + t.amount, 0);

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-5 pt-2 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <h1 className="text-[22px] font-bold text-white" style={S.label}>
            Caja del día
          </h1>
          <p className="text-[11px]" style={{ color: "#6A6460" }}>
            Sábado, 21 de junio de 2025
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {/* Total hero */}
          <div
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, #1C1810, #231F12)",
              border: "1px solid rgba(200,144,42,0.2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div>
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ ...S.label, color: "#8A7040" }}>
                Total del día
              </p>
              <p className="text-[42px] font-bold text-white leading-none" style={S.label}>
                {total}€
              </p>
              <p className="text-[11px] mt-2" style={{ color: "#6A6460" }}>
                {CAJA_TXS.length} cobros · {APPTS.filter((a) => a.status !== "no-show").length} servicios
              </p>
            </div>
            <TrendingUp size={44} color="#C8902A" strokeWidth={1.2} opacity={0.5} />
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Efectivo", value: efectivo, icon: <Banknote size={15} />, color: "#34d399" },
              { label: "Tarjeta", value: tarjeta, icon: <CreditCard size={15} />, color: "#60a5fa" },
              { label: "Bizum", value: bizum, icon: <Smartphone size={15} />, color: "#c084fc" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={S.card}>
                <div className="flex justify-center mb-1.5" style={{ color }}>
                  {icon}
                </div>
                <p className="text-[17px] font-bold text-white" style={S.label}>
                  {value}€
                </p>
                <p className="text-[8px] uppercase tracking-widest mt-0.5" style={{ ...S.label, color: "#5A5450" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ ...S.label, color: "#5A5450" }}>
              Cobros del día
            </p>
            <div className="flex flex-col gap-2">
              {CAJA_TXS.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={S.card}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#252220" }}
                    >
                      {payIcon(tx.method)}
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-white">{tx.client}</p>
                      <p className="text-[10px]" style={{ color: "#5A5450" }}>
                        {tx.service} · {tx.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold text-white" style={S.label}>
                    {tx.amount}€
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 mt-1"
            style={{ ...S.card, ...S.label, color: "#5A5450", borderStyle: "dashed", letterSpacing: "0.08em" }}
          >
            Exportar resumen del día
          </button>
          <div className="h-20" />
        </div>

        <BottomNav />
      </div>
    );
  }

  // ── STATS ──────────────────────────────────────────────────────────────────

  function StatsScreen() {
    const metrics = [
      { label: "Ingresos mes", value: "2.847€", sub: "+12% vs. mes ant.", pos: true },
      { label: "Ocupación", value: "78%", sub: "L–S, todos los barberos", pos: true },
      { label: "Tasa no-show", value: "6,3%", sub: "−2pp vs. mes ant.", pos: true },
      { label: "Top servicio", value: "Corte+Barba", sub: "34% de las citas", pos: null },
    ];

    const barbers = [
      { name: "Rafa", amount: 1124, pct: 39 },
      { name: "Luis", amount: 948, pct: 33 },
      { name: "Carlos", amount: 775, pct: 27 },
    ];

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="px-5 pt-2 pb-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <h1 className="text-[22px] font-bold text-white" style={S.label}>
            Estadísticas
          </h1>
          <p className="text-[11px]" style={{ color: "#6A6460" }}>
            Junio 2025
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-2">
            {metrics.map(({ label, value, sub, pos }) => (
              <div key={label} className="rounded-xl p-3.5" style={S.card}>
                <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ ...S.label, color: "#5A5450" }}>
                  {label}
                </p>
                <p
                  className="text-[20px] font-bold leading-tight"
                  style={{ ...S.label, color: "#C8902A" }}
                >
                  {value}
                </p>
                <p
                  className="text-[10px] mt-1"
                  style={{
                    color:
                      pos === true ? "#34d399" : pos === false ? "#f87171" : "#6A6460",
                  }}
                >
                  {sub}
                </p>
              </div>
            ))}
          </div>

          {/* Weekly bar chart */}
          <div className="rounded-xl p-4" style={S.card}>
            <p className="text-[9px] uppercase tracking-widest mb-4" style={{ ...S.label, color: "#5A5450" }}>
              Ingresos esta semana
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={WEEKLY} barSize={22} margin={{ top: 0, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6A6460", fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6A6460", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#252220",
                    border: "1px solid rgba(200,144,42,0.25)",
                    borderRadius: 10,
                    color: "#F0EDE8",
                    fontSize: 12,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                  formatter={(v: number) => [`${v}€`, "Ingresos"]}
                  cursor={{ fill: "rgba(200,144,42,0.06)" }}
                />
                <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                  {WEEKLY.map((entry, i) => (
                    <Cell key={`weekly-cell-${entry.day}`} fill={i === 5 ? "#C8902A" : "#2A2520"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Barber breakdown */}
          <div className="rounded-xl p-4" style={S.card}>
            <p className="text-[9px] uppercase tracking-widest mb-3" style={{ ...S.label, color: "#5A5450" }}>
              Ingresos por barbero — junio
            </p>
            {barbers.map(({ name, amount, pct }) => (
              <div key={name} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-white font-medium">{name}</span>
                  <span className="text-[13px] font-bold text-white" style={S.label}>
                    {amount}€
                    <span className="text-[10px] font-normal ml-1.5" style={{ color: "#5A5450" }}>
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#252220" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: "linear-gradient(90deg, #C8902A, #E5A93C)",
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Occupation by day */}
          <div className="rounded-xl p-4" style={S.card}>
            <p className="text-[9px] uppercase tracking-widest mb-3" style={{ ...S.label, color: "#5A5450" }}>
              Ocupación por día de la semana
            </p>
            <div className="flex items-end justify-between gap-1">
              {[
                { day: "L", pct: 72 },
                { day: "M", pct: 58 },
                { day: "X", pct: 85 },
                { day: "J", pct: 66 },
                { day: "V", pct: 91 },
                { day: "S", pct: 100 },
              ].map(({ day, pct }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold" style={{ ...S.label, color: "#C8902A" }}>
                    {pct}%
                  </span>
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${(pct / 100) * 48}px`,
                      background: pct >= 90 ? "linear-gradient(180deg, #C8902A, #A0702A)" : "#252220",
                    }}
                  />
                  <span className="text-[9px]" style={{ ...S.label, color: "#5A5450" }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-20" />
        </div>

        <BottomNav />
      </div>
    );
  }
}
