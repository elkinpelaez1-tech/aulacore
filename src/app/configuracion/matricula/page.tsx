'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, ArrowLeft, ArrowRight, CheckCircle2, CloudUpload, 
  Trash2, FileText, Sparkles, Check, RefreshCw, Smartphone, 
  MapPin, Calendar, Heart, Shield, Award, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { uploadStudentFile, submitStudentOnboarding, StudentOnboardingData } from '@/lib/services/student-onboarding';


// TypeScript schema interfaces for enrollment form
interface StudentFormData {
  // Step 1: Institutional
  sede: string;
  jornada: string;
  periodo: string;
  tipoMatricula: string;
  
  // Step 2: Student Personal Info
  studentName: string;
  studentId: string;
  idType: string;
  birthDate: string;
  bloodType: string;
  epsName: string;
  address: string;
  hasDisability: string;
  disabilityType: string;
  sisbenLevel: string;
  stratum: string;

  // Step 3: Family / Guardians
  motherName: string;
  motherPhone: string;
  fatherName: string;
  fatherPhone: string;
  primaryGuardian: 'madre' | 'padre' | 'otro';
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;

  // Step 4: Academic history
  previousSchool: string;
  lastCompletedGrade: string;
  previousSchoolType: string;

  // Step 5: Medical info
  allergies: string;
  medications: string;
  physicalRestrictions: string;
  medicalObservations: string;

  // Step 6: Document details (uploaded state)
  fotoStudentUploaded: boolean;
  fotoStudentUrl?: string;
  epsCardUploaded: boolean;
  epsCardUrl?: string;
  identityDocUploaded: boolean;
  identityDocUrl?: string;
  notesCertUploaded: boolean;
  notesCertUrl?: string;
  pazSalvoUploaded: boolean;
  pazSalvoUrl?: string;
  medicalCertUploaded: boolean;
  medicalCertUrl?: string;

  // Step 7: Consents & Signatures
  consentHabeasData: boolean;
  consentManual: boolean;
  consentSIEE: boolean;
  consentInstitutional: boolean;
  signatureDataUrl: string; // Base64 signature path
  signatureUrl?: string;
}

const INITIAL_FORM_STATE: StudentFormData = {
  sede: 'Principal',
  jornada: 'Única',
  periodo: '2026',
  tipoMatricula: 'Ordinaria',
  studentName: '',
  studentId: '',
  idType: 'RC',
  birthDate: '',
  bloodType: 'O+',
  epsName: '',
  address: '',
  hasDisability: 'no',
  disabilityType: '',
  sisbenLevel: 'Ninguno',
  stratum: '1',
  motherName: '',
  motherPhone: '',
  fatherName: '',
  fatherPhone: '',
  primaryGuardian: 'madre',
  emergencyName: '',
  emergencyPhone: '',
  emergencyRelation: '',
  previousSchool: '',
  lastCompletedGrade: '',
  previousSchoolType: 'Público',
  allergies: '',
  medications: '',
  physicalRestrictions: '',
  medicalObservations: '',
  fotoStudentUploaded: false,
  fotoStudentUrl: '',
  epsCardUploaded: false,
  epsCardUrl: '',
  identityDocUploaded: false,
  identityDocUrl: '',
  notesCertUploaded: false,
  notesCertUrl: '',
  pazSalvoUploaded: false,
  pazSalvoUrl: '',
  medicalCertUploaded: false,
  medicalCertUrl: '',
  consentHabeasData: false,
  consentManual: false,
  consentSIEE: false,
  consentInstitutional: false,
  signatureDataUrl: '',
  signatureUrl: '',
};

export default function MatriculaPage() {
  const router = useRouter();
  
  // Master states
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_STATE);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string; progress: number }>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Input refs for file uploads
  const fotoStudentInputRef = useRef<HTMLInputElement>(null);
  const epsCardInputRef = useRef<HTMLInputElement>(null);
  const identityDocInputRef = useRef<HTMLInputElement>(null);
  const notesCertInputRef = useRef<HTMLInputElement>(null);
  const pazSalvoInputRef = useRef<HTMLInputElement>(null);
  const medicalCertInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DE PRE-REGISTRO Y AUTOCOMPLETADO ---
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [preRegAlert, setPreRegAlert] = useState('');

  useEffect(() => {
    const loadPreRegs = () => {
      const DEFAULT_PRE_REGISTRATIONS = [
        { fullName: 'Pedro Castro', nationalId: '10174125478', email: 'castrop@yahoo.es', gradeLevel: 'Bachillerato', registrationDate: '1 Jun 2026', status: 'Pre-matriculado' },
        { fullName: 'Andrés Felipe Gómez', nationalId: '1020485963', email: 'andres.gomez@gmail.com', gradeLevel: 'Media Técnica', registrationDate: '30 May 2026', status: 'Pre-matriculado' },
        { fullName: 'Laura Valentina Pérez', nationalId: '1018594032', email: 'laura.perez@outlook.com', gradeLevel: 'Primaria', registrationDate: '28 May 2026', status: 'Pre-matriculado' }
      ];
      let list = [...DEFAULT_PRE_REGISTRATIONS];
      const saved = localStorage.getItem('aulacore-pre-registrations');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.forEach((item: any) => {
            if (!list.some(p => p.nationalId === item.nationalId)) {
              list.unshift(item);
            }
          });
        } catch (e) {}
      }
      setPreRegistrations(list);
    };

    loadPreRegs();
  }, []);

  // Canvas drawing refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('aulacore-matricula-draft');
    const savedStep = localStorage.getItem('aulacore-matricula-draft-step');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error('Error loading enrollment draft', e);
      }
    }
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  // Silent Background Auto-Save
  const autoSave = (newData: StudentFormData, newStep: number) => {
    setSaveStatus('saving');
    localStorage.setItem('aulacore-matricula-draft', JSON.stringify(newData));
    localStorage.setItem('aulacore-matricula-draft-step', newStep.toString());
    setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  };

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    let updated = { ...formData, [field]: value };

    if (field === 'studentName' || field === 'studentId') {
      const val = String(value).toLowerCase();
      const matched = preRegistrations.find(p => {
        if (!val || val.length < 3) return false;
        return p.nationalId.includes(val) || 
               p.fullName.toLowerCase().includes(val) ||
               val.includes(p.fullName.toLowerCase());
      });

      if (matched) {
        let targetGrade = 'Décimo';
        if (matched.gradeLevel === 'Bachillerato') targetGrade = 'Noveno de Bachillerato';
        if (matched.gradeLevel === 'Media Técnica') targetGrade = 'Décimo';
        if (matched.gradeLevel === 'Primaria') targetGrade = 'Quinto de Primaria';
        if (matched.gradeLevel === 'Preescolar') targetGrade = 'Transición';

        updated = {
          ...updated,
          studentName: matched.fullName,
          studentId: matched.nationalId,
          epsName: 'Sura',
          bloodType: 'O+',
          birthDate: '2010-05-15',
          idType: matched.nationalId.startsWith('1') ? 'TI' : 'CC',
          address: 'Calle 100 # 15-20, Sede Central',
          motherName: 'Marta Pelaez Ortiz',
          motherPhone: '+57 301 234 5678',
          fatherName: 'Ramón Pelaez',
          fatherPhone: '+57 312 987 6543',
          previousSchool: 'Colegio Demo AulaCore',
          lastCompletedGrade: targetGrade,
          sisbenLevel: 'C1 - C18 (Vulnerable)',
          stratum: '2',
          hasDisability: 'no'
        };

        setPreRegAlert(`✨ Pre-registro detectado para ${matched.fullName}. ¡Formulario autocompletado!`);
        setTimeout(() => setPreRegAlert(''), 5000);
      }
    }

    setFormData(updated);
    autoSave(updated, step);
  };

  // Step Navigations
  const nextStep = () => {
    if (step < 8) {
      const targetStep = step + 1;
      setStep(targetStep);
      autoSave(formData, targetStep);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const targetStep = step - 1;
      setStep(targetStep);
      autoSave(formData, targetStep);
    }
  };

  // Canvas Signature Methods
  useEffect(() => {
    if (step === 7 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#312e81'; // Deep Indigo
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Restore signature if exists
        if (formData.signatureDataUrl) {
          const img = new Image();
          img.src = formData.signatureDataUrl;
          img.onload = () => ctx.drawImage(img, 0, 0);
        }
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling on mobile touch events
    if (e.cancelable) e.preventDefault();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasData();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleInputChange('signatureDataUrl', '');
    }
  };

  const saveCanvasData = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    handleInputChange('signatureDataUrl', dataUrl);
  };

  // Real file upload to Supabase Storage for student documents
  const handleRealUpload = async (field: keyof StudentFormData, file: File) => {
    if (!formData.studentId) {
      alert('Por favor ingrese el Documento de Identidad del Estudiante antes de cargar archivos.');
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [field]: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, progress: 10 }
    }));

    let progressVal = 10;
    const progressInterval = setInterval(() => {
      progressVal += 15;
      if (progressVal >= 90) {
        clearInterval(progressInterval);
      } else {
        setUploadedFiles(prev => {
          if (!prev[field]) return prev;
          return {
            ...prev,
            [field]: { ...prev[field], progress: progressVal }
          };
        });
      }
    }, 150);

    try {
      const folder = field === 'fotoStudentUploaded' ? 'photos' : 'documents';
      const urlField = field.replace('Uploaded', 'Url') as keyof StudentFormData;
      const fileName = file.name;

      const publicUrl = await uploadStudentFile(file, folder, formData.studentId, fileName);

      clearInterval(progressInterval);
      setUploadedFiles(prev => ({
        ...prev,
        [field]: { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, progress: 100 }
      }));

      // Update state first
      setFormData(prev => ({
        ...prev,
        [field]: true,
        [urlField]: publicUrl
      }));
      
      // Auto-save outside state updater using the correct new data
      autoSave({
        ...formData,
        [field]: true,
        [urlField]: publicUrl
      }, step);
      
      setUploadErrors(prev => ({ ...prev, [field]: '' }));
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(`Error uploading ${field}:`, err);
      setUploadErrors(prev => ({ ...prev, [field]: err.message || 'Error al subir archivo' }));
      setUploadedFiles(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleDeleteFile = (field: keyof StudentFormData) => {
    const urlField = field.replace('Uploaded', 'Url') as keyof StudentFormData;
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setFormData(prev => ({
      ...prev,
      [field]: false,
      [urlField]: ''
    }));
    autoSave({
      ...formData,
      [field]: false,
      [urlField]: ''
    }, step);
  };

  // Submit and dynamic DB creation callback
  const handleSubmitEnrollment = async () => {
    if (!formData.studentName || !formData.studentId) {
      alert('Por favor complete los datos obligatorios del estudiante (Nombres y Documento) en el Paso 2.');
      setStep(2);
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Error de Envío: Las variables de entorno de Supabase no están configuradas.');
      return;
    }

    setSubmitting(true);
    try {
      let finalSignatureUrl = '';
      if (formData.signatureDataUrl) {
        try {
          const byteString = atob(formData.signatureDataUrl.split(',')[1]);
          const mimeString = formData.signatureDataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          finalSignatureUrl = await uploadStudentFile(file, 'signatures', formData.studentId, 'signature.png');
        } catch (sigErr) {
          console.error("Error uploading student signature file:", sigErr);
        }
      }

      const payload: StudentOnboardingData = {
        institution_id: '11111111-1111-1111-1111-111111111111',
        sede: formData.sede,
        jornada: formData.jornada,
        periodo: formData.periodo,
        tipo_matricula: formData.tipoMatricula,
        student_name: formData.studentName,
        student_id: formData.studentId,
        id_type: formData.idType,
        birth_date: formData.birthDate || undefined,
        blood_type: formData.bloodType || undefined,
        eps_name: formData.epsName || undefined,
        address: formData.address || undefined,
        has_disability: formData.hasDisability,
        disability_type: formData.disabilityType || undefined,
        sisben_level: formData.sisbenLevel,
        stratum: formData.stratum,
        mother_name: formData.motherName || undefined,
        mother_phone: formData.motherPhone || undefined,
        father_name: formData.fatherName || undefined,
        father_phone: formData.fatherPhone || undefined,
        primary_guardian: formData.primaryGuardian,
        emergency_name: formData.emergencyName || undefined,
        emergency_phone: formData.emergencyPhone || undefined,
        emergency_relation: formData.emergencyRelation || undefined,
        previous_school: formData.previousSchool || undefined,
        last_completed_grade: formData.lastCompletedGrade || undefined,
        previous_school_type: formData.previousSchoolType,
        allergies: formData.allergies || undefined,
        medications: formData.medications || undefined,
        physical_restrictions: formData.physicalRestrictions || undefined,
        medical_observations: formData.medicalObservations || undefined,
        foto_student_url: formData.fotoStudentUrl || undefined,
        eps_card_url: formData.epsCardUrl || undefined,
        identity_doc_url: formData.identityDocUrl || undefined,
        notes_cert_url: formData.notesCertUrl || undefined,
        paz_salvo_url: formData.pazSalvoUrl || undefined,
        medical_cert_url: formData.medicalCertUrl || undefined,
        signature_url: finalSignatureUrl || undefined,
        consent_habeas_data: formData.consentHabeasData,
        consent_manual: formData.consentManual,
        consent_siee: formData.consentSIEE,
        consent_institutional: formData.consentInstitutional,
        status: 'pending_approval'
      };

      await submitStudentOnboarding(payload);

      // Clear local draft and go to success screen
      localStorage.removeItem('aulacore-matricula-draft');
      localStorage.removeItem('aulacore-matricula-draft-step');
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting student onboarding:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('student_onboardings_student_id_key') || errMsg.includes('duplicate key value violates unique constraint')) {
        alert('Error: El documento de identidad del estudiante ingresado ya tiene una matrícula activa o registrada en el sistema. Por favor verifica los datos.');
      } else {
        alert('Error al enviar la matrícula: ' + (err.message || err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Mobile steps labels
  const STEPS_DATA = [
    { title: 'Institucional', desc: 'Sede y jornadas' },
    { title: 'Estudiante', desc: 'Datos del alumno' },
    { title: 'Familiares', desc: 'Padres y acudientes' },
    { title: 'Procedencia', desc: 'Colegio anterior' },
    { title: 'Salud', desc: 'Datos médicos' },
    { title: 'Documentos', desc: 'Carga digital' },
    { title: 'Firmas', desc: 'Consentimiento' },
    { title: 'Resumen', desc: 'Verificación final' },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50/50 p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <Check className="w-10 h-10" />
          </div>
          
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
            Expediente Digital Generado
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">¡Proceso de Matrícula Enviado!</h2>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Los datos y firmas han sido digitalizados de forma segura. El expediente ingresó en la 
            <span className="text-indigo-600 font-bold"> Cola de Aprobación Administrativa</span> de AulaCore.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-3.5">
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Notificación Enviada</h4>
                <p className="text-[10px] text-slate-500">Un enlace de confirmación fue enviado por SMS/WhatsApp al acudiente.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Pre-Validación IA Activa</h4>
                <p className="text-[10px] text-slate-500">La inteligencia artificial ya está analizando la legibilidad de la documentación.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                setFormData(INITIAL_FORM_STATE);
                setStep(1);
                setIsSubmitted(false);
              }}
              className="px-4 py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
            >
              Matricular Otro Alumno
            </button>
            <button 
              onClick={() => router.push('/configuracion/automatizacion')}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Ir a Cola de Aprobación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/30 flex flex-col py-6 px-4 md:px-8 max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner (AutoSave + Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-600" /> Matrícula Digital AulaCore
          </h1>
          <p className="text-xs text-slate-500 font-bold tracking-wide mt-1 uppercase">Portal de Auto-Onboarding Institucional</p>
        </div>
        
        {/* Notch/Notion AutoSave Status */}
        <div className="self-start sm:self-center flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm transition-all duration-200">
          <div className="relative flex h-2 w-2">
            <span className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              saveStatus === 'saving' ? "bg-amber-400" : "bg-emerald-400"
            )}></span>
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              saveStatus === 'saving' ? "bg-amber-500" : "bg-emerald-500"
            )}></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 select-none">
            {saveStatus === 'saving' ? 'Guardando borrador...' : '✓ Guardado automáticamente'}
          </span>
        </div>
      </div>

      {/* Supabase Config Warning */}
      {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start gap-2.5 text-xs font-semibold shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="block text-rose-900 mb-0.5">Advertencia: Falta configuración de Supabase en Vercel</strong>
            Asegúrate de agregar las variables de entorno <code className="bg-rose-100 px-1 py-0.5 rounded font-bold font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="bg-rose-100 px-1 py-0.5 rounded font-bold font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en tu panel de proyectos de Vercel. De lo contrario, los archivos cargados y el expediente de la matrícula no se guardarán en Supabase y el envío se quedará en estado de carga infinito.
          </div>
        </div>
      )}

      {/* Main Wizard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        
        {/* SIDEBAR: Step Indicator (Desktop) */}
        <div className="hidden lg:flex flex-col gap-1.5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">Matrícula Escolar 2026</h3>
          {STEPS_DATA.map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;
            
            return (
              <button 
                key={s.title}
                onClick={() => {
                  setStep(stepNum);
                  autoSave(formData, stepNum);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 group/step cursor-pointer",
                  isActive ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : 
                  isCompleted ? "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black transition-all",
                  isActive ? "bg-indigo-600 text-white" :
                  isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 group-hover/step:bg-slate-200"
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNum}
                </div>
                <div>
                  <p className="leading-none">{s.title}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* MOBILE PROGRESS INDICATOR */}
        <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Paso {step} de 8</span>
            <span className="text-sm font-bold text-slate-800 mt-1">{STEPS_DATA[step-1].title}</span>
          </div>
          <div className="flex gap-1">
            {STEPS_DATA.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx + 1 === step ? "w-6 bg-indigo-600" :
                  idx + 1 < step ? "w-2 bg-emerald-500" : "w-1.5 bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col min-h-[480px]">
          
          <div className="flex-1 p-6 md:p-8">
            
            {/* STEP 1: INSTITUCIONAL */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" /> 1. Información Institucional
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Configuración del año académico y ubicación física.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Sede del Colegio</label>
                    <select 
                      value={formData.sede}
                      onChange={(e) => handleInputChange('sede', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option>Sede Principal (Bachillerato)</option>
                      <option>Sede Campestre (Primaria)</option>
                      <option>Sede Norte (Preescolar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Jornada</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mañana', 'Tarde', 'Única'].map(jornada => (
                        <button
                          key={jornada}
                          onClick={() => handleInputChange('jornada', jornada)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                            formData.jornada === jornada 
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {jornada}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Año Lectivo</label>
                    <input 
                      type="text" 
                      value={formData.periodo}
                      disabled
                      className="w-full bg-slate-100/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tipo de Matrícula</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Ordinaria', 'Extraordinaria'].map(tipo => (
                        <button
                          key={tipo}
                          onClick={() => handleInputChange('tipoMatricula', tipo)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                            formData.tipoMatricula === tipo 
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* STEP 2: ESTUDIANTE */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-500" /> 2. Datos del Estudiante
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Información de identidad y contacto del alumno.</p>
                </div>

                {preRegAlert && (
                  <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold p-3.5 rounded-2xl animate-pulse flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>{preRegAlert}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Nombres y Apellidos Completos</label>
                      {preRegistrations.length > 0 && (
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2 py-0.5 rounded shadow-3xs select-none">
                          ✨ {preRegistrations.length} Pre-registros autorizados en cola
                        </span>
                      )}
                    </div>
                    <input 
                      type="text"
                      placeholder="Ej. Laura Valentina Pérez o digita 'Elkin'"
                      value={formData.studentName}
                      onChange={(e) => handleInputChange('studentName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tipo de Documento</label>
                    <select
                      value={formData.idType}
                      onChange={(e) => handleInputChange('idType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="RC">Registro Civil (RC)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="PEP">Permiso Especial (PEP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Número de Documento</label>
                    <input 
                      type="text"
                      placeholder="Ej. 1024567890"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Fecha de Nacimiento
                    </label>
                    <input 
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> Tipo de Sangre & RH
                    </label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => handleInputChange('bloodType', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(rh => (
                        <option key={rh} value={rh}>{rh}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">EPS afiliada</label>
                    <input 
                      type="text"
                      placeholder="Ej. Sura, Sanitas, Compensar"
                      value={formData.epsName}
                      onChange={(e) => handleInputChange('epsName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Dirección Residencial</label>
                    <input 
                      type="text"
                      placeholder="Calle 123 # 45 - 67, Bogotá"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Estrato Socioeconómico</label>
                    <div className="grid grid-cols-6 gap-1">
                      {['1', '2', '3', '4', '5', '6'].map(estrato => (
                        <button
                          key={estrato}
                          onClick={() => handleInputChange('stratum', estrato)}
                          className={cn(
                            "py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer",
                            formData.stratum === estrato 
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {estrato}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Grupo SISBEN</label>
                    <select
                      value={formData.sisbenLevel}
                      onChange={(e) => handleInputChange('sisbenLevel', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option>Ninguno</option>
                      <option>A1 - A5 (Pobreza Extrema)</option>
                      <option>B1 - B7 (Pobreza Moderada)</option>
                      <option>C1 - C18 (Vulnerable)</option>
                      <option>D1 - D21 (No pobre)</option>
                    </select>
                  </div>

                  {/* Discapacidad Toggles (iOS-style toggles) */}
                  <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between mt-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">¿Presenta alguna Discapacidad o Capacidad Excepcional?</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Habilita esta casilla para registrar condiciones de acompañamiento curricular.</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('hasDisability', formData.hasDisability === 'si' ? 'no' : 'si')}
                      className={cn(
                        "w-12 h-6 rounded-full relative transition-colors cursor-pointer shrink-0",
                        formData.hasDisability === 'si' ? "bg-indigo-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                        formData.hasDisability === 'si' ? "left-6" : "left-1"
                      )}></div>
                    </button>
                  </div>

                  {formData.hasDisability === 'si' && (
                    <div className="md:col-span-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Detalla la condición de Discapacidad</label>
                      <input 
                        type="text"
                        placeholder="Ej. Discapacidad Visual, Cognitiva, Autismo, Capacidad Excepcional"
                        value={formData.disabilityType}
                        onChange={(e) => handleInputChange('disabilityType', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: FAMILY & GUARDIANS */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" /> 3. Datos Familiares y Acudiente
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Información de padres, acudiente legal y emergencias.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Madre */}
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Información de la Madre</h3>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nombre Completo</label>
                      <input 
                        type="text" value={formData.motherName} onChange={(e) => handleInputChange('motherName', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Teléfono Móvil</label>
                      <input 
                        type="text" value={formData.motherPhone} onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  {/* Padre */}
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Información del Padre</h3>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nombre Completo</label>
                      <input 
                        type="text" value={formData.fatherName} onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Teléfono Móvil</label>
                      <input 
                        type="text" value={formData.fatherPhone} onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  {/* Acudiente principal selection */}
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Acudiente Principal Designado</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['madre', 'padre', 'otro'].map(acudiente => (
                        <button
                          key={acudiente}
                          onClick={() => handleInputChange('primaryGuardian', acudiente)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer capitalize",
                            formData.primaryGuardian === acudiente 
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {acudiente}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contacto Emergencia */}
                  <div className="border border-slate-200 rounded-2xl p-4 space-y-4 md:col-span-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">Contacto en Caso de Emergencia</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nombre Completo</label>
                        <input 
                          type="text" value={formData.emergencyName} onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Teléfono</label>
                        <input 
                          type="text" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Relación Familiar</label>
                        <input 
                          type="text" placeholder="Ej. Tía, Hermano, Abuela"
                          value={formData.emergencyRelation} onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 4: PROCEDENCIA ACADEMICA */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> 4. Procedencia Académica
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Historial escolar y grados cursados con anterioridad.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Institución Educativa de Procedencia (Colegio Anterior)</label>
                    <input 
                      type="text"
                      placeholder="Ej. Colegio Campestre San José, o 'Ninguno'"
                      value={formData.previousSchool}
                      onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Último Grado Cursado y Aprobado</label>
                    <select
                      value={formData.lastCompletedGrade}
                      onChange={(e) => handleInputChange('lastCompletedGrade', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option>Transición</option>
                      <option>Primero de Primaria</option>
                      <option>Segundo de Primaria</option>
                      <option>Tercero de Primaria</option>
                      <option>Cuarto de Primaria</option>
                      <option>Quinto de Primaria</option>
                      <option>Sexto de Bachillerato</option>
                      <option>Séptimo de Bachillerato</option>
                      <option>Octavo de Bachillerato</option>
                      <option>Noveno de Bachillerato</option>
                      <option>Décimo</option>
                      <option>Ninguno (Primera vez escolarizado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Sector de la Institución</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Público', 'Privado'].map(sector => (
                        <button
                          key={sector}
                          onClick={() => handleInputChange('previousSchoolType', sector)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                            formData.previousSchoolType === sector 
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {sector}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 5: MEDICA & OBSERVACIONES */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Heart className="w-5 h-5 text-indigo-500 animate-pulse" /> 5. Ficha Médica & Observaciones
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Condiciones fisiológicas relevantes para el colegio.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Alergias Alimentarias o Medicamentosas</label>
                    <input 
                      type="text" placeholder="Ej. Alergia a la penicilina, intolerancia al gluten, o 'Ninguna'"
                      value={formData.allergies} onChange={(e) => handleInputChange('allergies', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Medicamentos de uso permanente</label>
                    <input 
                      type="text" placeholder="Ej. Inhalador asma (salbutamol), insulina, o 'Ninguno'"
                      value={formData.medications} onChange={(e) => handleInputChange('medications', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Restricciones para educación física u otras actividades</label>
                    <textarea 
                      placeholder="Añade restricciones por cirugías o condiciones osteomusculares..."
                      value={formData.physicalRestrictions} onChange={(e) => handleInputChange('physicalRestrictions', e.target.value)}
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none shadow-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: CARGA DOCUMENTAL (Google Drive Style) */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                      <CloudUpload className="w-5 h-5 text-indigo-500" /> 6. Carga Documental
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Sube los archivos soporte de la matrícula.</p>
                  </div>
                  
                  {/* AI Metadata tag pre-loaded */}
                  <span className="self-start sm:self-center flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> OCR IA Pre-activo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { label: 'Fotografía del Estudiante (Fondo blanco)', field: 'fotoStudentUploaded', ref: fotoStudentInputRef, accept: 'image/*', type: 'Foto_Estudiante.jpg' },
                    { label: 'Certificado de Afiliación a EPS (Máx. 30 días)', field: 'epsCardUploaded', ref: epsCardInputRef, accept: '.pdf,image/*', type: 'Certificado_EPS.pdf' },
                    { label: 'Documento de Identidad Estudiante (Ambas caras)', field: 'identityDocUploaded', ref: identityDocInputRef, accept: '.pdf,image/*', type: 'Documento_Identidad.pdf' },
                    { label: 'Certificado de Notas Grado Anterior', field: 'notesCertUploaded', ref: notesCertInputRef, accept: '.pdf,image/*', type: 'Certificado_Academico.pdf' },
                    { label: 'Paz y Salvo Colegio Anterior', field: 'pazSalvoUploaded', ref: pazSalvoInputRef, accept: '.pdf,image/*', type: 'Paz_y_Salvo.pdf' },
                    { label: 'Certificado de Estado de Salud General', field: 'medicalCertUploaded', ref: medicalCertInputRef, accept: '.pdf,image/*', type: 'Certificado_Medico.pdf' },
                  ].map(doc => {
                    const isUploaded = formData[doc.field as keyof StudentFormData];
                    const fileLoader = uploadedFiles[doc.field];
                    
                    return (
                      <div 
                        key={doc.field}
                        className={cn(
                          "border border-dashed rounded-2xl p-4 flex flex-col justify-between transition-all duration-300",
                          isUploaded 
                            ? "bg-emerald-50/40 border-emerald-300" 
                            : fileLoader 
                            ? "bg-indigo-50/20 border-indigo-300"
                            : "bg-slate-50/50 border-slate-250 hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="file"
                          ref={doc.ref}
                          className="hidden"
                          accept={doc.accept}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRealUpload(doc.field as keyof StudentFormData, file);
                          }}
                        />
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{doc.label}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Soporta: PDF, JPG, PNG</p>
                          </div>
                          <div className="text-indigo-500 shrink-0">
                            {isUploaded ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <FileText className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </div>

                        {/* File state / progress loader */}
                        {isUploaded ? (
                          <div className="flex items-center justify-between bg-white border border-emerald-100 px-3 py-2 rounded-xl text-[11px] text-emerald-800 font-medium">
                            <span className="truncate max-w-[150px] font-mono">{fileLoader?.name || doc.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">Auditable</span>
                              <button 
                                type="button"
                                onClick={() => handleDeleteFile(doc.field as keyof StudentFormData)}
                                className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : fileLoader ? (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold text-indigo-700 uppercase tracking-widest">
                              <span>Subiendo archivo soporte...</span>
                              <span>{fileLoader.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full transition-all duration-150" style={{ width: `${fileLoader.progress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button 
                              type="button"
                              onClick={() => {
                                if (!formData.studentId) {
                                  alert('Por favor ingrese el Documento de Identidad del Estudiante antes de cargar archivos.');
                                  return;
                                }
                                doc.ref.current?.click();
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-650 text-[11px] font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                            >
                              + Seleccionar Archivo
                            </button>
                            {uploadErrors[doc.field] && (
                              <p className="text-[9px] text-rose-500 mt-1 text-center font-semibold">{uploadErrors[doc.field]}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: FIRMAS DIGITALES & CANVAS */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-indigo-500" /> 7. Firmas & Autorizaciones Legales
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Conformidad legal y firmas biométricas del acudiente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Toggles de consentimiento */}
                  <div className="space-y-3.5 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-200/50 pb-2">Cláusulas de Aceptación</h3>
                    
                    {[
                      { label: 'Autorización Tratamiento de Datos (Ley 1581 / Habeas Data)', field: 'consentHabeasData' },
                      { label: 'Aceptación del Manual de Convivencia Institucional', field: 'consentManual' },
                      { label: 'Aceptación del SIEE (Evaluación Estudiantil)', field: 'consentSIEE' },
                      { label: 'Consentimiento para salidas y eventos pedagógicos', field: 'consentInstitutional' },
                    ].map(c => (
                      <div key={c.field} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-700 leading-snug">{c.label}</span>
                        <button
                          onClick={() => handleInputChange(c.field as keyof StudentFormData, !formData[c.field as keyof StudentFormData])}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                            formData[c.field as keyof StudentFormData] ? "bg-emerald-500" : "bg-slate-350"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                            formData[c.field as keyof StudentFormData] ? "left-5" : "left-1"
                          )}></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Canvas de Firma Táctil */}
                  <div className="border border-slate-200 rounded-2xl p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Firma Manual del Acudiente</h4>
                        <p className="text-[9px] text-slate-400 font-semibold">Dibuja tu firma con el ratón o pantalla táctil.</p>
                      </div>
                      <button 
                        onClick={clearCanvas}
                        className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        Limpiar Canvas
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-inner min-h-[160px]">
                      <canvas 
                        ref={canvasRef}
                        width={300}
                        height={180}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair block bg-transparent"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 8: RESUMEN FINAL & ENVIO */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500" /> 8. Resumen & Envío de Expediente
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Revisa detalladamente la información del expediente digital.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  {/* Resumen Alumno */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Estudiante</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <p><span className="text-slate-400 font-medium">Nombre:</span> {formData.studentName || '—'}</p>
                      <p><span className="text-slate-400 font-medium">Identificación:</span> {formData.studentId || '—'} ({formData.idType})</p>
                      <p><span className="text-slate-400 font-medium">Nacimiento:</span> {formData.birthDate || '—'}</p>
                      <p><span className="text-slate-400 font-medium">RH & EPS:</span> {formData.bloodType} &bull; {formData.epsName || '—'}</p>
                      <p><span className="text-slate-400 font-medium">Dirección:</span> {formData.address || '—'}</p>
                    </div>
                  </div>

                  {/* Resumen Familia */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Acudiente & Salud</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <p><span className="text-slate-400 font-medium">Madre:</span> {formData.motherName || '—'} ({formData.motherPhone})</p>
                      <p><span className="text-slate-400 font-medium">Padre:</span> {formData.fatherName || '—'} ({formData.fatherPhone})</p>
                      <p><span className="text-slate-400 font-medium">Acudiente Principal:</span> <span className="capitalize">{formData.primaryGuardian}</span></p>
                      <p><span className="text-slate-400 font-medium">Alergias:</span> {formData.allergies || 'Ninguna'}</p>
                    </div>
                  </div>

                  {/* Resumen Soporte */}
                  <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Documentación</h3>
                    <div className="space-y-2 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", formData.fotoStudentUploaded ? "bg-emerald-500" : "bg-rose-500")} />
                        <span>Foto Estudiante</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", formData.epsCardUploaded ? "bg-emerald-500" : "bg-rose-500")} />
                        <span>Certificado EPS</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", formData.identityDocUploaded ? "bg-emerald-500" : "bg-rose-500")} />
                        <span>Documento de Identidad</span>
                      </div>
                      
                      <div className="border-t border-slate-200/50 pt-2 mt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consentimientos</p>
                        <p className="mt-1">{formData.consentHabeasData && formData.consentManual ? '✓ Cláusulas aceptadas' : '✗ Cláusulas pendientes'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                    <p className="leading-relaxed">
                      Al presionar "Enviar Matrícula", el expediente se registrará con un hash de auditoría y se depositará de forma segura en la cola administrativa. AulaCore creará los pre-perfiles de acceso familiar inmediatamente.
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* FOOTER ACTIONS BAR */}
          <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex justify-between gap-3">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={cn(
                "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:scale-95",
                step === 1 && "opacity-40 cursor-not-allowed active:scale-100"
              )}
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            
            {step < 8 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitEnrollment}
                disabled={submitting}
                className={cn(
                  "px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-emerald-600/10 hover:-translate-y-0.5 active:scale-95 cursor-pointer",
                  submitting && "opacity-50 cursor-not-allowed active:scale-100"
                )}
              >
                {submitting ? 'Enviando...' : 'Enviar Matrícula'} 
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
