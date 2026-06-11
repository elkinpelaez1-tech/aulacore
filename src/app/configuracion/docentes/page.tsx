'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, ArrowLeft, ArrowRight, CheckCircle2, CloudUpload, 
  Trash2, FileText, Sparkles, Check, Shield, Award, ClipboardCheck,
  Calendar, CheckSquare, Clock, UserCheck, Settings2, Bell, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { uploadOnboardingFile, submitOnboarding, TeacherOnboardingData } from '@/lib/services/teacher-onboarding';

interface TeacherFormData {
  // Step 1: Identity
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  fotoUploaded: boolean;
  fotoUrl?: string;
  signatureDataUrl: string;
  signatureUrl?: string;

  // Step 2: Academic Profile
  profession: string;
  degree: string;
  specialization: string;
  masters: string;
  phd: string;
  experienceYears: string;
  domainAreas: string[];

  // Step 3: Institutional Workload
  sede: string;
  jornada: string;
  academicLevel: string;
  subjectArea: string;
  subjects: string[];
  courses: string[];

  // Step 4: Documents (Dropbox)
  cvUploaded: boolean;
  cvUrl?: string;
  diplomaUploaded: boolean;
  diplomaUrl?: string;
  escalafonUploaded: boolean;
  escalafonUrl?: string;
  backgroundCheckUploaded: boolean;
  backgroundCheckUrl?: string;
  certificationsUploaded: boolean;
  certificationsUrl?: string;
  identityDocUploaded: boolean;
  identityDocUrl?: string;

  // Step 5: Horario (Availability)
  selectedSlots: string[]; // E.g. "Lunes-0", "Martes-1"

  // Step 6: Hybrid Roles
  selectedRoles: string[]; // 'docente', 'director_grupo', 'coordinador', 'jefe_area', 'orientador'

  // Step 7: Platform Settings
  notifEmail: boolean;
  notifWhatsapp: boolean;
  useQrAccess: boolean;
  useRfidFuture: boolean;
  security2FA: boolean;

  // Step 8: Activación & Firma
  acceptHabData: boolean;
  acceptConvivencia: boolean;
}

const INITIAL_FORM_STATE: TeacherFormData = {
  fullName: '',
  documentId: '',
  email: '',
  phone: '',
  fotoUploaded: false,
  fotoUrl: '',
  signatureDataUrl: '',
  signatureUrl: '',
  profession: '',
  degree: 'Licenciatura',
  specialization: '',
  masters: '',
  phd: '',
  experienceYears: '1',
  domainAreas: [],
  sede: 'Sede Principal (Bachillerato)',
  jornada: 'Única',
  academicLevel: 'Básica Secundaria (6° - 9°)',
  subjectArea: 'Matemáticas',
  subjects: [],
  courses: [],
  cvUploaded: false,
  cvUrl: '',
  diplomaUploaded: false,
  diplomaUrl: '',
  escalafonUploaded: false,
  escalafonUrl: '',
  backgroundCheckUploaded: false,
  backgroundCheckUrl: '',
  certificationsUploaded: false,
  certificationsUrl: '',
  identityDocUploaded: false,
  identityDocUrl: '',
  selectedSlots: [],
  selectedRoles: ['docente'],
  notifEmail: true,
  notifWhatsapp: true,
  useQrAccess: true,
  useRfidFuture: false,
  security2FA: false,
  acceptHabData: false,
  acceptConvivencia: false,
};

const TIME_BLOCKS = [
  { id: 0, label: '06:00 - 07:00' },
  { id: 1, label: '07:00 - 08:00' },
  { id: 2, label: '08:00 - 09:00' },
  { id: 3, label: '09:00 - 10:00' },
  { id: 4, label: '10:00 - 11:00' },
  { id: 5, label: '11:00 - 12:00' },
  { id: 6, label: '12:00 - 13:00' },
  { id: 7, label: '13:00 - 14:00' },
  { id: 8, label: '14:00 - 15:00' },
  { id: 9, label: '15:00 - 16:00' },
  { id: 10, label: '16:00 - 17:00' },
  { id: 11, label: '17:00 - 18:00' },
];

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function DocentesPage() {
  const router = useRouter();
  
  // Master wizard state
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<TeacherFormData>(INITIAL_FORM_STATE);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string; progress: number }>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Input refs for file uploads
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const diplomaInputRef = useRef<HTMLInputElement>(null);
  const escalafonInputRef = useRef<HTMLInputElement>(null);
  const backgroundCheckInputRef = useRef<HTMLInputElement>(null);
  const certificationsInputRef = useRef<HTMLInputElement>(null);
  const identityDocInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  // Canvas drawing ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Notion-style calendar dragging and Saturday configuration
  const [isDraggingSchedule, setIsDraggingSchedule] = useState(false);
  const [dragSelectMode, setDragSelectMode] = useState<'select' | 'deselect' | null>(null);
  const [showSaturday, setShowSaturday] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('aulacore-docente-draft');
    const savedStep = localStorage.getItem('aulacore-docente-draft-step');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        if (parsed.selectedSlots?.some((slot: string) => slot.startsWith('Sábado-'))) {
          setShowSaturday(true);
        }
      } catch (e) {
        console.error('Error loading teacher draft', e);
      }
    }
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  // Silent Background Auto-Save
  const autoSave = (newData: TeacherFormData, newStep: number) => {
    setSaveStatus('saving');
    localStorage.setItem('aulacore-docente-draft', JSON.stringify(newData));
    localStorage.setItem('aulacore-docente-draft-step', newStep.toString());
    setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  };

  const handleInputChange = (field: keyof TeacherFormData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    autoSave(updated, step);
  };

  // Navigations
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

  // Global listener to stop dragging when user releases mouse button anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingSchedule(false);
      setDragSelectMode(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Step 5 Availability Matrix Event Handlers
  const handleSlotStart = (day: string, blockId: number) => {
    const slotStr = `${day}-${blockId}`;
    const slots = [...formData.selectedSlots];
    const isAlreadySelected = slots.includes(slotStr);
    const newMode = isAlreadySelected ? 'deselect' : 'select';
    
    setIsDraggingSchedule(true);
    setDragSelectMode(newMode);
    
    if (newMode === 'select') {
      if (!slots.includes(slotStr)) slots.push(slotStr);
    } else {
      const idx = slots.indexOf(slotStr);
      if (idx > -1) slots.splice(idx, 1);
    }
    
    handleInputChange('selectedSlots', slots);
  };

  const handleSlotEnter = (day: string, blockId: number) => {
    if (!isDraggingSchedule || !dragSelectMode) return;
    const slotStr = `${day}-${blockId}`;
    const slots = [...formData.selectedSlots];
    
    if (dragSelectMode === 'select') {
      if (!slots.includes(slotStr)) {
        slots.push(slotStr);
        handleInputChange('selectedSlots', slots);
      }
    } else {
      const idx = slots.indexOf(slotStr);
      if (idx > -1) {
        slots.splice(idx, 1);
        handleInputChange('selectedSlots', slots);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSchedule || !dragSelectMode) return;
    
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!targetEl) return;
    
    const slotId = targetEl.getAttribute('data-slot-id') || targetEl.closest('[data-slot-id]')?.getAttribute('data-slot-id');
    if (slotId) {
      const [day, blockIdStr] = slotId.split('-');
      const blockId = parseInt(blockIdStr, 10);
      const slots = [...formData.selectedSlots];
      
      if (dragSelectMode === 'select') {
        if (!slots.includes(slotId)) {
          slots.push(slotId);
          handleInputChange('selectedSlots', slots);
        }
      } else {
        const idx = slots.indexOf(slotId);
        if (idx > -1) {
          slots.splice(idx, 1);
          handleInputChange('selectedSlots', slots);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDraggingSchedule(false);
    setDragSelectMode(null);
  };

  // Step 6 (Hybrid Roles Switcher) Toggle
  const toggleRole = (role: string) => {
    const roles = [...formData.selectedRoles];
    const idx = roles.indexOf(role);
    if (idx > -1) {
      // Don't allow empty roles (at least 'docente')
      if (roles.length > 1) roles.splice(idx, 1);
    } else {
      roles.push(role);
    }
    handleInputChange('selectedRoles', roles);
  };

  // Canvas Signature Methods
  useEffect(() => {
    if (step === 8 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e1b4b'; // Deep Indigo/Black
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        
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

  // Real file upload to Supabase Storage
  const handleRealUpload = async (field: keyof TeacherFormData, file: File) => {
    if (!formData.documentId) {
      alert('Por favor ingrese el Documento de Identidad (Cédula) antes de cargar archivos.');
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
      const folder = field === 'fotoUploaded' ? 'photos' : 'documents';
      const urlField = field.replace('Uploaded', 'Url') as keyof TeacherFormData;
      const fileName = file.name;

      const publicUrl = await uploadOnboardingFile(file, folder, formData.documentId, fileName);

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

  const handleDeleteFile = (field: keyof TeacherFormData) => {
    const urlField = field.replace('Uploaded', 'Url') as keyof TeacherFormData;
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

  // Submit dynamic database save
  const handleSubmitOnboarding = async () => {
    if (!formData.fullName || !formData.documentId || !formData.email || !formData.phone) {
      alert('Por favor, complete todos los campos obligatorios en el Paso 1: Identidad (Nombre, Documento, Correo y Teléfono).');
      setStep(1);
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      alert('Error de Envío: Las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) no están configuradas en tu Vercel. Por favor agrégalas en el panel del proyecto.');
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
          finalSignatureUrl = await uploadOnboardingFile(file, 'signatures', formData.documentId, 'signature.png');
        } catch (sigErr) {
          console.error("Error uploading signature file:", sigErr);
        }
      }

      const payload: TeacherOnboardingData = {
        institution_id: '11111111-1111-1111-1111-111111111111',
        full_name: formData.fullName,
        document_id: formData.documentId,
        email: formData.email,
        phone: formData.phone,
        profession: formData.profession || undefined,
        degree: formData.degree || undefined,
        experience_years: formData.experienceYears || undefined,
        domain_areas: formData.domainAreas,
        sede: formData.sede,
        jornada: formData.jornada,
        academic_level: formData.academicLevel,
        subject_area: formData.subjectArea,
        selected_slots: formData.selectedSlots,
        selected_roles: formData.selectedRoles,
        foto_url: formData.fotoUrl || undefined,
        cv_url: formData.cvUrl || undefined,
        diploma_url: formData.diplomaUrl || undefined,
        escalafon_url: formData.escalafonUrl || undefined,
        background_check_url: formData.backgroundCheckUrl || undefined,
        certifications_url: formData.certificationsUrl || undefined,
        identity_doc_url: formData.identityDocUrl || undefined,
        signature_url: finalSignatureUrl || undefined,
        status: 'pending_approval'
      };

      await submitOnboarding(payload);

      // Reset and close
      localStorage.removeItem('aulacore-docente-draft');
      localStorage.removeItem('aulacore-docente-draft-step');
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error enviando onboarding a Supabase:', err);
      const errMsg = err.message || '';
      if (errMsg.includes('teacher_onboardings_email_key') || errMsg.includes('duplicate key value violates unique constraint')) {
        alert('Error: El correo electrónico ingresado ya tiene un registro de onboarding activo en el sistema. Por favor utiliza un correo diferente.');
      } else {
        alert('Error al enviar la solicitud: ' + (err.message || err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS_DATA = [
    { title: 'Identidad', desc: 'Ficha y datos' },
    { title: 'Académico', desc: 'Títulos y badges' },
    { title: 'Asignación', desc: 'Sedes y materias' },
    { title: 'Documentos', desc: 'Dropbox CV' },
    { title: 'Disponibilidad', desc: 'Calendly Grid' },
    { title: 'Roles Híbridos', desc: 'Role Engine' },
    { title: 'Configuración', desc: 'Accesos y RFID' },
    { title: 'Activación', desc: 'Firma y envío' },
  ];

  // Horas totales seleccionadas (bloques de 1 hora)
  const selectedHours = formData.selectedSlots.length * 1;

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50/50 p-4 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <Check className="w-10 h-10 animate-fade-in" />
          </div>
          
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
            Perfil de Constructor Académico Indexado
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">¡Onboarding Docente Enviado!</h2>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            La información curricular y la disponibilidad horaria han sido registradas. La solicitud ingresó a la 
            <span className="text-indigo-600 font-bold"> Cola de Aprobación</span> de AulaCore.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-3.5">
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Role Engine Pre-configurado</h4>
                <p className="text-[10px] text-slate-500">Permisos híbridos de {formData.selectedRoles.join(', ')} mapeados para activación inmediata.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Disponibilidad de {selectedHours}h Sincronizada</h4>
                <p className="text-[10px] text-slate-500">Mapeado completo cargado en el optimizador de mallas curriculares de AulaCore.</p>
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
              Registrar Otro Docente
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600 animate-pulse" /> Onboarding Docentes AulaCore
          </h1>
          <p className="text-xs text-slate-500 font-bold tracking-wide mt-1 uppercase">Portal de Incorporación de Constructores Académicos</p>
        </div>
        
        {/* AutoSave Indicator */}
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
            Asegúrate de agregar las variables de entorno <code className="bg-rose-100 px-1 py-0.5 rounded font-bold font-mono">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="bg-rose-100 px-1 py-0.5 rounded font-bold font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en tu panel de proyectos de Vercel. De lo contrario, los archivos cargados y el registro del docente no se guardarán en Supabase y el envío se quedará en estado de carga infinito.
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
        
        {/* Desktop Sidebar Indicator */}
        <div className="hidden lg:flex flex-col gap-1.5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">Onboarding Docente</h3>
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

        {/* Mobile Indicator */}
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

        {/* Main Form content */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col min-h-[480px]">
          
          <div className="flex-1 p-6 md:p-8">
            
            {/* STEP 1: IDENTIDAD */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-500" /> 1. Identidad Profesional
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Información básica y contacto del docente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                    <input 
                      type="text"
                      placeholder="Ej. Andrés Felipe Gómez"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Documento de Identidad (Cédula)</label>
                    <input 
                      type="text"
                      placeholder="C.C. 1.098.765.432"
                      value={formData.documentId}
                      onChange={(e) => handleInputChange('documentId', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Correo Electrónico</label>
                    <input 
                      type="email"
                      placeholder="af.gomez@aulacore.edu.co"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Número Celular</label>
                    <input 
                      type="text"
                      placeholder="+57 311 234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm font-mono"
                    />
                  </div>

                  {/* Foto profesional dropzone */}
                  <div 
                    onClick={() => {
                      if (formData.fotoUploaded || uploadedFiles['fotoUploaded']) return;
                      if (!formData.documentId) {
                        alert('Por favor ingrese el Documento de Identidad (Cédula) antes de cargar la fotografía.');
                        return;
                      }
                      fotoInputRef.current?.click();
                    }}
                    className="md:col-span-2 border border-dashed border-slate-250 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden"
                  >
                    <input 
                      type="file" 
                      ref={fotoInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleRealUpload('fotoUploaded', file);
                      }} 
                    />
                    {formData.fotoUploaded ? (
                      <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                        {formData.fotoUrl ? (
                          <img 
                            src={formData.fotoUrl} 
                            alt="Foto profesional" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 mb-2 shadow"
                          />
                        ) : (
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                        )}
                        <h4 className="text-xs font-bold text-slate-700">Fotografía Profesional cargada</h4>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile('fotoUploaded');
                          }}
                          className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded mt-2 hover:bg-rose-100 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : uploadedFiles['fotoUploaded'] ? (
                      <div className="w-full max-w-xs space-y-1.5 py-4">
                        <div className="flex justify-between text-[9px] font-bold text-indigo-700 uppercase tracking-widest">
                          <span>Subiendo fotografía...</span>
                          <span>{uploadedFiles['fotoUploaded'].progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full transition-all duration-150" style={{ width: `${uploadedFiles['fotoUploaded'].progress}%` }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center bg-transparent border-0 select-none">
                        <CloudUpload className="w-10 h-10 text-indigo-500 mb-2 animate-bounce" />
                        <h4 className="text-xs font-bold text-slate-700">Fotografía Profesional (Fondo Blanco)</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">Haz clic para seleccionar o subir desde tu galería</p>
                        {uploadErrors['fotoUploaded'] && (
                          <p className="text-[10px] text-rose-500 mt-1 font-bold">{uploadErrors['fotoUploaded']}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ACADEMICO BADGES */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" /> 2. Perfil Académico & Habilidades
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Registra tu trayectoria académica. Los badges premium validarán tu estatus.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Profesión Base</label>
                    <input 
                      type="text" placeholder="Ej. Ingeniero Físico, Licenciado en Ciencias"
                      value={formData.profession} onChange={(e) => handleInputChange('profession', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Años de Experiencia Académica</label>
                    <select
                      value={formData.experienceYears}
                      onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      {['1', '2', '3', '4', '5', '8', '10', '15+'].map(exp => (
                        <option key={exp} value={exp}>{exp} años</option>
                      ))}
                    </select>
                  </div>

                  {/* Badges Académicos Premium */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Grado Máximo Alcanzado (Badges Premium)</label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { title: 'Licenciatura', desc: 'Pregrado Docente', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50' },
                        { title: 'Especialización', desc: 'Postgrado Técnico', color: 'border-blue-200 text-blue-700 bg-blue-50/50' },
                        { title: 'Maestría', desc: 'Magíster Investigador', color: 'border-purple-200 text-purple-700 bg-purple-50/50' },
                        { title: 'Doctorado', desc: 'Ph.D. Máximo Rango', color: 'border-amber-200 text-amber-700 bg-amber-50/50' },
                      ].map(badge => {
                        const isSelected = formData.degree === badge.title;
                        
                        return (
                          <button
                            key={badge.title}
                            onClick={() => handleInputChange('degree', badge.title)}
                            className={cn(
                              "border p-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group cursor-pointer",
                              isSelected 
                                ? badge.color + " ring-2 ring-indigo-500/10 shadow-md scale-102" 
                                : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                            )}
                          >
                            <span className="text-sm font-black tracking-tight block">{badge.title}</span>
                            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 leading-none">{badge.desc}</span>
                            {isSelected && (
                              <div className="absolute right-2 top-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-90 animate-fade-in">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Areas de Dominio */}
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Áreas del Conocimiento Dominantes</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Matemáticas',
                        'Lengua Castellana',
                        'Inglés',
                        'Ciencias Naturales y Educación Ambiental',
                        'Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia',
                        'Educación Artística y Cultural',
                        'Educación Ética y en Valores Humanos',
                        'Educación Física, Recreación y Deportes',
                        'Educación Religiosa',
                        'Tecnología e Informática'
                      ].map(area => {
                        const isSelected = formData.domainAreas.includes(area);
                        
                        return (
                          <button
                            key={area}
                            onClick={() => {
                              const areas = [...formData.domainAreas];
                              const idx = areas.indexOf(area);
                              if (idx > -1) areas.splice(idx, 1);
                              else areas.push(area);
                              handleInputChange('domainAreas', areas);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer",
                              isSelected 
                                ? "bg-indigo-600 border-indigo-650 text-white shadow-sm" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ASIGNACION INSTITUCIONAL */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" /> 3. Asignación Institucional
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Mapea la sede, jornada y la carga pedagógica del docente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Sede Asignada</label>
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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Área Pedagógica</label>
                    <select
                      value={formData.subjectArea}
                      onChange={(e) => handleInputChange('subjectArea', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Lengua Castellana">Lengua Castellana</option>
                      <option value="Inglés">Inglés</option>
                      <option value="Ciencias Naturales y Educación Ambiental">Ciencias Naturales y Educación Ambiental</option>
                      <option value="Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia">Ciencias Sociales, Historia, Geografía, Constitución Política y Democracia</option>
                      <option value="Educación Artística y Cultural">Educación Artística y Cultural</option>
                      <option value="Educación Ética y en Valores Humanos">Educación Ética y en Valores Humanos</option>
                      <option value="Educación Física, Recreación y Deportes">Educación Física, Recreación y Deportes</option>
                      <option value="Educación Religiosa">Educación Religiosa</option>
                      <option value="Tecnología e Informática">Tecnología e Informática</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nivel de Cátedra</label>
                    <select
                      value={formData.academicLevel}
                      onChange={(e) => handleInputChange('academicLevel', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                    >
                      <option>Básica Primaria (1° - 5°)</option>
                      <option>Básica Secundaria (6° - 9°)</option>
                      <option>Media Académica (10° - 11°)</option>
                    </select>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 4: CARGA DOCUMENTAL (Dropbox) */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                      <CloudUpload className="w-5 h-5 text-indigo-500" /> 4. Soporte Documental
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">Sube los documentos de soporte de contratación.</p>
                  </div>
                  <span className="self-start sm:self-center flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-indigo-100 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> OCR Activo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { label: 'Hoja de Vida Única Actualizada', field: 'cvUploaded', ref: cvInputRef, type: 'HV_AndresGomez.pdf', size: '2.8 MB' },
                    { label: 'Título de Grado / Acta de Licenciatura', field: 'diplomaUploaded', ref: diplomaInputRef, type: 'Diploma_Profesional.pdf', size: '1.9 MB' },
                    { label: 'Resolución de Escalafón Docente', field: 'escalafonUploaded', ref: escalafonInputRef, type: 'Escalafon_MinEdu.pdf', size: '1.4 MB' },
                    { label: 'Certificado Judicial & Antecedentes (Máx. 30 días)', field: 'backgroundCheckUploaded', ref: backgroundCheckInputRef, type: 'Antecedentes.pdf', size: '1.2 MB' },
                    { label: 'Certificaciones Laborales Anteriores', field: 'certificationsUploaded', ref: certificationsInputRef, type: 'Certificaciones_Historico.pdf', size: '3.4 MB' },
                    { label: 'Cédula de Ciudadanía (Ambas caras)', field: 'identityDocUploaded', ref: identityDocInputRef, type: 'Cedula_Identidad.pdf', size: '1.7 MB' },
                  ].map(doc => {
                    const isUploaded = formData[doc.field as keyof TeacherFormData];
                    const loader = uploadedFiles[doc.field];
                    
                    return (
                      <div 
                        key={doc.field}
                        className={cn(
                          "border border-dashed rounded-2xl p-4 flex flex-col justify-between transition-all duration-300",
                          isUploaded ? "bg-emerald-50/40 border-emerald-300" :
                          loader ? "bg-indigo-50/20 border-indigo-300" : "bg-slate-50/50 border-slate-250 hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="file"
                          ref={doc.ref}
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleRealUpload(doc.field as keyof TeacherFormData, file);
                          }}
                        />
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{doc.label}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Formatos: PDF, JPG, PNG</p>
                          </div>
                          <div className="text-indigo-500 shrink-0">
                            {isUploaded ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <FileText className="w-5 h-5 text-slate-350" />}
                          </div>
                        </div>

                        {isUploaded ? (
                          <div className="flex items-center justify-between bg-white border border-emerald-100 px-3 py-2 rounded-xl text-[11px] text-emerald-800 font-medium">
                            <span className="truncate max-w-[150px] font-mono text-[10px]">{loader?.name || doc.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">Verificado</span>
                              <button 
                                type="button"
                                onClick={() => handleDeleteFile(doc.field as keyof TeacherFormData)}
                                className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ) : loader ? (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-bold text-indigo-700 uppercase tracking-widest">
                              <span>Subiendo archivo...</span>
                              <span>{loader.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full transition-all duration-150" style={{ width: `${loader.progress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button 
                              type="button"
                              onClick={() => {
                                if (!formData.documentId) {
                                  alert('Por favor ingrese el Documento de Identidad (Cédula) antes de cargar documentos.');
                                  return;
                                }
                                doc.ref.current?.click();
                              }}
                              className="w-full bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-650 text-[11px] font-bold py-2.5 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                            >
                              + Cargar Soporte
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

            {/* STEP 5: CALENDLY SCHEDULE MATRIX (NOTION CALENDAR) */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500 animate-pulse" /> 5. Calendario de Disponibilidad
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Haz clic y arrastra para pintar tu disponibilidad. ¡Funciona también en móvil deslizando el dedo!
                    </p>
                  </div>
                  
                  {/* Saturday Toggle & Metrics Header */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Sábado Opcional Switch */}
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">Habilitar Sábado</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newSaturday = !showSaturday;
                          setShowSaturday(newSaturday);
                          if (!newSaturday) {
                            // Automatically clear Saturday slots if disabled
                            const filtered = formData.selectedSlots.filter(s => !s.startsWith('Sábado-'));
                            handleInputChange('selectedSlots', filtered);
                          }
                        }}
                        className={cn(
                          "w-8 h-4 rounded-full relative transition-colors cursor-pointer shrink-0",
                          showSaturday ? "bg-indigo-600" : "bg-slate-350"
                        )}
                      >
                        <div className={cn(
                          "w-3 h-3 bg-white rounded-full absolute top-[2px] transition-all shadow-sm",
                          showSaturday ? "left-45" : "left-[2px]"
                        )}
                        style={{
                          left: showSaturday ? '18px' : '2px'
                        }}></div>
                      </button>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                      <p className="text-[8px] font-black uppercase text-slate-400">Horas Pintadas</p>
                      <p className="text-sm font-black text-slate-800">{selectedHours}h</p>
                    </div>
                    
                    {/* Dynamic alert indicator */}
                    {selectedHours > 35 ? (
                      <span className="flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" /> Sobrecarga
                      </span>
                    ) : selectedHours > 25 ? (
                      <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Carga Completa
                      </span>
                    ) : selectedHours > 0 ? (
                      <span className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase">
                        <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Óptimo
                      </span>
                    ) : (
                      <span className="bg-slate-100 border border-slate-200 text-slate-500 px-3 py-2 rounded-xl text-[10px] font-black uppercase">
                        Sin Asignar
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid layout with side pre-optimizer panel */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  
                  {/* Scheduling Grid Container (Notion/Calendar scrollable) */}
                  <div className="xl:col-span-3 overflow-x-auto border border-slate-200 rounded-3xl bg-slate-50/50 shadow-inner">
                    <div 
                      className="min-w-[760px] p-4 select-none"
                      onMouseLeave={() => {
                        setIsDraggingSchedule(false);
                        setDragSelectMode(null);
                      }}
                    >
                      <div 
                        className="grid gap-1.5"
                        style={{ gridTemplateColumns: `90px repeat(${showSaturday ? 6 : 5}, minmax(0, 1fr))` }}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        
                        {/* Header block (Time / Columns) */}
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center p-2">
                          Bloques
                        </div>
                        {(showSaturday ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5)).map(day => (
                          <div 
                            key={day} 
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest text-center py-2 border rounded-xl shadow-sm",
                              day === 'Sábado' ? "bg-amber-50/50 border-amber-200 text-amber-800" : "bg-white border-slate-200 text-slate-700"
                            )}
                          >
                            {day}
                          </div>
                        ))}

                        {/* Time blocks row */}
                        {TIME_BLOCKS.map(block => (
                          <React.Fragment key={block.id}>
                            {/* Row label */}
                            <div className="text-[9px] font-black text-slate-500 bg-white border border-slate-200 rounded-xl p-2 shadow-sm text-center flex items-center justify-center font-mono">
                              {block.label}
                            </div>
                            
                            {/* Weekly cells */}
                            {(showSaturday ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5)).map(day => {
                              const slotId = `${day}-${block.id}`;
                              const isSelected = formData.selectedSlots.includes(slotId);
                              return (
                                <button
                                  key={slotId}
                                  type="button"
                                  data-slot-id={slotId}
                                  onMouseDown={() => handleSlotStart(day, block.id)}
                                  onMouseEnter={() => handleSlotEnter(day, block.id)}
                                  onTouchStart={() => handleSlotStart(day, block.id)}
                                  className={cn(
                                    "h-10 border rounded-xl transition-all duration-200 flex flex-col items-center justify-center cursor-pointer font-bold text-[10px] select-none shadow-sm relative overflow-hidden group/cell",
                                    isSelected 
                                      ? "bg-gradient-to-br from-indigo-600 to-violet-650 border-indigo-700 text-white shadow-indigo-200/50 scale-[0.98] ring-2 ring-indigo-500/10" 
                                      : "bg-white border-slate-200 text-slate-400 hover:bg-indigo-50/40 hover:border-indigo-200 hover:text-indigo-600 hover:-translate-y-0.5 hover:shadow"
                                  )}
                                >
                                  {isSelected ? (
                                    <span className="flex flex-col items-center leading-none animate-in zoom-in-95 duration-200">
                                      <span className="font-extrabold text-[8px] uppercase tracking-wide animate-pulse">Activo</span>
                                      <span className="text-[7px] opacity-80 mt-0.5">1 hora</span>
                                    </span>
                                  ) : (
                                    <span className="opacity-0 group-hover/cell:opacity-100 transition-opacity text-[8px] uppercase tracking-wider font-extrabold text-indigo-500">
                                      Pintar
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </React.Fragment>
                        ))}

                      </div>
                    </div>
                  </div>

                  {/* AI Pre-optimization & Info Panel */}
                  <div className="space-y-4 xl:col-span-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                        <Sparkles className="w-4 h-4 text-indigo-550 animate-pulse" />
                        <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">AI Pre-procesamiento</h4>
                      </div>

                      <div className="space-y-3.5">
                        {/* Metric 1 */}
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                            <span>Disponibilidad Declarada</span>
                            <span className="text-slate-800 font-extrabold">
                              {Math.round((formData.selectedSlots.length / (TIME_BLOCKS.length * (showSaturday ? 6 : 5))) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${(formData.selectedSlots.length / (TIME_BLOCKS.length * (showSaturday ? 6 : 5))) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 shadow-sm">
                          <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Intensidad Semanal Estimada</p>
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-black text-slate-800">{selectedHours} horas</span>
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                              selectedHours === 0 ? "bg-slate-100 text-slate-500" :
                              selectedHours > 35 ? "bg-rose-100 text-rose-700 animate-pulse" :
                              selectedHours > 25 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            )}>
                              {selectedHours === 0 ? "Sin horas" :
                               selectedHours > 35 ? "Sobrecarga" :
                               selectedHours > 25 ? "Alta" : "Adecuada"}
                            </span>
                          </div>
                        </div>

                        {/* Cruces & Agenda */}
                        <div className="text-[10px] text-slate-650 font-semibold space-y-2 pt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span>Cruce de horarios detectados: 0</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <span>Intensidad horaria recomendada: 30h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            <span>Sede: {formData.sede}</span>
                          </div>
                        </div>
                      </div>

                      {/* Info footer */}
                      <div className="border-t border-slate-200/60 pt-3 text-[9px] text-slate-400 leading-normal font-medium">
                        La matriz está pre-configurada para conectarse con <span className="font-bold text-slate-500">academic_schedules</span>, optimización por IA y detección de colisiones.
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-3xl p-5 text-center bg-white space-y-2 shadow-sm">
                      <div className="text-lg">📅</div>
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Carga Óptima AulaCore</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        Los bloques marcados como disponibles se exportarán al Role Engine y generarán calendarios automáticos tras su validación administrativa.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* STEP 6: ROLE ENGINE SELECTOR */}
            {step === 6 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-500" /> 6. Roles Institucionales & Permisos Híbridos
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">El Docente puede tener asignaciones concurrentes. Selecciona todos los que apliquen para el Role Engine.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    {[
                      { id: 'docente', label: 'Docente de Asignatura', desc: 'Acceso a mallas, calificaciones y asistencia.' },
                      { id: 'director_grupo', label: 'Director de Grupo', desc: 'Gestión de observador escolar de su curso asignado.' },
                      { id: 'coordinador', label: 'Coordinador Académico/Nivel', desc: 'Auditoría curricular completa y firmas de actas.' },
                      { id: 'jefe_area', label: 'Jefe de Área', desc: 'Validación de planeación curricular del departamento.' },
                      { id: 'orientador', label: 'Orientador Escolar', desc: 'Fichas psicosociales especiales del observador.' },
                    ].map(role => {
                      const isSelected = formData.selectedRoles.includes(role.id);
                      
                      return (
                        <button
                          key={role.id}
                          onClick={() => toggleRole(role.id)}
                          className={cn(
                            "w-full text-left p-4 border rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 shadow-sm",
                            isSelected 
                              ? "bg-indigo-50/70 border-indigo-300 text-indigo-800 font-bold" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-650"
                          )}
                        >
                          <div>
                            <h4 className="text-xs font-bold leading-tight">{role.label}</h4>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-normal">{role.desc}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                            isSelected ? "bg-indigo-600 border-indigo-700 text-white" : "border-slate-300 bg-white"
                          )}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Visualizing dynamic permissions map */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200/50 pb-2">Habilidades Técnicas AulaCore</h3>
                    
                    <div className="space-y-3 text-xs text-slate-700 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Gestión curricular avanzada habilitada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Firma digital de actas del consejo directivo</span>
                      </div>
                      {formData.selectedRoles.includes('coordinador') && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                          <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0 animate-bounce" />
                          <span className="text-indigo-800 font-bold">Módulo de auditoría general pre-configurado</span>
                        </div>
                      )}
                      {formData.selectedRoles.includes('director_grupo') && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                          <CheckSquare className="w-4 h-4 text-indigo-500 shrink-0 animate-bounce" />
                          <span className="text-indigo-800 font-bold">Editor del Observador de Convivencia activo</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200/50 pt-3 mt-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel de Seguridad</p>
                        <p className="mt-1 font-bold text-slate-500 text-[11px]">Acceso Híbrido Concurrente (Role Engine)</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 7: CONFIGURACION AULACORE */}
            {step === 7 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-500" /> 7. Configuración de la Cuenta & Seguridad
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Configura las alertas y accesos biométricos del docente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Channels configuration (switches) */}
                  <div className="space-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200/50 pb-2 mb-1 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-slate-400" /> Canales de Notificación
                    </h3>
                    
                    {[
                      { label: 'Notificar Asignación Curricular por Correo', field: 'notifEmail' },
                      { label: 'Notificar Inasistencias de Alumnos por WhatsApp', field: 'notifWhatsapp' },
                      { label: 'Habilitar acceso QR Institucional en la App', field: 'useQrAccess' },
                      { label: 'Vincular código RFID futuro para control de asistencia', field: 'useRfidFuture' },
                      { label: 'Exigir doble factor de seguridad (2FA) en el portal', field: 'security2FA' },
                    ].map(s => (
                      <div key={s.field} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-700 leading-snug">{s.label}</span>
                        <button
                          onClick={() => handleInputChange(s.field as keyof TeacherFormData, !formData[s.field as keyof TeacherFormData])}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                            formData[s.field as keyof TeacherFormData] ? "bg-emerald-500" : "bg-slate-350"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                            formData[s.field as keyof TeacherFormData] ? "left-5" : "left-1"
                          )}></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Future RFID Mock details */}
                  <div className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-center text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-xl shadow-inner animate-pulse">
                      📡
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">RFID e Identificaciones AulaCore</h4>
                      <p className="text-[10px] text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed mt-1">
                        Una vez aprobado el perfil docente, el sistema pre-configurará una clave única y un UID de tarjeta para integraciones de control físico en portería.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 8: ACTIVACION & FIRMA CANVAS */}
            {step === 8 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-lg font-black text-slate-800 leading-none flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-indigo-500" /> 8. Firmas de Consentimiento & Envío
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Firma digitalmente tu acuerdo de onboarding institucional.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Agreements */}
                  <div className="space-y-4 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200/50 pb-2 mb-1">Cláusulas del Contrato</h3>
                    
                    {[
                      { label: 'Autorizo el tratamiento de mis datos personales y del historial académico (Habeas Data)', field: 'acceptHabData' },
                      { label: 'Acepto cumplir los lineamientos éticos y formativos del Manual de Convivencia Escolar', field: 'acceptConvivencia' },
                    ].map(c => (
                      <div key={c.field} className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-700 leading-snug">{c.label}</span>
                        <button
                          onClick={() => handleInputChange(c.field as keyof TeacherFormData, !formData[c.field as keyof TeacherFormData])}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0",
                            formData[c.field as keyof TeacherFormData] ? "bg-emerald-500" : "bg-slate-350"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                            formData[c.field as keyof TeacherFormData] ? "left-5" : "left-1"
                          )}></div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* HTML5 drawing signature canvas */}
                  <div className="border border-slate-200 rounded-2xl p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-800">Firma Biométrica Manual</h4>
                        <p className="text-[9px] text-slate-400 font-semibold">Dibuja tu firma aquí.</p>
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
                onClick={handleSubmitOnboarding}
                disabled={submitting}
                className={cn(
                  "px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-lg shadow-emerald-600/10 hover:-translate-y-0.5 active:scale-95 cursor-pointer",
                  submitting && "opacity-50 cursor-not-allowed active:scale-100"
                )}
              >
                {submitting ? 'Enviando...' : 'Enviar Onboarding'} 
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
