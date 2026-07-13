/*!
 * FormForge embed runtime — renders an exported FormForge schema anywhere.
 * Usage (produced by the FormForge "Embed Code" export):
 *   <div data-formforge="FORM_ID"></div>
 *   <script type="application/json" data-formforge-schema="FORM_ID">{...}</script>
 *   <script async src="https://.../embed.js" data-formforge-id="FORM_ID"></script>
 */
(function () {
  "use strict";

  var STYLE_ID = "formforge-embed-styles";
  var CSS =
    ".ff-form{font-family:Inter,system-ui,sans-serif;color:#1a1a1a;background:#fffdf0;border:2px solid #1a1a1a;padding:24px;max-width:640px}" +
    ".ff-form *{box-sizing:border-box}" +
    ".ff-form h1{font-size:24px;font-weight:700;margin:0 0 4px}" +
    ".ff-form .ff-desc{margin:0 0 20px;font-size:14px;opacity:.65}" +
    ".ff-field{margin-bottom:16px}" +
    ".ff-field>label{display:block;font-weight:700;font-size:14px;margin-bottom:6px}" +
    ".ff-field input[type=text],.ff-field input[type=email],.ff-field input[type=date],.ff-field input[type=number],.ff-field select,.ff-field textarea{width:100%;border:2px solid #1a1a1a;border-radius:6px;background:#fff;padding:8px 10px;font:inherit;font-size:14px}" +
    ".ff-option{display:flex;align-items:center;gap:8px;font-size:14px;margin:4px 0;font-weight:400}" +
    ".ff-option input{width:auto}" +
    ".ff-help{font-size:12px;opacity:.6;margin:4px 0 0}" +
    ".ff-error{font-size:12px;font-weight:600;color:#c8102e;margin:4px 0 0}" +
    ".ff-rating button{background:none;border:none;font-size:26px;cursor:pointer;padding:2px;line-height:1}" +
    ".ff-section{border-top:2px solid #1a1a1a;padding-top:12px;margin:20px 0 16px}" +
    ".ff-section h2{font-size:18px;margin:0}" +
    ".ff-section p{font-size:13px;opacity:.6;margin:4px 0 0}" +
    ".ff-submit{background:#c8102e;color:#fff;border:2px solid #1a1a1a;border-radius:6px;padding:10px 20px;font-weight:700;font-size:14px;cursor:pointer}" +
    ".ff-submit:hover{background:#9d0c24}" +
    ".ff-success{border:2px solid #1a1a1a;background:#ffd000;padding:20px;font-weight:700;font-size:16px}";

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "text") node.textContent = attrs[key];
        else if (attrs[key] !== undefined && attrs[key] !== null)
          node.setAttribute(key, attrs[key]);
      });
    }
    (children || []).forEach(function (child) {
      node.appendChild(child);
    });
    return node;
  }

  function findRule(field, type) {
    for (var i = 0; i < (field.validations || []).length; i++) {
      if (field.validations[i].type === type) return field.validations[i];
    }
    return null;
  }

  function isRequired(field) {
    return field.required || !!findRule(field, "required");
  }

  // -------------------------------------------------------------------------
  // Value collection + validation
  // -------------------------------------------------------------------------

  function getValue(form, field) {
    var name = field.id;
    switch (field.type) {
      case "checkbox": {
        var box = form.querySelector('[name="' + name + '"]');
        return box ? box.checked : false;
      }
      case "multiselect": {
        var checks = form.querySelectorAll('[name="' + name + '"]:checked');
        return Array.prototype.map.call(checks, function (c) {
          return c.value;
        });
      }
      case "radio": {
        var picked = form.querySelector('[name="' + name + '"]:checked');
        return picked ? picked.value : "";
      }
      case "rating": {
        var holder = form.querySelector('[data-ff-rating="' + name + '"]');
        return holder ? Number(holder.getAttribute("data-value") || 0) : 0;
      }
      case "file": {
        var input = form.querySelector('[name="' + name + '"]');
        return input && input.files ? Array.prototype.slice.call(input.files) : [];
      }
      case "section":
        return null;
      default: {
        var node = form.querySelector('[name="' + name + '"]');
        return node ? node.value : "";
      }
    }
  }

  function isEmpty(value) {
    if (value === null || value === undefined || value === false) return true;
    if (Array.isArray(value)) return value.length === 0;
    return String(value).replace(/\s/g, "") === "";
  }

  function validateField(field, value) {
    var rules = field.validations || [];
    if (isRequired(field) && isEmpty(value)) {
      var reqRule = findRule(field, "required");
      return (reqRule && reqRule.message) || (field.label || "This field") + " is required";
    }
    if (isEmpty(value)) return null;

    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var str = String(value);
      switch (rule.type) {
        case "minLength":
          if (str.length < Number(rule.value)) return rule.message;
          break;
        case "maxLength":
          if (str.length > Number(rule.value)) return rule.message;
          break;
        case "min":
          if (field.type === "number" && Number(value) < Number(rule.value))
            return rule.message;
          if (field.type === "date" && str < String(rule.value))
            return rule.message;
          if (field.type === "multiselect" && value.length < Number(rule.value))
            return rule.message;
          break;
        case "max":
          if (field.type === "number" && Number(value) > Number(rule.value))
            return rule.message;
          if (field.type === "date" && str > String(rule.value))
            return rule.message;
          if (field.type === "multiselect" && value.length > Number(rule.value))
            return rule.message;
          break;
        case "pattern":
          try {
            if (!new RegExp(String(rule.value)).test(str)) return rule.message;
          } catch {
            /* invalid regex — skip */
          }
          break;
        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return rule.message;
          break;
        case "url":
          try {
            new URL(str);
          } catch {
            return rule.message;
          }
          break;
      }
    }

    if (field.type === "file" && field.maxSizeMB) {
      for (var j = 0; j < value.length; j++) {
        if (value[j].size > field.maxSizeMB * 1024 * 1024)
          return "Each file must be under " + field.maxSizeMB + "MB";
      }
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Conditional logic
  // -------------------------------------------------------------------------

  function comparable(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "boolean") return value ? "true" : "";
    if (Array.isArray(value)) return value.join(",");
    return String(value);
  }

  function ruleMatches(rule, raw) {
    var str = comparable(raw);
    switch (rule.operator) {
      case "equals":
        return str === rule.value;
      case "not_equals":
        return str !== rule.value;
      case "contains":
        return Array.isArray(raw)
          ? raw.indexOf(rule.value) !== -1
          : str.indexOf(rule.value) !== -1;
      case "is_empty":
        return isEmpty(raw);
      case "is_not_empty":
        return !isEmpty(raw);
      default:
        return true;
    }
  }

  function applyConditionals(form, schema) {
    (schema.fields || []).forEach(function (field) {
      var rule = field.conditional;
      if (!rule || !rule.fieldId) return;
      var wrapper = form.querySelector('[data-ff-field="' + field.id + '"]');
      if (!wrapper) return;
      var source = null;
      for (var i = 0; i < schema.fields.length; i++) {
        if (schema.fields[i].id === rule.fieldId) source = schema.fields[i];
      }
      var matches = source
        ? ruleMatches(rule, getValue(form, source))
        : true;
      var visible = rule.action === "show" ? matches : !matches;
      wrapper.style.display = visible ? "" : "none";
      wrapper.setAttribute("data-ff-hidden", visible ? "0" : "1");
    });
  }

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  function buildInput(field) {
    var required = isRequired(field);
    var min, max;
    switch (field.type) {
      case "textarea": {
        var area = el("textarea", {
          name: field.id,
          id: field.id,
          rows: String(field.rows || 4),
          placeholder: field.placeholder || "",
        });
        return [area];
      }
      case "select": {
        var select = el("select", { name: field.id, id: field.id });
        select.appendChild(el("option", { value: "", text: field.placeholder || "Select…" }));
        (field.options || []).forEach(function (option) {
          select.appendChild(el("option", { value: option.value, text: option.label }));
        });
        return [select];
      }
      case "multiselect":
      case "radio": {
        var group = el("div", { role: "group", "aria-label": field.label });
        (field.options || []).forEach(function (option) {
          var input = el("input", {
            type: field.type === "radio" ? "radio" : "checkbox",
            name: field.id,
            value: option.value,
          });
          var label = el("label", { class: "ff-option" }, [input]);
          label.appendChild(document.createTextNode(option.label));
          group.appendChild(label);
        });
        return [group];
      }
      case "checkbox": {
        var box = el("input", { type: "checkbox", name: field.id, id: field.id });
        var wrap = el("label", { class: "ff-option" }, [box]);
        wrap.appendChild(document.createTextNode(field.label + (required ? " *" : "")));
        return [wrap];
      }
      case "date": {
        min = findRule(field, "min");
        max = findRule(field, "max");
        return [
          el("input", {
            type: "date",
            name: field.id,
            id: field.id,
            min: min ? String(min.value) : null,
            max: max ? String(max.value) : null,
          }),
        ];
      }
      case "number": {
        min = findRule(field, "min");
        max = findRule(field, "max");
        return [
          el("input", {
            type: "number",
            name: field.id,
            id: field.id,
            placeholder: field.placeholder || "",
            step: field.step !== undefined ? String(field.step) : "any",
            min: min ? String(min.value) : null,
            max: max ? String(max.value) : null,
          }),
        ];
      }
      case "rating": {
        var holder = el("div", {
          class: "ff-rating",
          "data-ff-rating": field.id,
          "data-value": "0",
          role: "radiogroup",
          "aria-label": field.label,
        });
        for (var star = 1; star <= 5; star++) {
          (function (value) {
            var btn = el("button", {
              type: "button",
              "aria-label": value + " star" + (value > 1 ? "s" : ""),
              text: "☆",
            });
            btn.addEventListener("click", function () {
              holder.setAttribute("data-value", String(value));
              var buttons = holder.querySelectorAll("button");
              for (var b = 0; b < buttons.length; b++) {
                buttons[b].textContent = b < value ? "★" : "☆";
              }
              holder.dispatchEvent(new Event("change", { bubbles: true }));
            });
            holder.appendChild(btn);
          })(star);
        }
        return [holder];
      }
      case "file": {
        return [
          el("input", {
            type: "file",
            name: field.id,
            id: field.id,
            multiple: "",
            accept: field.accept || null,
          }),
        ];
      }
      default:
        return [
          el("input", {
            type: "text",
            name: field.id,
            id: field.id,
            placeholder: field.placeholder || "",
          }),
        ];
    }
  }

  function buildField(field) {
    if (field.type === "section") {
      var section = el("div", { class: "ff-section", "data-ff-field": field.id });
      section.appendChild(el("h2", { text: field.label }));
      if (field.helpText) section.appendChild(el("p", { text: field.helpText }));
      return section;
    }

    var wrapper = el("div", { class: "ff-field", "data-ff-field": field.id });
    if (field.type !== "checkbox") {
      var label = el("label", {
        for: field.id,
        text: field.label + (isRequired(field) ? " *" : ""),
      });
      wrapper.appendChild(label);
    }
    buildInput(field).forEach(function (node) {
      wrapper.appendChild(node);
    });
    if (field.helpText)
      wrapper.appendChild(el("p", { class: "ff-help", text: field.helpText }));
    wrapper.appendChild(el("p", { class: "ff-error", "data-ff-error": field.id }));
    return wrapper;
  }

  function render(mount, schema) {
    injectStyles();
    var form = el("form", { class: "ff-form", novalidate: "" });
    form.appendChild(el("h1", { text: schema.title || "Untitled form" }));
    if (schema.description)
      form.appendChild(el("p", { class: "ff-desc", text: schema.description }));

    var fields = (schema.fields || []).slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });
    fields.forEach(function (field) {
      form.appendChild(buildField(field));
    });

    form.appendChild(
      el("button", {
        type: "submit",
        class: "ff-submit",
        text: (schema.settings && schema.settings.submitLabel) || "Submit",
      }),
    );

    form.addEventListener("input", function () {
      applyConditionals(form, schema);
    });
    form.addEventListener("change", function () {
      applyConditionals(form, schema);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = {};
      var firstError = null;

      fields.forEach(function (field) {
        if (field.type === "section") return;
        var wrapper = form.querySelector('[data-ff-field="' + field.id + '"]');
        var hidden = wrapper && wrapper.getAttribute("data-ff-hidden") === "1";
        var errorNode = form.querySelector('[data-ff-error="' + field.id + '"]');
        if (errorNode) errorNode.textContent = "";
        if (hidden) return;

        var value = getValue(form, field);
        var error = validateField(field, value);
        if (error) {
          if (errorNode) errorNode.textContent = error;
          if (!firstError) firstError = wrapper;
        } else {
          data[field.id] = Array.isArray(value)
            ? value.map(function (v) {
                return v && v.name ? v.name : v;
              })
            : value;
        }
      });

      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      var success = el("div", {
        class: "ff-success",
        role: "status",
        text:
          (schema.settings && schema.settings.successMessage) ||
          "Thanks! Your response has been recorded.",
      });
      form.replaceWith(success);
      mount.dispatchEvent(
        new CustomEvent("formforge:submit", { detail: data, bubbles: true }),
      );
    });

    mount.appendChild(form);
    applyConditionals(form, schema);
  }

  function init() {
    var nodes = document.querySelectorAll(
      'script[type="application/json"][data-formforge-schema]',
    );
    Array.prototype.forEach.call(nodes, function (node) {
      var id = node.getAttribute("data-formforge-schema");
      var mount = document.querySelector('[data-formforge="' + id + '"]');
      if (!mount || mount.getAttribute("data-ff-mounted")) return;
      var schema;
      try {
        schema = JSON.parse(node.textContent);
      } catch {
        return;
      }
      mount.setAttribute("data-ff-mounted", "1");
      render(mount, schema);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
