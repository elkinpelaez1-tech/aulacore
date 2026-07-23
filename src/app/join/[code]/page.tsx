'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRole } from '@/providers/role-provider';
import { UserRole } from '@/lib/navigation';
import { 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert,
  Check, 
  Loader2, 
  Calendar, 
  Building2, 
  QrCode, 
  ArrowRight,
  User,
  Mail,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function JoinOnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const { setUserRole } = useRole();
  const code = (params?.code as string) || '';

  // Onboarding activation details if act- prefix
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Detect onboarding flow type based on prefix
  const [flowType, setFlowType] = useState<'student' | 'teacher' | 'parent'>('student');
  const [selectedRole, setSelectedRole] = useState<UserRole>('estudiante');
  const [flowName, setFlowName] = useState('Matrícula Abierta Secundaria 2026');
  const [flowDesc, setFlowDesc] = useState('Proceso de auto-onboarding y calibración RFID de AulaCore.');

  // Form states
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Bachillerato');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Animation states
  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Analizando código mágico de invitación...');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const fetchOnboardingDetails = async () => {
      const lowerCode = code.toLowerCase();
      if (lowerCode.startsWith('act-')) {
        const onboardingId = code.substring(4);
        try {
          const { data, error } = await supabase
            .from('teacher_onboardings')
            .select('*')
            .eq('id', onboardingId)
            .single();

          if (error || !data) {
            setErrorText('Código de activación inválido, expirado o ya utilizado.');
            return;
          }

          setOnboardingData(data);
          setFullName(data.full_name);
          setEmail(data.email);
          setNationalId(data.document_id);
          
          const roles = data.selected_roles && data.selected_roles.length > 0
            ? data.selected_roles
            : ['docente'];
          const primaryRole = roles.includes('director_grupo') ? 'director_grupo' : 'docente';
          setSelectedRole(primaryRole as UserRole);
          
          setFlowType('teacher');
          setFlowName('Activación de Cuenta Docente Real');
          setFlowDesc('Tu solicitud de onboarding ha sido aprobada por la Coordinación Académica. Configura tus datos biométricos y accede a tu consola.');
        } catch (err) {
          console.error('Error fetching onboarding details:', err);
          setErrorText('Ocurrió un error al verificar tu código de activación.');
        }
      } else if (lowerCode.startsWith('mat') || lowerCode.startsWith('join')) {
        setFlowType('student');
        setSelectedRole('estudiante');
        setFlowName('Matrícula Escolar Inteligente');
        setFlowDesc('Auto-onboarding digital, registro de expediente y asignación RFID.');
      } else if (lowerCode.startsWith('doc') || lowerCode.startsWith('t-') || lowerCode.startsWith('xyz')) {
        setFlowType('teacher');
        setSelectedRole('docente');
        setFlowName('Invitación de Incorporación Docente');
        setFlowDesc('Vinculación de plan curricular, asignación de cursos y firma digital.');
      } else if (lowerCode.startsWith('act') || lowerCode.startsWith('upd') || lowerCode.startsWith('bac')) {
        setFlowType('parent');
        setSelectedRole('padre_familia');
        setFlowName('Actualización y Consentimiento Familiar');
        setFlowDesc('Actualización de datos de acudiente, firma digital de circulares y semáforo RFID.');
      } else {
        setFlowType('student');
        setSelectedRole('estudiante');
        setFlowName('Matrícula Escolar Inteligente');
        setFlowDesc('Auto-onboarding digital, registro de expediente y asignación RFID.');
      }
    };

    fetchOnboardingDetails();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !nationalId.trim() || !email.trim()) return;

    setFormSubmitted(true);
    setProgress(0);

    const animationSteps = [
      { p: 15, text: 'Verificando código de sincronización en AulaCore Vault...' },
      { p: 45, text: 'Generando credenciales y reservando portería RFID...' },
      { p: 75, text: 'Calibrando base de datos Supabase e IA predictiva de alertas...' },
      { p: 100, text: '¡Registro exitoso! Cuenta AulaCore configurada correctamente.' }
    ];

    if (code.toLowerCase().startsWith('act-')) {
      const onboardingId = code.substring(4);
      try {
        await supabase
          .from('teacher_onboardings')
          .update({
            status: 'activated',
            updated_at: new Date().toISOString()
          })
          .eq('id', onboardingId);
      } catch (err) {
        console.error('Error updating onboarding status in Supabase:', err);
      }
    }

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < animationSteps.length) {
        setProgress(animationSteps[currentStep].p);
        setLoaderText(animationSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setOnboardingComplete(true);
        }, 300);
      }
    }, 900);
  };

  const handleEnterDashboard = async () => {
    // Dynamically set local state role and name to allow Rector-style showcase!
    setUserRole(selectedRole);
    
    if (code.toLowerCase().startsWith('act-')) {
      const onboardingId = code.substring(4);
      try {
        await supabase
          .from('teacher_onboardings')
          .update({
            status: 'first_access',
            updated_at: new Date().toISOString()
          })
          .eq('id', onboardingId);
      } catch (err) {
        console.error('Error updating onboarding status to first_access:', err);
      }
    }
    
    // Save onboarding details for personalization in the student dashboard
    if (selectedRole === 'estudiante') {
      const newPreReg = {
        fullName,
        nationalId,
        email,
        gradeLevel,
        registrationDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: 'Pre-matriculado'
      };

      localStorage.setItem('aulacore-onboarding-student', JSON.stringify(newPreReg));

      // Append to the list of pre-registrations in localStorage for multi-student demo support
      const existingPreRegsStr = localStorage.getItem('aulacore-pre-registrations');
      let preRegsList = [];
      if (existingPreRegsStr) {
        try {
          preRegsList = JSON.parse(existingPreRegsStr);
        } catch (e) {}
      }
      preRegsList = preRegsList.filter((p: any) => p.nationalId !== nationalId);
      preRegsList.unshift(newPreReg);
      localStorage.setItem('aulacore-pre-registrations', JSON.stringify(preRegsList));
    }
    
    // Redirect to main Dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Premium background effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
            AulaCore Auto-Onboarding
          </span>
          <h1 className="text-xl font-black text-white mt-1 tracking-tight">
            Colegio Demo AulaCore
          </h1>
        </div>

        {/* Dynamic step states */}
        {errorText ? (
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100 mb-1">Error de Activación</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed px-6">
                {errorText}
              </p>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-3 rounded-xl transition text-xs cursor-pointer border-none outline-none shadow-sm active:scale-95"
            >
              Volver al Inicio
            </button>
          </div>
        ) : !formSubmitted ? (
          /* STEP 1: Registration Form */
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-base font-black text-slate-100 uppercase tracking-wider">{flowName}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1.5 leading-relaxed">{flowDesc}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {flowType === 'student' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-850 p-1 rounded-xl border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('estudiante');
                    }}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'estudiante' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Estudiante
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('padre_familia');
                    }}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'padre_familia' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Acudiente / Padre
                  </button>
                </div>
              )}

              {flowType === 'teacher' && (
                <div className="grid grid-cols-2 gap-2 bg-slate-850 p-1 rounded-xl border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('docente');
                    }}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'docente' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Docente Aula
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('director_grupo');
                    }}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'director_grupo' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Director de Grupo
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!!onboardingData}
                    placeholder="Ej. Juan Carlos Ospina"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {selectedRole === 'estudiante' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nivel Académico de Ingreso</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Preescolar" className="bg-slate-900 text-white">Preescolar</option>
                    <option value="Primaria" className="bg-slate-900 text-white">Primaria</option>
                    <option value="Bachillerato" className="bg-slate-900 text-white">Bachillerato (Sexto a Noveno)</option>
                    <option value="Media Técnica" className="bg-slate-900 text-white">Media Técnica (Décimo y Undécimo)</option>
                    <option value="Otras" className="bg-slate-900 text-white">Otras</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Documento de Identidad</label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    disabled={!!onboardingData}
                    placeholder="Ej. CC / TI 1023456789"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!onboardingData}
                    placeholder="Ej. jc.ospina@aulacore.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="bg-slate-850 p-4 border border-slate-800/80 rounded-2xl flex items-start gap-2.5 mt-3 select-none text-[10px] font-semibold text-slate-450 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Entorno Seguro de Admisiones:</strong> Sus datos personales están encriptados y protegidos según los estándares de AulaCore IA. Se generará un certificado único firmado digitalmente.
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-xl transition shadow shadow-indigo-600/20 text-xs cursor-pointer border-none outline-none flex items-center justify-center gap-1.5"
              >
                {onboardingData ? 'Activar mi Cuenta Docente' : 'Completar Registro Seguro'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : !onboardingComplete ? (
          /* STEP 2: Simulated Progress Loader */
          <div className="p-10 text-center space-y-6 animate-in zoom-in-95">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-900/30 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
              <div className="absolute inset-3.5 rounded-full bg-slate-905 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Configurando Perfil...</h4>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed px-4 h-8 transition-all">{loaderText}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          /* STEP 3: Success Onboarding Confirmation */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100 mb-1">¡Onboarding Exitoso!</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-6">
                Tu perfil ha sido registrado correctamente en la portería biométrica RFID y base de datos de la institución.
              </p>
            </div>

            <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl text-left space-y-2.5 max-w-sm mx-auto">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">
                  {selectedRole === 'estudiante' ? 'Estudiante:' :
                   selectedRole === 'padre_familia' ? 'Acudiente:' :
                   selectedRole === 'director_grupo' || selectedRole === 'docente' ? 'Docente:' : 'Usuario:'}
                </span>
                <span className="text-slate-200 font-black truncate max-w-[180px]">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">Identificación:</span>
                <span className="text-slate-200 font-black">{nationalId}</span>
              </div>
              {selectedRole === 'estudiante' && (
                <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                  <span className="text-slate-400 font-bold">Nivel de Ingreso:</span>
                  <span className="text-indigo-400 font-black">{gradeLevel}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Rol Asignado:</span>
                <span className="text-indigo-400 font-black">
                  {selectedRole === 'estudiante' ? 'Estudiante Regular' :
                   selectedRole === 'padre_familia' ? 'Acudiente Familiar' :
                   selectedRole === 'director_grupo' ? 'Director de Grupo' : 'Docente Titular'}
                </span>
              </div>
            </div>

            <button
              onClick={handleEnterDashboard}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-xl transition shadow shadow-indigo-650/25 text-xs cursor-pointer border-none outline-none flex items-center justify-center gap-1.5"
            >
              Acceder a mi Consola AulaCore <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Email Dispatch Simulation Toast */}
      {formSubmitted && onboardingComplete && (
        <div className="fixed bottom-4 left-4 bg-slate-900/95 border border-slate-850 text-white rounded-2xl shadow-2xl p-4 max-w-sm z-50 animate-in slide-in-from-left-5 fade-in duration-500">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Simulador de Correo AulaCore</span>
          </div>
          <div className="space-y-1 text-xs select-none">
            <p className="text-slate-400 font-bold"><span className="text-indigo-400">Para:</span> {email}</p>
            <p className="text-slate-400 font-bold"><span className="text-indigo-400">Asunto:</span> ✨ Pre-registro Confirmado - Colegio Demo AulaCore</p>
            <div className="mt-2 p-2 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-300 font-medium leading-relaxed">
              ¡Hola <strong>{fullName}</strong>! Tu pre-registro para <strong>{gradeLevel}</strong> ha sido recibido con éxito en nuestro sistema y está listo para ser oficializado por Secretaría. ¡Bienvenido(a)!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
