// Ilustrasi SVG modern, tajam, dan 100% offline-ready untuk aset produk warung

const createProductSvg = (bgGradient: [string, string], iconSvg: string, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" width="320" height="240">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="280" cy="40" r="120" fill="white" opacity="0.06"/>
    <circle cx="40" cy="200" r="90" fill="white" opacity="0.04"/>
    <g transform="translate(160, 105)" filter="url(#shadow)">
      ${iconSvg}
    </g>
    <rect x="24" y="194" width="272" height="30" rx="8" fill="#0f172a" opacity="0.45"/>
    <text x="160" y="214" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">${label.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Ikon-ikon spesifik per produk
const ICONS = {
  // Karung Beras
  beras: `
    <g transform="translate(-40, -45)">
      <path d="M 20 80 C 15 35, 25 15, 40 10 C 55 15, 65 35, 60 80 Z" fill="#fef08a"/>
      <path d="M 22 45 Q 40 55 58 45" stroke="#ca8a04" stroke-width="3" fill="none"/>
      <circle cx="40" cy="30" r="5" fill="#ca8a04"/>
      <rect x="26" y="52" width="28" height="18" rx="3" fill="#ffffff"/>
      <text x="40" y="65" font-family="sans-serif" font-size="9" font-weight="bold" fill="#854d0e" text-anchor="middle">BERAS</text>
    </g>
  `,
  // Botol/Pouch Minyak Goreng Emas
  minyak: `
    <g transform="translate(-35, -45)">
      <path d="M 20 20 L 50 20 L 58 75 C 58 82, 50 85, 35 85 C 20 85, 12 82, 12 75 Z" fill="#fde047"/>
      <rect x="28" y="10" width="14" height="10" rx="2" fill="#eab308"/>
      <ellipse cx="35" cy="50" rx="14" ry="18" fill="#facc15"/>
      <path d="M 35 38 Q 42 46 42 54 A 7 7 0 0 1 28 54 Q 28 46 35 38 Z" fill="#ca8a04"/>
    </g>
  `,
  // Kantong Gula Pasir
  gula: `
    <g transform="translate(-40, -45)">
      <rect x="18" y="15" width="44" height="65" rx="8" fill="#f8fafc"/>
      <rect x="18" y="15" width="44" height="16" rx="4" fill="#38bdf8"/>
      <circle cx="40" cy="50" r="12" fill="#e0f2fe"/>
      <text x="40" y="54" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0284c7" text-anchor="middle">GULA</text>
      <circle cx="28" cy="70" r="2" fill="#cbd5e1"/>
      <circle cx="34" cy="72" r="2" fill="#cbd5e1"/>
      <circle cx="46" cy="71" r="2" fill="#cbd5e1"/>
      <circle cx="52" cy="70" r="2" fill="#cbd5e1"/>
    </g>
  `,
  // Keranjang / Butir Telur Ayam Cokelat Alami
  telur: `
    <g transform="translate(-45, -40)">
      <ellipse cx="32" cy="40" rx="14" ry="19" fill="#f59e0b" transform="rotate(-15, 32, 40)"/>
      <ellipse cx="58" cy="40" rx="14" ry="19" fill="#d97706" transform="rotate(15, 58, 40)"/>
      <ellipse cx="45" cy="48" rx="15" ry="20" fill="#fbbf24"/>
      <path d="M 15 55 Q 45 78 75 55" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
  `,
  // Bungkus Mie Instan Indomie
  mie: `
    <g transform="translate(-45, -40)">
      <rect x="10" y="15" width="70" height="52" rx="6" fill="#dc2626"/>
      <rect x="10" y="30" width="70" height="18" fill="#fbbf24"/>
      <circle cx="45" cy="39" r="16" fill="#ffffff"/>
      <path d="M 35 39 Q 45 46 55 39 Q 45 32 35 39" fill="#ca8a04"/>
      <text x="45" y="62" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">INDOMIE</text>
    </g>
  `,
  // Kopi Hitam Cangkir & Sachet
  kopi: `
    <g transform="translate(-40, -42)">
      <rect x="15" y="10" width="30" height="65" rx="4" fill="#78350f" transform="rotate(-12, 30, 42)"/>
      <rect x="36" y="28" width="36" height="38" rx="6" fill="#1c1917"/>
      <path d="M 72 38 Q 82 44 72 52" stroke="#1c1917" stroke-width="4" fill="none"/>
      <ellipse cx="54" cy="28" rx="18" ry="5" fill="#451a03"/>
      <path d="M 48 20 Q 52 14 50 8" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 58 20 Q 62 14 60 8" stroke="#cbd5e1" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
  `,
  // Kotak Teh Celup
  teh: `
    <g transform="translate(-40, -42)">
      <rect x="15" y="18" width="50" height="52" rx="6" fill="#15803d"/>
      <rect x="25" y="10" width="30" height="8" rx="2" fill="#166534"/>
      <circle cx="40" cy="44" r="14" fill="#86efac"/>
      <path d="M 40 34 C 48 42, 44 52, 40 54 C 36 52, 32 42, 40 34 Z" fill="#15803d"/>
    </g>
  `,
  // Botol Air Mineral Segar
  aqua: `
    <g transform="translate(-35, -45)">
      <rect x="22" y="24" width="26" height="58" rx="6" fill="#67e8f9"/>
      <rect x="28" y="14" width="14" height="10" rx="2" fill="#0284c7"/>
      <rect x="22" y="42" width="26" height="20" fill="#0284c7"/>
      <text x="35" y="55" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">AQUA</text>
      <path d="M 24 32 Q 35 36 46 32" stroke="#ffffff" stroke-width="2" fill="none"/>
    </g>
  `,
  // Sabun Cuci Botol Hijau Fresh
  sabun: `
    <g transform="translate(-35, -45)">
      <path d="M 22 24 L 48 24 L 52 78 C 52 84, 46 86, 35 86 C 24 86, 18 84, 18 78 Z" fill="#84cc16"/>
      <rect x="28" y="14" width="14" height="10" rx="3" fill="#65a30d"/>
      <circle cx="35" cy="50" r="12" fill="#facc15"/>
      <path d="M 35 44 L 35 56 M 29 50 L 41 50" stroke="#ca8a04" stroke-width="2"/>
    </g>
  `,
  // Deterjen Cuci Pakaian
  deterjen: `
    <g transform="translate(-40, -42)">
      <rect x="15" y="16" width="50" height="60" rx="6" fill="#2563eb"/>
      <path d="M 15 28 Q 40 40 65 28" fill="#ec4899"/>
      <circle cx="40" cy="52" r="14" fill="#ffffff"/>
      <path d="M 32 52 L 40 44 L 48 52 L 40 60 Z" fill="#3b82f6"/>
    </g>
  `,
  // Botol Kecap Manis
  kecap: `
    <g transform="translate(-35, -45)">
      <path d="M 25 22 L 45 22 L 50 78 C 50 84, 44 86, 35 86 C 26 86, 20 84, 20 78 Z" fill="#1e293b"/>
      <rect x="28" y="12" width="14" height="10" rx="2" fill="#f59e0b"/>
      <rect x="22" y="40" width="26" height="24" fill="#047857"/>
      <circle cx="35" cy="52" r="7" fill="#fef08a"/>
      <text x="35" y="55" font-family="sans-serif" font-size="7" font-weight="bold" fill="#065f46" text-anchor="middle">BANGO</text>
    </g>
  `,
  // Tepung Terigu Kemasan
  tepung: `
    <g transform="translate(-40, -45)">
      <rect x="16" y="16" width="48" height="64" rx="6" fill="#f1f5f9"/>
      <polygon points="40,24 24,52 56,52" fill="#2563eb"/>
      <circle cx="40" cy="66" r="4" fill="#cbd5e1"/>
    </g>
  `,
  // Default Kategori Sembako
  defaultSembako: `
    <g transform="translate(-40, -40)">
      <rect x="18" y="20" width="44" height="50" rx="6" fill="#fef08a"/>
      <circle cx="40" cy="45" r="12" fill="#eab308"/>
    </g>
  `,
  // Default Makanan
  defaultMakanan: `
    <g transform="translate(-40, -40)">
      <rect x="15" y="20" width="50" height="45" rx="6" fill="#f87171"/>
      <circle cx="40" cy="42" r="12" fill="#ffffff"/>
    </g>
  `,
  // Default Minuman
  defaultMinuman: `
    <g transform="translate(-35, -45)">
      <rect x="22" y="24" width="26" height="54" rx="6" fill="#38bdf8"/>
      <rect x="28" y="14" width="14" height="10" rx="2" fill="#0284c7"/>
    </g>
  `,
};

export const PRODUCT_IMAGES = {
  beras: createProductSvg(['#ca8a04', '#854d0e'], ICONS.beras, 'Beras Ramos 5kg'),
  minyak: createProductSvg(['#eab308', '#ca8a04'], ICONS.minyak, 'Minyak Goreng 2L'),
  gula: createProductSvg(['#0284c7', '#0369a1'], ICONS.gula, 'Gulaku 1kg'),
  telur: createProductSvg(['#d97706', '#9a3412'], ICONS.telur, 'Telur Ayam 1kg'),
  mie: createProductSvg(['#dc2626', '#991b1b'], ICONS.mie, 'Indomie Goreng'),
  kopi: createProductSvg(['#451a03', '#1c1917'], ICONS.kopi, 'Kopi Kapal Api'),
  teh: createProductSvg(['#15803d', '#14532d'], ICONS.teh, 'Teh Sariwangi'),
  aqua: createProductSvg(['#0284c7', '#075985'], ICONS.aqua, 'Aqua 600ml'),
  sabun: createProductSvg(['#65a30d', '#3f6212'], ICONS.sabun, 'Sunlight 650ml'),
  deterjen: createProductSvg(['#1d4ed8', '#1e3a8a'], ICONS.deterjen, 'Rinso Bubuk 770g'),
  kecap: createProductSvg(['#065f46', '#064e3b'], ICONS.kecap, 'Kecap Bango 520ml'),
  tepung: createProductSvg(['#1e40af', '#172554'], ICONS.tepung, 'Segitiga Biru 1kg'),
};

export const getCategoryFallbackImage = (kategori: string): string => {
  const kat = kategori.toLowerCase();
  if (kat.includes('sembako')) return createProductSvg(['#ca8a04', '#854d0e'], ICONS.defaultSembako, kategori);
  if (kat.includes('makan')) return createProductSvg(['#dc2626', '#991b1b'], ICONS.defaultMakanan, kategori);
  if (kat.includes('minum')) return createProductSvg(['#0284c7', '#075985'], ICONS.defaultMinuman, kategori);
  if (kat.includes('rumah')) return createProductSvg(['#2563eb', '#1e3a8a'], ICONS.deterjen, kategori);
  if (kat.includes('bumbu')) return createProductSvg(['#065f46', '#064e3b'], ICONS.kecap, kategori);
  return createProductSvg(['#475569', '#1e293b'], ICONS.defaultSembako, kategori || 'Produk Warung');
};
