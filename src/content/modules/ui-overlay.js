/**
 * AEGIS UI Overlay Module
 * Handles warning dialogs and overlay UI elements
 */

const TRANSLATIONS = {
  en: { sensitiveDetected: "Sensitive Data Detected", proceed: "Are you sure you want to proceed?", cancel: "Cancel", sendAnyway: "Send Anyway", protectTip: "Tip: Click Protect in the AEGIS popup to replace sensitive data first", imageUpload: "Image Upload Detected", aiCanRead: "AI can read text and faces in images. Does this file contain IDs or sensitive info?", privacyRisk: "Privacy Risk: Once uploaded, you cannot control who accesses this file.", cancelUpload: "Cancel Upload", uploadAnyway: "Upload Anyway", sensitiveFilename: "Sensitive Filename", containsKeywords: "contains sensitive keywords.", welcome: "Welcome to AEGIS!", welcomeText: "I'll protect your sensitive data as you type.", quickProtect: "Tip: Press ⌘+Enter to quick-protect", gotIt: "Got it!" },
  es: { sensitiveDetected: "Datos Sensibles Detectados", proceed: "¿Estás seguro?", cancel: "Cancelar", sendAnyway: "Enviar", protectTip: "Consejo: Haz clic en Proteger", imageUpload: "Imagen Detectada", aiCanRead: "La IA puede leer texto.", privacyRisk: "Riesgo de Privacidad.", cancelUpload: "Cancelar", uploadAnyway: "Subir", sensitiveFilename: "Nombre Sensible", containsKeywords: "contiene palabras clave.", welcome: "¡Bienvenido!", welcomeText: "Protegeré tus datos.", quickProtect: "Presiona ⌘+Enter", gotIt: "¡Entendido!" },
  fr: { sensitiveDetected: "Données Sensibles", proceed: "Êtes-vous sûr?", cancel: "Annuler", sendAnyway: "Envoyer", protectTip: "Astuce: Cliquez sur Protéger", imageUpload: "Image Détectée", aiCanRead: "L'IA peut lire le texte.", privacyRisk: "Risque de Confidentialité.", cancelUpload: "Annuler", uploadAnyway: "Télécharger", sensitiveFilename: "Nom Sensible", containsKeywords: "contient des mots-clés.", welcome: "Bienvenue!", welcomeText: "Je protège vos données.", quickProtect: "Appuyez sur ⌘+Entrée", gotIt: "Compris!" },
  de: { sensitiveDetected: "Sensible Daten", proceed: "Sind Sie sicher?", cancel: "Abbrechen", sendAnyway: "Senden", protectTip: "Tipp: Klicken Sie auf Schützen", imageUpload: "Bild Erkannt", aiCanRead: "KI kann Text lesen.", privacyRisk: "Datenschutzrisiko.", cancelUpload: "Abbrechen", uploadAnyway: "Hochladen", sensitiveFilename: "Sensibler Name", containsKeywords: "enthält Schlüsselwörter.", welcome: "Willkommen!", welcomeText: "Ich schütze Ihre Daten.", quickProtect: "Drücken Sie ⌘+Enter", gotIt: "Verstanden!" },
  pt: { sensitiveDetected: "Dados Sensíveis", proceed: "Tem certeza?", cancel: "Cancelar", sendAnyway: "Enviar", protectTip: "Dica: Clique em Proteger", imageUpload: "Imagem Detectada", aiCanRead: "A IA pode ler texto.", privacyRisk: "Risco de Privacidade.", cancelUpload: "Cancelar", uploadAnyway: "Enviar", sensitiveFilename: "Nome Sensível", containsKeywords: "contém palavras-chave.", welcome: "Bem-vindo!", welcomeText: "Protegerei seus dados.", quickProtect: "Pressione ⌘+Enter", gotIt: "Entendi!" },
  it: { sensitiveDetected: "Dati Sensibili", proceed: "Sei sicuro?", cancel: "Annulla", sendAnyway: "Invia", protectTip: "Suggerimento: Clicca su Proteggi", imageUpload: "Immagine Rilevata", aiCanRead: "L'IA può leggere testo.", privacyRisk: "Rischio Privacy.", cancelUpload: "Annulla", uploadAnyway: "Carica", sensitiveFilename: "Nome Sensibile", containsKeywords: "contiene parole chiave.", welcome: "Benvenuto!", welcomeText: "Proteggerò i tuoi dati.", quickProtect: "Premi ⌘+Invio", gotIt: "Capito!" },
  ru: { sensitiveDetected: "Конфиденциальные данные", proceed: "Вы уверены?", cancel: "Отмена", sendAnyway: "Отправить", protectTip: "Совет: Нажмите 'Защитить'", imageUpload: "Обнаружено изображение", aiCanRead: "ИИ может читать текст.", privacyRisk: "Риск конфиденциальности.", cancelUpload: "Отмена", uploadAnyway: "Загрузить", sensitiveFilename: "Конфиденциальное имя", containsKeywords: "содержит ключевые слова.", welcome: "Добро пожаловать!", welcomeText: "Я защищу ваши данные.", quickProtect: "Нажмите ⌘+Enter", gotIt: "Понятно!" },
  zh: { sensitiveDetected: "检测到敏感数据", proceed: "您确定要继续吗？", cancel: "取消", sendAnyway: "仍然发送", protectTip: "提示：点击保护", imageUpload: "检测到图像", aiCanRead: "人工智能可以读取文本。", privacyRisk: "隐私风险。", cancelUpload: "取消上传", uploadAnyway: "仍然上传", sensitiveFilename: "敏感文件名", containsKeywords: "包含敏感关键字。", welcome: "欢迎使用 AEGIS！", welcomeText: "我会保护您的数据。", quickProtect: "按 ⌘+Enter", gotIt: "明白了！" },
  ar: { sensitiveDetected: "بيانات حساسة", proceed: "هل أنت متأكد؟", cancel: "إلغاء", sendAnyway: "إرسال", protectTip: "نصيحة: انقر فوق حماية", imageUpload: "تم اكتشاف صورة", aiCanRead: "يمكن للذكاء الاصطناعي القراءة.", privacyRisk: "مخاطر الخصوصية.", cancelUpload: "إلغاء", uploadAnyway: "تحميل", sensitiveFilename: "اسم حساس", containsKeywords: "يحتوي على كلمات.", welcome: "مرحبًا بك!", welcomeText: "سأحمي بياناتك.", quickProtect: "اضغط ⌘+Enter", gotIt: "فهمت!" }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (TRANSLATIONS[lang]) currentLang = lang;
}

export function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key];
}

/**
 * Create a warning dialog for PII detection
 * @param {Function} onConfirm - Callback when user confirms
 * @param {Function} onCancel - Callback when user cancels
 * @returns {HTMLElement} The dialog element
 */
export function createWarningDialog(onConfirm, onCancel) {
  const dialog = document.createElement('div');
  dialog.className = 'aegis-warning-dialog';
  dialog.innerHTML = `
    <div class="aegis-dialog-content">
      <div class="aegis-dialog-header">
        <span class="aegis-icon">🛡️</span>
        <h3>${t('sensitiveDetected')}</h3>
      </div>
      <p>${t('proceed')}</p>
      <p class="aegis-tip">${t('protectTip')}</p>
      <div class="aegis-dialog-buttons">
        <button class="aegis-btn aegis-btn-cancel">${t('cancel')}</button>
        <button class="aegis-btn aegis-btn-confirm">${t('sendAnyway')}</button>
      </div>
    </div>
  `;
  
  dialog.querySelector('.aegis-btn-cancel').addEventListener('click', () => {
    dialog.remove();
    onCancel?.();
  });
  
  dialog.querySelector('.aegis-btn-confirm').addEventListener('click', () => {
    dialog.remove();
    onConfirm?.();
  });
  
  return dialog;
}

/**
 * Create an image upload warning dialog
 * @param {Function} onConfirm - Callback when user confirms upload
 * @param {Function} onCancel - Callback when user cancels
 * @returns {HTMLElement} The dialog element
 */
export function createImageWarningDialog(onConfirm, onCancel) {
  const dialog = document.createElement('div');
  dialog.className = 'aegis-warning-dialog';
  dialog.innerHTML = `
    <div class="aegis-dialog-content">
      <div class="aegis-dialog-header">
        <span class="aegis-icon">🖼️</span>
        <h3>${t('imageUpload')}</h3>
      </div>
      <p>${t('aiCanRead')}</p>
      <p>${t('privacyRisk')}</p>
      <div class="aegis-dialog-buttons">
        <button class="aegis-btn aegis-btn-cancel">${t('cancelUpload')}</button>
        <button class="aegis-btn aegis-btn-confirm">${t('uploadAnyway')}</button>
      </div>
    </div>
  `;
  
  dialog.querySelector('.aegis-btn-cancel').addEventListener('click', () => {
    dialog.remove();
    onCancel?.();
  });
  
  dialog.querySelector('.aegis-btn-confirm').addEventListener('click', () => {
    dialog.remove();
    onConfirm?.();
  });
  
  return dialog;
}

/**
 * Apply theme colors to overlay elements
 * @param {string} themeColor - Theme color from settings
 */
export function applyThemeColors(themeColor = '#1a73e8') {
  const style = document.getElementById('aegis-theme-style');
  if (style) style.remove();
  
  const newStyle = document.createElement('style');
  newStyle.id = 'aegis-theme-style';
  newStyle.textContent = `
    .aegis-warning-dialog {
      border-left: 4px solid ${themeColor} !important;
    }
    .aegis-btn-confirm {
      background-color: ${themeColor} !important;
    }
    .aegis-highlight {
      background-color: ${themeColor}20 !important;
      border-bottom: 2px solid ${themeColor} !important;
    }
  `;
  document.head.appendChild(newStyle);
}
