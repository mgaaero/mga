import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  ArrowRight, 
  UserPlus, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Plane,
  Compass
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onAuthenticated: (user: any) => void;
  onDemoAccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  onDemoAccess
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVERY'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'LOGIN') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          onAuthenticated(data.user);
        }
      } else if (mode === 'SIGNUP') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        if (data.user) {
          setSuccessMsg('Cadastro realizado com sucesso! Verifique seu e-mail de ativação.');
          setTimeout(() => {
            if (data.session) onAuthenticated(data.user);
            else setMode('LOGIN');
          }, 1500);
        }
      } else if (mode === 'RECOVERY') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMsg('Instruções de recuperação enviadas para o seu e-mail.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050811] text-slate-100 flex items-center justify-center p-4 font-mono select-none overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff8800]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0c101a]/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#ff8800]/10 border border-[#ff8800]/40 text-[#ff8800] mb-3">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>MGA</span>
            <span className="text-[10px] font-mono text-[#ff8800] bg-[#ff8800]/15 px-2 py-0.5 rounded border border-[#ff8800]/30">
              APP
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Memória Geográfica da Aviação • Plataforma do Cliente
          </p>
        </div>

        {/* Notices */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
                Nome Completo / Matrícula
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Comandante Silva"
                className="w-full bg-[#131722] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff8800] focus:ring-1 focus:ring-[#ff8800] transition"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
              E-mail Aeronáutico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="piloto@operador.aero"
                className="w-full bg-[#131722] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff8800] focus:ring-1 focus:ring-[#ff8800] transition"
              />
            </div>
          </div>

          {mode !== 'RECOVERY' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] text-slate-400 uppercase tracking-wider">
                  Senha de Acesso
                </label>
                {mode === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => setMode('RECOVERY')}
                    className="text-[10px] text-[#ff8800] hover:underline"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#131722] border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#ff8800] focus:ring-1 focus:ring-[#ff8800] transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ff8800] hover:bg-[#ff9900] text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span>Autenticando via Supabase...</span>
            ) : mode === 'LOGIN' ? (
              <>
                <span>ENTRAR NA PLATAFORMA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'SIGNUP' ? (
              <>
                <span>CRIAR CONTA MGA</span>
                <UserPlus className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>ENVIAR LINK DE RECUPERAÇÃO</span>
                <KeyRound className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access for Audits and Pilot Demos */}
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col gap-3">
          <button
            onClick={onDemoAccess}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs rounded-xl border border-white/10 transition flex items-center justify-center gap-2"
          >
            <Plane className="w-3.5 h-3.5 text-[#ff8800]" />
            <span>Acesso Rápido de Demonstração / Homologação</span>
          </button>

          {/* Toggle Modes */}
          <div className="text-center text-xs text-slate-400">
            {mode === 'LOGIN' ? (
              <span>
                Não possui conta?{' '}
                <button
                  onClick={() => setMode('SIGNUP')}
                  className="text-[#ff8800] hover:underline font-bold"
                >
                  Cadastre-se
                </button>
              </span>
            ) : (
              <span>
                Já possui acesso?{' '}
                <button
                  onClick={() => setMode('LOGIN')}
                  className="text-[#ff8800] hover:underline font-bold"
                >
                  Fazer Login
                </button>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Situational Awareness */}
      <div className="absolute bottom-4 text-[10px] text-slate-500 font-mono text-center">
        MGA — Memória Geográfica da Aviação • Conexão Segura Supabase Auth WGS84
      </div>
    </div>
  );
};
