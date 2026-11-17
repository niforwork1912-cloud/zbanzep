(function () {
  "use strict";

  var CFG = window.KOWIN_CONFIG || {};
  var PROMO = CFG.promo || {};
  var CONTACT = CFG.contact || {};
  var CATEGORIES = window.KOWIN_CATEGORIES || [];
  var FAMILIES = window.KOWIN_COLOR_FAMILIES || {};

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     DATA
     ========================================================= */
  var isNum = function (v) { return typeof v === "number" && isFinite(v) && v > 0; };
  var vnd = function (n) { return Math.round(n).toLocaleString("vi-VN") + "₫"; };

  var PRODUCTS = (window.KOWIN_PRODUCTS || []).map(function (p, i) {
    var d = isNum(p.discountPercent) ? p.discountPercent : 0;
    var sale = isNum(p.salePrice) ? p.salePrice : (isNum(p.originalPrice) && d ? Math.round(p.originalPrice * (100 - d) / 100) : (isNum(p.originalPrice) ? p.originalPrice : null));
    var orig = isNum(p.originalPrice) ? p.originalPrice : sale;
    return Object.assign({}, p, {
      _index: i,
      discount: d,
      unitPrice: sale,
      listPrice: orig,
      colors: (p.colors || []).filter(function (c) { return c.available !== false && c.images && c.images.length; }),
      sizes: (p.sizes || []).map(String),
      gallery: p.gallery || [],
      isAvailable: p.available !== false
    });
  }).filter(function (p) { return p.colors.length; });

  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };
  var colorOf = function (p, cid) { return p.colors.filter(function (c) { return c.id === cid; })[0] || p.colors[0]; };
  var catName = function (id) { var c = CATEGORIES.filter(function (x) { return x.id === id; })[0]; return c ? c.name : ""; };
  var altFor = function (p, c) { return p.name + " — màu " + c.name; };
  var ALL_SIZES = PRODUCTS.reduce(function (a, p) { p.sizes.forEach(function (s) { if (a.indexOf(s) < 0) a.push(s); }); return a; }, []).sort(function (a, b) { return a - b; });
  var anyPriced = PRODUCTS.some(function (p) { return isNum(p.unitPrice); });

  function priceHTML(p, cls) {
    cls = cls || "price";
    if (isNum(p.unitPrice)) {
      var strike = p.listPrice > p.unitPrice ? '<s class="' + cls + '__original">' + vnd(p.listPrice) + "</s>" : "";
      return '<span class="' + cls + '__sale">' + vnd(p.unitPrice) + "</span>" + strike;
    }
    return '<span class="' + cls + '__sale">[Giá khuyến mãi]</span><s class="' + cls + '__original">[Giá gốc]</s>';
  }

  /* =========================================================
     CONFIG (gift, contact, deadline, reviews)
     ========================================================= */
  function applyConfig() {
    if (PROMO.gift) {
      $$("[data-gift]").forEach(function (el) { el.textContent = PROMO.gift; });
      $$("[data-gift-short]").forEach(function (el) { el.textContent = PROMO.gift; });
    }
    if (CONTACT.hotline) {
      var tel = "tel:" + CONTACT.hotline.replace(/[^\d+]/g, "");
      $$("[data-hotline]").forEach(function (el) { el.textContent = CONTACT.hotline; });
      $$("[data-hotline-link]").forEach(function (el) { el.setAttribute("href", tel); });
    }
    if (CONTACT.fanpageName) $$("[data-fanpage]").forEach(function (el) { el.textContent = CONTACT.fanpageName; });
    if (CONTACT.fanpageUrl) {
      $$("[data-fanpage]").forEach(function (el) {
        var a = document.createElement("a");
        a.href = CONTACT.fanpageUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = el.textContent;
        el.replaceWith(a);
      });
      $$("[data-fanpage-link]").forEach(function (el) { el.href = CONTACT.fanpageUrl; el.hidden = false; });
    }
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    setupDeadline();
    renderReviews();
  }

  function setupDeadline() {
    var els = $$("[data-deadline]");
    var end = PROMO.endDate ? new Date(PROMO.endDate) : null;
    if (!end || isNaN(end)) return;
    var dateText = end.toLocaleDateString("vi-VN");
    function tick() {
      var ms = end - Date.now(), txt;
      if (ms <= 0) txt = "Ưu đãi đã kết thúc ngày " + dateText;
      else {
        var d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
        txt = "Kết thúc ngày " + dateText + " — còn " + (d ? d + " ngày " : "") + h + " giờ " + m + " phút";
      }
      els.forEach(function (el) { el.textContent = txt; });
    }
    tick(); setInterval(tick, 30000);
  }

  function renderReviews() {
    var list = CFG.reviews || [], box = $("[data-reviews]");
    if (!box || !list.length) return;
    list.forEach(function (r) {
      var n = Math.max(1, Math.min(5, r.rating || 5));
      var card = document.createElement("figure");
      card.className = "review";
      card.innerHTML = '<p class="stars">' + "★★★★★".slice(0, n) + "</p><blockquote>" + esc(r.text) + "</blockquote><figcaption><strong>" + esc(r.name) + '</strong> <span class="muted">' + esc(r.meta) + "</span></figcaption>";
      box.appendChild(card);
    });
    box.hidden = false;
    box.closest(".reviews__layout").classList.add("has-reviews");
  }

  /* =========================================================
     COLLECTIONS
     ========================================================= */
  function renderCollections() {
    var box = $("[data-collections]");
    var cats = CATEGORIES.filter(function (c) { return PRODUCTS.some(function (p) { return p.category === c.id; }); });
    box.innerHTML = cats.map(function (c) {
      var ps = PRODUCTS.filter(function (p) { return p.category === c.id; });
      var colors = ps.reduce(function (n, p) { return n + p.colors.length; }, 0);
      return '<li><button type="button" class="collection" data-goto-cat="' + esc(c.id) + '">' +
        '<span class="collection__img"><img src="' + esc(c.image) + '" width="800" height="600" alt="' + esc(c.name) + ' KOWIN" loading="lazy"></span>' +
        '<span class="collection__body"><span class="collection__name">' + esc(c.name) + "</span>" +
        '<span class="collection__meta">' + ps.length + " mẫu · " + colors + " màu</span>" +
        '<span class="collection__desc">' + esc(c.description || "") + "</span>" +
        '<span class="collection__cta">Xem bộ sưu tập <span aria-hidden="true">→</span></span></span></button></li>';
    }).join("");
  }

  /* =========================================================
     CATALOG: filters, sort, grid
     ========================================================= */
  var PRICE_BUCKETS = [
    { id: "lt200", name: "Dưới 200.000₫", test: function (v) { return v < 200000; } },
    { id: "200-300", name: "200.000₫ – 300.000₫", test: function (v) { return v >= 200000 && v < 300000; } },
    { id: "300-500", name: "300.000₫ – 500.000₫", test: function (v) { return v >= 300000 && v < 500000; } },
    { id: "gte500", name: "Từ 500.000₫", test: function (v) { return v >= 500000; } }
  ];
  var SORTS = [
    { id: "featured", name: "Sản phẩm nổi bật", ok: function () { return true; }, cmp: function (a, b) { return (a.featured || 999) - (b.featured || 999) || a._index - b._index; } },
    { id: "bestseller", name: "Bán chạy", ok: function () { return PRODUCTS.some(function (p) { return isNum(p.salesRank); }); }, cmp: function (a, b) { return (a.salesRank || 1e9) - (b.salesRank || 1e9); } },
    { id: "newest", name: "Sản phẩm mới", ok: function () { return PRODUCTS.some(function (p) { return p.addedAt; }); }, cmp: function (a, b) { return String(b.addedAt || "").localeCompare(String(a.addedAt || "")); } },
    { id: "price-asc", name: "Giá thấp đến cao", ok: function () { return anyPriced; }, cmp: function (a, b) { return (a.unitPrice || 1e12) - (b.unitPrice || 1e12); } },
    { id: "price-desc", name: "Giá cao đến thấp", ok: function () { return anyPriced; }, cmp: function (a, b) { return (b.unitPrice || -1) - (a.unitPrice || -1); } }
  ];

  var filters = { category: [], color: [], size: [], price: [] };
  var sortId = "featured";
  var cardColor = {};

  function familiesInUse() {
    var used = {};
    PRODUCTS.forEach(function (p) { p.colors.forEach(function (c) { (c.family || []).forEach(function (f) { used[f] = true; }); }); });
    return Object.keys(FAMILIES).filter(function (f) { return used[f]; });
  }

  function chip(group, value, label, swatch) {
    var on = filters[group].indexOf(value) > -1;
    return '<button type="button" class="chip' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" data-chip="' + group + '" data-value="' + esc(value) + '">' +
      (swatch ? '<i style="background:' + swatch + '"></i>' : "") + esc(label) + "</button>";
  }

  function renderFilterUI() {
    var cats = CATEGORIES.filter(function (c) { return PRODUCTS.some(function (p) { return p.category === c.id; }); });
    // toolbar category chips (single-select shortcut)
    var allOn = !filters.category.length;
    $("[data-cat-chips]").innerHTML = '<button type="button" class="chip' + (allOn ? " is-active" : "") + '" aria-pressed="' + allOn + '" data-cat-shortcut="">Tất cả</button>' +
      cats.map(function (c) {
        var on = filters.category.length === 1 && filters.category[0] === c.id;
        return '<button type="button" class="chip' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" data-cat-shortcut="' + esc(c.id) + '">' + esc(c.name) + "</button>";
      }).join("");

    $('[data-f="category"]').innerHTML = cats.map(function (c) { return chip("category", c.id, c.name); }).join("");
    $('[data-f="color"]').innerHTML = familiesInUse().map(function (f) { return chip("color", f, FAMILIES[f].name, FAMILIES[f].swatch); }).join("");
    $('[data-f="size"]').innerHTML = ALL_SIZES.map(function (s) { return chip("size", s, s); }).join("");
    var buckets = PRICE_BUCKETS.filter(function (b) { return PRODUCTS.some(function (p) { return isNum(p.unitPrice) && b.test(p.unitPrice); }); });
    $("[data-price-group]").hidden = !buckets.length;
    $('[data-f="price"]').innerHTML = buckets.map(function (b) { return chip("price", b.id, b.name); }).join("");

    // active filter pills
    var pills = [];
    ["category", "color", "size", "price"].forEach(function (g) {
      filters[g].forEach(function (v) {
        var label = g === "category" ? catName(v) : g === "color" ? (FAMILIES[v] || {}).name : g === "size" ? "Size " + v : (PRICE_BUCKETS.filter(function (b) { return b.id === v; })[0] || {}).name;
        pills.push('<button type="button" class="pill" data-remove-filter="' + g + '" data-value="' + esc(v) + '" aria-label="Bỏ lọc ' + esc(label) + '">' + esc(label) + ' <span aria-hidden="true">×</span></button>');
      });
    });
    var n = pills.length;
    $("[data-active-filters]").innerHTML = n ? pills.join("") + '<button type="button" class="link" data-clear-filters>Xoá tất cả</button>' : "";
    var cnt = $("[data-filter-count]");
    cnt.hidden = !n; cnt.textContent = n;
  }

  function renderSort() {
    var sel = $("[data-sort]");
    sel.innerHTML = SORTS.filter(function (s) { return s.ok(); }).map(function (s) {
      return '<option value="' + s.id + '"' + (s.id === sortId ? " selected" : "") + ">" + s.name + "</option>";
    }).join("");
    sel.addEventListener("change", function () { sortId = sel.value; renderGrid(); });
  }

  function matchingColors(p) {
    if (!filters.color.length) return p.colors;
    return p.colors.filter(function (c) { return (c.family || []).some(function (f) { return filters.color.indexOf(f) > -1; }); });
  }

  function filtered() {
    var list = PRODUCTS.filter(function (p) {
      if (filters.category.length && filters.category.indexOf(p.category) < 0) return false;
      if (filters.color.length && !matchingColors(p).length) return false;
      if (filters.size.length && !p.sizes.some(function (s) { return filters.size.indexOf(s) > -1; })) return false;
      if (filters.price.length) {
        if (!isNum(p.unitPrice)) return false;
        var ok = PRICE_BUCKETS.some(function (b) { return filters.price.indexOf(b.id) > -1 && b.test(p.unitPrice); });
        if (!ok) return false;
      }
      return true;
    });
    var s = SORTS.filter(function (x) { return x.id === sortId; })[0] || SORTS[0];
    return list.slice().sort(function (a, b) { return s.cmp(a, b) || a._index - b._index; });
  }

  function cardHTML(p) {
    var colors = matchingColors(p);
    var cur = colors.filter(function (c) { return c.id === cardColor[p.id]; })[0] || colors[0];
    cardColor[p.id] = cur.id;
    var img = cur.images[0];
    var badge = p.discount ? '<span class="badge badge--blue pcard__badge">-' + p.discount + "%</span>" : "";
    var soldout = p.isAvailable ? "" : '<span class="pcard__soldout">Tạm hết hàng</span>';
    var rating = isNum(p.rating) ? '<p class="pcard__rating"><span class="stars" aria-hidden="true">★</span> ' + p.rating.toFixed(1) + "</p>" : "";
    var sizeText = p.sizes.length ? "Size " + p.sizes[0] + (p.sizes.length > 1 ? "–" + p.sizes[p.sizes.length - 1] : "") : "";
    return '<li class="pcard' + (p.isAvailable ? "" : " is-soldout") + '" data-product="' + esc(p.id) + '">' +
      '<button type="button" class="pcard__media" data-open-product aria-label="Xem chi tiết ' + esc(p.name) + '">' +
      '<img src="' + esc(img.src) + '" width="800" height="600" alt="' + esc(img.alt || altFor(p, cur)) + '" loading="lazy" data-card-img>' + badge + soldout + "</button>" +
      '<div class="pcard__body">' +
      '<div class="pcard__swatches" role="group" aria-label="Màu của ' + esc(p.name) + '">' +
      p.colors.map(function (c) {
        var on = c.id === cur.id;
        return '<button type="button" class="swatch swatch--sm' + (on ? " is-active" : "") + '" aria-pressed="' + on + '" data-card-color="' + esc(c.id) + '" aria-label="' + esc(c.name) + '" title="' + esc(c.name) + '"><span style="background:' + c.swatch + '"></span></button>';
      }).join("") + "</div>" +
      '<p class="pcard__color"><span data-card-colorname>' + esc(cur.name) + "</span> · " + p.colors.length + " màu</p>" +
      '<h3 class="pcard__name"><button type="button" data-open-product>' + esc(p.name) + "</button></h3>" +
      rating +
      '<p class="pcard__price">' + priceHTML(p, "pcard__price") + "</p>" +
      '<p class="pcard__sizes">' + sizeText + "</p>" +
      '<button type="button" class="btn btn--primary btn--sm btn--block pcard__cta" data-open-product data-quick' + (p.isAvailable ? "" : " disabled") + ">" + (p.isAvailable ? "ĐẶT NHANH" : "TẠM HẾT HÀNG") + "</button>" +
      "</div></li>";
  }

  function renderGrid() {
    var list = filtered();
    $("[data-grid]").innerHTML = list.map(cardHTML).join("");
    $("[data-empty]").hidden = list.length > 0;
    $("[data-result-count]").textContent = list.length + " sản phẩm";
    var apply = $("[data-apply-label]");
    if (apply) apply.textContent = "Xem " + list.length + " sản phẩm";
    renderFilterUI();
  }

  function toggleFilter(group, value) {
    var arr = filters[group], i = arr.indexOf(value);
    if (i > -1) arr.splice(i, 1); else arr.push(value);
    renderGrid();
  }
  function clearFilters() { filters = { category: [], color: [], size: [], price: [] }; renderGrid(); }
  function gotoCategory(id) {
    filters.category = id ? [id] : [];
    renderGrid();
    scrollToEl($("#san-pham"));
  }

  function setupCatalog() {
    renderCollections();
    renderSort();
    renderGrid();

    document.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-goto-cat]"))) { e.preventDefault(); gotoCategory(t.dataset.gotoCat); return; }
      if ((t = e.target.closest("[data-cat-shortcut]"))) { filters.category = t.dataset.catShortcut ? [t.dataset.catShortcut] : []; renderGrid(); return; }
      if ((t = e.target.closest("[data-chip]"))) { toggleFilter(t.dataset.chip, t.dataset.value); return; }
      if ((t = e.target.closest("[data-remove-filter]"))) { toggleFilter(t.dataset.removeFilter, t.dataset.value); return; }
      if ((t = e.target.closest("[data-clear-filters]"))) { clearFilters(); return; }
      if ((t = e.target.closest("[data-open-filters]"))) { openDialog($("[data-filters]")); return; }
      if ((t = e.target.closest("[data-card-color]"))) {
        var card = t.closest("[data-product]"), p = byId(card.dataset.product), c = colorOf(p, t.dataset.cardColor);
        cardColor[p.id] = c.id;
        var img = card.querySelector("[data-card-img]");
        img.src = c.images[0].src; img.alt = c.images[0].alt || altFor(p, c);
        card.querySelector("[data-card-colorname]").textContent = c.name;
        $$("[data-card-color]", card).forEach(function (b) { var on = b === t; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
        return;
      }
      if ((t = e.target.closest("[data-open-product]"))) {
        var pc = t.closest("[data-product]");
        openProduct(pc.dataset.product, cardColor[pc.dataset.product], t.hasAttribute("data-quick"));
      }
    });
  }

  /* =========================================================
     DIALOGS
     ========================================================= */
  var lastFocus = null;
  function openDialog(d) {
    lastFocus = document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.documentElement.classList.add("dialog-open");
  }
  function closeDialog(d) {
    if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
  }
  function setupDialogs() {
    $$("dialog").forEach(function (d) {
      d.addEventListener("click", function (e) {
        if (e.target === d || e.target.closest("[data-close]")) closeDialog(d);
      });
      d.addEventListener("close", function () {
        if (!$$("dialog").some(function (x) { return x.open; })) document.documentElement.classList.remove("dialog-open");
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      });
    });
  }

  /* =========================================================
     PRODUCT DETAIL
     ========================================================= */
  var pdp = { product: null, color: null, size: null, qty: 1, img: 0 };

  function openProduct(pid, cid, quick) {
    var p = byId(pid); if (!p) return;
    pdp.product = p; pdp.size = null; pdp.qty = 1;
    var d = $("[data-pdp]");
    $("[data-pdp-cat]", d).textContent = catName(p.category);
    $("[data-pdp-name]", d).textContent = p.name;
    $("[data-pdp-desc]", d).textContent = p.description || "";
    $("[data-pdp-price]", d).innerHTML = priceHTML(p) + (p.discount ? '<span class="badge badge--soft">-' + p.discount + "%</span>" : "");
    $("[data-pdp-discount]", d).textContent = p.discount;
    $("[data-pdp-badge]", d).hidden = !p.discount;
    $("[data-pdp-badge]", d).textContent = "-" + p.discount + "%";
    var r = $("[data-pdp-rating]", d);
    r.hidden = !isNum(p.rating);
    if (isNum(p.rating)) r.innerHTML = '<span class="stars" aria-hidden="true">★★★★★</span> <strong>' + p.rating.toFixed(1) + "/5</strong>";
    $("[data-pdp-swatches]", d).innerHTML = p.colors.map(function (c) {
      return '<button type="button" class="swatch" data-pdp-colorbtn="' + esc(c.id) + '" aria-label="' + esc(c.name) + '" title="' + esc(c.name) + '"><span style="background:' + c.swatch + '"></span></button>';
    }).join("");
    $("[data-pdp-sizes]", d).innerHTML = p.sizes.map(function (s) {
      return '<button type="button" class="size" data-pdp-sizebtn="' + s + '" aria-pressed="false">' + s + "</button>";
    }).join("");
    $("[data-pdp-error]", d).textContent = "";
    $("[data-pdp-size]", d).textContent = "Chưa chọn";
    $("[data-pdp-qtyinput]", d).value = 1;
    var add = $("[data-pdp-add]", d), buy = $("[data-pdp-buy]", d);
    add.disabled = buy.disabled = !p.isAvailable;
    add.textContent = p.isAvailable ? "THÊM VÀO ĐƠN HÀNG" : "TẠM HẾT HÀNG";
    setPdpColor(cid || p.colors[0].id);
    openDialog(d);
    d.scrollTop = 0; $(".pdp__inner", d).scrollTop = 0;
    if (quick && p.isAvailable) {
      var first = $("[data-pdp-sizebtn]", d);
      if (first) first.focus({ preventScroll: true });
    }
  }

  function pdpImages() {
    var c = pdp.color, p = pdp.product;
    return c.images.map(function (im) { return { src: im.src, alt: im.alt || altFor(p, c) }; }).concat(p.gallery);
  }
  function setPdpImage(i) {
    var imgs = pdpImages(); pdp.img = i;
    var el = $("[data-pdp-image]");
    el.src = imgs[i].src; el.alt = imgs[i].alt || pdp.product.name;
    $$("[data-pdp-thumb]").forEach(function (b, j) { b.classList.toggle("is-active", j === i); b.setAttribute("aria-pressed", j === i); });
  }
  function setPdpColor(cid) {
    var p = pdp.product, c = colorOf(p, cid);
    pdp.color = c;
    $("[data-pdp-color]").textContent = c.name;
    $$("[data-pdp-colorbtn]").forEach(function (b) { var on = b.dataset.pdpColorbtn === c.id; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
    var imgs = pdpImages();
    $("[data-pdp-thumbs]").innerHTML = imgs.length > 1 ? imgs.map(function (im, i) {
      return '<button type="button" class="thumb" data-pdp-thumb="' + i + '" aria-label="Ảnh ' + (i + 1) + '"><img src="' + esc(im.src) + '" alt="" width="160" height="120" loading="lazy"></button>';
    }).join("") : "";
    setPdpImage(0);
  }
  function setPdpSize(s) {
    pdp.size = s;
    $$("[data-pdp-sizebtn]").forEach(function (b) { var on = b.dataset.pdpSizebtn === s; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); });
    $("[data-pdp-size]").textContent = s;
    $("[data-pdp-error]").textContent = "";
  }
  function setPdpQty(v) {
    pdp.qty = Math.max(1, Math.min(20, parseInt(v, 10) || 1));
    $("[data-pdp-qtyinput]").value = pdp.qty;
  }
  function pdpAdd(goToForm) {
    if (!pdp.size) {
      $("[data-pdp-error]").textContent = "Vui lòng chọn size trước khi thêm vào đơn hàng.";
      var b = $("[data-pdp-sizebtn]"); if (b) b.focus();
      return;
    }
    addToCart(pdp.product.id, pdp.color.id, pdp.size, pdp.qty);
    closeDialog($("[data-pdp]"));
    if (goToForm) scrollToEl($("#dat-hang"));
    else showToast("Đã thêm " + pdp.product.name + " (" + pdp.color.name + ", size " + pdp.size + ") vào đơn hàng.");
  }
  function setupPdp() {
    var d = $("[data-pdp]");
    d.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-pdp-colorbtn]"))) setPdpColor(t.dataset.pdpColorbtn);
      else if ((t = e.target.closest("[data-pdp-thumb]"))) setPdpImage(parseInt(t.dataset.pdpThumb, 10));
      else if ((t = e.target.closest("[data-pdp-sizebtn]"))) setPdpSize(t.dataset.pdpSizebtn);
      else if ((t = e.target.closest("[data-pdp-qty]"))) setPdpQty(pdp.qty + parseInt(t.dataset.pdpQty, 10));
      else if (e.target.closest("[data-pdp-add]")) pdpAdd(false);
      else if (e.target.closest("[data-pdp-buy]")) pdpAdd(true);
    });
    $("[data-pdp-qtyinput]").addEventListener("change", function (e) { setPdpQty(e.target.value); });
  }

  /* =========================================================
     CART / ORDER LINES
     ========================================================= */
  var STORE_KEY = "kowin_order_v1";
  var lines = [];
  var uidSeq = 0;
  var newUid = function () { uidSeq += 1; return "l" + Date.now().toString(36) + uidSeq; };

  function loadCart() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      lines = saved.filter(function (l) {
        var p = byId(l.productId);
        return p && p.colors.some(function (c) { return c.id === l.colorId; });
      }).map(function (l) {
        var p = byId(l.productId);
        return { uid: newUid(), productId: l.productId, colorId: l.colorId, size: p.sizes.indexOf(String(l.size)) > -1 ? String(l.size) : "", qty: Math.max(1, Math.min(20, l.qty | 0 || 1)) };
      });
    } catch (e) { lines = []; }
  }
  function saveCart() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(lines.map(function (l) { return { productId: l.productId, colorId: l.colorId, size: l.size, qty: l.qty }; }))); } catch (e) { /* storage unavailable */ }
  }

  function addToCart(pid, cid, size, qty) {
    var same = lines.filter(function (l) { return l.productId === pid && l.colorId === cid && l.size === size; })[0];
    if (same) same.qty = Math.min(20, same.qty + qty);
    else lines.push({ uid: newUid(), productId: pid, colorId: cid, size: size || "", qty: qty || 1 });
    renderLines();
  }
  function addBlankLine() {
    var p = PRODUCTS.filter(function (x) { return x.isAvailable; })[0] || PRODUCTS[0];
    lines.push({ uid: newUid(), productId: p.id, colorId: p.colors[0].id, size: "", qty: 1 });
    renderLines();
  }

  function totals() {
    var qty = 0, sub = 0, disc = 0, total = 0, priced = true;
    lines.forEach(function (l) {
      var p = byId(l.productId);
      qty += l.qty;
      if (!isNum(p.unitPrice)) { priced = false; return; }
      sub += p.listPrice * l.qty;
      total += p.unitPrice * l.qty;
      disc += (p.listPrice - p.unitPrice) * l.qty;
    });
    return { qty: qty, sub: sub, disc: disc, total: total, priced: priced && lines.length > 0 };
  }

  function lineHTML(l, i) {
    var p = byId(l.productId), c = colorOf(p, l.colorId);
    var unit = isNum(p.unitPrice)
      ? '<span>' + vnd(p.unitPrice) + (p.listPrice > p.unitPrice ? ' <s>' + vnd(p.listPrice) + "</s>" : "") + " × " + l.qty + '</span><strong>' + vnd(p.unitPrice * l.qty) + "</strong>"
      : "<span>[Giá khuyến mãi] × " + l.qty + "</span><strong>[Thành tiền]</strong>";
    var label = "sản phẩm " + (i + 1);
    return '<li class="line" data-uid="' + l.uid + '">' +
      '<img class="line__img" src="' + esc(c.images[0].src) + '" width="160" height="120" alt="' + esc(altFor(p, c)) + '">' +
      '<div class="line__body">' +
      '<div class="line__top">' +
      '<select data-l="product" aria-label="Mẫu ' + label + '">' + PRODUCTS.map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (x.id === p.id ? " selected" : "") + (x.isAvailable ? "" : " disabled") + ">" + esc(x.name) + (x.isAvailable ? "" : " (tạm hết)") + "</option>";
      }).join("") + "</select>" +
      '<button type="button" class="line__remove" data-l="remove" aria-label="Xoá ' + label + '"><svg class="ico"><use href="#i-trash"/></svg></button></div>' +
      '<div class="line__opts">' +
      '<select data-l="color" aria-label="Màu ' + label + '">' + p.colors.map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (x.id === c.id ? " selected" : "") + ">" + esc(x.name) + "</option>";
      }).join("") + "</select>" +
      '<select data-l="size" aria-label="Size ' + label + '" class="' + (l.size ? "" : "is-empty") + (l._err ? " has-error" : "") + '"><option value="">Chọn size</option>' + p.sizes.map(function (s) {
        return '<option value="' + s + '"' + (s === l.size ? " selected" : "") + ">Size " + s + "</option>";
      }).join("") + "</select>" +
      '<div class="qty qty--sm"><button type="button" class="qty__btn" data-l="dec" aria-label="Giảm số lượng ' + label + '">−</button>' +
      '<input type="number" inputmode="numeric" min="1" max="20" value="' + l.qty + '" data-l="qty" aria-label="Số lượng ' + label + '">' +
      '<button type="button" class="qty__btn" data-l="inc" aria-label="Tăng số lượng ' + label + '">+</button></div>' +
      "</div>" +
      '<p class="line__price">' + unit + "</p>" +
      (l._err ? '<p class="field__error">Vui lòng chọn size cho sản phẩm này.</p>' : "") +
      "</div></li>";
  }

  function renderLines(focus) {
    var box = $("[data-lines]");
    box.innerHTML = lines.map(lineHTML).join("");
    $("[data-lines-empty]").hidden = lines.length > 0;
    var t = totals();
    $("[data-sum-qty]").textContent = t.qty;
    if (t.priced) {
      $("[data-sum-subtotal]").textContent = vnd(t.sub);
      $("[data-sum-discount]").textContent = t.disc ? "−" + vnd(t.disc) : "0₫";
      $("[data-sum-total]").textContent = vnd(t.total);
    } else {
      var ph = lines.length ? "[Chưa có giá]" : "—";
      $("[data-sum-subtotal]").textContent = ph;
      $("[data-sum-discount]").textContent = lines.length ? "−10% trên giá gốc" : "—";
      $("[data-sum-total]").textContent = lines.length ? "Xác nhận qua điện thoại" : "—";
    }
    $("[data-price-note]").hidden = t.priced || !lines.length;
    // header + sticky
    var cc = $("[data-cart-count]");
    cc.hidden = !t.qty; cc.textContent = t.qty;
    $("[data-sticky-cart]").textContent = t.qty ? "Đơn hàng: " + t.qty + " sản phẩm" : "Giao hàng toàn quốc";
    saveCart();
    if (focus) {
      var el = $('[data-uid="' + focus.uid + '"] [data-l="' + focus.l + '"]');
      if (el) el.focus();
    }
  }

  function setupLines() {
    var box = $("[data-lines]");
    box.addEventListener("change", function (e) {
      var row = e.target.closest("[data-uid]"); if (!row) return;
      var l = lines.filter(function (x) { return x.uid === row.dataset.uid; })[0]; if (!l) return;
      var k = e.target.dataset.l;
      if (k === "product") {
        var p = byId(e.target.value);
        l.productId = p.id; l.colorId = p.colors[0].id;
        if (p.sizes.indexOf(l.size) < 0) l.size = "";
      } else if (k === "color") l.colorId = e.target.value;
      else if (k === "size") { l.size = e.target.value; if (l.size) l._err = false; }
      else if (k === "qty") l.qty = Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1));
      renderLines({ uid: l.uid, l: k });
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-l]"); if (!b) return;
      var row = b.closest("[data-uid]");
      var idx = lines.map(function (x) { return x.uid; }).indexOf(row.dataset.uid);
      var l = lines[idx]; if (!l) return;
      var k = b.dataset.l;
      if (k === "remove") {
        lines.splice(idx, 1);
        renderLines();
        var next = $$("[data-l='remove']")[Math.min(idx, lines.length - 1)] || $("[data-add-line]");
        next.focus();
        return;
      }
      l.qty = Math.max(1, Math.min(20, l.qty + (k === "inc" ? 1 : -1)));
      renderLines({ uid: l.uid, l: k });
    });
    $("[data-add-line]").addEventListener("click", function () {
      addBlankLine();
      clearError("e-lines");
      var last = $$("[data-lines] [data-l='product']").pop(); if (last) last.focus();
    });
    renderLines();
  }

  /* =========================================================
     TOAST
     ========================================================= */
  var toastTimer;
  function showToast(msg) {
    var t = $("[data-toast]");
    $("[data-toast-text]", t).textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add("is-visible"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-visible"); setTimeout(function () { t.hidden = true; }, 300); }, 4000);
  }

  /* =========================================================
     NAVIGATION, HEADER, STICKY, REVEAL
     ========================================================= */
  function scrollToEl(el) {
    if (!el) return;
    var offset = ($(".header").offsetHeight || 0) + 8;
    var y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
  }
  function setupAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.hasAttribute("data-goto-cat")) return;
      var id = a.getAttribute("href");
      var target = id === "#top" || id === "#" ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      var tt = $("[data-toast]"); if (a.closest("[data-toast]")) { tt.classList.remove("is-visible"); tt.hidden = true; }
      if ($("[data-collections]") && id === "#dat-hang" && !lines.length) addBlankLine();
      if (target === document.body) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      else scrollToEl(target);
    });
  }

  var burger, nav;
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Mở menu");
    document.body.classList.remove("menu-open");
  }
  function setupHeader() {
    burger = $(".burger"); nav = $("#nav");
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
      document.body.classList.toggle("menu-open", open);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    var header = $(".header");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.pageYOffset > 10); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  function setupAnnounce() {
    var items = $$(".announce__list li");
    if (reduceMotion || items.length < 2) return;
    var i = 0;
    setInterval(function () {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
    }, 4000);
  }

  function setupSticky() {
    var bar = $("[data-sticky]");
    if (!("IntersectionObserver" in window)) return;
    var heroVisible = true, formVisible = false, footerVisible = false;
    function render() {
      var show = !heroVisible && !formVisible && !footerVisible;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      bar.querySelector("a").tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; render(); }).observe($(".hero"));
    new IntersectionObserver(function (en) { formVisible = en[0].isIntersecting; render(); }, { rootMargin: "0px 0px 120px 0px" }).observe($("#dat-hang"));
    new IntersectionObserver(function (en) { footerVisible = en[0].isIntersecting; render(); }).observe($(".footer"));
  }

  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var els = $$(".section__head, .collections__grid li, .benefits__grid li, .editorial__item, .policy__grid li, .promo__inner");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  /* =========================================================
     ORDER FORM — validation + REAL submission to Netlify Forms
     ========================================================= */
  function setError(id, msg) {
    var el = document.getElementById(id); if (!el) return;
    el.textContent = msg;
    var field = el.closest(".field");
    if (field) field.classList.toggle("has-error", !!msg);
  }
  function clearError(id) { setError(id, ""); }
  function normPhone(v) { return v.replace(/[\s.\-()]/g, "").replace(/^\+?84/, "0"); }

  function validate(form) {
    var firstBad = null;
    function bad(id, msg, el) { setError(id, msg); if (!firstBad) firstBad = el; }

    if (!lines.length) bad("e-lines", "Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.", $("[data-add-line]"));
    else {
      var missing = lines.filter(function (l) { return !l.size; });
      lines.forEach(function (l) { l._err = !l.size; });
      renderLines();
      if (missing.length) bad("e-lines", "Vui lòng chọn size cho tất cả sản phẩm trong đơn.", $('[data-uid="' + missing[0].uid + '"] [data-l="size"]'));
      else clearError("e-lines");
    }
    var name = form.ho_ten.value.trim(), phone = normPhone(form.so_dien_thoai.value), addr = form.dia_chi.value.trim();
    if (name.length < 2) bad("e-name", "Vui lòng nhập họ và tên.", form.ho_ten); else clearError("e-name");
    if (!phone) bad("e-phone", "Vui lòng nhập số điện thoại.", form.so_dien_thoai);
    else if (!/^0[35789]\d{8}$/.test(phone)) bad("e-phone", "Số điện thoại chưa hợp lệ. Vui lòng nhập số di động 10 chữ số (ví dụ 0912 345 678).", form.so_dien_thoai);
    else clearError("e-phone");
    if (addr.length < 10) bad("e-address", "Vui lòng nhập địa chỉ nhận hàng đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành).", form.dia_chi); else clearError("e-address");

    if (firstBad) { firstBad.focus({ preventScroll: true }); scrollToEl(firstBad.closest(".line, .field") || firstBad); }
    return !firstBad;
  }

  function orderText() {
    return lines.map(function (l, i) {
      var p = byId(l.productId), c = colorOf(p, l.colorId);
      var price = isNum(p.unitPrice)
        ? " | Đơn giá: " + vnd(p.unitPrice) + (p.listPrice > p.unitPrice ? " (giá gốc " + vnd(p.listPrice) + ", giảm " + p.discount + "%)" : "") + " | Thành tiền: " + vnd(p.unitPrice * l.qty)
        : " | Đơn giá: chưa cấu hình (giảm " + p.discount + "%)";
      return (i + 1) + ". " + p.name + " | Màu: " + c.name + " | Size: " + l.size + " | SL: " + l.qty + price;
    }).join("\n");
  }

  function setupForm() {
    var form = $("#order-form");
    var status = $("[data-form-status]");
    var btn = form.querySelector(".form__submit");
    var success = $("[data-form-success]");

    ["ho_ten", "so_dien_thoai", "dia_chi"].forEach(function (n) {
      form[n].addEventListener("input", function () {
        var f = form[n].closest(".field");
        if (f.classList.contains("has-error")) setError(f.querySelector(".field__error").id, "");
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.hidden = true;
      if (!validate(form)) return;

      var t = totals();
      form.so_dien_thoai.value = normPhone(form.so_dien_thoai.value);
      form.chi_tiet_don_hang.value = orderText();
      form.tong_so_luong.value = t.qty;
      form.tam_tinh.value = t.priced ? vnd(t.sub) : "Chưa cấu hình giá";
      form.giam_gia.value = t.priced ? vnd(t.disc) : "10% trên giá gốc";
      form.tong_cong.value = t.priced ? vnd(t.total) : "Xác nhận qua điện thoại";

      var fd = new FormData(form);
      var body = new URLSearchParams();
      ["form-name", "subject", "bot-field", "ho_ten", "so_dien_thoai", "dia_chi", "chi_tiet_don_hang", "tong_so_luong", "tam_tinh", "giam_gia", "tong_cong"].forEach(function (k) {
        body.append(k, fd.get(k) || "");
      });
      btn.disabled = true;
      btn.textContent = "ĐANG GỬI ĐƠN…";

      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showSuccess(form, success, t);
        })
        .catch(function () {
          // Never pretend the order went through.
          status.hidden = false;
          var tel = (CONTACT.hotline || "").replace(/[^\d+]/g, "");
          status.innerHTML = 'Chưa gửi được đơn hàng do lỗi kết nối. Vui lòng thử lại hoặc gọi hotline <a href="tel:' + tel + '">' + esc(CONTACT.hotline || "") + "</a> để đặt hàng.";
        })
        .finally(function () { btn.disabled = false; btn.textContent = "ĐẶT HÀNG COD NGAY"; });
    });
  }

  var landingProduct = PRODUCTS[0] || null;
  var landingColor = landingProduct ? landingProduct.colors[0] : null;

  function landingQuantity() {
    var input = $('#order-form [name="so_luong"]');
    var value = parseInt(input && input.value, 10);
    return Math.max(1, Math.min(20, isFinite(value) ? value : 1));
  }

  function updateLandingPrices() {
    if (!landingProduct) return;
    $$("[data-price='sale']").forEach(function (el) {
      el.textContent = isNum(landingProduct.unitPrice) ? vnd(landingProduct.unitPrice) : "Liên hệ";
    });
    $$("[data-price='original']").forEach(function (el) {
      var show = isNum(landingProduct.listPrice) && landingProduct.listPrice > landingProduct.unitPrice;
      el.textContent = show ? vnd(landingProduct.listPrice) : "";
      el.hidden = !show;
    });
    $$(".product__discount, .price .badge--soft").forEach(function (el) {
      el.textContent = "-" + landingProduct.discount + "%";
      el.hidden = !landingProduct.discount;
    });
  }

  function updateLandingSummary() {
    if (!landingProduct || !landingColor) return;
    var selectedSize = $('#order-form [name="size"]:checked');
    var qty = landingQuantity();
    var img = landingColor.images[0];
    var productImage = $("#product-image");
    var orderImage = $("[data-order-image]");
    if (productImage) {
      productImage.src = img.src;
      productImage.alt = img.alt || altFor(landingProduct, landingColor);
    }
    if (orderImage) {
      orderImage.src = img.src;
      orderImage.alt = img.alt || altFor(landingProduct, landingColor);
    }
    $$("[data-color-label]").forEach(function (el) { el.textContent = landingColor.name; });
    $$("[data-size-label]").forEach(function (el) { el.textContent = selectedSize ? selectedSize.value : "chưa chọn"; });
    var total = isNum(landingProduct.unitPrice) ? landingProduct.unitPrice * qty : null;
    var totalEl = $("[data-total]");
    if (totalEl) totalEl.textContent = total ? vnd(total) : "Xác nhận qua điện thoại";
  }

  function selectLandingColor(id) {
    if (!landingProduct) return;
    landingColor = colorOf(landingProduct, id);
    $$("[data-landing-color]").forEach(function (button) {
      var selected = button.dataset.landingColor === landingColor.id;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    var colorSelect = $('#order-form [name="mau_sac"]');
    if (colorSelect) colorSelect.value = landingColor.name;
    clearError("e-color");
    updateLandingSummary();
  }

  function setupLandingProduct() {
    if (!landingProduct || !landingProduct.colors.length) return;
    $$("[data-product-name]").forEach(function (el) { el.textContent = landingProduct.name; });
    var colors = landingProduct.colors;
    var colorSelect = $('#order-form [name="mau_sac"]');
    if (colorSelect) {
      colorSelect.innerHTML = colors.map(function (c) {
        return '<option value="' + esc(c.name) + '">' + esc(c.name) + "</option>";
      }).join("");
    }
    var swatches = $('[data-swatches="product"]');
    swatches.innerHTML = colors.map(function (c) {
      return '<button type="button" class="swatch" data-landing-color="' + esc(c.id) + '" aria-label="' + esc(c.name) + '" aria-pressed="false" title="' + esc(c.name) + '"><span style="background:' + c.swatch + '"></span></button>';
    }).join("");
    var thumbs = $(".product__thumbs");
    thumbs.innerHTML = colors.map(function (c) {
      var img = c.images[0];
      return '<button type="button" class="thumb" data-landing-color="' + esc(c.id) + '" aria-label="Xem màu ' + esc(c.name) + '" aria-pressed="false"><img src="' + esc(img.src) + '" alt="" width="160" height="120" loading="lazy"></button>';
    }).join("");
    var cards = $("[data-color-cards]");
    cards.innerHTML = colors.map(function (c) {
      var img = c.images[0];
      return '<li><button type="button" class="color-card" data-landing-color="' + esc(c.id) + '" aria-pressed="false">' +
        '<img src="' + esc(img.src) + '" alt="' + esc(img.alt || altFor(landingProduct, c)) + '" width="800" height="600" loading="lazy">' +
        '<span class="color-card__name">' + esc(c.name) + '</span><span class="color-card__action">Xem màu này</span></button></li>';
    }).join("");
    var sizes = $('[data-sizes="product"]');
    sizes.innerHTML = landingProduct.sizes.map(function (size) {
      return '<button type="button" class="size" data-landing-size="' + esc(size) + '" aria-pressed="false">' + esc(size) + "</button>";
    }).join("");
    document.addEventListener("click", function (e) {
      var color = e.target.closest("[data-landing-color]");
      if (color) { selectLandingColor(color.dataset.landingColor); return; }
      var size = e.target.closest("[data-landing-size]");
      if (size) {
        var radio = $('#order-form [name="size"][value="' + size.dataset.landingSize + '"]');
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event("change", { bubbles: true })); }
      }
    });
    updateLandingPrices();
    selectLandingColor(landingColor.id);
  }

  function setupLandingForm() {
    var form = $("#order-form");
    if (!form) return;
    var status = $("[data-form-status]");
    var success = $("[data-form-success]");
    var submit = form.querySelector(".form__submit");
    var value = function (name) { return form.elements.namedItem(name); };
    var requiredFields = [
      { name: "ho_ten", id: "e-name", valid: function (v) { return v.trim().length >= 2; }, message: "Vui lòng nhập họ và tên." },
      { name: "so_dien_thoai", id: "e-phone", valid: function (v) { return /^0[35789]\d{8}$/.test(normPhone(v)); }, message: "Số điện thoại chưa hợp lệ. Vui lòng nhập số di động 10 chữ số." },
      { name: "dia_chi", id: "e-address", valid: function (v) { return v.trim().length >= 10; }, message: "Vui lòng nhập địa chỉ nhận hàng đầy đủ." }
    ];
    function refreshTotal() {
      var qty = landingQuantity();
      value("so_luong").value = qty;
      clearError("e-qty");
      var total = landingProduct && isNum(landingProduct.unitPrice) ? landingProduct.unitPrice * qty : null;
      var totalEl = $("[data-total]");
      if (totalEl) totalEl.textContent = total ? vnd(total) : "Xác nhận qua điện thoại";
      updateLandingSummary();
    }
    requiredFields.forEach(function (field) {
      value(field.name).addEventListener("input", function () {
        var error = document.getElementById(field.id);
        if (error && error.textContent) clearError(field.id);
      });
    });
    value("mau_sac").addEventListener("change", function () {
      var color = landingProduct.colors.filter(function (c) { return c.name === value("mau_sac").value; })[0];
      if (color) selectLandingColor(color.id);
      clearError("e-color");
    });
    form.addEventListener("change", function (e) {
      if (e.target.name === "size") clearError("e-size");
      if (e.target.name === "size" || e.target.name === "so_luong") refreshTotal();
    });
    form.addEventListener("click", function (e) {
      var button = e.target.closest("[data-qty]");
      if (!button) return;
      e.preventDefault();
      value("so_luong").value = Math.max(1, Math.min(20, landingQuantity() + Number(button.dataset.qty)));
      refreshTotal();
    });
    value("so_luong").addEventListener("input", refreshTotal);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.hidden = true;
      var firstBad = null;
      requiredFields.forEach(function (field) {
        var input = value(field.name);
        if (!field.valid(input.value)) {
          setError(field.id, field.message);
          if (!firstBad) firstBad = input;
        } else clearError(field.id);
      });
      if (!landingProduct || !landingColor || !value("mau_sac").value) {
        setError("e-color", "Vui lòng chọn màu sắc sản phẩm.");
        if (!firstBad) firstBad = value("mau_sac");
      } else clearError("e-color");
      var size = form.querySelector('[name="size"]:checked');
      if (!size) {
        setError("e-size", "Vui lòng chọn size dép.");
        if (!firstBad) firstBad = form.querySelector('[name="size"]');
      } else clearError("e-size");
      var qty = parseInt(value("so_luong").value, 10);
      if (!isFinite(qty) || qty < 1 || qty > 20) {
        setError("e-qty", "Số lượng phải từ 1 đến 20.");
        if (!firstBad) firstBad = value("so_luong");
      } else clearError("e-qty");
      if (firstBad) {
        firstBad.focus({ preventScroll: true });
        scrollToEl(firstBad.closest(".field") || firstBad);
        return;
      }

      qty = landingQuantity();
      var priced = isNum(landingProduct.unitPrice);
      var subtotal = priced ? landingProduct.listPrice * qty : null;
      var discount = priced ? (landingProduct.listPrice - landingProduct.unitPrice) * qty : null;
      var total = priced ? landingProduct.unitPrice * qty : null;
      value("so_dien_thoai").value = normPhone(value("so_dien_thoai").value);
      value("chi_tiet_don_hang").value = landingProduct.name + " | Màu: " + landingColor.name +
        " | Size: " + size.value + " | SL: " + qty + " | Đơn giá: " + (priced ? vnd(landingProduct.unitPrice) : "chưa cấu hình");
      value("tong_so_luong").value = qty;
      value("gia_tam_tinh").value = priced ? vnd(total) : "Chưa cấu hình giá";
      value("tam_tinh").value = priced ? vnd(subtotal) : "Chưa cấu hình giá";
      value("giam_gia").value = priced ? vnd(discount) : "10% trên giá gốc";
      value("tong_cong").value = priced ? vnd(total) : "Xác nhận qua điện thoại";

      var body = new URLSearchParams();
      new FormData(form).forEach(function (fieldValue, key) { body.append(key, fieldValue); });
      submit.disabled = true;
      submit.textContent = "ĐANG GỬI ĐƠN…";
      fetch("/api/send-order", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (response) {
          return response.text().then(function (responseBody) {
            var data = null;
            try {
              data = responseBody ? JSON.parse(responseBody) : null;
            } catch (_) {}
            if (!response.ok) {
              var fallback = response.status === 404
                ? "Không tìm thấy API gửi đơn. Hãy kiểm tra cấu hình hosting hoặc thử lại sau."
                : "Máy chủ gửi đơn phản hồi lỗi (HTTP " + response.status + ").";
              throw new Error(data && data.message || fallback);
            }
            if (!data || typeof data.message !== "string") {
              throw new Error("Máy chủ gửi đơn không trả về phản hồi hợp lệ. Vui lòng thử lại sau.");
            }
          });
        })
        .then(function () {
          var summary = $("[data-success-summary]", success);
          summary.innerHTML = '<dl><dt>Sản phẩm</dt><dd>' + esc(landingProduct.name) + " · " + esc(landingColor.name) +
            " · Size " + esc(size.value) + " · SL " + qty + "</dd><dt>Người nhận</dt><dd>" + esc(value("ho_ten").value.trim()) +
            "</dd><dt>Số điện thoại</dt><dd>" + esc(value("so_dien_thoai").value) + "</dd><dt>Địa chỉ</dt><dd>" +
            esc(value("dia_chi").value.trim()) + "</dd><dt>Tổng cộng</dt><dd>" + (priced ? vnd(total) : "KOWIN sẽ xác nhận qua điện thoại") + "</dd></dl>";
          form.hidden = true;
          success.hidden = false;
          scrollToEl(success);
          success.focus({ preventScroll: true });
        }).catch(function (error) {
          status.hidden = false;
          var tel = (CONTACT.hotline || "").replace(/[^\d+]/g, "");
          var message = error && error.message && error.message !== "Failed to fetch"
            ? error.message
            : "Chưa kết nối được máy chủ gửi đơn.";
          status.innerHTML = esc(message) + ' Vui lòng thử lại hoặc gọi hotline <a href="tel:' +
            tel + '">' + esc(CONTACT.hotline || "") + "</a> để đặt hàng.";
        })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = "ĐẶT HÀNG COD NGAY";
        });
    });
    refreshTotal();
  }

  function showSuccess(form, success, t) {
    var items = lines.map(function (l) {
      var p = byId(l.productId), c = colorOf(p, l.colorId);
      return "<li><strong>" + esc(p.name) + "</strong><span>" + esc(c.name) + " · Size " + esc(l.size) + " · SL " + l.qty + "</span>" +
        (isNum(p.unitPrice) ? "<b>" + vnd(p.unitPrice * l.qty) + "</b>" : "") + "</li>";
    }).join("");
    success.querySelector("[data-success-summary]").innerHTML =
      '<ul class="success-items">' + items + "</ul>" +
      '<dl><dt>Người nhận</dt><dd>' + esc(form.ho_ten.value.trim()) + "</dd>" +
      "<dt>Số điện thoại</dt><dd>" + esc(form.so_dien_thoai.value) + "</dd>" +
      "<dt>Địa chỉ</dt><dd>" + esc(form.dia_chi.value.trim()) + "</dd>" +
      "<dt>Tổng cộng</dt><dd>" + (t.priced ? vnd(t.total) : "KOWIN sẽ xác nhận qua điện thoại") + "</dd>" +
      "<dt>Thanh toán</dt><dd>COD — thanh toán khi nhận hàng</dd></dl>";
    form.hidden = true;
    success.hidden = false;
    lines = []; saveCart();
    var cc = $("[data-cart-count]"); cc.hidden = true;
    $("[data-sticky-cart]").textContent = "Giao hàng toàn quốc";
    scrollToEl(success);
    success.focus({ preventScroll: true });
  }

  /* =========================================================
     INIT
     ========================================================= */
  applyConfig();
  if ($("[data-collections]")) {
    loadCart();
    setupDialogs();
    setupCatalog();
    setupPdp();
    setupLines();
    setupAnchors();
    setupForm();
  } else {
    setupLandingProduct();
    setupLandingForm();
    setupAnchors();
  }
  setupHeader();
  setupAnnounce();
  setupSticky();
  setupReveal();
})();
