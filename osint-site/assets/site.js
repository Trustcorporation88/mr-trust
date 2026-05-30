(function () {
  "use strict";

  var cfg = window.MR_TRUST_SITE || {};
  var contactEmail = cfg.contactEmail || "sales@mrtrust.com";

  function qs(sel) {
    return document.querySelector(sel);
  }

  function qsa(sel) {
    return document.querySelectorAll(sel);
  }

  /** Preenche links mailto e texto de e-mail na página */
  function applyContactLinks() {
    qsa("[data-contact-email]").forEach(function (el) {
      var label = el.getAttribute("data-contact-label") || contactEmail;
      if (el.tagName === "A") {
        el.href = "mailto:" + contactEmail;
        if (!el.textContent.trim() || el.hasAttribute("data-replace-text")) {
          el.textContent = label;
        }
      } else {
        el.textContent = label;
      }
    });
  }

  /** Links GitHub (site OSINT) */
  function applyGithubLinks() {
    var url = cfg.githubUrl;
    if (!url) return;
    qsa("[data-github-url]").forEach(function (el) {
      el.href = url;
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    });
  }

  function isLocalHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1";
  }

  function isLocalUrl(url) {
    return /localhost|127\.0\.0\.1/i.test(url || "");
  }

  /** URL do dashboard: online > local (se visitante local) > âncora #dashboard */
  function resolveDemoUrl() {
    var pub = (cfg.demoDashboardUrl || "").trim();
    var local = (cfg.demoDashboardLocal || "http://localhost:8511").trim();
    var onLocalViewer = isLocalHost(window.location.hostname);

    if (pub && !isLocalUrl(pub)) {
      return pub;
    }
    if (onLocalViewer && local) {
      return local;
    }
    return "";
  }

  /** CTAs de demo (Streamlit) */
  function applyDemoLinks() {
    var demoUrl = resolveDemoUrl();

    qsa("[data-demo-url]").forEach(function (el) {
      if (demoUrl) {
        el.href = demoUrl;
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
        el.setAttribute(
          "title",
          isLocalUrl(demoUrl)
            ? "Dashboard local — Streamlit deve estar rodando na porta 8511"
            : "Abrir dashboard online"
        );
        if (el.classList.contains("btn-secondary") && el.textContent.indexOf("dashboard") !== -1) {
          el.textContent = "Abrir dashboard";
        }
      } else {
        el.href = "#dashboard";
        el.removeAttribute("target");
        el.removeAttribute("rel");
        el.setAttribute(
          "title",
          "Dashboard online em breve — veja como rodar na sua máquina"
        );
        if (el.classList.contains("btn")) {
          var label = el.getAttribute("data-demo-label-fallback");
          if (label) el.textContent = label;
        }
      }
    });
  }

  function initMobileNav() {
    var toggle = qs("#menu-toggle");
    var mobileNav = qs("#nav-mobile");
    if (!toggle || !mobileNav) return;

    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function showFormMessage(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.classList.add("visible");
    el.style.color = isError ? "#ef4444" : "";
    el.style.borderColor = isError ? "rgba(239,68,68,0.35)" : "";
    el.style.background = isError ? "rgba(239,68,68,0.12)" : "";
  }

  function mailtoFallback(data) {
    var product = data.get("produto") || cfg.product || "MR TRUST OSINT";
    var subject = encodeURIComponent(
      product + " — " + (data.get("plan") || data.get("name") || "novo lead")
    );
    var body = encodeURIComponent(
      "Nome: " +
        data.get("name") +
        "\nE-mail: " +
        data.get("email") +
        "\nPlano: " +
        (data.get("plan") || "—") +
        "\nUso: " +
        (data.get("use_case") || "—") +
        "\n\n" +
        (data.get("message") || "")
    );
    window.location.href =
      "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body;
  }

  async function submitViaFormspree(form, successEl, submitBtn) {
    var id = cfg.formspreeFormId;
    var url = "https://formspree.io/f/" + id;
    var data = new FormData(form);
    data.append(
      "_subject",
      (cfg.product || "MR TRUST OSINT") +
        " — " +
        (data.get("plan") || data.get("name") || "site")
    );

    var res = await fetch(url, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      var err = await res.json().catch(function () {
        return {};
      });
      throw new Error(err.error || "Falha ao enviar formulário");
    }

    form.reset();
    showFormMessage(
      successEl,
      "Mensagem enviada! Respondemos em até 1 dia útil em " + contactEmail + ".",
      false
    );
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Ativar trial de 14 dias";
    }
  }

  function loadHubspotForm(container) {
    if (!cfg.hubspotPortalId || !cfg.hubspotFormId) return false;

    var script = document.createElement("script");
    script.charset = "utf-8";
    script.type = "text/javascript";
    script.src = "//js.hsforms.net/forms/embed/v2.js";
    script.onload = function () {
      if (window.hbspt && window.hbspt.forms) {
        window.hbspt.forms.create({
          region: "na1",
          portalId: cfg.hubspotPortalId,
          formId: cfg.hubspotFormId,
          target: "#hubspot-form-container",
        });
      }
    };
    document.body.appendChild(script);
    container.innerHTML = "";
    container.id = "hubspot-form-container";
    return true;
  }

  function initLeadForm() {
    var form = qs("#lead-form");
    if (!form) return;

    var success = qs("#form-success");
    var note = qs(".form-note");
    var hubspotWrap = qs("#hubspot-form-wrap");

    if (
      cfg.hubspotPortalId &&
      cfg.hubspotFormId &&
      hubspotWrap &&
      loadHubspotForm(hubspotWrap)
    ) {
      hubspotWrap.style.display = "block";
      hubspotWrap.removeAttribute("aria-hidden");
      if (form) form.style.display = "none";
      if (note) {
        note.textContent =
          "Formulário gerenciado pelo HubSpot. Dúvidas: " + contactEmail;
      }
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (form.querySelector("[name=_gotcha]") && form.querySelector("[name=_gotcha]").value) {
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando…";
      }

      try {
        if (cfg.formspreeFormId) {
          await submitViaFormspree(form, success, submitBtn);
        } else {
          mailtoFallback(data);
          showFormMessage(
            success,
            "Abrimos seu e-mail para envio. Se não abrir, escreva para " +
              contactEmail,
            false
          );
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Ativar trial de 14 dias";
          }
        }
      } catch (err) {
        showFormMessage(
          success,
          (err && err.message) ||
            "Erro ao enviar. Tente " + contactEmail + " diretamente.",
          true
        );
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Ativar trial de 14 dias";
        }
      }
    });

    if (note) {
      if (cfg.formspreeFormId) {
        note.textContent =
          "Envio seguro via Formspree. Seus dados vão para " + contactEmail + ".";
      } else {
        note.textContent =
          "Configure formspreeFormId em assets/site-config.js para envio direto, ou use o e-mail que abrirá agora.";
      }
    }
  }

  function init() {
    applyContactLinks();
    applyGithubLinks();
    applyDemoLinks();
    initMobileNav();
    initLeadForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
