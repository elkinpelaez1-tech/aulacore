'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  FileText,
  Phone,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { submitOnboarding, TeacherOnboardingData } from '@/lib/services/teacher-onboarding';
import { submitStudentOnboarding, StudentOnboardingData } from '@/lib/services/student-onboarding';

function JoinOnboardingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUserRole } = useRole();
  const code = (params?.code as string) || '';
  const instParam = searchParams.get('inst') || '';

  // Target institution resolution
  const [targetInstitution, setTargetInstitution] = useState<{ id: string; name: string; slug?: string }>({
    id: '3ee6d8c5-e23f-4848-aa36-cd456afb0dfe',
    name: 'Instituto Profes',
    slug: 'instituto-profes'
  });

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
  const [phone, setPhone] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Bachillerato');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Animation states
  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('Analizando código mágico de invitación...');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // 1. Resolve institution dynamically from ?inst= parameter if present
  useEffect(() => {
    const resolveInstitution = async () => {
      if (instParam) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(instParam);
          let query = supabase.from('institutions').select('id, name, slug');
          if (isUuid) {
            query = query.eq('id', instParam);
          } else {
            query = query.eq('slug', instParam);
          }
          const { data, error } = await query.maybeSingle();
          if (!error && data) {
            setTargetInstitution(data);
          }
        } catch (e) {
          console.warn('Error resolviendo institución desde parámetro inst:', e);
        }
      }
    };
    resolveInstitution();
  }, [instParam]);

  // 2. Resolve code details (activation code act- or invitation prefix)
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
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setNationalId(data.document_id || '');
          setPhone(data.phone || '');

          // Resolve institution from teacher onboarding institution_id
          if (data.institution_id) {
            const { data: instData } = await supabase
              .from('institutions')
              .select('id, name, slug')
              .eq('id', data.institution_id)
              .maybeSingle();

            if (instData) {
              setTargetInstitution(instData);
            }
          }
          
          const roles = data.selected_roles && data.selected_roles.length > 0
            ? data.selected_roles
            : ['docente'];
          const primaryRole = roles.includes('director_grupo') ? 'director_grupo' : 'docente';
          setSelectedRole(primaryRole as UserRole);
          
          setFlowType('teacher');
          setFlowName('Activación de Cuenta Docente');
          setFlowDesc('Tu solicitud de vinculación ha sido aprobada por la Coordinación Académica. Configura y activa tu cuenta institucional.');
        } catch (err) {
          console.error('Error al consultar detalles de activación:', err);
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
        setFlowDesc('Vinculación de plan curricular, asignación de cursos y registro oficial.');
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

    const isActivation = code.toLowerCase().startsWith('act-');

    if (isActivation) {
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
        console.error('Error al actualizar estado a activated en Supabase:', err);
      }
    } else {
      const currentInstId = targetInstitution.id || '3ee6d8c5-e23f-4848-aa36-cd456afb0dfe';
      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = fullName.trim();
      const cleanDoc = nationalId.trim();
      const cleanPhone = phone.trim() || 'No registrado';

      if (flowType === 'teacher') {
        const payload: TeacherOnboardingData = {
          institution_id: currentInstId,
          full_name: cleanFullName,
          document_id: cleanDoc,
          email: cleanEmail,
          phone: cleanPhone,
          selected_roles: selectedRole === 'director_grupo' ? ['director_grupo', 'docente'] : ['docente'],
          status: 'pending_approval'
        };

        try {
          await submitOnboarding(payload);
        } catch (dbErr) {
          console.error('Error al insertar en teacher_onboardings:', dbErr);
        }

        // Despacho real de confirmación por correo mediante Resend API
        try {
          const emailRes = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: cleanEmail,
              subject: `✨ Solicitud de Registro Recibida - ${targetInstitution.name}`,
              message: `Tu postulación de vinculación docente para ${targetInstitution.name} ha sido recibida con éxito en el sistema AulaCore. Tan pronto la institución revise y apruebe tu solicitud, recibirás un correo electrónico con tus credenciales y el enlace directo para activar tu cuenta institucional.`,
              recipientName: cleanFullName,
              category: 'onboarding',
              metadata: {
                fullName: cleanFullName,
                institutionName: targetInstitution.name,
                documentId: cleanDoc,
                role: selectedRole
              },
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                  <h2 style="color: #0f172a; margin-top: 0;">¡Solicitud de Registro Recibida!</h2>
                  <p style="color: #334155; font-size: 15px; line-height: 1.5;">Estimado(a) <strong>${cleanFullName}</strong>,</p>
                  <p style="color: #334155; font-size: 15px; line-height: 1.5;">Tu postulación de vinculación docente para <strong>${targetInstitution.name}</strong> ha sido recibida con éxito en el sistema AulaCore.</p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: bold; font-size: 14px;">Resumen del registro:</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Docente:</strong> ${cleanFullName}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Identificación:</strong> ${cleanDoc}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Institución:</strong> ${targetInstitution.name}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Rol postulado:</strong> ${selectedRole === 'director_grupo' ? 'Director de Grupo' : 'Docente'}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>Estado:</strong> En espera de aprobación por Coordinación Académica</p>
                  </div>

                  <p style="color: #334155; font-size: 14px; line-height: 1.5;">Tan pronto la institución revise y apruebe tu solicitud, recibirás un correo electrónico con tus credenciales y el enlace directo para activar tu cuenta institucional.</p>

                  <p style="font-size: 12px; color: #64748b; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                    Mensaje generado automáticamente por AulaCore para ${targetInstitution.name}.
                  </p>
                </div>
              `
            })
          });

          if (!emailRes.ok) {
            const errorData = await emailRes.json().catch(() => ({}));
            console.error('Error al despachar correo de pre-registro:', errorData);
          }
        } catch (emailErr) {
          console.error('Error al despachar correo de pre-registro:', emailErr);
        }
      } else {
        const studentPayload: StudentOnboardingData = {
          institution_id: currentInstId,
          student_name: cleanFullName,
          student_id: cleanDoc,
          status: 'pending_approval'
        };
        try {
          await submitStudentOnboarding(studentPayload);
        } catch (dbErr) {
          console.error('Error al insertar en student_onboardings:', dbErr);
        }
      }
    }

    const animationSteps = [
      { p: 25, text: 'Verificando datos institucionales en AulaCore...' },
      { p: 55, text: 'Registrando expediente en base de datos de la institución...' },
      { p: 85, text: 'Enviando notificación a Coordinación Académica...' },
      { p: 100, text: '¡Proceso completado exitosamente!' }
    ];

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
    }, 700);
  };

  const handleExitAndLogin = async () => {
    // 1. Terminar cualquier sesión activa anterior (evitar reutilización de la sesión del Rector)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error al cerrar sesión anterior:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('aulacore-user-role');
      localStorage.removeItem('aulacore-demo-session');
    }

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
        console.error('Error al actualizar estado a first_access:', err);
      }
    }

    // Redirigir a login con el email pre-cargado para autenticación segura
    router.push(`/login?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Banner with dynamically resolved institution name */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
            AulaCore Auto-Onboarding
          </span>
          <h1 className="text-xl font-black text-white mt-1 tracking-tight">
            {targetInstitution.name}
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
                    onClick={() => setSelectedRole('estudiante')}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'estudiante' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Estudiante
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('padre_familia')}
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
                    onClick={() => setSelectedRole('docente')}
                    className={cn(
                      "py-2 rounded-lg cursor-pointer transition-all border-none outline-none",
                      selectedRole === 'docente' ? "bg-indigo-600 text-white font-extrabold shadow-sm" : "hover:bg-slate-800"
                    )}
                  >
                    Docente Aula
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('director_grupo')}
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
                    placeholder="Ej. Pedro Pablo Holguin"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

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
                    placeholder="Ej. CC 1023456789"
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
                    placeholder="Ej. docente@aulacore.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-850 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!!onboardingData}
                    placeholder="Ej. +57 300 123 4567"
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

              <div className="bg-slate-850 p-4 border border-slate-800/80 rounded-2xl flex items-start gap-2.5 mt-3 select-none text-[10px] font-semibold text-slate-400 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Entorno Seguro Institucional:</strong> Tus datos se almacenan de forma aislada y protegida en el expediente de <strong>{targetInstitution.name}</strong> según la normativa de Habeas Data.
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
          /* STEP 2: Progress Loader */
          <div className="p-10 text-center space-y-6 animate-in zoom-in-95">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-900/30 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin" />
              <div className="absolute inset-3.5 rounded-full bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Procesando Información...</h4>
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
          /* STEP 3: Real Confirmation Screen */
          <div className="p-8 text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-100 mb-1">
                {code.toLowerCase().startsWith('act-') ? '¡Cuenta Activada con Éxito!' : '¡Solicitud Registrada con Éxito!'}
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-6">
                {code.toLowerCase().startsWith('act-')
                  ? `Tu cuenta ha sido activada en ${targetInstitution.name}. Puedes iniciar sesión ahora con tus credenciales institucionales.`
                  : `Tu solicitud ha sido radicada correctamente en ${targetInstitution.name}. La Coordinación Académica revisará tu postulación y recibirás la confirmación y enlace de activación por correo electrónico.`}
              </p>
            </div>

            <div className="bg-slate-850 p-4 border border-slate-800 rounded-2xl text-left space-y-2.5 max-w-sm mx-auto">
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">Institución:</span>
                <span className="text-emerald-400 font-black truncate max-w-[200px]">{targetInstitution.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">
                  {selectedRole === 'estudiante' ? 'Estudiante:' :
                   selectedRole === 'padre_familia' ? 'Acudiente:' : 'Docente:'}
                </span>
                <span className="text-slate-200 font-black truncate max-w-[180px]">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">Identificación:</span>
                <span className="text-slate-200 font-black">{nationalId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5 text-xs">
                <span className="text-slate-400 font-bold">Correo:</span>
                <span className="text-slate-300 font-semibold truncate max-w-[180px]">{email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Estado:</span>
                <span className="text-indigo-400 font-black">
                  {code.toLowerCase().startsWith('act-') ? 'Cuenta Activa' : 'Pendiente de Aprobación'}
                </span>
              </div>
            </div>

            <button
              onClick={handleExitAndLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 rounded-xl transition shadow shadow-indigo-650/25 text-xs cursor-pointer border-none outline-none flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              {code.toLowerCase().startsWith('act-') ? 'Iniciar Sesión en mi Consola' : 'Continuar al Portal de Ingreso'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function JoinOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Cargando portal de onboarding...</span>
        </div>
      </div>
    }>
      <JoinOnboardingContent />
    </Suspense>
  );
}
