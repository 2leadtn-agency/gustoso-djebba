(function () {
  "use strict";

  var SYSTEM_PROMPT =
    "Vous êtes l'assistant virtuel de Gustoso Djebba, unité de séchage moderne de fruits, légumes et plantes aromatiques. Répondez avec chaleur et professionnalisme aux questions sur les produits séchés (figues, tomates, etc.), leurs bienfaits et les modalités de commande.";
  var BUSINESS_NAME = "Gustoso Djebba";
  var WHATSAPP_NUMBER = "21625417909";
  var PRIMARY_COLOR = "#038432";
  var ACCENT_COLOR = "#f49828";

  // Endpoint for the hosted chatbot proxy. Wire this to the live
  // Lumerank chatbot-proxy function before going to production —
  // in this preview, a failed/absent call falls back to a WhatsApp prompt.
  var CHATBOT_ENDPOINT = "/api/chatbot-proxy";

  var WELCOME_MESSAGE =
    "Bonjour et bienvenue chez Gustoso Djebba \u{1F31E}! Je suis là pour répondre à vos questions sur nos figues, tomates, olives et plantes aromatiques séchées. Comment puis-je vous aider aujourd'hui ?";

  var FALLBACK_MESSAGE =
    "Merci pour votre message ! Notre assistant n'est pas disponible pour le moment. Pour une réponse rapide, contactez-nous directement sur WhatsApp.";

  var STYLE = `
    .gd-chat-bubble {
      position: fixed;
      right: 20px;
      bottom: 90px;
      z-index: 950;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #026b28);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 22px rgba(3, 132, 50, 0.4);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .gd-chat-bubble:hover { transform: scale(1.07); box-shadow: 0 10px 26px rgba(3, 132, 50, 0.5); }
    .gd-chat-bubble svg { width: 30px; height: 30px; }
    .gd-chat-panel {
      position: fixed;
      right: 20px;
      bottom: 160px;
      z-index: 950;
      width: min(360px, calc(100vw - 32px));
      height: min(500px, calc(100vh - 200px));
      background: #fffdf9;
      border-radius: 18px;
      box-shadow: 0 20px 50px rgba(43, 32, 19, 0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.35s ease, transform 0.35s ease;
      font-family: "Karla", "Helvetica Neue", Arial, sans-serif;
    }
    .gd-chat-panel.gd-open { display: flex; }
    .gd-chat-panel.gd-visible { opacity: 1; transform: translateY(0); }
    .gd-chat-header {
      background: ${PRIMARY_COLOR};
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .gd-chat-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .gd-chat-avatar svg { width: 22px; height: 22px; }
    .gd-chat-title { font-weight: 700; font-size: 0.95rem; line-height: 1.2; }
    .gd-chat-sub { font-size: 0.72rem; opacity: 0.85; }
    .gd-chat-close {
      margin-left: auto;
      background: none; border: none; cursor: pointer;
      color: #fff; opacity: 0.85; padding: 4px;
      display: flex;
    }
    .gd-chat-close:hover { opacity: 1; }
    .gd-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fbf3e6;
    }
    .gd-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.88rem;
      line-height: 1.5;
      white-space: pre-wrap;
    }
    .gd-msg-bot {
      background: #fff;
      color: #2b2013;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(43,32,19,0.08);
    }
    .gd-msg-user {
      background: ${ACCENT_COLOR};
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .gd-msg-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; }
    .gd-msg-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: #b7a893;
      animation: gd-typing 1s infinite ease-in-out;
    }
    .gd-msg-typing span:nth-child(2) { animation-delay: 0.15s; }
    .gd-msg-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes gd-typing {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-3px); }
    }
    .gd-chat-input-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 10px;
      border-top: 1px solid rgba(43,32,19,0.08);
      background: #fff;
      flex-shrink: 0;
    }
    .gd-chat-textarea {
      flex: 1;
      resize: none;
      max-height: 96px;
      overflow-y: auto;
      border: 1.5px solid rgba(43,32,19,0.14);
      border-radius: 12px;
      padding: 9px 12px;
      font-family: inherit;
      font-size: 0.88rem;
      line-height: 1.4;
      color: #2b2013;
    }
    .gd-chat-textarea:focus { outline: none; border-color: ${PRIMARY_COLOR}; }
    .gd-chat-send {
      width: 38px; height: 38px; border-radius: 50%;
      border: none; cursor: pointer; flex-shrink: 0;
      background: ${PRIMARY_COLOR}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.25s ease;
    }
    .gd-chat-send:hover { background: #026b28; }
    .gd-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
    @media (max-width: 420px) {
      .gd-chat-panel { right: 16px; bottom: 148px; }
      .gd-chat-bubble { right: 16px; }
    }
  `;

  function injectStyle() {
    var s = document.createElement("style");
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  // Custom avatar: sun rays (orange) behind a fig-leaf line silhouette (white),
  // evoking the sun-dried orchard identity rather than a generic round avatar.
  var AVATAR_SVG =
    '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="16" cy="16" r="5.2"></circle>' +
    '<path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2.1 2.1M23.4 23.4l2.1 2.1M25.5 6.5l-2.1 2.1M8.6 23.4l-2.1 2.1"></path>' +
    "</svg>";

  var BUBBLE_SVG =
    '<svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M16 4c-5 4-8 8-8 12.5A8 8 0 0 0 16 24a8 8 0 0 0 8-7.5C24 12 21 8 16 4z"></path>' +
    '<path d="M16 14c-2 2.5-2 4.5-2 6"></path>' +
    "</svg>";

  var SEND_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>';

  var CLOSE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>';

  function buildDOM() {
    var bubble = document.createElement("button");
    bubble.className = "gd-chat-bubble";
    bubble.setAttribute("aria-label", "Ouvrir le chat " + BUSINESS_NAME);
    bubble.innerHTML = BUBBLE_SVG;

    var panel = document.createElement("div");
    panel.className = "gd-chat-panel";
    panel.innerHTML =
      '<div class="gd-chat-header">' +
      '<div class="gd-chat-avatar">' + AVATAR_SVG + "</div>" +
      '<div><div class="gd-chat-title">' + BUSINESS_NAME + "</div>" +
      '<div class="gd-chat-sub">Généralement en ligne</div></div>' +
      '<button class="gd-chat-close" aria-label="Fermer le chat">' + CLOSE_SVG + "</button>" +
      "</div>" +
      '<div class="gd-chat-messages" id="gd-chat-messages"></div>' +
      '<div class="gd-chat-input-row">' +
      '<textarea class="gd-chat-textarea" id="gd-chat-textarea" rows="1" placeholder="Écrivez votre message..."></textarea>' +
      '<button class="gd-chat-send" id="gd-chat-send" aria-label="Envoyer">' + SEND_SVG + "</button>" +
      "</div>";

    document.body.appendChild(panel);
    document.body.appendChild(bubble);
    return { bubble: bubble, panel: panel };
  }

  function addMessage(container, text, who) {
    var el = document.createElement("div");
    el.className = "gd-msg " + (who === "user" ? "gd-msg-user" : "gd-msg-bot");
    el.textContent = text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  function addTyping(container) {
    var el = document.createElement("div");
    el.className = "gd-msg gd-msg-bot gd-msg-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  async function requestReply(history) {
    try {
      var res = await fetch(CHATBOT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: SYSTEM_PROMPT,
          businessName: BUSINESS_NAME,
          messages: history,
        }),
      });
      if (!res.ok) throw new Error("bad response");
      var data = await res.json();
      if (data && typeof data.reply === "string") return data.reply;
      throw new Error("no reply");
    } catch (err) {
      return (
        FALLBACK_MESSAGE +
        "\n\n\u{1F449} wa.me/" +
        WHATSAPP_NUMBER
      );
    }
  }

  function init() {
    injectStyle();
    var dom = buildDOM();
    var messages = document.getElementById("gd-chat-messages");
    var textarea = document.getElementById("gd-chat-textarea");
    var sendBtn = document.getElementById("gd-chat-send");
    var closeBtn = dom.panel.querySelector(".gd-chat-close");
    var history = [];
    var hasOpenedOnce = false;
    var isSending = false;

    function openPanel() {
      dom.panel.classList.add("gd-open");
      requestAnimationFrame(function () {
        dom.panel.classList.add("gd-visible");
      });
      if (!hasOpenedOnce) {
        hasOpenedOnce = true;
        addMessage(messages, WELCOME_MESSAGE, "bot");
        history.push({ role: "assistant", content: WELCOME_MESSAGE });
      }
      textarea.focus();
    }

    function closePanel() {
      dom.panel.classList.remove("gd-visible");
      setTimeout(function () {
        dom.panel.classList.remove("gd-open");
      }, 300);
    }

    dom.bubble.addEventListener("click", function () {
      if (dom.panel.classList.contains("gd-open")) {
        closePanel();
      } else {
        openPanel();
      }
    });
    closeBtn.addEventListener("click", closePanel);

    textarea.addEventListener("input", function () {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + "px";
    });

    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    sendBtn.addEventListener("click", send);

    async function send() {
      var text = textarea.value.trim();
      if (!text || isSending) return;
      isSending = true;
      sendBtn.disabled = true;
      addMessage(messages, text, "user");
      history.push({ role: "user", content: text });
      textarea.value = "";
      textarea.style.height = "auto";

      var typingEl = addTyping(messages);
      var reply = await requestReply(history);
      typingEl.remove();
      addMessage(messages, reply, "bot");
      history.push({ role: "assistant", content: reply });

      isSending = false;
      sendBtn.disabled = false;
      textarea.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
