import React, { useEffect, useState, useRef, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, useNavigate, NavLink, useParams, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, PlusCircle,
  ArrowLeft, ClipboardList, Mic, User, X, Phone, Mail, LogOut, Lock, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';
const PYTHON_API_URL = 'http://localhost:5000/transcrever';

// ============================================================
// AUTH CONTEXT
// ============================================================
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('mediclinic_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });

  const login = async (email, senha) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, senha });
    const dados = res.data;
    localStorage.setItem('mediclinic_usuario', JSON.stringify(dados));
    if (dados.token) axios.defaults.headers.common['Authorization'] = `Bearer ${dados.token}`;
    setUsuario(dados);
    return dados;
  };

  const logout = () => {
    localStorage.removeItem('mediclinic_usuario');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
  };

  useEffect(() => {
    if (usuario?.token) axios.defaults.headers.common['Authorization'] = `Bearer ${usuario.token}`;
  }, []);

  const isMedico = usuario?.role === 'MEDICO';
  const isAssistente = usuario?.role === 'ASSISTENTE';

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isMedico, isAssistente }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// ROTA PROTEGIDA
// ============================================================
const RotaProtegida = ({ children, apenasMediaco = false }) => {
  const { usuario, isMedico } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (apenasMediaco && !isMedico) return <Navigate to="/" replace />;
  return children;
};

// ============================================================
// TELA DE LOGIN
// ============================================================
const Login = () => {
  const { login, usuario } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { if (usuario) navigate('/', { replace: true }); }, [usuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(form.email, form.senha);
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.response?.data?.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e4cf1] rounded-3xl mb-4 shadow-xl">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-slate-800">MediClinic</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Acesse sua conta</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">E-mail</label>
              <input type="email" required placeholder="seu@email.com"
                className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1e4cf1] transition-all font-medium"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Senha</label>
              <input type="password" required placeholder="••••••••"
                className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1e4cf1] transition-all font-medium"
                value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} />
            </div>
            {erro && <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-2xl text-center">{erro}</div>}
            <button type="submit" disabled={carregando}
              className="w-full bg-[#1e4cf1] text-white py-6 rounded-[2rem] font-black shadow-xl mt-2 disabled:opacity-60 transition-all hover:bg-blue-700">
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <p className="text-[10px] font-black text-[#1e4cf1] uppercase tracking-widest">Médico</p>
            <p className="text-slate-400 text-xs mt-1">Acesso completo</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assistente</p>
            <p className="text-slate-400 text-xs mt-1">Dashboard e Agenda</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = () => {
  const { usuario, logout, isMedico } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 bg-[#1e4cf1] text-white flex flex-col h-screen p-6 fixed left-0 top-0 shadow-2xl z-20">
      <div className="mb-12 px-2">
        <h1 className="text-2xl font-black italic tracking-tighter">MediClinic</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all ${isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/60'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/agenda" className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all ${isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/60'}`}>
          <Calendar size={20} /> Agenda
        </NavLink>
        {isMedico && (
          <NavLink to="/pacientes" className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl font-semibold transition-all ${isActive ? 'bg-white/20' : 'hover:bg-white/10 text-white/60'}`}>
            <Users size={20} /> Pacientes
          </NavLink>
        )}
      </nav>
      <div className="border-t border-white/20 pt-6 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <User size={16} />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{usuario?.nome}</p>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isMedico ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}>
              {isMedico ? 'Médico' : 'Assistente'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-2xl text-white/60 hover:bg-white/10 hover:text-white transition-all font-semibold text-sm">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </aside>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = () => {
  const [stats, setStats] = useState({ pacientes: 0, consultas: 0 });
  const { isMedico } = useAuth();

  useEffect(() => {
    const carregar = async () => {
      try {
        const promises = [axios.get(`${API_BASE}/consultas`)];
        if (isMedico) promises.unshift(axios.get(`${API_BASE}/pacientes`));
        if (isMedico) {
          const [resP, resC] = await Promise.all(promises);
          setStats({ pacientes: Array.isArray(resP.data) ? resP.data.length : 0, consultas: Array.isArray(resC.data) ? resC.data.length : 0 });
        } else {
          const [resC] = await Promise.all(promises);
          setStats({ consultas: Array.isArray(resC.data) ? resC.data.length : 0 });
        }
      } catch (e) { console.error(e); }
    };
    carregar();
  }, [isMedico]);

  return (
    <div className="p-10 animate-in fade-in text-left">
      <h2 className="text-4xl font-black mb-8 text-slate-800">Resumo</h2>
      <div className={`grid gap-8 ${isMedico ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
        {isMedico && (
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Pacientes</p>
            <p className="text-7xl font-black text-[#1e4cf1]">{stats.pacientes}</p>
          </div>
        )}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Consultas</p>
          <p className="text-7xl font-black text-slate-800">{stats.consultas}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PACIENTES
// ============================================================
const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [novo, setNovo] = useState({ nomeCompleto: '', dataNascimento: '', cpf: '', telefone: '', email: '' });
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/pacientes`);
      setPacientes(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setPacientes([]); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleCadastrar = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/pacientes`, novo).then(() => {
      setNovo({ nomeCompleto: '', dataNascimento: '', cpf: '', telefone: '', email: '' });
      setModalOpen(false);
      carregar();
    });
  };

  return (
    <div className="p-10 text-left animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-black">Pacientes</h2>
        <button onClick={() => setModalOpen(true)} className="bg-[#1e4cf1] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg">
          <PlusCircle size={20} /> Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6 text-left">Nome</th>
              <th className="px-8 py-6 text-left">CPF</th>
              <th className="px-8 py-6 text-left">Contato</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pacientes.map(p => (
              <tr key={p.id} className="hover:bg-blue-50 transition-all">
                <td className="px-8 py-6 font-bold text-slate-700">{p.nomeCompleto}</td>
                <td className="px-8 py-6 text-slate-400 font-mono text-sm">{p.cpf}</td>
                <td className="px-8 py-6 text-slate-500 text-sm">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1"><Phone size={12} /> {p.telefone}</span>
                    <span className="flex items-center gap-1 opacity-60"><Mail size={12} /> {p.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => navigate(`/prontuario/${p.id}`)} className="bg-blue-50 text-[#1e4cf1] p-3 rounded-xl hover:bg-[#1e4cf1] hover:text-white transition-all">
                    <ClipboardList size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-8 right-8 text-slate-300"><X size={28} /></button>
            <h3 className="text-3xl font-black mb-8">Cadastro</h3>
            <form onSubmit={handleCadastrar} className="space-y-4">
              <input required placeholder="Nome Completo" className="w-full p-5 bg-slate-100 rounded-2xl outline-none" value={novo.nomeCompleto} onChange={e => setNovo({ ...novo, nomeCompleto: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required className="w-full p-5 bg-slate-100 rounded-2xl outline-none" value={novo.dataNascimento} onChange={e => setNovo({ ...novo, dataNascimento: e.target.value })} />
                <input required placeholder="CPF" className="w-full p-5 bg-slate-100 rounded-2xl outline-none" value={novo.cpf} onChange={e => setNovo({ ...novo, cpf: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Telefone" className="w-full p-5 bg-slate-100 rounded-2xl outline-none" value={novo.telefone} onChange={e => setNovo({ ...novo, telefone: e.target.value })} />
                <input type="email" required placeholder="E-mail" className="w-full p-5 bg-slate-100 rounded-2xl outline-none" value={novo.email} onChange={e => setNovo({ ...novo, email: e.target.value })} />
              </div>
              <button type="submit" className="w-full bg-[#1e4cf1] text-white py-6 rounded-[2rem] font-black shadow-xl mt-6">Salvar Paciente</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Card de consulta (externo para evitar redefinição a cada render) ──
const CardConsulta = ({ c, onAbrir, compact = false }) => {
  const status = (c.status || 'AGENDADO').toLowerCase();
  const cor = STATUS_COLORS[c.status] || STATUS_COLORS['AGENDADO'];

  if (compact) {
    return (
      <button onClick={() => onAbrir(c)}
        className={`w-full text-left ${cor.bg} ${cor.text} rounded-lg px-2 py-1.5 text-xs font-bold leading-tight hover:opacity-90 transition-all`}>
        <p className="truncate">{c.paciente?.nomeCompleto}</p>
        <p className="text-[10px] opacity-80 font-medium capitalize">{status}</p>
      </button>
    );
  }
  return (
    <button onClick={() => onAbrir(c)}
      className={`w-full text-left ${cor.bg} ${cor.text} rounded-xl px-4 py-3 font-bold leading-tight hover:opacity-90 transition-all flex items-center justify-between`}>
      <div>
        <p className="text-sm">{c.paciente?.nomeCompleto}</p>
        <p className="text-xs opacity-80 font-medium capitalize mt-0.5">{status}</p>
      </div>
    </button>
  );
};

const STATUS_OPCOES = [
  { valor: 'AGENDADO',  label: 'Confirmada', cor: 'bg-green-500 text-white' },
  { valor: 'PENDENTE',  label: 'Pendente',   cor: 'bg-yellow-400 text-white' },
  { valor: 'CANCELADA', label: 'Cancelada',  cor: 'bg-red-500 text-white' },
  { valor: 'REALIZADA', label: 'Realizada',  cor: 'bg-blue-500 text-white' },
];

// ── Modal de detalhes/ações da consulta ──
const ModalConsulta = ({ consulta, isMedico, onFechar, onAlterarStatus, onVerFicha }) => {
  if (!consulta) return null;
  const cor = STATUS_COLORS[consulta.status] || STATUS_COLORS['AGENDADO'];
  const status = (consulta.status || 'AGENDADO').toLowerCase();
  const dataHora = new Date(consulta.dataHora);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onFechar}>
      <div className="bg-white rounded-[2.5rem] max-w-sm w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Topo colorido */}
        <div className={`${cor.bg} px-8 py-6 flex items-center justify-between`}>
          <div>
            <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Consulta</p>
            <h3 className="text-white text-xl font-black">{consulta.paciente?.nomeCompleto}</h3>
            <p className="text-white/80 text-sm font-medium mt-0.5 capitalize">{status}</p>
          </div>
          <button onClick={onFechar} className="text-white/70 hover:text-white transition-all">
            <X size={22} />
          </button>
        </div>

        {/* Data e horário */}
        <div className="px-8 py-5 border-b border-slate-100">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Data e horário</p>
          <p className="text-slate-700 font-bold text-sm">
            {dataHora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' — '}
            {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Ações */}
        <div className="px-8 py-6 space-y-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alterar status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPCOES.map(op => (
                <button
                  key={op.valor}
                  onClick={() => onAlterarStatus(op.valor)}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    consulta.status === op.valor
                      ? op.cor + ' ring-2 ring-offset-1 ring-slate-400'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {isMedico && (
            <button
              onClick={onVerFicha}
              className="w-full bg-[#1e4cf1] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
            >
              <ClipboardList size={18} /> Ver Ficha do Paciente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



// Mapeamento de status -> cor
const STATUS_COLORS = {
  confirmada:  { bg: 'bg-green-500',  text: 'text-white' },
  CONFIRMADA:  { bg: 'bg-green-500',  text: 'text-white' },
  AGENDADO:    { bg: 'bg-green-500',  text: 'text-white' },
  pendente:    { bg: 'bg-yellow-400', text: 'text-white' },
  PENDENTE:    { bg: 'bg-yellow-400', text: 'text-white' },
  cancelada:   { bg: 'bg-red-500',    text: 'text-white' },
  CANCELADA:   { bg: 'bg-red-500',    text: 'text-white' },
  realizada:   { bg: 'bg-blue-500',   text: 'text-white' },
  REALIZADA:   { bg: 'bg-blue-500',   text: 'text-white' },
};

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HORARIOS = Array.from({ length: 13 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`); // 07:00–19:00

// Retorna o domingo da semana que contém a data fornecida
const getInicioSemana = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

// Formata "abril de 2026"
const formatarMesAno = (date) =>
  date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

const Agenda = () => {
  const navigate = useNavigate();
  const { isMedico } = useAuth();

  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ pacienteId: '', data: '', hora: '', status: 'AGENDADO' });

  // Visão: 'semana' | 'dia'
  const [visao, setVisao] = useState('semana');

  // Dia selecionado (para visão Dia)
  const [diaSelecionado, setDiaSelecionado] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Semana atual
  const [semanaInicio, setSemanaInicio] = useState(() => getInicioSemana(new Date()));

  useEffect(() => {
    axios.get(`${API_BASE}/consultas`).then(res => setConsultas(res.data)).catch(() => {});
    axios.get(`${API_BASE}/pacientes`).then(res => setPacientes(res.data)).catch(() => {});
  }, []);

  const semanaAtual = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(semanaInicio);
    d.setDate(semanaInicio.getDate() + i);
    return d;
  });

  // Navegação semana
  const irSemanaAnterior = () => {
    const d = new Date(semanaInicio);
    d.setDate(d.getDate() - 7);
    setSemanaInicio(d);
  };

  const irProximaSemana = () => {
    const d = new Date(semanaInicio);
    d.setDate(d.getDate() + 7);
    setSemanaInicio(d);
  };

  // Navegação dia
  const irDiaAnterior = () => {
    const d = new Date(diaSelecionado);
    d.setDate(d.getDate() - 1);
    setDiaSelecionado(d);
  };

  const irProximoDia = () => {
    const d = new Date(diaSelecionado);
    d.setDate(d.getDate() + 1);
    setDiaSelecionado(d);
  };

  const formatarDiaCompleto = (date) =>
    date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Filtra consultas por dia e hora
  const getConsultasCelula = (dia, hora) => {
    const horaNum = parseInt(hora.split(':')[0]);
    return consultas.filter(c => {
      const dt = new Date(c.dataHora);
      return (
        dt.getFullYear() === dia.getFullYear() &&
        dt.getMonth() === dia.getMonth() &&
        dt.getDate() === dia.getDate() &&
        dt.getHours() === horaNum
      );
    });
  };

  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  const abrirConsulta = (c) => setConsultaSelecionada(c);
  const fecharConsulta = () => setConsultaSelecionada(null);

  const alterarStatus = (novoStatus) => {
    const payload = { ...consultaSelecionada, status: novoStatus };
    axios.put(`${API_BASE}/consultas/${consultaSelecionada.id}`, payload)
      .then(() => {
        setConsultas(prev => prev.map(c => c.id === consultaSelecionada.id ? { ...c, status: novoStatus } : c));
        setConsultaSelecionada(prev => ({ ...prev, status: novoStatus }));
      })
      .catch(() => alert('Erro ao atualizar status.'));
  };

  const salvar = (e) => {
    e.preventDefault();
    const payload = {
      paciente: { id: parseInt(form.pacienteId) },
      dataHora: `${form.data}T${form.hora}:00`,
      status: form.status,
    };
    axios.post(`${API_BASE}/consultas`, payload).then(() => {
      setModal(false);
      setForm({ pacienteId: '', data: '', hora: '', status: 'AGENDADO' });
      axios.get(`${API_BASE}/consultas`).then(res => setConsultas(res.data));
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc]">
      {/* ── Cabeçalho ── */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Agenda</h2>
          <p className="text-xs text-slate-400 font-medium">Calendário de consultas</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-[#1e4cf1] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all"
        >
          <Plus size={16} /> Agendar Consulta
        </button>
      </div>

      {/* ── Navegação + toggle Dia/Semana ── */}
      <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={visao === 'semana' ? irSemanaAnterior : irDiaAnterior}
            className="p-1 rounded-lg hover:bg-slate-100 transition-all text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-base font-bold text-slate-700 capitalize">
            {visao === 'semana'
              ? formatarMesAno(semanaInicio)
              : formatarDiaCompleto(diaSelecionado)}
          </span>
          <button
            onClick={visao === 'semana' ? irProximaSemana : irProximoDia}
            className="p-1 rounded-lg hover:bg-slate-100 transition-all text-slate-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Toggle Dia / Semana */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setVisao('dia')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${visao === 'dia' ? 'bg-[#1e4cf1] text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
          >
            Dia
          </button>
          <button
            onClick={() => setVisao('semana')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${visao === 'semana' ? 'bg-[#1e4cf1] text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* ── Grade ── */}
      <div className="flex-1 overflow-auto">
        {visao === 'semana' ? (
          /* ════ VISÃO SEMANA ════ */
          <div className="min-w-[900px]">
            <div className="grid border-b border-slate-200 bg-white sticky top-0 z-10"
              style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
              <div className="py-3 px-3 text-xs font-bold text-slate-400 border-r border-slate-100">Horário</div>
              {semanaAtual.map((dia, i) => (
                <div
                  key={i}
                  className="py-3 px-3 text-center border-r border-slate-100 last:border-r-0 cursor-pointer hover:bg-slate-50 transition-all"
                  onClick={() => { setDiaSelecionado(dia); setVisao('dia'); }}
                >
                  <p className="text-xs font-bold text-slate-400">{DIAS_SEMANA[dia.getDay()]}</p>
                  <p className="text-sm font-black text-slate-700">{dia.getDate()}</p>
                </div>
              ))}
            </div>

            {HORARIOS.map((hora) => (
              <div key={hora} className="grid border-b border-slate-100"
                style={{ gridTemplateColumns: '80px repeat(7, 1fr)', minHeight: '64px' }}>
                <div className="py-2 px-3 text-xs font-bold text-slate-400 border-r border-slate-100 flex items-start pt-2">
                  {hora}
                </div>
                {semanaAtual.map((dia, dIdx) => {
                  const cells = getConsultasCelula(dia, hora);
                  return (
                    <div key={dIdx} className="border-r border-slate-100 last:border-r-0 p-1 relative group hover:bg-slate-50 transition-all">
                      {cells.length === 0 && (
                        <button
                          onClick={() => {
                            setForm(f => ({ ...f, data: dia.toISOString().split('T')[0], hora }));
                            setModal(true);
                          }}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Plus size={16} className="text-slate-300" />
                        </button>
                      )}
                      <div className="space-y-1">
                        {cells.map((c, idx) => <CardConsulta key={idx} c={c} compact onAbrir={abrirConsulta} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* ════ VISÃO DIA ════ */
          <div className="min-w-[400px] max-w-3xl mx-auto">
            {/* Cabeçalho dia único */}
            <div className="grid border-b border-slate-200 bg-white sticky top-0 z-10"
              style={{ gridTemplateColumns: '80px 1fr' }}>
              <div className="py-3 px-3 text-xs font-bold text-slate-400 border-r border-slate-100">Horário</div>
              <div className="py-3 px-4 text-center">
                <p className="text-xs font-bold text-slate-400 capitalize">{DIAS_SEMANA[diaSelecionado.getDay()]}</p>
                <p className="text-sm font-black text-slate-700">{diaSelecionado.getDate()}</p>
              </div>
            </div>

            {HORARIOS.map((hora) => {
              const cells = getConsultasCelula(diaSelecionado, hora);
              return (
                <div key={hora} className="grid border-b border-slate-100"
                  style={{ gridTemplateColumns: '80px 1fr', minHeight: '72px' }}>
                  <div className="py-3 px-3 text-xs font-bold text-slate-400 border-r border-slate-100 flex items-start pt-3">
                    {hora}
                  </div>
                  <div className="p-2 relative group hover:bg-slate-50 transition-all">
                    {cells.length === 0 && (
                      <button
                        onClick={() => {
                          setForm(f => ({ ...f, data: diaSelecionado.toISOString().split('T')[0], hora }));
                          setModal(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus size={16} className="text-slate-300" />
                      </button>
                    )}
                    <div className="space-y-1.5">
                      {cells.map((c, idx) => <CardConsulta key={idx} c={c} onAbrir={abrirConsulta} />)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legenda ── */}
      <div className="flex items-center gap-6 px-8 py-3 bg-white border-t border-slate-100">
        {[
          { label: 'Confirmada', color: 'bg-green-500' },
          { label: 'Pendente',   color: 'bg-yellow-400' },
          { label: 'Cancelada',  color: 'bg-red-500' },
          { label: 'Realizada',  color: 'bg-blue-500' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-xs font-semibold text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      <ModalConsulta
        consulta={consultaSelecionada}
        isMedico={isMedico}
        onFechar={fecharConsulta}
        onAlterarStatus={alterarStatus}
        onVerFicha={() => { fecharConsulta(); navigate(`/prontuario/${consultaSelecionada?.paciente?.id}`); }}
      />

      {/* ── Modal agendar consulta ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative shadow-2xl">
            <button onClick={() => setModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500">
              <X size={28} />
            </button>
            <h3 className="text-2xl font-black mb-6">Agendar Consulta</h3>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Paciente</label>
                <select required
                  className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-medium"
                  value={form.pacienteId}
                  onChange={e => setForm({ ...form, pacienteId: e.target.value })}>
                  <option value="">Selecione o paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Data</label>
                  <input type="date" required className="w-full p-5 bg-slate-100 rounded-2xl outline-none"
                    value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Hora</label>
                  <input type="time" required className="w-full p-5 bg-slate-100 rounded-2xl outline-none"
                    value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Status</label>
                <select
                  className="w-full p-5 bg-slate-100 rounded-2xl outline-none font-medium"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="AGENDADO">Confirmada</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="REALIZADA">Realizada</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#1e4cf1] text-white py-5 rounded-2xl font-black shadow-xl">
                Confirmar Agendamento
              </button>
              <button type="button" onClick={() => setModal(false)} className="w-full text-slate-400 font-semibold mt-1 hover:text-slate-600">
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PRONTUÁRIO
// ============================================================
const Prontuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [gravando, setGravando] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    axios.get(`${API_BASE}/pacientes/${id}`).then(res => setP(res.data)).catch(() => setP(null));
  }, [id]);

  const toggleGravacao = async () => {
    if (gravando) {
      mediaRecorder.current.stop();
      setGravando(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        try {
          const res = await axios.post(PYTHON_API_URL, formData);
          setP(prev => ({ ...prev, observacoes: (prev.observacoes || '') + '\n' + res.data.texto }));
        } catch (err) { alert('Erro na transcrição.'); }
      };
      mediaRecorder.current.start();
      setGravando(true);
    }
  };

  if (!p) return <div className="p-20 text-center font-black">Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 text-left">
      <button onClick={() => navigate('/pacientes')} className="mb-4 text-slate-400 flex items-center gap-2 font-bold uppercase text-[10px]">
        <ArrowLeft size={16} /> Voltar
      </button>
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-[#1e4cf1] p-12 text-white flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black">{p.nomeCompleto}</h2>
            <div className="flex gap-4 mt-2 opacity-80 text-sm font-bold">
              <span>CPF: {p.cpf}</span><span>•</span><span>{p.telefone}</span>
            </div>
          </div>
          <User size={40} />
        </div>
        <div className="p-12 space-y-6">
          <textarea
            className="w-full p-10 bg-slate-50 rounded-[2.5rem] h-80 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={p.observacoes || ''}
            onChange={e => setP({ ...p, observacoes: e.target.value })}
            placeholder="Evolução do paciente..."
          />
          <div className="flex gap-4">
            <button onClick={toggleGravacao}
              className={`flex-1 py-6 rounded-[2rem] font-black flex items-center justify-center gap-2 ${gravando ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
              <Mic size={24} /> {gravando ? 'Ouvindo...' : 'Gravar Voz'}
            </button>
            <button onClick={() => axios.put(`${API_BASE}/pacientes/${id}`, p).then(() => alert('Salvo!'))}
              className="flex-1 bg-[#1e4cf1] text-white py-6 rounded-[2rem] font-black shadow-xl">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LAYOUT
// ============================================================
const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-[#f8fafc] font-sans">
    <Sidebar />
    <main className="flex-1 ml-64 overflow-y-auto">
      {children}
    </main>
  </div>
);

// ============================================================
// APP
// ============================================================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RotaProtegida><Layout><Dashboard /></Layout></RotaProtegida>} />
          <Route path="/agenda" element={<RotaProtegida><Layout><Agenda /></Layout></RotaProtegida>} />
          <Route path="/pacientes" element={<RotaProtegida apenasMediaco><Layout><Pacientes /></Layout></RotaProtegida>} />
          <Route path="/prontuario/:id" element={<RotaProtegida apenasMediaco><Layout><Prontuario /></Layout></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}