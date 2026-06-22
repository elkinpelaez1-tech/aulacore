// Utility for Google Analytics 4 Events in AulaCore (SaaS Marketing Funnel)

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log page view manually
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Generic event sender
export const event = (action: string, { category, label, value, ...rest }: {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
} = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...rest
    });
  }
};

// CUSTOM EVENTS FOR AULACORE MARKETING & ENGAGEMENT FUNNEL

/**
 * 1. Visita a landing (se ejecuta al entrar a la landing page)
 */
export const trackLandingVisit = (referrer?: string) => {
  event('landing_visit', {
    category: 'Marketing',
    label: referrer || 'direct'
  });
};

/**
 * 2. Clic en "Solicitar demostración"
 */
export const trackClickDemoRequest = () => {
  event('click_demo_request', {
    category: 'Marketing',
    label: 'Call to Action'
  });
};

/**
 * 3. Envío de formulario de contacto
 */
export const trackContactFormSubmit = (subject: string) => {
  event('contact_form_submit', {
    category: 'Marketing',
    label: subject
  });
};

/**
 * 4. Inicio de prueba gratuita
 */
export const trackStartFreeTrial = (planName?: string) => {
  event('start_free_trial', {
    category: 'Marketing',
    label: planName || 'Plan Gratuito'
  });
};

/**
 * 5. Registro de institución (Onboarding Inicial)
 */
export const trackRegisterInstitution = (institutionName: string, country: string) => {
  event('register_institution', {
    category: 'Onboarding',
    label: institutionName,
    country: country
  });
};

/**
 * 6. Inicio de sesión
 */
export const trackLogin = (userId: string, userRole: string) => {
  event('login', {
    category: 'Engagement',
    label: userRole,
    user_id: userId
  });
};

/**
 * 7. Activación institucional (Conversión Comercial)
 */
export const trackInstitutionalActivation = (institutionId: string, planName: string) => {
  event('institutional_activation', {
    category: 'Onboarding',
    label: planName,
    institution_id: institutionId
  });
};

/**
 * 8. Importación de estudiantes (Adopción Masiva)
 */
export const trackStudentsImport = (recordsCount: number, status: string) => {
  event('students_import', {
    category: 'Migration',
    label: 'Estudiantes',
    records_count: recordsCount,
    status: status
  });
};

/**
 * 9. Creación de docente
 */
export const trackCreateTeacher = (specialty: string, area: string) => {
  event('create_teacher', {
    category: 'Academic',
    label: specialty,
    subject_area: area
  });
};

/**
 * 10. Creación de matrícula
 */
export const trackCreateEnrollment = (courseCode: string, studentDoc: string) => {
  event('create_enrollment', {
    category: 'Academic',
    label: courseCode,
    student_document: studentDoc
  });
};

/**
 * 11. Uso del módulo PEI
 */
export const trackModuleUsePEI = (actionName: string) => {
  event('use_module_pei', {
    category: 'FeatureUsage',
    label: actionName
  });
};

/**
 * 12. Uso del módulo Gobierno Escolar
 */
export const trackModuleUseGobiernoEscolar = (actionName: string) => {
  event('use_module_gobierno', {
    category: 'FeatureUsage',
    label: actionName
  });
};

/**
 * 13. Uso del módulo PAE
 */
export const trackModuleUsePAE = (actionName: string) => {
  event('use_module_pae', {
    category: 'FeatureUsage',
    label: actionName
  });
};

/**
 * 14. Solicitud de demostración (Lead de conversión)
 */
export const trackDemoRequest = (institutionName: string, email: string) => {
  event('demo_request', {
    category: 'Lead',
    label: institutionName,
    email: email
  });
};

/**
 * 15. Contacto comercial
 */
export const trackCommercialContact = (contactName: string, email: string, phone: string) => {
  event('commercial_contact', {
    category: 'Lead',
    label: contactName,
    email: email,
    phone: phone
  });
};
