const translations = {
    es: {
        nav_home: "Inicio",
        nav_services: "Servicios",
        nav_impact: "Impacto",
        nav_contact: "Contacto",
        hero_title: "Transformamos procesos manuales en soluciones digitales eficientes",
        hero_text: "Ayudamos a pymes y organizaciones públicas a optimizar su gestión administrativa mediante automatización y análisis de datos.",
        hero_button: "Solicitar diagnóstico",
        services_title: "Nuestros Servicios",
        service1_title: "Diagnóstico de procesos",
        service1_text: "Analizamos circuitos administrativos e identificamos mejoras.",
        service2_title: "Automatización",
        service2_text: "Implementamos soluciones digitales accesibles.",
        service3_title: "Tableros de control",
        service3_text: "Centralizamos información para decisiones estratégicas.",
        impact_title: "Impacto del Proyecto",
        impact1: "Reducción de tiempos administrativos.",
        impact2: "Disminución de errores operativos.",
        impact3: "Menor uso de papel.",
        impact4: "Mayor profesionalización organizacional.",
        contact_title: "Contacto",
        contact_button: "Enviar mensaje"
    },
    en: {
        nav_home: "Home",
        nav_services: "Services",
        nav_impact: "Impact",
        nav_contact: "Contact",
        hero_title: "We transform manual processes into efficient digital solutions",
        hero_text: "We help SMEs and public organizations optimize administrative management through automation and data analysis.",
        hero_button: "Request assessment",
        services_title: "Our Services",
        service1_title: "Process Diagnosis",
        service1_text: "We analyze workflows and identify improvements.",
        service2_title: "Automation",
        service2_text: "We implement accessible digital solutions.",
        service3_title: "Dashboards",
        service3_text: "We centralize information for strategic decisions.",
        impact_title: "Project Impact",
        impact1: "Reduction of administrative time.",
        impact2: "Operational error reduction.",
        impact3: "Less paper usage.",
        impact4: "Organizational professionalization.",
        contact_title: "Contact",
        contact_button: "Send message"
    }
};

let currentLang = "es";

const toggleBtn = document.getElementById("langToggle");

toggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "es" ? "en" : "es";
    toggleBtn.textContent = currentLang === "es" ? "EN" : "ES";
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        element.textContent = translations[currentLang][key];
    });
}
