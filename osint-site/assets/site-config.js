/**
 * MR TRUST OSINT — configuração do site (independente do CRM).
 * Repositório: https://github.com/Trustcorporation88/mr-trust
 */
window.MR_TRUST_SITE = {
  product: "MR TRUST OSINT",
  contactEmail: "sales@mrtrust.com",
  /** Formspree: https://formspree.io → New Form → ID em formspree.io/f/SEU_ID */
  formspreeFormId: "",
  hubspotPortalId: "",
  hubspotFormId: "",
  /** URL pública (produção). Preview exige login na Vercel. */
  siteUrl: "https://mr-trust.vercel.app",
  previewUrl: "https://mr-trust-git-master-trustcorporation88s-projects.vercel.app",
  trialDays: 14,
  /** Dashboard Streamlit Cloud (produção) */
  demoDashboardUrl:
    "https://trustcorporation88-mr-trust-streamlit-app-ppasek.streamlit.app/",
  /** Só para quem abre o site em localhost */
  demoDashboardLocal: "http://localhost:8511",
  githubUrl: "https://github.com/Trustcorporation88/mr-trust",
};
