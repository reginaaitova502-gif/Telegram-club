(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* Плейсхолдеры в квадратных скобках подсвечиваются, чтобы их было видно */
  function txt(s) {
    return esc(s).replace(/\[[^\]]+\]/g, function (m) { return '<span class="placeholder">' + m + "</span>"; });
  }
  function render(name, html) {
    $$('[data-render="' + name + '"]').forEach(function (el) { el.innerHTML = html; });
  }

  /* ------------------------------------------------------------------
     Данные сайта и Telegram
     ------------------------------------------------------------------ */
  $$("[data-site]").forEach(function (el) {
    var key = el.getAttribute("data-site");
    if (SITE[key] !== undefined) el.textContent = SITE[key];
  });

  var tgReady = /^(https?:\/\/|tg:\/\/)/i.test(TELEGRAM_URL);
  $$("[data-tg]").forEach(function (a) {
    if (tgReady) {
      a.href = TELEGRAM_URL;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        showToast("Ссылка на Telegram ещё не добавлена. Укажите её в <code>assets/js/config.js</code> → TELEGRAM_URL.");
      });
    }
  });

  var toastEl = $(".toast");
  var toastTimer;
  function showToast(html) {
    toastEl.innerHTML = html;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ------------------------------------------------------------------
     Рендер контента из config.js
     ------------------------------------------------------------------ */
  var stripGroup = valueStrip.map(function (v) {
    return '<span class="strip__item"><span class="kf" aria-hidden="true"></span>' + esc(v) + "</span>";
  }).join("");
  render("valueStrip",
    '<ul class="strip__group" role="list">' + valueStrip.map(function (v) {
      return '<li class="strip__item"><span class="kf" aria-hidden="true"></span>' + esc(v) + "</li>";
    }).join("") + "</ul>" +
    '<div class="strip__group" aria-hidden="true">' + stripGroup + "</div>");

  var visuals = {
    lessons:
      '<div class="vis-lessons" aria-hidden="true">' +
      '<div><b></b>Интерфейс и первый проект<span class="bar"><i style="--w:100%"></i></span><em>✓</em></div>' +
      '<div><b></b>Ключевые кадры и easing<span class="bar"><i style="--w:70%"></i></span><em>12:40</em></div>' +
      '<div><b></b>Маски и переходы<span class="bar"><i style="--w:25%"></i></span><em>18:05</em></div>' +
      "</div>",
    steps: '<div class="vis-steps" aria-hidden="true"><span></span><span></span><span></span><span></span></div>',
    transfer:
      '<div class="vis-transfer" aria-hidden="true"><div class="desk"></div>' +
      '<div class="arrow"><span class="kf"></span><span class="kf"></span><span class="kf"></span></div>' +
      '<div class="mob"></div></div>',
  };

  render("clubFeatures", clubFeatures.map(function (f) {
    var cls = "feature feature--" + f.size + (f.accent ? " feature--accent" : "");
    var body =
      '<p class="feature__num">' + esc(f.number) + "</p>" +
      '<h3 class="feature__title">' + esc(f.title) + "</h3>" +
      '<p class="feature__text">' + esc(f.description) + "</p>";
    if (f.size === "full") {
      return '<article class="' + cls + '"><div>' + body + "</div>" + (visuals[f.visual] || "") + "</article>";
    }
    var vis = f.visual ? visuals[f.visual] : "";
    if (f.visual === "lessons") body = body.replace('<h3', vis + '<h3');
    else body += vis;
    return '<article class="' + cls + '">' + body + "</article>";
  }).join(""));

  render("before", transformation.before.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join(""));
  render("after", transformation.after.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join(""));

  var icons = {
    remote: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 14.5z"/><path d="M8 21h8M12 17v4"/><path d="M10 9.5l4 1.5-4 1.5z"/>',
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M12 17.5s-3-1.8-3-3.8A1.7 1.7 0 0 1 12 13a1.7 1.7 0 0 1 3 .7c0 2-3 3.8-3 3.8z"/>',
    growth: '<path d="M3 20h18"/><path d="M5 16l5-5 3 3 6-7"/><path d="M15 7h4v4"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5z"/>',
  };
  render("audience", audience.map(function (a, i) {
    return '<article class="aud">' +
      '<span class="aud__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + icons[a.icon] + "</svg></span>" +
      '<h3 class="aud__title">' + esc(a.title) + "</h3>" +
      '<p class="aud__text">' + esc(a.text) + "</p>" +
      '<span class="aud__ghost" aria-hidden="true">' + (i + 1) + "</span>" +
      "</article>";
  }).join(""));

  render("ecosystem", ecosystem.map(function (e, i) {
    return '<li class="track" data-i="' + i + '">' +
      '<span class="track__label">' + esc(e.track) + "</span>" +
      '<span class="track__lane">' +
      '<button type="button" class="track__clip" style="--s:' + e.start + "%;--l:" + e.length + '%" aria-label="' + esc(e.track + ": " + e.title) + '">' + esc(e.title) + "</button>" +
      '<span class="track__desc">' + esc(e.text) + "</span>" +
      "</span></li>";
  }).join(""));

  render("pinterestTopics", pinterestTopics.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join(""));

  var quote = '<svg class="tcard__mark" viewBox="0 0 40 32" aria-hidden="true"><path fill="currentColor" d="M0 32V19.2C0 8.6 5.6 2.2 16.8 0l1.6 4.4C12.3 6 9.3 9.4 9 14.4h8.2V32zm22.4 0V19.2C22.4 8.6 28 2.2 39.2 0l1.6 4.4c-6.1 1.6-9.1 5-9.4 10h8.2V32z"/></svg>';
  render("testimonials", testimonials.map(function (t, i) {
    return '<figure class="tcard tcard--' + t.size + '" aria-label="Отзыв ' + (i + 1) + " из " + testimonials.length + '">' +
      quote +
      '<blockquote class="tcard__text">' + txt(t.text) + "</blockquote>" +
      (t.beforeAfter ? '<div class="tcard__ba"><div>[ДО]</div><div>[ПОСЛЕ]</div></div>' : "") +
      '<figcaption class="tcard__who"><span class="tcard__avatar" aria-hidden="true"></span><span>' +
      '<span class="tcard__name">' + txt(t.name) + '</span><br><span class="tcard__role">' + txt(t.role) + "</span></span></figcaption>" +
      "</figure>";
  }).join(""));

  var keyItems = /неограниченный|без доплат|рассрочка/i;
  render("pricingIncludes", pricingIncludes.map(function (p) {
    return '<li' + (keyItems.test(p) ? ' class="is-key"' : "") + ">" + esc(p) + "</li>";
  }).join(""));

  render("faq", faq.map(function (f, i) {
    return '<div class="acc">' +
      '<h3><button class="acc__btn" type="button" id="faq-b' + i + '" aria-expanded="false" aria-controls="faq-p' + i + '">' +
      "<span>" + esc(f.q) + '</span><span class="acc__icon" aria-hidden="true"></span></button></h3>' +
      '<div class="acc__panel" id="faq-p' + i + '" role="region" aria-labelledby="faq-b' + i + '" inert><div><p>' + txt(f.a) + "</p></div></div>" +
      "</div>";
  }).join(""));

  render("legal", SITE.legal.filter(function (l) { return l.url; }).map(function (l) {
    return '<a href="' + esc(l.url) + '">' + esc(l.label) + "</a>";
  }).join(""));

  /* ------------------------------------------------------------------
     Смартфон с монтажным таймлайном
     ------------------------------------------------------------------ */
  var TL_DUR = 9; // секунд на один круг таймлайна
  var tlClips = {
    video: [[0, 21], [23, 47], [49, 77], [79, 100]],
    text: [[9, 35], [55, 83]],
    fx: [[3, 46], [51, 97]],
  };
  var tlKeys = [7, 19, 33, 44, 56, 69, 81, 93];

  function waveform(n) {
    var s = "";
    for (var i = 0; i < n; i++) {
      var h = 18 + Math.abs(Math.sin(i * 0.9) * 50 + Math.sin(i * 0.23) * 30);
      s += '<i style="height:' + Math.min(92, h).toFixed(0) + '%"></i>';
    }
    return s;
  }

  function timelineCopy() {
    function row(type, top) {
      return '<div class="tl__row" style="top:' + top + '%">' +
        tlClips[type].map(function (c) {
          return '<span class="tl__clip tl__clip--' + type + '" style="left:' + c[0] + "%;width:" + (c[1] - c[0]) + '%"></span>';
        }).join("") + "</div>";
    }
    return '<div class="tl__copy">' +
      row("video", 6) + row("text", 28) +
      '<div class="tl__row" style="top:50%">' +
      tlClips.fx.map(function (c) {
        return '<span class="tl__clip tl__clip--fx" style="left:' + c[0] + "%;width:" + (c[1] - c[0]) + '%"></span>';
      }).join("") +
      tlKeys.map(function (k) { return '<span class="tl__kf" data-x="' + k + '" style="left:' + k + '%"></span>'; }).join("") +
      "</div>" +
      '<div class="tl__row" style="top:72%"><span class="tl__clip" style="left:0;width:100%"><span class="tl__wave">' + waveform(64) + "</span></span></div>" +
      "</div>";
  }

  function timeline(copyWidthEm) {
    return '<div class="tl" style="--tl-dur:' + TL_DUR + "s;--tl-w:" + copyWidthEm + 'em">' +
      '<div class="tl__ruler"></div>' +
      '<div class="tl__rows"><div class="tl__move">' + timelineCopy() + timelineCopy() + "</div></div>" +
      '<span class="tl__playhead"></span></div>';
  }

  function buildPhone(el) {
    var variant = el.getAttribute("data-phone");
    if (variant === "strip") { el.innerHTML = timeline(100); return; }
    var preview = variant === "layers"
      ? '<div class="phone__preview preview--layers"><div class="preview__orb"></div><div class="preview__mask"></div><span class="preview__time">Маска</span></div>'
      : '<div class="phone__preview phone__preview--video">' +
        '<video class="preview__video" src="' + SITE.heroVideo + '" muted loop playsinline preload="auto"></video>' +
        '<div class="preview__crop"><i></i><i></i><i></i><i></i></div><span class="preview__time" data-video-time>00:00</span></div>';
    el.innerHTML =
      '<div class="phone__screen">' +
      '<span class="phone__island"></span>' +
      '<div class="phone__status"><span>9:41</span><i></i></div>' +
      '<div class="phone__appbar"><b><img class="phone__appicon" src="' + SITE.appIcon + '" alt="">Проект_01</b><span class="phone__export">Экспорт</span></div>' +
      preview +
      '<div class="phone__tools"><span></span><span class="is-on"></span><span></span><span></span><span></span></div>' +
      timeline(36) +
      "</div>";
  }
  $$("[data-phone]").forEach(buildPhone);

  /* Видео в телефоне: играет без звука, только когда видно на экране;
     при reduced-motion показываем первый кадр без воспроизведения */
  $$(".preview__video").forEach(function (v) {
    var timeEl = v.parentNode.querySelector("[data-video-time]");
    v.muted = true;
    v.addEventListener("timeupdate", function () {
      var s = Math.floor(v.currentTime);
      timeEl.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    });
    function play() { if (!reduceMotion.matches) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) play(); else v.pause(); });
      }).observe(v);
    } else {
      play();
    }
    reduceMotion.addEventListener("change", function () { if (reduceMotion.matches) v.pause(); else play(); });
  });

  /* ключевые кадры вспыхивают ровно в момент, когда проходят через плейхед */
  function syncKeyframes() {
    $$(".tl").forEach(function (tl) {
      var rows = $(".tl__rows", tl);
      var copy = $(".tl__copy", tl);
      if (!rows || !copy) return;
      var W = copy.offsetWidth;
      var P = rows.clientWidth * 0.38;
      if (!W) return;
      $$(".tl__kf", tl).forEach(function (k) {
        var x = (parseFloat(k.getAttribute("data-x")) / 100) * W;
        var phase = (((x - P) / W) % 1 + 1) % 1;
        k.style.setProperty("--d", (-(1 - phase) * TL_DUR).toFixed(3) + "s");
      });
    });
  }

  /* ------------------------------------------------------------------
     Header + мобильное меню
     ------------------------------------------------------------------ */
  var header = $(".header");
  var burger = $(".burger");
  var menu = $("#mobile-menu");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    menu.hidden = !open;
    menu.classList.toggle("is-open", open);
    header.classList.toggle("is-scrolled", open || window.scrollY > 8);
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); }
  });
  window.matchMedia("(min-width: 1081px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ------------------------------------------------------------------
     FAQ
     ------------------------------------------------------------------ */
  var accButtons = $$(".acc__btn");
  function setAcc(btn, open) {
    var item = btn.closest(".acc");
    var panel = doc.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", String(open));
    item.classList.toggle("is-open", open);
    if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
  }
  accButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () { setAcc(btn, btn.getAttribute("aria-expanded") !== "true"); });
    btn.addEventListener("keydown", function (e) {
      var j = null;
      if (e.key === "ArrowDown") j = (i + 1) % accButtons.length;
      if (e.key === "ArrowUp") j = (i - 1 + accButtons.length) % accButtons.length;
      if (e.key === "Home") j = 0;
      if (e.key === "End") j = accButtons.length - 1;
      if (j !== null) { e.preventDefault(); accButtons[j].focus(); }
    });
  });
  if (accButtons[0]) setAcc(accButtons[0], true);

  /* ------------------------------------------------------------------
     Карусель отзывов
     ------------------------------------------------------------------ */
  var carousel = $(".carousel");
  var prevBtn = $('[data-carousel="prev"]');
  var nextBtn = $('[data-carousel="next"]');

  function step() {
    var card = $(".tcard", carousel);
    return card ? card.offsetWidth + 16 : 300;
  }
  function scrollByCards(dir) {
    carousel.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });
  }
  // отступ карусели совпадает с левым краем сетки страницы
  var reviewsHead = $("#reviews .section-head");
  function alignCarousel() {
    var edge = reviewsHead.getBoundingClientRect().left - carousel.getBoundingClientRect().left;
    carousel.style.setProperty("--edge", Math.max(0, Math.round(edge)) + "px");
  }
  alignCarousel();

  function updateNav() {
    var max = carousel.scrollWidth - carousel.clientWidth - 2;
    prevBtn.disabled = carousel.scrollLeft <= 2;
    nextBtn.disabled = carousel.scrollLeft >= max;
  }
  prevBtn.addEventListener("click", function () { scrollByCards(-1); });
  nextBtn.addEventListener("click", function () { scrollByCards(1); });
  carousel.addEventListener("scroll", updateNav, { passive: true });
  carousel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); scrollByCards(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); scrollByCards(-1); }
  });

  // перетаскивание мышью (на тач-экранах работает нативный свайп)
  var drag = null;
  carousel.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: carousel.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; carousel.classList.add("is-dragging"); }
    if (drag.moved) carousel.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    var moved = drag.moved;
    var start = drag.left;
    drag = null;
    if (!moved) return;
    var dir = carousel.scrollLeft > start ? 1 : -1;
    carousel.classList.remove("is-dragging");
    // доснапить к ближайшей карточке в сторону движения
    var s = step();
    var target = Math.round((carousel.scrollLeft + dir * s * 0.3) / s) * s;
    carousel.scrollTo({ left: target, behavior: reduceMotion.matches ? "auto" : "smooth" });
  });

  if ("IntersectionObserver" in window) {
    var cardIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-dim", en.intersectionRatio < 0.6); });
    }, { root: carousel, threshold: [0, 0.6, 1] });
    $$(".tcard", carousel).forEach(function (c) { cardIO.observe(c); });
  }
  updateNav();

  /* ------------------------------------------------------------------
     Reveal-анимации
     ------------------------------------------------------------------ */
  $$(".features, .audience").forEach(function (g) {
    g.classList.add("stagger");
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.style.transitionDelay = Math.min(i, 6) * 0.08 + "s";
    });
  });

  var hero = $(".hero");
  function heroIn() { hero.classList.add("is-loaded"); }
  requestAnimationFrame(function () { requestAnimationFrame(heroIn); });
  setTimeout(heroIn, 120); // если вкладка в фоне и кадры не рисуются

  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add("is-in");
        revealIO.unobserve(t);
        if (t.classList.contains("stagger")) {
          setTimeout(function () {
            Array.prototype.forEach.call(t.children, function (c) { c.style.transitionDelay = ""; });
          }, 1400);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal, .stagger, .chat, .transform").forEach(function (el) { revealIO.observe(el); });

    // анимации вне экрана ставим на паузу
    var pauseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle("is-paused", !en.isIntersecting); });
    });
    $$(".hero__visual, .strip, .mobile-edit, .final, .price-card, .chat, .feature--full").forEach(function (el) { pauseIO.observe(el); });
  } else {
    $$(".reveal, .stagger, .chat, .transform").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------
     Скролл: шапка, таймлайн обучения, сцена с телефоном
     ------------------------------------------------------------------ */
  var editor = $(".editor");
  var tracks = $$(".track");
  var detail = $(".eco__detail");
  var tcEl = $("[data-eco-tc]");
  var stage = $(".mobile-edit");
  var desktopTL = window.matchMedia("(min-width: 901px)");
  var activeTrack = -1;

  function setPlayhead(p) {
    editor.style.setProperty("--p", p.toFixed(4));
    var pos = p * 100;
    var idx = 0;
    ecosystem.forEach(function (e, i) { if (pos >= e.start - 0.5) idx = i; });
    tracks.forEach(function (t, i) {
      var e = ecosystem[i];
      t.classList.toggle("is-active", i === idx);
      t.classList.toggle("is-past", i !== idx && pos > e.start + e.length);
    });
    var secs = Math.round(p * 150);
    tcEl.textContent = "00:" + String(Math.floor(secs / 60)).padStart(2, "0") + ":" + String(secs % 60).padStart(2, "0");
    if (idx !== activeTrack) {
      activeTrack = idx;
      var e = ecosystem[idx];
      $("[data-eco-track]").textContent = e.track;
      $("[data-eco-title]").textContent = e.title;
      $("[data-eco-text]").textContent = e.text;
      detail.classList.remove("is-swap");
      void detail.offsetWidth;
      detail.classList.add("is-swap");
    }
  }
  tracks.forEach(function (t, i) {
    $(".track__clip", t).addEventListener("click", function () {
      var e = ecosystem[i];
      setPlayhead(clamp((e.start + Math.min(e.length / 2, 8)) / 100, 0, 1));
    });
  });
  setPlayhead(0.02);

  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    if (burger.getAttribute("aria-expanded") !== "true") header.classList.toggle("is-scrolled", y > 8);
    var vh = window.innerHeight;

    if (!reduceMotion.matches && desktopTL.matches) {
      var r = editor.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        setPlayhead(clamp((vh * 0.8 - r.top) / (vh * 0.62), 0, 1));
      }
    }
    if (!reduceMotion.matches) {
      var s = stage.getBoundingClientRect();
      if (s.bottom > 0 && s.top < vh) {
        stage.style.setProperty("--p", clamp((vh - s.top) / (vh + s.height * 0.6), 0, 1).toFixed(4));
      }
    }
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Указатель: наклон телефона, подсветка карточек, «магнитные» кнопки
     ------------------------------------------------------------------ */
  function pointerFx() { return finePointer.matches && !reduceMotion.matches; }

  var tiltStage = $("[data-tilt]");
  var tiltPhone = tiltStage && $(".phone", tiltStage);
  var tiltFrame = 0;
  window.addEventListener("pointermove", function (e) {
    if (!pointerFx() || !tiltPhone || tiltFrame) return;
    tiltFrame = requestAnimationFrame(function () {
      tiltFrame = 0;
      var nx = e.clientX / window.innerWidth - 0.5;
      var ny = e.clientY / window.innerHeight - 0.5;
      tiltPhone.style.setProperty("--ry", (nx * 12).toFixed(2) + "deg");
      tiltPhone.style.setProperty("--rx", (-ny * 9).toFixed(2) + "deg");
    });
  }, { passive: true });

  doc.addEventListener("pointermove", function (e) {
    if (!pointerFx()) return;
    var card = e.target.closest && e.target.closest(".feature");
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  $$(".magnetic").forEach(function (btn) {
    btn.addEventListener("pointermove", function (e) {
      if (!pointerFx()) return;
      var r = btn.getBoundingClientRect();
      btn.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * 0.12).toFixed(1) + "px");
      btn.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px");
    });
    btn.addEventListener("pointerleave", function () {
      btn.style.setProperty("--bx", "0px");
      btn.style.setProperty("--by", "0px");
    });
  });

  /* ------------------------------------------------------------------
     Пересчёт после загрузки шрифтов и ресайза
     ------------------------------------------------------------------ */
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { syncKeyframes(); alignCarousel(); updateNav(); onScroll(); }, 150);
  });
  syncKeyframes();
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(syncKeyframes);
})();
