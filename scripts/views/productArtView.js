(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});
  let artInstance = 0;

  function getProductArtSvg(art, suffix) {
    if (art === "midnight-watch") {
      return `
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id="strap-dark-${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#303746" />
              <stop offset="100%" stop-color="#0e121a" />
            </linearGradient>
            <linearGradient id="face-dark-${suffix}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#414a5a" />
              <stop offset="100%" stop-color="#161b27" />
            </linearGradient>
          </defs>
          <rect x="58" y="12" width="44" height="42" rx="16" fill="url(#strap-dark-${suffix})" />
          <rect x="58" y="106" width="44" height="42" rx="16" fill="url(#strap-dark-${suffix})" />
          <rect x="42" y="42" width="76" height="76" rx="24" fill="url(#face-dark-${suffix})" stroke="#596376" stroke-width="4" />
          <circle cx="80" cy="80" r="22" fill="#1f2431" stroke="#8b96a7" stroke-width="3" />
          <path d="M80 65v15l12 7" stroke="#dce7f2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="80" cy="80" r="4.5" fill="#dce7f2" />
          <path d="M80 53v6M80 101v6M53 80h6M101 80h6" stroke="#f3f6fb" stroke-width="4" stroke-linecap="round" />
        </svg>
      `;
    }

    if (art === "copper-watch") {
      return `
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id="strap-copper-${suffix}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#8f5b39" />
              <stop offset="100%" stop-color="#52311d" />
            </linearGradient>
            <radialGradient id="dial-copper-${suffix}" cx="50%" cy="40%" r="62%">
              <stop offset="0%" stop-color="#fff5e8" />
              <stop offset="100%" stop-color="#f0d1ad" />
            </radialGradient>
          </defs>
          <rect x="56" y="10" width="48" height="48" rx="18" fill="url(#strap-copper-${suffix})" />
          <rect x="56" y="102" width="48" height="48" rx="18" fill="url(#strap-copper-${suffix})" />
          <circle cx="80" cy="80" r="40" fill="url(#dial-copper-${suffix})" stroke="#7f5336" stroke-width="6" />
          <circle cx="80" cy="80" r="29" fill="#fffaf2" stroke="#d8b693" stroke-width="3" />
          <path d="M80 61v21l13 9" stroke="#7a4e33" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="80" cy="80" r="4.5" fill="#7a4e33" />
          <path d="M80 49v5M80 106v5M49 80h5M106 80h5" stroke="#b07c56" stroke-width="4" stroke-linecap="round" />
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <radialGradient id="clock-face-${suffix}" cx="50%" cy="40%" r="58%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#edf4fa" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r="48" fill="url(#clock-face-${suffix})" stroke="#cedae5" stroke-width="8" />
        <circle cx="80" cy="80" r="36" fill="#fbfdff" stroke="#e3ecf4" stroke-width="3" />
        <path d="M80 50v8M80 102v8M50 80h8M102 80h8M59 59l6 6M101 59l-6 6M59 101l6-6M101 101l-6-6" stroke="#8398ab" stroke-width="4" stroke-linecap="round" />
        <path d="M80 62v21l15 10" stroke="#607384" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="80" cy="80" r="5" fill="#607384" />
      </svg>
    `;
  }

  app.createProductArtMarkup = function createProductArtMarkup(art, sizeClass) {
    artInstance += 1;
    return `<div class="product-art ${sizeClass || ""}">${getProductArtSvg(art, artInstance)}</div>`;
  };
})();
