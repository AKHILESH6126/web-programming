(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Storage Helper Functions (Safe LocalStorage Wrap)
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

  // Helper to escape HTML characters safely
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
  // 2. Application State & DOM Cache
  // --------------------------------------------------------------------------
  var allBooks = (typeof BOOKS !== 'undefined' && Array.isArray(BOOKS)) ? BOOKS : [];
  var currentSearch = '';
  var currentGenre = 'ALL';
  var currentSort = 'title-asc';

  var searchInput = document.getElementById('search-input');
  var sortSelect = document.getElementById('sort-select');
  var genreChipsContainer = document.getElementById('genre-chips');
  var booksGrid = document.getElementById('books-grid');
  var resultsCount = document.getElementById('results-count');
  var emptyState = document.getElementById('empty-state');
  var resetFiltersBtn = document.getElementById('reset-filters-btn');

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
    
    // Update badge count
    if (bomCountBadge) {
      bomCountBadge.textContent = set.length;
    }

    // Update total count readout in modal
    if (bomTotalCount) {
      bomTotalCount.textContent = 'TOTAL SHEETS: ' + set.length;
    }

    // Populate modal table
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

        // Attach listeners to remove buttons
        var removeButtons = bomTableContainer.querySelectorAll('.bom-remove-btn');
        removeButtons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-id');
            if (targetId) {
              toggleDraftingSetItem(targetId);
              renderCatalogue();
            }
          });
        });
      }
    }

    // Sync button states on cards
    var cardToggleBtns = document.querySelectorAll('.btn-toggle-set');
    cardToggleBtns.forEach(function (btn) {
      var id = btn.getAttribute('data-id');
      if (id && isInDraftingSet(id)) {
        btn.classList.add('in-set');
        btn.innerHTML = '✓ IN SET';
      } else {
        btn.classList.remove('in-set');
        btn.innerHTML = '[+] ADD TO SET';
      }
    });
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
  // 4. Genre Filter Chips Initialization
  // --------------------------------------------------------------------------
  function initGenres() {
    if (!genreChipsContainer) return;

    var genreMap = {};
    allBooks.forEach(function (b) {
      if (b.genre) genreMap[b.genre] = true;
    });

    var genresList = ['ALL'].concat(Object.keys(genreMap).sort());

    genreChipsContainer.innerHTML = '';
    genresList.forEach(function (g) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-btn' + (g === currentGenre ? ' active' : '');
      btn.textContent = g;
      btn.addEventListener('click', function () {
        currentGenre = g;
        var allChips = genreChipsContainer.querySelectorAll('.chip-btn');
        allChips.forEach(function (c) { c.classList.remove('active'); });
        btn.classList.add('active');
        renderCatalogue();
      });
      genreChipsContainer.appendChild(btn);
    });
  }

  // --------------------------------------------------------------------------
  // 5. Filter & Sort Logic
  // --------------------------------------------------------------------------
  function filterAndSortBooks() {
    var filtered = allBooks.filter(function (book) {
      // Genre match
      if (currentGenre !== 'ALL' && book.genre !== currentGenre) {
        return false;
      }

      // Search match (title, author, or tags)
      if (currentSearch.trim() !== '') {
        var query = currentSearch.toLowerCase();
        var matchTitle = book.title && book.title.toLowerCase().indexOf(query) > -1;
        var matchAuthor = book.author && book.author.toLowerCase().indexOf(query) > -1;
        var matchTag = book.tags && book.tags.some(function (t) {
          return t.toLowerCase().indexOf(query) > -1;
        });

        if (!matchTitle && !matchAuthor && !matchTag) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort(function (a, b) {
      if (currentSort === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (currentSort === 'year-desc') {
        return (b.year || 0) - (a.year || 0);
      } else if (currentSort === 'year-asc') {
        return (a.year || 0) - (b.year || 0);
      } else if (currentSort === 'rating-desc') {
        // Guarded rating sort
        var rA = (a.rating == null) ? -1 : Number(a.rating);
        var rB = (b.rating == null) ? -1 : Number(b.rating);
        return rB - rA;
      }
      return 0;
    });

    return filtered;
  }

  // --------------------------------------------------------------------------
  // 6. Render Book Cards Grid
  // --------------------------------------------------------------------------
  function renderCatalogue() {
    if (!booksGrid) return;

    var list = filterAndSortBooks();

    // Live counter readout
    if (resultsCount) {
      resultsCount.textContent = 'SHEETS: ' + list.length + ' / ' + allBooks.length;
    }

    if (list.length === 0) {
      booksGrid.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    booksGrid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    booksGrid.innerHTML = '';

    list.forEach(function (book, idx) {
      var card = document.createElement('article');
      card.className = 'spec-card';

      // Guard rating explicitly
      var ratingText = (book.rating == null) ? 'N/A' : Number(book.rating).toFixed(1);
      var figNum = 'FIG. ' + String(idx + 1).padStart(3, '0');
      var pageCountText = (book.pages != null) ? book.pages + ' PP' : 'N/A';
      var yearText = (book.year != null) ? book.year : 'N/A';

      var coverFrom = book.coverFrom || '#0f2c5c';
      var coverTo = book.coverTo || '#14356e';
      var titleEscaped = escapeHtml(book.title);
      var authorEscaped = escapeHtml(book.author);
      var genreEscaped = escapeHtml(book.genre || 'UNCLASSIFIED');
      var detailUrl = 'book.html?id=' + encodeURIComponent(book.id);

      var isSet = isInDraftingSet(book.id);
      var btnText = isSet ? '✓ IN SET' : '[+] ADD TO SET';
      var btnClass = isSet ? 'btn btn-toggle-set in-set' : 'btn btn-toggle-set';

      card.innerHTML = 
        '<div class="card-top-bar">' +
          '<span class="fig-label">' + figNum + '</span>' +
          '<span class="genre-pill">' + genreEscaped + '</span>' +
        '</div>' +
        '<div class="card-cover-frame">' +
          '<div class="frame-corner tl"></div>' +
          '<div class="frame-corner tr"></div>' +
          '<div class="frame-corner bl"></div>' +
          '<div class="frame-corner br"></div>' +
          '<img src="' + escapeHtml(book.cover) + '" alt="Cover of ' + titleEscaped + '" class="card-cover-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
          '<div class="cover-fallback" style="display:none; background: linear-gradient(135deg, ' + coverFrom + ', ' + coverTo + ');">' +
            '<div class="fallback-content">' +
              '<span class="fallback-title">' + titleEscaped + '</span>' +
              '<span class="fallback-author">' + authorEscaped + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title"><a href="' + detailUrl + '">' + titleEscaped + '</a></h3>' +
          '<div class="card-author">BY: ' + authorEscaped + '</div>' +
          '<div class="card-stats-row">' +
            '<span class="stat-item">YEAR: [' + yearText + ']</span>' +
            '<span class="stat-item">SPEC: ' + pageCountText + '</span>' +
            '<span class="stat-rating">★ ' + ratingText + '</span>' +
          '</div>' +
          '<div class="card-actions">' +
            '<a href="' + detailUrl + '" class="btn btn-outline-cyan">INSPECT</a>' +
            '<button class="' + btnClass + '" data-id="' + escapeHtml(book.id) + '">' + btnText + '</button>' +
          '</div>' +
        '</div>';

      // Event listener for toggle set button
      var toggleBtn = card.querySelector('.btn-toggle-set');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
          toggleDraftingSetItem(book.id);
        });
      }

      booksGrid.appendChild(card);
    });

    updateBomUI();
  }

  // --------------------------------------------------------------------------
  // 7. Event Listeners & Bootstrapping
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        currentSearch = e.target.value;
        renderCatalogue();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function (e) {
        currentSort = e.target.value;
        renderCatalogue();
      });
    }

    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', function () {
        currentSearch = '';
        currentGenre = 'ALL';
        currentSort = 'title-asc';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'title-asc';
        initGenres();
        renderCatalogue();
      });
    }

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
        renderCatalogue();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeBomModal();
    });
  }

  // Init on DOM Load
  document.addEventListener('DOMContentLoaded', function () {
    initGenres();
    setupEventListeners();
    renderCatalogue();
    updateBomUI();
  });

})();
