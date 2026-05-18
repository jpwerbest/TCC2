import { useState, useEffect, useCallback, useRef } from "react";

const API = "http://localhost:8080/api";
const WHISPER_API = "http://localhost:5000/transcribe";

// ─── HOOK: GRAVAÇÃO DE VOZ ─────────────────────────────────────
function useVoiceRecorder(onTranscript) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const mrRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording() {
    setVoiceError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mrRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setTranscribing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await fetch(WHISPER_API, { method: "POST", body: fd });
          if (!res.ok) throw new Error("Serviço de transcrição indisponível");
          const data = await res.json();
          if (data.text) onTranscript(data.text.trim());
          else throw new Error(data.error || "Transcrição vazia");
        } catch (err) {
          setVoiceError(err.message);
        } finally {
          setTranscribing(false);
        }
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      setVoiceError("Microfone indisponível: " + err.message);
    }
  }

  function stopRecording() {
    mrRef.current?.stop();
    setRecording(false);
  }

  return { recording, transcribing, voiceError, startRecording, stopRecording };
}

const palette = {
  navy: "#0D1B2A",
  teal: "#0F7173",
  tealLight: "#E1F5EE",
  tealMid: "#1D9E75",
  sand: "#F5F0E8",
  sandDark: "#E8E0D0",
  ink: "#1A1A2E",
  muted: "#6B7280",
  danger: "#A32D2D",
  dangerLight: "#FCEBEB",
  success: "#3B6D11",
  successLight: "#EAF3DE",
  amber: "#BA7517",
  amberLight: "#FAEEDA",
  white: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
};

const styles = {
  app: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: palette.sand,
    minHeight: "100vh",
    color: palette.ink,
  },
  // LOGIN
  loginWrap: {
    minHeight: "100vh",
    display: "flex",
    background: `linear-gradient(135deg, ${palette.navy} 0%, #1a3a5c 50%, ${palette.teal} 100%)`,
    position: "relative",
    overflow: "hidden",
  },
  loginLeft: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "4rem",
    color: palette.white,
    position: "relative",
    zIndex: 1,
  },
  loginRight: {
    width: "480px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(12px)",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
  },
  loginCard: {
    width: "100%",
    background: palette.white,
    borderRadius: "20px",
    padding: "2.5rem",
    boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
  },
  loginTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: palette.navy,
    marginBottom: "0.25rem",
  },
  loginSub: {
    fontSize: "0.875rem",
    color: palette.muted,
    marginBottom: "2rem",
  },
  inputGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.4rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: `1.5px solid ${palette.sandDark}`,
    borderRadius: "10px",
    fontSize: "0.95rem",
    color: palette.ink,
    background: palette.sand,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  btnPrimary: {
    width: "100%",
    padding: "0.85rem",
    background: palette.teal,
    color: palette.white,
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    marginTop: "0.5rem",
  },
  errorBox: {
    background: palette.dangerLight,
    color: palette.danger,
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    border: `1px solid #F09595`,
  },
  // SIDEBAR
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: palette.navy,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarLogo: {
    padding: "2rem 1.5rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  logoMark: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: palette.white,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  navSection: {
    padding: "1.5rem 0.75rem",
    flex: 1,
  },
  navLabel: {
    fontSize: "0.65rem",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.3)",
    padding: "0 0.75rem",
    marginBottom: "0.5rem",
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.65rem 0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    color: active ? palette.white : "rgba(255,255,255,0.55)",
    background: active ? "rgba(255,255,255,0.1)" : "transparent",
    fontSize: "0.9rem",
    fontWeight: active ? "600" : "400",
    marginBottom: "2px",
    transition: "all 0.15s",
    border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
  }),
  navIcon: {
    fontSize: "1.1rem",
    width: "20px",
    textAlign: "center",
  },
  sidebarFooter: {
    padding: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.07)",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
  },
  avatar: (role) => ({
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: role === "MEDICO" ? palette.teal : "#533AB7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: palette.white,
    flexShrink: 0,
  }),
  userName: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: palette.white,
  },
  userRole: {
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem",
    marginLeft: "auto",
  },
  // MAIN
  main: {
    marginLeft: "240px",
    minHeight: "100vh",
    padding: "2rem 2.5rem",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: palette.navy,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: "0.875rem",
    color: palette.muted,
    marginTop: "0.2rem",
  },
  // CARDS & METRICS
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  metricCard: (color) => ({
    background: palette.white,
    borderRadius: "14px",
    padding: "1.25rem 1.5rem",
    border: `1px solid ${palette.border}`,
    borderLeft: `4px solid ${color}`,
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  }),
  metricIcon: (color) => ({
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: color + "18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
    fontSize: "1.3rem",
    flexShrink: 0,
  }),
  metricValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: palette.navy,
    lineHeight: 1,
  },
  metricLabel: {
    fontSize: "0.75rem",
    color: palette.muted,
    marginTop: "0.2rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  // TABLE
  tableCard: {
    background: palette.white,
    borderRadius: "14px",
    border: `1px solid ${palette.border}`,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.25rem 1.5rem",
    borderBottom: `1px solid ${palette.border}`,
  },
  tableTitle: {
    fontWeight: "600",
    fontSize: "1rem",
    color: palette.navy,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem 1.5rem",
    fontSize: "0.72rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: palette.muted,
    borderBottom: `1px solid ${palette.border}`,
    background: palette.sand,
  },
  td: {
    padding: "1rem 1.5rem",
    fontSize: "0.9rem",
    borderBottom: `1px solid ${palette.border}`,
    color: palette.ink,
    verticalAlign: "middle",
  },
  // BADGES
  badge: (type) => {
    const map = {
      AGENDADA: { bg: palette.amberLight, color: palette.amber, text: "Agendada" },
      REALIZADA: { bg: palette.successLight, color: palette.success, text: "Realizada" },
      CANCELADA: { bg: palette.dangerLight, color: palette.danger, text: "Cancelada" },
      MEDICO: { bg: palette.tealLight, color: palette.tealMid, text: "Médico" },
      ASSISTENTE: { bg: "#EEEDFE", color: "#534AB7", text: "Assistente" },
    };
    const m = map[type] || { bg: palette.sandDark, color: palette.muted, text: type };
    return {
      display: "inline-block",
      padding: "0.25rem 0.65rem",
      borderRadius: "6px",
      background: m.bg,
      color: m.color,
      fontSize: "0.75rem",
      fontWeight: "600",
    };
  },
  // BUTTONS
  btnSm: (variant = "default") => {
    const map = {
      default: { bg: palette.sand, color: palette.ink, border: palette.sandDark },
      primary: { bg: palette.teal, color: palette.white, border: palette.teal },
      danger: { bg: palette.dangerLight, color: palette.danger, border: "#F09595" },
    };
    const v = map[variant];
    return {
      padding: "0.4rem 0.9rem",
      borderRadius: "7px",
      border: `1px solid ${v.border}`,
      background: v.bg,
      color: v.color,
      fontSize: "0.82rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "opacity 0.15s",
    };
  },
  // MODAL
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(13,27,42,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: palette.white,
    borderRadius: "20px",
    padding: "2rem",
    width: "520px",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: palette.navy,
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formGrid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  formActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: `1px solid ${palette.border}`,
  },
  searchInput: {
    padding: "0.5rem 1rem",
    border: `1.5px solid ${palette.sandDark}`,
    borderRadius: "8px",
    fontSize: "0.875rem",
    outline: "none",
    background: palette.sand,
    width: "220px",
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    color: palette.muted,
  },
};

// ─── COMPONENTS ───────────────────────────────────────────────
function Badge({ type }) {
  const s = styles.badge(type);
  const labels = {
    AGENDADA: "Agendada", REALIZADA: "Realizada", CANCELADA: "Cancelada",
    MEDICO: "Médico", ASSISTENTE: "Assistente",
  };
  return <span style={s}>{labels[type] || type}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalTitle}>
          {title}
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: palette.muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={styles.inputGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <input style={styles.input} {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={styles.inputGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <select style={{ ...styles.input, appearance: "none" }} {...props}>{children}</select>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={styles.inputGroup}>
      {label && <label style={styles.label}>{label}</label>}
      <textarea style={{ ...styles.input, minHeight: "90px", resize: "vertical" }} {...props} />
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!res.ok) throw new Error("E-mail ou senha inválidos.");
      const data = await res.json();
      localStorage.setItem("mc_token", data.token);
      localStorage.setItem("mc_user", JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.loginWrap}>
      <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", top: "-200px", left: "-200px" }} />
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", top: "-100px", left: "-100px" }} />

      <div style={styles.loginLeft}>
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏥</div>
          <div style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Medi<span style={{ color: palette.teal }}>Clinic</span>
          </div>
          <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
            Sistema de Gestão Médica
          </div>
        </div>
        <div style={{ maxWidth: "380px" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "300", marginBottom: "1rem", lineHeight: 1.4 }}>
            Cuidado com<br /><strong style={{ fontWeight: "700" }}>excelência e precisão</strong>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            Gerencie pacientes, consultas e prontuários de forma integrada e segura.
          </p>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: "2rem" }}>
            {[["Pacientes", "Cadastro completo"], ["Consultas", "Agendamento fácil"], ["Prontuários", "Registro clínico"]].map(([t, s]) => (
              <div key={t}>
                <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>{t}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.loginRight}>
        <div style={styles.loginCard}>
          <div style={styles.loginTitle}>Bem-vindo de volta</div>
          <div style={styles.loginSub}>Faça login para acessar o sistema</div>
          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleLogin}>
            <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            <Input label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••" required />
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? "Entrando..." : "Entrar no sistema →"}
            </button>
          </form>
          <div style={{ marginTop: "1.5rem", background: palette.sand, borderRadius: "10px", padding: "0.875rem 1rem", fontSize: "0.8rem", color: palette.muted }}>
            <strong style={{ color: palette.ink }}>Contas de teste:</strong><br />
            🩺 medico@clinic.com / 123456<br />
            📋 assistente@clinic.com / 123456
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────
function Sidebar({ user, activePage, onNavigate, onLogout }) {
  const isMedico = user.role === "MEDICO";
  const initials = user.nome.split(" ").map(w => w[0]).slice(0, 2).join("");

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "agenda", icon: "🗓️", label: "Agenda" },
    { id: "consultas", icon: "📅", label: "Consultas" },
    { id: "pacientes", icon: "👥", label: "Pacientes" },
    { id: "prontuarios", icon: "📋", label: "Prontuários", locked: !isMedico },
  ];

  return (
    <nav style={styles.sidebar}>
      <div style={styles.sidebarLogo}>
        <div style={styles.logoMark}>MediClinic</div>
        <div style={styles.logoSub}>Sistema Médico</div>
      </div>
      <div style={styles.navSection}>
        <div style={styles.navLabel}>Menu principal</div>
        {navItems.map(item => (
          <div key={item.id} style={{
            ...styles.navItem(activePage === item.id),
            opacity: item.locked ? 0.45 : 1,
          }} onClick={() => onNavigate(item.id)}>
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.locked && <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>🔒</span>}
          </div>
        ))}
      </div>
      <div style={styles.sidebarFooter}>
        <div style={styles.userChip}>
          <div style={styles.avatar(user.role)}>{initials}</div>
          <div>
            <div style={styles.userName}>{user.nome}</div>
            <div style={styles.userRole}>{user.role === "MEDICO" ? "Médico" : "Assistente"}</div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout} title="Sair">⎋</button>
        </div>
      </div>
    </nav>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard({ consultas, pacientes, user }) {
  const hoje = new Date().toDateString();
  const agendadas = consultas.filter(c => c.status === "AGENDADA").length;
  const realizadas = consultas.filter(c => c.status === "REALIZADA").length;
  const canceladas = consultas.filter(c => c.status === "CANCELADA").length;
  const hoje_consultas = consultas.filter(c => new Date(c.dataHora).toDateString() === hoje).length;

  const proximas = [...consultas]
    .filter(c => c.status === "AGENDADA" && new Date(c.dataHora) > new Date())
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))
    .slice(0, 5);

  const isMedico = user.role === "MEDICO";

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>Olá, {user.nome.split(" ")[0]} 👋</div>
          <div style={styles.pageSubtitle}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard icon="📅" label="Hoje" value={hoje_consultas} color={palette.teal} />
        <MetricCard icon="⏳" label="Agendadas" value={agendadas} color={palette.amber} />
        <MetricCard icon="✅" label="Realizadas" value={realizadas} color={palette.success} />
        {isMedico && <MetricCard icon="👥" label="Pacientes" value={pacientes.length} color="#534AB7" />}
        {!isMedico && <MetricCard icon="❌" label="Canceladas" value={canceladas} color={palette.danger} />}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitle}>Próximas consultas</div>
        </div>
        {proximas.length === 0 ? (
          <div style={styles.emptyState}>Nenhuma consulta agendada.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Paciente</th>
                <th style={styles.th}>Data & Hora</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {proximas.map(c => (
                <tr key={c.id}>
                  <td style={styles.td}><strong>{c.paciente?.nomeCompleto || "—"}</strong></td>
                  <td style={styles.td}>{new Date(c.dataHora).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td style={styles.td}><Badge type={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <div style={styles.metricCard(color)}>
      <div style={styles.metricIcon(color)}><span style={{ fontSize: "1.3rem" }}>{icon}</span></div>
      <div>
        <div style={styles.metricValue}>{value}</div>
        <div style={styles.metricLabel}>{label}</div>
      </div>
    </div>
  );
}

// ─── CONSULTAS ────────────────────────────────────────────────
function ConsultasPage({ consultas, pacientes, user, token, onRefresh }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); 
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ pacienteId: "", dataHora: "", status: "AGENDADA", observacoesAgendamento: "" });
  const [prontuario, setProntuario] = useState("");
  const [loading, setLoading] = useState(false);

  const isMedico = user.role === "MEDICO";

  const filtered = consultas.filter(c => {
    const nome = c.paciente?.nomeCompleto?.toLowerCase() || "";
    return (!search || nome.includes(search.toLowerCase())) &&
      (!filterStatus || c.status === filterStatus);
  });

  function openNew() {
    setForm({ pacienteId: pacientes[0]?.id || "", dataHora: "", status: "AGENDADA", observacoesAgendamento: "" });
    setSelected(null);
    setModal("new");
  }

  function openEdit(c) {
    setSelected(c);
    setForm({
      pacienteId: c.paciente?.id || "",
      dataHora: c.dataHora?.slice(0, 16) || "",
      status: c.status,
      observacoesAgendamento: c.observacoesAgendamento || "",
    });
    setModal("edit");
  }

  function openProntuario(c) {
    setSelected(c);
    setProntuario(c.registroAtendimento || "");
    setModal("prontuario");
  }

  async function handleSave() {
  setLoading(true);
  const body = modal === "edit" && selected
    ? {
        ...selected,
        paciente: { id: Number(form.pacienteId) },
        dataHora: form.dataHora,
        status: form.status,
        observacoesAgendamento: form.observacoesAgendamento,
      }
    : {
        paciente: { id: Number(form.pacienteId) },
        dataHora: form.dataHora,
        status: form.status,
        observacoesAgendamento: form.observacoesAgendamento,
      };
  try {
    const url = modal === "edit" && selected
      ? `${API}/consultas/${selected.id}`
      : `${API}/consultas`;
    const method = modal === "edit" && selected ? "PUT" : "POST";
    const res = await fetch(url, { 
      method, 
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      }, 
      body: JSON.stringify(body) 
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Erro desconhecido no servidor");
    }

    onRefresh();
    setModal(null);
  } catch (err) {
    alert("Erro ao salvar: " + err.message); // Isso te dirá o problema real
  } finally {
    setLoading(false);
  }
}

  async function handleSaveProntuario() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/consultas/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...selected, registroAtendimento: prontuario }),
      });
      if (!res.ok) throw new Error("Erro ao salvar prontuário");
      onRefresh();
      setModal(null);
    } catch (e) {
      alert("Falha ao salvar: " + e.message);
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Excluir esta consulta?")) return;
    await fetch(`${API}/consultas/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    onRefresh();
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>Consultas</div>
          <div style={styles.pageSubtitle}>{filtered.length} registro(s)</div>
        </div>
        <button style={styles.btnSm("primary")} onClick={openNew}>+ Agendar consulta</button>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <input style={styles.searchInput} placeholder="Buscar por paciente..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...styles.searchInput, width: "160px" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option value="AGENDADA">Agendada</option>
          <option value="REALIZADA">Realizada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      <div style={styles.tableCard}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>Nenhuma consulta encontrada.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Paciente</th>
                <th style={styles.th}>Data & Hora</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Observações</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ transition: "background 0.1s" }}>
                  <td style={styles.td}><strong>{c.paciente?.nomeCompleto || "—"}</strong></td>
                  <td style={styles.td}>{c.dataHora ? new Date(c.dataHora).toLocaleString("pt-BR") : "—"}</td>
                  <td style={styles.td}><Badge type={c.status} /></td>
                  <td style={{ ...styles.td, color: palette.muted, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.observacoesAgendamento || "—"}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button style={styles.btnSm()} onClick={() => openEdit(c)}>Editar</button>
                      {isMedico && <button style={styles.btnSm()} onClick={() => openProntuario(c)}>Prontuário</button>}
                      <button style={styles.btnSm("danger")} onClick={() => handleDelete(c.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === "new" || modal === "edit") && (
        <Modal title={modal === "new" ? "Nova Consulta" : "Editar Consulta"} onClose={() => setModal(null)}>
          <Select label="Paciente" value={form.pacienteId} onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
          </Select>
          <Input label="Data e Hora" type="datetime-local" value={form.dataHora} onChange={e => setForm({ ...form, dataHora: e.target.value })} />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="AGENDADA">Agendada</option>
            <option value="REALIZADA">Realizada</option>
            <option value="CANCELADA">Cancelada</option>
          </Select>
          <Textarea label="Observações" value={form.observacoesAgendamento} onChange={e => setForm({ ...form, observacoesAgendamento: e.target.value })} placeholder="Observações sobre o agendamento..." />
          <div style={styles.formActions}>
            <button style={styles.btnSm()} onClick={() => setModal(null)}>Cancelar</button>
            <button style={styles.btnSm("primary")} onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </Modal>
      )}

      {modal === "prontuario" && (
        <Modal title={`Prontuário — ${selected?.paciente?.nomeCompleto}`} onClose={() => setModal(null)}>
          <div style={{ ...styles.inputGroup }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <label style={styles.label}>Registro de atendimento</label>
              <VoiceButton
                compact
                onTranscript={txt => setProntuario(prev => prev ? prev + " " + txt : txt)}
              />
            </div>
            <textarea
              style={{ ...styles.input, minHeight: "200px", resize: "vertical", fontFamily: "monospace", fontSize: "0.875rem" }}
              value={prontuario}
              onChange={e => setProntuario(e.target.value)}
              placeholder="Descreva o atendimento realizado, diagnóstico, prescrições... (ou use 🎙 para gravar)"
            />
          </div>
          <div style={styles.formActions}>
            <button style={styles.btnSm()} onClick={() => setModal(null)}>Cancelar</button>
            <button style={styles.btnSm("primary")} onClick={handleSaveProntuario} disabled={loading}>{loading ? "Salvando..." : "Salvar prontuário"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PACIENTES ────────────────────────────────────────────────
function PacientesPage({ pacientes, consultas, token, onRefresh, user }) {
  const isMedico = user?.role === "MEDICO";
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ nomeCompleto: "", cpf: "", telefone: "", email: "", dataNascimento: "", observacoes: "" });
  const [loading, setLoading] = useState(false);

  const filtered = pacientes.filter(p =>
    !search ||
    p.nomeCompleto?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search)
  );

  function openNew() {
    setForm({ nomeCompleto: "", cpf: "", telefone: "", email: "", dataNascimento: "", observacoes: "" });
    setSelected(null);
    setModal("form");
  }

  function openEdit(p) {
    setSelected(p);
    setForm({ nomeCompleto: p.nomeCompleto || "", cpf: p.cpf || "", telefone: p.telefone || "", email: p.email || "", dataNascimento: p.dataNascimento || "", observacoes: p.observacoes || "" });
    setModal("form");
  }

  function openHistorico(p) {
    setSelected(p);
    setModal("historico");
  }

  async function handleSave() {
    setLoading(true);
    try {
      if (!selected) {
        await fetch(`${API}/pacientes`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      } else {
        await fetch(`${API}/pacientes/${selected.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      }
      onRefresh();
      setModal(null);
    } catch { }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Excluir este paciente? Isso pode afetar consultas vinculadas.")) return;
    await fetch(`${API}/pacientes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    onRefresh();
  }

  const historicoPaciente = selected
    ? consultas.filter(c => c.paciente?.id === selected.id).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
    : [];

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>Pacientes</div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={styles.pageSubtitle}>{filtered.length} cadastrado(s)</div>
            {!isMedico && (
              <span style={{ ...styles.badge("ASSISTENTE"), fontSize: "0.7rem" }}>
                👁️ Somente visualização
              </span>
            )}
          </div>
        </div>
        {isMedico && (
          <button style={styles.btnSm("primary")} onClick={openNew}>+ Novo paciente</button>
        )}
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <input style={styles.searchInput} placeholder="Buscar por nome ou CPF..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={styles.tableCard}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>Nenhum paciente encontrado.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>CPF</th>
                <th style={styles.th}>Telefone</th>
                <th style={styles.th}>E-mail</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: palette.tealLight, color: palette.tealMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "700", flexShrink: 0 }}>
                        {p.nomeCompleto?.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <strong>{p.nomeCompleto}</strong>
                    </div>
                  </td>
                  <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "0.85rem" }}>{p.cpf || "—"}</td>
                  <td style={styles.td}>{p.telefone || "—"}</td>
                  <td style={{ ...styles.td, color: palette.teal }}>{p.email || "—"}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button style={styles.btnSm()} onClick={() => openHistorico(p)}>Ver dados</button>
                      {isMedico && <>
                        <button style={styles.btnSm()} onClick={() => openEdit(p)}>Editar</button>
                        <button style={styles.btnSm("danger")} onClick={() => handleDelete(p.id)}>✕</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "form" && isMedico && (
        <Modal title={selected ? "Editar Paciente" : "Novo Paciente"} onClose={() => setModal(null)}>
          <div style={styles.formGrid2}>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Nome completo" value={form.nomeCompleto} onChange={e => setForm({ ...form, nomeCompleto: e.target.value })} />
            </div>
            <Input label="CPF" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            <Input label="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(85) 9 9999-0000" />
            <Input label="E-mail" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="paciente@email.com" />
            <Input label="Data de nascimento" type="date" value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Textarea label="Observações clínicas" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} placeholder="Alergias, condições pré-existentes..." />
            </div>
          </div>
          <div style={styles.formActions}>
            <button style={styles.btnSm()} onClick={() => setModal(null)}>Cancelar</button>
            <button style={styles.btnSm("primary")} onClick={handleSave} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </Modal>
      )}

      {modal === "historico" && selected && (
        <Modal title={`Dados — ${selected.nomeCompleto}`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {selected.dataNascimento && <span style={styles.badge("AGENDADA")}>📅 {new Date(selected.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR")}</span>}
            {selected.cpf && <span style={{ ...styles.badge("MEDICO"), fontFamily: "monospace" }}>{selected.cpf}</span>}
            {selected.telefone && <span style={styles.badge("MEDICO")}>{selected.telefone}</span>}
          </div>
          {selected.email && (
            <div style={{ marginBottom: "0.75rem", fontSize: "0.875rem", color: palette.teal }}>{selected.email}</div>
          )}
          {selected.observacoes && (
            <div style={{ background: palette.sand, borderRadius: "8px", padding: "0.875rem", fontSize: "0.875rem", color: palette.muted, marginBottom: "1rem" }}>
              <strong style={{ color: palette.ink }}>Observações:</strong><br />{selected.observacoes}
            </div>
          )}
          <div style={{ fontWeight: "600", marginBottom: "0.75rem", color: palette.navy }}>
            Consultas ({historicoPaciente.length})
          </div>
          {historicoPaciente.length === 0 ? (
            <div style={styles.emptyState}>Nenhuma consulta registrada.</div>
          ) : (
            historicoPaciente.map(c => (
              <div key={c.id} style={{ padding: "0.875rem", borderRadius: "10px", border: `1px solid ${palette.border}`, marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <strong style={{ fontSize: "0.875rem" }}>{new Date(c.dataHora).toLocaleString("pt-BR")}</strong>
                  <Badge type={c.status} />
                </div>
                {c.observacoesAgendamento && <div style={{ fontSize: "0.8rem", color: palette.muted, marginTop: "0.4rem" }}>{c.observacoesAgendamento}</div>}
              </div>
            ))
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── ACESSO NEGADO ────────────────────────────────────────────
function AcessoNegado() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: "360px" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: palette.dangerLight, color: palette.danger,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem", margin: "0 auto 1.5rem",
          border: `2px solid #F09595`,
        }}>🔒</div>
        <div style={{ fontSize: "1.25rem", fontWeight: "700", color: palette.navy, marginBottom: "0.5rem" }}>
          Acesso restrito
        </div>
        <div style={{ fontSize: "0.9rem", color: palette.muted, lineHeight: 1.6 }}>
          Os prontuários são acessíveis apenas para médicos. Entre em contato com o médico responsável para visualizar o histórico clínico do paciente.
        </div>
        <div style={{
          marginTop: "1.5rem", padding: "0.875rem 1rem",
          background: palette.amberLight, borderRadius: "10px",
          fontSize: "0.8rem", color: palette.amber, fontWeight: "600",
        }}>
          Perfil atual: Assistente
        </div>
      </div>
    </div>
  );
}

// ─── AGENDA ───────────────────────────────────────────────────
function AgendaPage({ consultas, pacientes, user, token, onRefresh }) {
  const hoje = new Date();
  const [semanaOffset, setSemanaOffset] = useState(0);

  function getSegundaFeira(date, offset = 0) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const segunda = getSegundaFeira(hoje, semanaOffset);
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });

  const nomesDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const horasVisiveis = Array.from({ length: 11 }, (_, i) => i + 7); 

  function consultasNoDia(dia) {
    return consultas.filter(c => {
      if (!c.dataHora) return false;
      const cd = new Date(c.dataHora);
      return cd.getFullYear() === dia.getFullYear() &&
        cd.getMonth() === dia.getMonth() &&
        cd.getDate() === dia.getDate();
    }).sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
  }

  function isHoje(d) {
    return d.toDateString() === hoje.toDateString();
  }

  const statusBg = {
    AGENDADA: { bg: palette.amberLight, border: palette.amber, text: palette.amber },
    REALIZADA: { bg: palette.tealLight, border: palette.tealMid, text: palette.tealMid },
    CANCELADA: { bg: palette.dangerLight, border: palette.danger, text: palette.danger },
  };

  const labelSemana = semanaOffset === 0
    ? "Esta semana"
    : semanaOffset === 1 ? "Próxima semana"
    : semanaOffset === -1 ? "Semana passada"
    : `${segunda.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} – ${diasSemana[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <div style={styles.pageTitle}>Agenda</div>
          <div style={styles.pageSubtitle}>{labelSemana}</div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button style={styles.btnSm()} onClick={() => setSemanaOffset(o => o - 1)}>← Anterior</button>
          <button style={styles.btnSm(semanaOffset === 0 ? "primary" : "default")} onClick={() => setSemanaOffset(0)}>Hoje</button>
          <button style={styles.btnSm()} onClick={() => setSemanaOffset(o => o + 1)}>Próxima →</button>
        </div>
      </div>

      <div style={{ ...styles.tableCard, overflow: "hidden" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "64px repeat(7, 1fr)",
          borderBottom: `1px solid ${palette.border}`,
          background: palette.sand,
        }}>
          <div style={{ padding: "0.75rem", borderRight: `1px solid ${palette.border}` }} />
          {diasSemana.map((dia, i) => (
            <div key={i} style={{
              padding: "0.75rem 0.5rem",
              textAlign: "center",
              borderRight: i < 6 ? `1px solid ${palette.border}` : "none",
              background: isHoje(dia) ? palette.tealLight : "transparent",
            }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: isHoje(dia) ? palette.tealMid : palette.muted, fontWeight: "600" }}>
                {nomesDias[i]}
              </div>
              <div style={{
                fontSize: "1.1rem", fontWeight: "700",
                color: isHoje(dia) ? palette.teal : palette.navy,
                marginTop: "0.1rem",
              }}>
                {dia.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div style={{ overflowY: "auto", maxHeight: "520px" }}>
          {horasVisiveis.map(hora => (
            <div key={hora} style={{
              display: "grid",
              gridTemplateColumns: "64px repeat(7, 1fr)",
              borderBottom: `1px solid ${palette.border}`,
              minHeight: "72px",
            }}>
              <div style={{
                padding: "0.5rem 0.75rem",
                fontSize: "0.72rem", color: palette.muted, fontWeight: "600",
                borderRight: `1px solid ${palette.border}`,
                paddingTop: "0.4rem",
                background: palette.sand,
              }}>
                {String(hora).padStart(2, "0")}:00
              </div>

              {diasSemana.map((dia, di) => {
                const consultasDaHora = consultasNoDia(dia).filter(c => {
                  const h = new Date(c.dataHora).getHours();
                  return h === hora;
                });
                return (
                  <div key={di} style={{
                    padding: "4px",
                    borderRight: di < 6 ? `1px solid ${palette.border}` : "none",
                    background: isHoje(dia) ? "#f0faf7" : "transparent",
                    verticalAlign: "top",
                  }}>
                    {consultasDaHora.map(c => {
                      const s = statusBg[c.status] || statusBg.AGENDADA;
                      const min = new Date(c.dataHora).getMinutes();
                      return (
                        <div key={c.id} style={{
                          background: s.bg,
                          borderLeft: `3px solid ${s.border}`,
                          borderRadius: "6px",
                          padding: "4px 6px",
                          marginBottom: "3px",
                          cursor: "default",
                        }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: "700", color: s.text }}>
                            {String(hora).padStart(2, "0")}:{String(min).padStart(2, "0")}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: palette.navy, fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.paciente?.nomeCompleto?.split(" ")[0] || "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center" }}>
        <span style={{ fontSize: "0.78rem", color: palette.muted }}>Legenda:</span>
        {[["AGENDADA", "Agendada"], ["REALIZADA", "Realizada"], ["CANCELADA", "Cancelada"]].map(([k, label]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: statusBg[k].bg, border: `1.5px solid ${statusBg[k].border}` }} />
            <span style={{ fontSize: "0.78rem", color: palette.muted }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRONTUÁRIOS ──────────────────────────────────────────────
function VoiceButton({ onTranscript, compact = false }) {
  const { recording, transcribing, voiceError, startRecording, stopRecording } = useVoiceRecorder(onTranscript);

  if (transcribing) return (
    <button disabled style={{ ...styles.btnSm(), opacity: 0.7, minWidth: compact ? "auto" : "130px" }}>
      ⏳ Transcrevendo...
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <button
        style={{
          ...styles.btnSm(recording ? "danger" : "default"),
          minWidth: compact ? "auto" : "130px",
          background: recording ? "#A32D2D" : undefined,
          color: recording ? "#fff" : undefined,
        }}
        onClick={recording ? stopRecording : startRecording}
      >
        {recording ? "⏹ Parar" : "🎙 Gravar voz"}
      </button>
      {voiceError && (
        <div style={{ fontSize: "0.72rem", color: palette.danger, maxWidth: "200px" }}>
          {voiceError}
        </div>
      )}
    </div>
  );
}

function ProntuariosPage({ pacientes, consultas, token, onRefresh }) {
  const [search, setSearch] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [registroText, setRegistroText] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = pacientes.filter(p =>
    !search ||
    p.nomeCompleto?.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search)
  );

  function calcIdade(dataNascimento) {
    if (!dataNascimento) return null;
    const diff = Date.now() - new Date(dataNascimento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  const consultasDoPaciente = selectedPaciente
    ? [...consultas.filter(c => c.paciente?.id === selectedPaciente.id)]
        .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
    : [];

  function openEditar(c) {
    setEditingConsulta(c);
    setRegistroText(c.registroAtendimento || "");
  }

  // Salva o registro de atendimento e marca a consulta como REALIZADA
  async function salvarRegistro() {
    if (!editingConsulta) return;
    setLoading(true);
    try {
      const payload = {
        ...editingConsulta,
        registroAtendimento: registroText,
        // Se havia texto, considera a consulta como realizada
        status: registroText.trim() ? "REALIZADA" : editingConsulta.status,
      };
      const res = await fetch(`${API}/consultas/${editingConsulta.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setEditingConsulta(null);
      setRegistroText("");
      onRefresh();
    } catch (e) {
      alert("Falha ao salvar registro: " + e.message);
    }
    setLoading(false);
  }

  const statusColor = {
    AGENDADA: palette.amber,
    REALIZADA: palette.tealMid,
    CANCELADA: palette.danger,
  };

  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
      <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <div style={styles.pageTitle}>Prontuários</div>
          <div style={styles.pageSubtitle}>Selecione um paciente</div>
        </div>
        <input
          style={{ ...styles.searchInput, width: "100%", boxSizing: "border-box" }}
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSelectedPaciente(null); }}
        />
        <div style={{ ...styles.tableCard }}>
          {filtered.length === 0 && (
            <div style={styles.emptyState}>Nenhum paciente encontrado.</div>
          )}
          {filtered.map(p => {
            const totalConsultas = consultas.filter(c => c.paciente?.id === p.id).length;
            const isSelected = selectedPaciente?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => { setSelectedPaciente(p); setEditingConsulta(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem", cursor: "pointer",
                  borderBottom: `1px solid ${palette.border}`,
                  background: isSelected ? palette.tealLight : "transparent",
                  borderLeft: isSelected ? `3px solid ${palette.tealMid}` : "3px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                  background: isSelected ? palette.tealMid : palette.sandDark,
                  color: isSelected ? palette.white : palette.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.78rem", fontWeight: "700",
                }}>
                  {p.nomeCompleto?.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "600", fontSize: "0.875rem", color: palette.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.nomeCompleto}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: palette.muted }}>
                    {totalConsultas} consulta{totalConsultas !== 1 ? "s" : ""}
                    {calcIdade(p.dataNascimento) ? ` · ${calcIdade(p.dataNascimento)} anos` : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
        {!selectedPaciente ? (
          <div style={{ ...styles.tableCard, padding: "4rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: palette.muted }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
              <div style={{ fontWeight: "600", color: palette.navy, marginBottom: "0.25rem" }}>Selecione um paciente</div>
              <div style={{ fontSize: "0.875rem" }}>O prontuário completo aparecerá aqui</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ ...styles.tableCard, padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{
                  width: "54px", height: "54px", borderRadius: "50%", flexShrink: 0,
                  background: palette.teal, color: palette.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: "700",
                }}>
                  {selectedPaciente.nomeCompleto?.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700", color: palette.navy }}>{selectedPaciente.nomeCompleto}</div>
                  <div style={{ fontSize: "0.8rem", color: palette.muted, marginTop: "0.2rem" }}>
                    {calcIdade(selectedPaciente.dataNascimento) && `${calcIdade(selectedPaciente.dataNascimento)} anos · `}
                    {selectedPaciente.cpf && `CPF: ${selectedPaciente.cpf}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", borderTop: `1px solid ${palette.border}`, paddingTop: "1.25rem" }}>
                {[
                  ["E-mail", selectedPaciente.email || "—"],
                  ["Telefone", selectedPaciente.telefone || "—"],
                  ["Nascimento", selectedPaciente.dataNascimento ? new Date(selectedPaciente.dataNascimento + "T12:00:00").toLocaleDateString("pt-BR") : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: palette.muted, fontWeight: "600", marginBottom: "0.25rem" }}>{label}</div>
                    <div style={{ fontSize: "0.875rem", color: palette.ink }}>{value}</div>
                  </div>
                ))}
              </div>

              {selectedPaciente.observacoes && (
                <div style={{ marginTop: "1rem", background: palette.amberLight, borderRadius: "8px", padding: "0.875rem 1rem", borderLeft: `3px solid ${palette.amber}` }}>
                  <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: palette.amber, fontWeight: "600", marginBottom: "0.35rem" }}>
                    Observações clínicas
                  </div>
                  <div style={{ fontSize: "0.875rem", color: palette.ink }}>{selectedPaciente.observacoes}</div>
                </div>
              )}
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>Histórico de atendimentos ({consultasDoPaciente.length})</div>
              </div>

              {consultasDoPaciente.length === 0 ? (
                <div style={styles.emptyState}>Nenhuma consulta registrada para este paciente.</div>
              ) : (
                <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(() => {
                    let lastDay = null;
                    return consultasDoPaciente.map((c, idx) => {
                      const dataConsulta = c.dataHora ? new Date(c.dataHora) : null;
                      const dayKey = dataConsulta
                        ? dataConsulta.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                        : null;
                      const showDayHeader = dayKey && dayKey !== lastDay;
                      if (showDayHeader) lastDay = dayKey;
                      return (
                        <div key={c.id}>
                          {showDayHeader && (
                            <div style={{
                              fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase",
                              letterSpacing: "0.08em", color: palette.tealMid,
                              padding: "0.4rem 0", marginBottom: "0.25rem",
                              borderBottom: `2px solid ${palette.tealLight}`,
                            }}>
                              📅 {dayKey}
                            </div>
                          )}
                          <div style={{
                            border: `1px solid ${palette.border}`,
                            borderRadius: "12px",
                            overflow: "hidden",
                            borderLeft: `4px solid ${statusColor[c.status] || palette.muted}`,
                          }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "0.875rem 1.25rem",
                              background: palette.sand,
                              borderBottom: `1px solid ${palette.border}`,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{
                                  width: "26px", height: "26px", borderRadius: "50%",
                                  background: (statusColor[c.status] || palette.muted) + "22",
                                  color: statusColor[c.status] || palette.muted,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "0.72rem", fontWeight: "700",
                                }}>
                                  {consultasDoPaciente.length - idx}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "600", fontSize: "0.875rem", color: palette.navy }}>
                                    {dataConsulta
                                      ? dataConsulta.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "h"
                                      : "Horário não informado"}
                                  </div>
                                  {c.observacoesAgendamento && (
                                    <div style={{ fontSize: "0.75rem", color: palette.muted }}>{c.observacoesAgendamento}</div>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Badge type={c.status} />
                                <button style={styles.btnSm()} onClick={() => openEditar(c)}>
                                  {c.registroAtendimento ? "Editar" : "Registrar"}
                                </button>
                              </div>
                            </div>

                            <div style={{ padding: "1rem 1.25rem" }}>
                              {editingConsulta?.id === c.id ? (
                                <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <label style={styles.label}>Registro de atendimento</label>
                                    <VoiceButton
                                      compact
                                      onTranscript={txt => setRegistroText(prev => prev ? prev + " " + txt : txt)}
                                    />
                                  </div>
                                  <textarea
                                    style={{
                                      ...styles.input, width: "100%", boxSizing: "border-box",
                                      minHeight: "120px", resize: "vertical",
                                      fontFamily: "monospace", fontSize: "0.875rem",
                                    }}
                                    value={registroText}
                                    onChange={e => setRegistroText(e.target.value)}
                                    placeholder="Descreva o atendimento..."
                                    autoFocus
                                  />
                                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", justifyContent: "flex-end" }}>
                                    <button style={styles.btnSm()} onClick={() => setEditingConsulta(null)}>Cancelar</button>
                                    <button style={styles.btnSm("primary")} onClick={salvarRegistro} disabled={loading}>
                                      {loading ? "Salvando..." : "Salvar registro"}
                                    </button>
                                  </div>
                                </div>
                              ) : c.registroAtendimento ? (
                                <div style={{ fontSize: "0.875rem", color: palette.ink, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                                  {c.registroAtendimento}
                                </div>
                              ) : (
                                <div style={{ fontSize: "0.875rem", color: palette.muted, fontStyle: "italic" }}>
                                  Sem registro de atendimento. Clique em "Registrar" para documentar.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mc_user")); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const token = user?.token || "";

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [cRes, pRes] = await Promise.all([
        fetch(`${API}/consultas`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/pacientes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (cRes.ok) setConsultas(await cRes.json());
      if (pRes.ok) setPacientes(await pRes.json());
    } catch { }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleLogin(data) { setUser(data); }
  function handleLogout() {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
    setUser(null);
  }

  if (!user) return <div style={styles.app}><LoginPage onLogin={handleLogin} /></div>;

  return (
    <div style={styles.app}>
      <Sidebar user={user} activePage={page} onNavigate={setPage} onLogout={handleLogout} />
      <main style={styles.main}>
        {page === "dashboard" && <Dashboard consultas={consultas} pacientes={pacientes} user={user} />}
        {page === "agenda" && <AgendaPage consultas={consultas} pacientes={pacientes} user={user} token={token} onRefresh={fetchData} />}
        {page === "consultas" && <ConsultasPage consultas={consultas} pacientes={pacientes} user={user} token={token} onRefresh={fetchData} />}
        {page === "pacientes" && <PacientesPage pacientes={pacientes} consultas={consultas} token={token} onRefresh={fetchData} user={user} />}
        {page === "prontuarios" && (user.role === "MEDICO" ? <ProntuariosPage pacientes={pacientes} consultas={consultas} token={token} onRefresh={fetchData} /> : <AcessoNegado />)}
      </main>
    </div>
  );
}