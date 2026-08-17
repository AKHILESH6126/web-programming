(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. LocalStorage Helpers (Try/Catch Guarded)
  // --------------------------------------------------------------------------
  function getDraftingSet() {
    try {
      var saved = localStorage.getItem('blueprint-set');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveDraftingSet(set) {
    try {
      localStorage.setItem('blueprint-set', JSON.stringify(set));
    } catch (e) {}
  }

  function toggleDraftingSetItem(id) {
    var set = getDraftingSet();
    var idx = set.indexOf(id);
    if (idx > -1) {
      set.splice(idx, 1);
    } else {
      set.push(id);
    }
    saveDraftingSet(set);
    updateBomUI();
  }

  function isInDraftingSet(id) {
    var set = getDraftingSet();
    return set.indexOf(id) > -1;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --------------------------------------------------------------------------
  // 2. DOM & State References
  // --------------------------------------------------------------------------
  var allBooks = (typeof BOOKS !== 'undefined' && Array.isArray(BOOKS)) ? BOOKS : [];
  var detailContainer = document.getElementById('detail-container');
  var detailDwgCode = document.getElementById('detail-dwg-code');

  var bomToggleBtn = document.getElementById('bom-toggle-btn');
  var bomCountBadge = document.getElementById('bom-count-badge');
  var bomModal = document.getElementById('bom-modal');
  var bomCloseBtn = document.getElementById('bom-close-btn');
  var bomTableContainer = document.getElementById('bom-table-container');
  var bomTotalCount = document.getElementById('bom-total-count');
  var bomClearBtn = document.getElementById('bom-clear-btn');

  // --------------------------------------------------------------------------
  // 3. BOM Modal Management
  // --------------------------------------------------------------------------
  function updateBomUI() {
    var set = getDraftingSet();

    if (bomCountBadge) {
      bomCountBadge.textContent = set.length;
    }

    if (bomTotalCount) {
      bomTotalCount.textContent = 'TOTAL SHEETS: ' + set.length;
    }

    if (bomTableContainer) {
      if (set.length === 0) {
        bomTableContainer.innerHTML = '<div class="empty-bom">SET EMPTY — NO SHEETS SELECTED.</div>';
      } else {
        var html = '<table class="bom-table"><thead><tr>' +
          '<th>ITEM</th>' +
          '<th>REF (ID)</th>' +
          '<th>TITLE</th>' +
          '<th>AUTHOR</th>' +
          '<th>YEAR</th>' +
          '<th>ACTION</th>' +
          '</tr></thead><tbody>';

        set.forEach(function (id, idx) {
          var book = allBooks.find(function (b) { return b.id === id; });
          var itemNum = String(idx + 1).padStart(3, '0');
          if (book) {
            html += '<tr>' +
              '<td>' + itemNum + '</td>' +
              '<td><code>' + escapeHtml(book.id) + '</code></td>' +
              '<td><a href="book.html?id=' + encodeURIComponent(book.id) + '">' + escapeHtml(book.title) + '</a></td>' +
              '<td>' + escapeHtml(book.author) + '</td>' +
              '<td>' + (book.year || 'N/A') + '</td>' +
              '<td><button class="btn btn-outline-danger btn-sm bom-remove-btn" data-id="' + escapeHtml(book.id) + '">REMOVE</button></td>' +
              '</tr>';
          } else {
            html += '<tr>' +
              '<td>' + itemNum + '</td>' +
              '<td><code>' + escapeHtml(id) + '</code></td>' +
              '<td colspan="3">SPECIFICATION NOT IN REGISTRY</td>' +
              '<td><button class="btn btn-outline-danger btn-sm bom-remove-btn" data-id="' + escapeHtml(id) + '">REMOVE</button></td>' +
              '</tr>';
          }
        });

        html += '</tbody></table>';
        bomTableContainer.innerHTML = html;

        var removeButtons = bomTableContainer.querySelectorAll('.bom-remove-btn');
        removeButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-id');
            if (targetId) {
              toggleDraftingSetItem(targetId);
              renderDetail();
            }
          });
        });
      }
    }

    // Sync state for any detail toggle buttons
    var detailToggleBtn = document.getElementById('detail-toggle-btn');
    if (detailToggleBtn) {
      var targetId = detailToggleBtn.getAttribute('data-id');
      if (targetId && isInDraftingSet(targetId)) {
        detailToggleBtn.classList.add('in-set');
        detailToggleBtn.innerHTML = '✓ IN DRAFTING SET';
      } else if (targetId) {
        detailToggleBtn.classList.remove('in-set');
        detailToggleBtn.innerHTML = '[+] ADD TO DRAFTING SET';
      }
    }
  }

  function openBomModal() {
    if (!bomModal) return;
    bomModal.classList.remove('hidden');
    bomModal.setAttribute('aria-hidden', 'false');
    if (bomToggleBtn) bomToggleBtn.setAttribute('aria-expanded', 'true');
    updateBomUI();
  }

  function closeBomModal() {
    if (!bomModal) return;
    bomModal.classList.add('hidden');
    bomModal.setAttribute('aria-hidden', 'true');
    if (bomToggleBtn) bomToggleBtn.setAttribute('aria-expanded', 'false');
  }

  // --------------------------------------------------------------------------
  // 4. Render Detail View
  // --------------------------------------------------------------------------
  function renderDetail() {
    if (!detailContainer) return;

    var urlParams = new URLSearchParams(window.location.search);
    var bookId = urlParams.get('id');

    if (!bookId) {
      renderError('NO SPECIFICATION ID PROVIDED IN QUERY');
      return;
    }

    var book = allBooks.find(function (b) { return b.id === bookId; });
    if (!book) {
      renderError('SHEET NOT FOUND / NO SUCH DRAWING (' + escapeHtml(bookId) + ')');
      return;
    }

    // Update Top Code & Document Title
    if (detailDwgCode) {
      detailDwgCode.textContent = 'DWG NO: ' + escapeHtml(book.id).toUpperCase();
    }
    document.title = 'DWG: ' + book.title + ' // Blueprint Archive';

    // Guarded fields
    var ratingText = (book.rating == null) ? 'N/A' : Number(book.rating).toFixed(1);
    var yearText = (book.year != null) ? book.year : 'N/A';
    var pagesText = (book.pages != null) ? book.pages + ' PAGES' : 'N/A';
    var coverFrom = book.coverFrom || '#0f2c5c';
    var coverTo = book.coverTo || '#14356e';

    var titleEscaped = escapeHtml(book.title);
    var subtitleEscaped = book.subtitle ? escapeHtml(book.subtitle) : '';
    var authorEscaped = escapeHtml(book.author);
    var genreEscaped = escapeHtml(book.genre || 'N/A');
    var publisherEscaped = escapeHtml(book.publisher || 'N/A');
    var languageEscaped = escapeHtml(book.language || 'N/A');
    var isbnEscaped = escapeHtml(book.isbn || 'N/A');

    var isSet = isInDraftingSet(book.id);
    var btnText = isSet ? '✓ IN DRAFTING SET' : '[+] ADD TO DRAFTING SET';
    var btnClass = isSet ? 'btn btn-cyan btn-toggle-set in-set' : 'btn btn-cyan btn-toggle-set';

    // Build main drawing sheet HTML
    var html = '<div class="detail-sheet-grid">' +
      // LEFT COLUMN: Cover & Fig
      '<div class="detail-left-col">' +
        '<div class="detail-cover-box">' +
          '<div class="card-top-bar">' +
            '<span class="fig-label">FIG. 001 — SCHEMATIC COVER</span>' +
            '<span class="genre-pill">' + genreEscaped + '</span>' +
          '</div>' +
          '<div class="detail-cover-frame">' +
            '<div class="frame-corner tl"></div><div class="frame-corner tr"></div>' +
            '<div class="frame-corner bl"></div><div class="frame-corner br"></div>' +
            '<img src="' + escapeHtml(book.cover) + '" alt="Cover of ' + titleEscaped + '" class="detail-cover-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
            '<div class="cover-fallback" style="display:none; background: linear-gradient(135deg, ' + coverFrom + ', ' + coverTo + ');">' +
              '<div class="fallback-content">' +
                '<span class="fallback-title" style="font-size: 1.4rem;">' + titleEscaped + '</span>' +
                '<span class="fallback-author" style="font-size: 0.95rem;">' + authorEscaped + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top: 16px;">' +
            '<button id="detail-toggle-btn" class="' + btnClass + '" data-id="' + escapeHtml(book.id) + '" style="width: 100%;">' + btnText + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // RIGHT COLUMN: Title Block Metadata Table, Notes, Quote, Tags
      '<div class="detail-right-col">' +
        '<div class="panel-header-bar" style="border: 1px solid var(--cyan-border); border-bottom: none; background: var(--bg-card-blue);">' +
          '<span class="tech-code">SPECIFICATION SHEET // DRAWING REF: ' + escapeHtml(book.id) + '</span>' +
          '<h2 style="font-size: 1.8rem; margin: 4px 0 2px 0;">' + titleEscaped + '</h2>' +
          (subtitleEscaped ? '<div style="font-size: 0.9rem; color: var(--text-muted); font-style: italic; margin-bottom: 4px;">' + subtitleEscaped + '</div>' : '') +
          '<div style="font-size: 0.95rem; color: var(--cyan-bright);">BY AUTHOR: ' + authorEscaped + '</div>' +
        '</div>' +

        // Engineering Title Block Table
        '<div class="title-block-panel">' +
          '<table class="title-block-table">' +
            '<tbody>' +
              '<tr>' +
                '<th>PUBLICATION YEAR</th><td>' + yearText + '</td>' +
                '<th>GENRE CLASS</th><td>' + genreEscaped + '</td>' +
              '</tr>' +
              '<tr>' +
                '<th>PAGES / EXTENT</th><td>' + pagesText + '</td>' +
                '<th>ARCHIVE RATING</th><td class="stat-rating">★ ' + ratingText + '</td>' +
              '</tr>' +
              '<tr>' +
                '<th>PUBLISHER</th><td>' + publisherEscaped + '</td>' +
                '<th>LANGUAGE</th><td>' + languageEscaped + '</td>' +
              '</tr>' +
              '<tr>' +
                '<th>ISBN IDENTIFIER</th><td colspan="3"><code>' + isbnEscaped + '</code></td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
        '</div>';

    // NOTES & SPECIFICATIONS (Blurb paragraphs)
    if (Array.isArray(book.blurb) && book.blurb.length > 0) {
      html += '<div class="notes-section">' +
        '<h3>NOTES & SPECIFICATIONS</h3>';
      book.blurb.forEach(function (paragraph, pIdx) {
        var noteNum = 'NOTE ' + String(pIdx + 1).padStart(2, '0');
        html += '<div class="note-item">' +
          '<span class="note-num">' + noteNum + ':</span>' +
          '<p>' + escapeHtml(paragraph) + '</p>' +
        '</div>';
      });
      html += '</div>';
    }

    // ANNOTATED QUOTE CALLOUT
    if (book.quote && book.quote.text) {
      html += '<div class="quote-callout">' +
        '<span class="quote-tag">[REF-QUOTE // ANNOTATED EXTRACT]</span>' +
        '<blockquote>"' + escapeHtml(book.quote.text) + '"</blockquote>' +
        '<cite>— ' + escapeHtml(book.quote.source || 'SOURCE UNKNOWN') + '</cite>' +
      '</div>';
    }

    // TAGS / REFERENCES
    if (Array.isArray(book.tags) && book.tags.length > 0) {
      html += '<div class="tech-label">CLASSIFICATION REFERENCES / TAGS:</div>' +
        '<div class="tags-section">';
      book.tags.forEach(function (tag) {
        html += '<span class="tag-chip">#' + escapeHtml(tag) + '</span>';
      });
      html += '</div>';
    }

    html += '</div></div>'; // Close right col & detail grid

    // RELATED SHEETS STRIP
    var relatedBooks = allBooks.filter(function (b) {
      return b.genre === book.genre && b.id !== book.id;
    }).slice(0, 4);

    if (relatedBooks.length > 0) {
      html += '<div class="related-sheets-section">' +
        '<h3>RELATED SPECIFICATION SHEETS // GENRE: ' + genreEscaped + '</h3>' +
        '<div class="related-grid">';

      relatedBooks.forEach(function (rel) {
        var relTitle = escapeHtml(rel.title);
        var relRating = (rel.rating == null) ? 'N/A' : Number(rel.rating).toFixed(1);
        var relYear = (rel.year != null) ? rel.year : 'N/A';
        var relUrl = 'book.html?id=' + encodeURIComponent(rel.id);

        html += '<div class="related-card">' +
          '<div class="related-cover-frame">' +
            '<img src="' + escapeHtml(rel.cover) + '" alt="Cover of ' + relTitle + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
            '<div class="cover-fallback" style="display:none; background: linear-gradient(135deg, ' + (rel.coverFrom || '#0f2c5c') + ', ' + (rel.coverTo || '#14356e') + ');">' +
              '<span class="fallback-title" style="font-size: 0.85rem;">' + relTitle + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="related-title"><a href="' + relUrl + '">' + relTitle + '</a></div>' +
          '<div class="related-meta">' +
            '<span>YEAR: [' + relYear + ']</span>' +
            '<span class="stat-rating">★ ' + relRating + '</span>' +
          '</div>' +
        '</div>';
      });

      html += '</div></div>';
    }

    detailContainer.innerHTML = html;

    // Attach click listener for detail toggle button
    var detailBtn = document.getElementById('detail-toggle-btn');
    if (detailBtn) {
      detailBtn.addEventListener('click', function () {
        toggleDraftingSetItem(book.id);
      });
    }

    updateBomUI();
  }

  // Error state display when ID missing or invalid
  function renderError(message) {
    if (!detailContainer) return;
    detailContainer.innerHTML = '<div class="empty-state">' +
      '<div class="empty-box">' +
        '<div class="empty-code">STATUS: 404 // DRAWING NOT FOUND</div>' +
        '<h2>' + escapeHtml(message) + '</h2>' +
        '<p>The specified drawing specification cannot be located in the register or has been removed.</p>' +
        '<a href="index.html" class="btn btn-cyan">← RETURN TO INDEX SHEET</a>' +
      '</div>' +
    '</div>';
  }

  // --------------------------------------------------------------------------
  // 5. Event Listeners & Bootstrap
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    if (bomToggleBtn) {
      bomToggleBtn.addEventListener('click', function () {
        if (bomModal && !bomModal.classList.contains('hidden')) {
          closeBomModal();
        } else {
          openBomModal();
        }
      });
    }

    if (bomCloseBtn) {
      bomCloseBtn.addEventListener('click', closeBomModal);
    }

    if (bomModal) {
      bomModal.addEventListener('click', function (e) {
        if (e.target === bomModal) closeBomModal();
      });
    }

    if (bomClearBtn) {
      bomClearBtn.addEventListener('click', function () {
        saveDraftingSet([]);
        updateBomUI();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBomModal();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    renderDetail();
    updateBomUI();
  });

})();
