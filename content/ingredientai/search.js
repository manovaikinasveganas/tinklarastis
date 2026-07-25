(function () {
  'use strict';

  var DB_URL = '/ingredientai/db.json';
  var CACHE_KEY = 'ingredientai-db-v2';
  var DISCLAIMER_KEY = 'ingredientai-disclaimer-accepted';
  var MAX_RESULTS = 20;

  var LT_MAP = {
    'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
    'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
  };

  // Longer phrases first, so "naturalus daziklis" is removed before "daziklis".
  var STOP_PHRASES = [
    'biruma gerinanti medziaga',
    'rugstinguma reguliuojanti medziaga',
    'lipnuma reguliuojanti medziaga',
    'naturalus daziklis',
    'konservantai',
    'konservantas',
    'tirstiklis',
    'tirstikliai',
    'stabilizatorius',
    'stabilizatoriai',
    'antioksidantas',
    'kietiklis',
    'be glitimo',
    'daziklis'
  ];

  var TAG_STYLE = {
    'Vegan':                { cls: 'tag--vegan', icon: 'fas fa-leaf' },
    'Vegetariškas':         { cls: 'tag--vege', icon: 'fas fa-seedling' },
    'Galbūt vegan':         { cls: 'tag--maybe', icon: 'fas fa-question-circle' },
    'Galbūt vegetariškas':  { cls: 'tag--maybe', icon: 'fas fa-question-circle' },
    'Ne vegan':             { cls: 'tag--not', icon: 'fas fa-times-circle' },
    'Ne vegetariškas':      { cls: 'tag--not', icon: 'fas fa-times-circle' },
    'Žuvis':                { cls: 'tag--animal', icon: 'fas fa-fish' },
    'Karvė':                { cls: 'tag--animal', icon: 'fas fa-paw' },
    'Bitė':                 { cls: 'tag--animal', icon: 'fas fa-paw' }
  };

  // Lowercase + strip Lithuanian diacritics. 1:1 per character, so indices
  // into the normalized string are valid indices into the original.
  function latinize(s) {
    return s.toLowerCase().replace(/[ąčęėįšųūž]/g, function (c) { return LT_MAP[c]; });
  }

  // 1:1 normalization: latinize and turn punctuation into spaces, keep length.
  function normalize(s) {
    return latinize(s).replace(/[^a-z0-9ąčęėįšųūž]/gi, ' ');
  }

  function cleanQuery(s) {
    var q = normalize(s);
    STOP_PHRASES.forEach(function (p) {
      q = q.replace(new RegExp('(^|\\s)' + p + '(?=\\s|$)', 'g'), ' ');
    });
    return q.replace(/\s+/g, ' ').trim();
  }

  function tokenize(norm) {
    var tokens = [];
    var re = /[a-z0-9]+/g, m;
    while ((m = re.exec(norm)) !== null) {
      tokens.push({ text: m[0], start: m.index });
    }
    return tokens;
  }

  // Optimal string alignment distance (Levenshtein + adjacent transposition),
  // bails out early when the distance exceeds max.
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev2 = null;
    var prev = [];
    for (var j = 0; j <= b.length; j++) prev.push(j);
    for (var i = 1; i <= a.length; i++) {
      var cur = [i];
      var rowMin = i;
      for (var k = 1; k <= b.length; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        var val = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
        if (prev2 && i > 1 && k > 1 && a[i - 1] === b[k - 2] && a[i - 2] === b[k - 1]) {
          val = Math.min(val, prev2[k - 2] + cost);
        }
        cur.push(val);
        if (val < rowMin) rowMin = val;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev;
      prev = cur;
    }
    return prev[b.length];
  }

  function fuzzyMax(token) {
    if (/\d/.test(token)) return 0; // E471 must never match E417
    if (token.length <= 3) return 0;
    if (token.length <= 5) return 1;
    return 2;
  }

  // Match tiers: 4 exact whole field, 3 substring at word boundary,
  // 2 substring elsewhere / all tokens exact, 1 fuzzy involved.
  function matchField(queryNorm, queryTokens, field) {
    if (field.compact === queryNorm) {
      return { tier: 4, coverage: 1, spans: [[0, field.norm.length]] };
    }
    var idx = field.norm.indexOf(queryNorm);
    if (queryNorm.indexOf(' ') === -1 || idx !== -1) {
      // Single-token query or the whole phrase appears verbatim.
      if (idx !== -1) {
        var atBoundary = idx === 0 || field.norm[idx - 1] === ' ';
        return {
          tier: atBoundary ? 3 : 2,
          coverage: queryNorm.length / field.compact.length,
          spans: [[idx, idx + queryNorm.length]]
        };
      }
    }
    // Per-token matching: every query token must land somewhere in the field.
    var spans = [];
    var tier = 3;
    var covered = 0;
    for (var i = 0; i < queryTokens.length; i++) {
      var qt = queryTokens[i].text;
      var best = null;
      for (var j = 0; j < field.tokens.length; j++) {
        var ft = field.tokens[j];
        var cand = null;
        if (ft.text === qt) {
          cand = { tier: 3, span: [ft.start, ft.start + ft.text.length] };
        } else if (ft.text.indexOf(qt) !== -1) {
          var at = ft.text.indexOf(qt);
          cand = { tier: at === 0 ? 3 : 2, span: [ft.start + at, ft.start + at + qt.length] };
        } else {
          var max = fuzzyMax(qt);
          if (max > 0 && editDistance(qt, ft.text, max) <= max) {
            cand = { tier: 1, span: [ft.start, ft.start + ft.text.length] };
          }
        }
        if (cand && (!best || cand.tier > best.tier)) best = cand;
        if (best && best.tier === 3) break;
      }
      if (!best) return null;
      tier = Math.min(tier, best.tier);
      covered += qt.length;
      spans.push(best.span);
    }
    return { tier: tier, coverage: covered / field.compact.length, spans: spans };
  }

  // Rank key: match tier dominates, then field weight (name > alias > desc),
  // then coverage — so an exact alias match beats a partial name match.
  function scoreItem(queryNorm, queryTokens, item) {
    var best = null;
    for (var f = 0; f < item.fields.length; f++) {
      var field = item.fields[f];
      var m = matchField(queryNorm, queryTokens, field);
      if (!m) continue;
      var score = m.tier * 1e6 + field.weight * 1e4 + Math.min(m.coverage, 1) * 9999;
      if (!best || score > best.score) {
        best = { score: score, tier: m.tier, field: field, spans: m.spans };
      }
    }
    return best;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function highlight(original, spans) {
    if (!spans || !spans.length) return escapeHtml(original);
    var merged = spans.slice().sort(function (a, b) { return a[0] - b[0]; })
      .reduce(function (acc, s) {
        var last = acc[acc.length - 1];
        if (last && s[0] <= last[1]) last[1] = Math.max(last[1], s[1]);
        else acc.push([s[0], s[1]]);
        return acc;
      }, []);
    var out = '';
    var pos = 0;
    merged.forEach(function (s) {
      out += escapeHtml(original.slice(pos, s[0]));
      out += '<mark>' + escapeHtml(original.slice(s[0], s[1])) + '</mark>';
      pos = s[1];
    });
    return out + escapeHtml(original.slice(pos));
  }

  function makeField(kind, weight, original) {
    var norm = normalize(original);
    return {
      kind: kind,
      weight: weight,
      original: original,
      norm: norm,
      compact: norm.replace(/\s+/g, ' ').trim(),
      tokens: tokenize(norm)
    };
  }

  function buildIndex(db) {
    return db.data.map(function (raw) {
      var fields = [makeField('name', 3, raw.name)];
      (raw.aliases || []).forEach(function (a) {
        fields.push(makeField('alias', 2, a));
      });
      if (raw.description) fields.push(makeField('description', 1, raw.description));
      return { raw: raw, fields: fields };
    });
  }

  function renderTag(tag) {
    var style = TAG_STYLE[tag] || { cls: 'tag--animal', icon: 'fas fa-tag' };
    return '<span class="ingr-tag ' + style.cls + '"><i class="' + style.icon +
      '" aria-hidden="true"></i>' + escapeHtml(tag) + '</span>';
  }

  function renderSources(sources) {
    if (!sources || !sources.length) return '';
    var links = sources.map(function (url) {
      var host;
      try { host = new URL(url).hostname.replace(/^www\./, ''); } catch (e) { host = url; }
      return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener nofollow">' +
        escapeHtml(host) + '</a>';
    });
    return '<p class="ingr-sources"><i class="fas fa-link" aria-hidden="true"></i> Šaltiniai: ' +
      links.join(', ') + '</p>';
  }

  function renderItem(hit) {
    var raw = hit.item.raw;
    var byKind = { name: [], alias: {}, description: [] };
    if (hit.match.field.kind === 'name') byKind.name = hit.match.spans;
    else if (hit.match.field.kind === 'description') byKind.description = hit.match.spans;
    else byKind.alias[hit.match.field.original] = hit.match.spans;

    var html = '<li class="ingr-item">';
    html += '<div class="ingr-item__head"><span class="ingr-item__name">' +
      highlight(raw.name, byKind.name) + '</span>';
    html += '<span class="ingr-item__tags">' + (raw.tags || []).map(renderTag).join('') + '</span></div>';
    if (raw.aliases && raw.aliases.length) {
      html += '<p class="ingr-aliases">Kiti pavadinimai: ' + raw.aliases.map(function (a) {
        return highlight(a, byKind.alias[a]);
      }).join(', ') + '</p>';
    }
    if (raw.description) {
      html += '<p class="ingr-desc">' + highlight(raw.description, byKind.description) + '</p>';
    }
    html += renderSources(raw.sources);
    return html + '</li>';
  }

  var index = null;

  function search(rawQuery) {
    var resultsEl = document.getElementById('ingr-results');
    var queryNorm = cleanQuery(rawQuery);
    if (!index || queryNorm.length < 2) {
      resultsEl.innerHTML = '';
      return;
    }
    var queryTokens = tokenize(queryNorm);
    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var match = scoreItem(queryNorm, queryTokens, index[i]);
      if (match) hits.push({ item: index[i], match: match, score: match.score });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    // If anything matched exactly, drop the fuzzy guesses entirely.
    if (hits.length && hits[0].match.tier > 1) {
      hits = hits.filter(function (h) { return h.match.tier > 1; });
    }
    hits = hits.slice(0, MAX_RESULTS);
    if (!hits.length) {
      resultsEl.innerHTML = '<p class="ingr-empty">Nieko nerasta. Pabandykite kitą pavadinimą arba E numerį.</p>';
      return;
    }
    resultsEl.innerHTML = '<ul class="ingr-list">' + hits.map(renderItem).join('') + '</ul>';
  }

  function init(db) {
    index = buildIndex(db);
    var input = document.getElementById('ingr-input');
    if (input.value) search(input.value);
  }

  function syncUrl(query) {
    var url = query
      ? location.pathname + '?q=' + encodeURIComponent(query)
      : location.pathname;
    history.replaceState(null, '', url);
  }

  function setupDisclaimer() {
    var banner = document.getElementById('ingr-disclaimer');
    if (!banner) return;
    var accepted = false;
    try { accepted = localStorage.getItem(DISCLAIMER_KEY) === 'true'; } catch (e) { /* ignore */ }
    if (accepted) return;
    // #main's intro animation creates a stacking context that would trap the
    // fixed banner under the footer, so hoist it out to <body>.
    document.body.appendChild(banner);
    banner.hidden = false;
    document.getElementById('ingr-disclaimer-accept').addEventListener('click', function () {
      try { localStorage.setItem(DISCLAIMER_KEY, 'true'); } catch (e) { /* ignore */ }
      banner.hidden = true;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupDisclaimer();

    var input = document.getElementById('ingr-input');
    var clear = document.getElementById('ingr-clear');

    function refresh() {
      clear.hidden = !input.value;
      search(input.value);
      syncUrl(input.value.trim());
    }

    input.addEventListener('input', refresh);
    clear.addEventListener('click', function () {
      input.value = '';
      refresh();
      input.focus();
    });

    var preset = new URLSearchParams(location.search).get('q');
    if (preset) {
      input.value = preset;
      clear.hidden = false;
    }

    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && cached.data) init(cached);
    } catch (e) { /* stale or corrupt cache, wait for fetch */ }

    fetch(DB_URL)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); })
      .then(function (fresh) {
        if (!fresh || !fresh.data) return;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch (e) { /* quota */ }
        init(fresh);
      })
      .catch(function () { /* keep cached version */ });
  });
})();
