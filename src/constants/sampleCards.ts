// High quality test card SVG Data URIs for instant testing of front and back alignment

export const SAMPLE_FRONT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  
  <!-- Card Background -->
  <rect width="800" height="500" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
  
  <!-- Security Microtext pattern line -->
  <rect x="0" y="0" width="800" height="110" rx="28" fill="url(#headerGrad)"/>
  <rect x="0" y="80" width="800" height="30" fill="#0284c7"/>
  <rect x="0" y="106" width="800" height="6" fill="url(#gold)"/>
  
  <!-- Header Text -->
  <text x="40" y="48" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">AAZMI ID SOLUTIONS</text>
  <text x="40" y="74" font-family="Arial, sans-serif" font-size="16" fill="#93c5fd">DIGITAL SECURE IDENTITY CREDENTIAL • TEST CARD</text>
  <text x="760" y="55" font-family="monospace" font-weight="bold" font-size="22" fill="#fbbf24" text-anchor="end">FRONT SIDE</text>

  <!-- Smart Chip Simulation -->
  <rect x="50" y="145" width="90" height="70" rx="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5"/>
  <line x1="50" y1="180" x2="140" y2="180" stroke="#ca8a04" stroke-width="2"/>
  <line x1="95" y1="145" x2="95" y2="215" stroke="#ca8a04" stroke-width="2"/>
  <circle cx="95" cy="180" r="14" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>

  <!-- Photo Box -->
  <rect x="50" y="240" width="180" height="220" rx="12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/>
  <circle cx="140" cy="315" r="45" fill="#cbd5e1"/>
  <path d="M 80 430 Q 140 375 200 430 Z" fill="#94a3b8"/>
  <text x="140" y="450" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748b" text-anchor="middle">SPECIMEN PHOTO</text>

  <!-- Details -->
  <text x="260" y="170" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#64748b">CARDHOLDER NAME</text>
  <text x="260" y="200" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#0f172a">MOHAMMAD AAZMI</text>

  <text x="260" y="245" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#64748b">IDENTIFICATION NO.</text>
  <text x="260" y="275" font-family="monospace" font-size="24" font-weight="bold" fill="#0284c7" letter-spacing="3">8492-3819-0012</text>

  <text x="260" y="325" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#64748b">DESIGNATION / ROLE</text>
  <text x="260" y="350" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#334155">Chief Print Operator</text>

  <text x="260" y="395" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#64748b">ISSUE DATE</text>
  <text x="260" y="420" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#334155">01/2026</text>

  <text x="440" y="395" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#64748b">VALIDITY</text>
  <text x="440" y="420" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#16a34a">PERMANENT</text>

  <!-- Alignment Corner Marks -->
  <circle cx="20" cy="20" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <line x1="10" y1="20" x2="30" y2="20" stroke="#ef4444" stroke-width="2"/>
  <line x1="20" y1="10" x2="20" y2="30" stroke="#ef4444" stroke-width="2"/>

  <circle cx="780" cy="20" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <line x1="770" y1="20" x2="790" y2="20" stroke="#ef4444" stroke-width="2"/>
  <line x1="780" y1="10" x2="780" y2="30" stroke="#ef4444" stroke-width="2"/>

  <circle cx="20" cy="480" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <circle cx="780" cy="480" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>

  <!-- Barcode -->
  <g transform="translate(580, 280)">
    <rect x="0" y="0" width="180" height="85" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
    <!-- barcode bars -->
    <rect x="15" y="10" width="4" height="50" fill="#000"/>
    <rect x="23" y="10" width="8" height="50" fill="#000"/>
    <rect x="35" y="10" width="4" height="50" fill="#000"/>
    <rect x="43" y="10" width="12" height="50" fill="#000"/>
    <rect x="60" y="10" width="6" height="50" fill="#000"/>
    <rect x="70" y="10" width="10" height="50" fill="#000"/>
    <rect x="85" y="10" width="4" height="50" fill="#000"/>
    <rect x="94" y="10" width="8" height="50" fill="#000"/>
    <rect x="106" y="10" width="4" height="50" fill="#000"/>
    <rect x="114" y="10" width="14" height="50" fill="#000"/>
    <rect x="133" y="10" width="6" height="50" fill="#000"/>
    <rect x="144" y="10" width="4" height="50" fill="#000"/>
    <rect x="153" y="10" width="10" height="50" fill="#000"/>
    <text x="90" y="74" font-family="monospace" font-size="12" text-anchor="middle">AAZ-84923819</text>
  </g>

  <!-- Watermark / Footer -->
  <text x="760" y="475" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#94a3b8" text-anchor="end">80 mm × 50 mm (8:5 RATIO)</text>
</svg>
`)}`;

export const SAMPLE_BACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="backHeader" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <!-- Card Background -->
  <rect width="800" height="500" rx="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
  
  <!-- Magnetic Stripe Simulation (Optional aesthetic) -->
  <rect x="0" y="35" width="800" height="75" fill="#1e293b"/>
  <rect x="0" y="110" width="800" height="12" fill="#e2e8f0"/>

  <text x="40" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#64748b">CARD CREDENTIAL SPECIFICATION</text>
  <text x="760" y="24" font-family="monospace" font-weight="bold" font-size="18" fill="#ef4444" text-anchor="end">BACK SIDE</text>

  <!-- Signature Strip -->
  <rect x="40" y="140" width="480" height="48" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="50" y="168" font-family="'Brush Script MT', cursive, sans-serif" font-size="26" fill="#1e3a8a">Authorized Signature</text>
  <rect x="525" y="140" width="120" height="48" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="585" y="170" font-family="monospace" font-weight="bold" font-size="20" fill="#0f172a" text-anchor="middle">CVV: 891</text>

  <!-- Address & Terms Details -->
  <text x="40" y="225" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">PERMANENT RESIDENCE ADDRESS:</text>
  <text x="40" y="250" font-family="Arial, sans-serif" font-size="15" fill="#334155">Plot No. 42, Aazmi Print Complex, Industrial Area,</text>
  <text x="40" y="272" font-family="Arial, sans-serif" font-size="15" fill="#334155">Near Civil Lines, New Delhi - 110001, India.</text>
  <text x="40" y="294" font-family="Arial, sans-serif" font-size="15" fill="#334155">Emergency Helpline: +91 98765 43210</text>

  <text x="40" y="340" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#64748b">TERMS &amp; CONDITIONS</text>
  <text x="40" y="360" font-family="Arial, sans-serif" font-size="12" fill="#64748b">1. This card is non-transferable and remains property of the issuing authority.</text>
  <text x="40" y="378" font-family="Arial, sans-serif" font-size="12" fill="#64748b">2. If found, please drop into the nearest post box or return to address above.</text>
  <text x="40" y="396" font-family="Arial, sans-serif" font-size="12" fill="#64748b">3. Canon Dual-Side Physical Alignment Verified (Zero Skew System).</text>

  <!-- QR Code Mock -->
  <g transform="translate(620, 280)">
    <rect x="0" y="0" width="140" height="140" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <!-- QR pattern -->
    <rect x="15" y="15" width="35" height="35" fill="#0f172a"/>
    <rect x="22" y="22" width="21" height="21" fill="#fff"/>
    <rect x="27" y="27" width="11" height="11" fill="#0f172a"/>

    <rect x="90" y="15" width="35" height="35" fill="#0f172a"/>
    <rect x="97" y="22" width="21" height="21" fill="#fff"/>
    <rect x="102" y="27" width="11" height="11" fill="#0f172a"/>

    <rect x="15" y="90" width="35" height="35" fill="#0f172a"/>
    <rect x="22" y="97" width="21" height="21" fill="#fff"/>
    <rect x="27" y="102" width="11" height="11" fill="#0f172a"/>

    <rect x="60" y="20" width="18" height="18" fill="#0f172a"/>
    <rect x="65" y="55" width="25" height="25" fill="#0f172a"/>
    <rect x="100" y="65" width="15" height="15" fill="#0f172a"/>
    <rect x="60" y="95" width="20" height="20" fill="#0f172a"/>
    <rect x="95" y="105" width="20" height="18" fill="#0f172a"/>
  </g>

  <!-- Alignment Crosshairs for Back -->
  <circle cx="20" cy="20" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <line x1="10" y1="20" x2="30" y2="20" stroke="#ef4444" stroke-width="2"/>
  <line x1="20" y1="10" x2="20" y2="30" stroke="#ef4444" stroke-width="2"/>

  <circle cx="780" cy="20" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <line x1="770" y1="20" x2="790" y2="20" stroke="#ef4444" stroke-width="2"/>
  <line x1="780" y1="10" x2="780" y2="30" stroke="#ef4444" stroke-width="2"/>

  <circle cx="20" cy="480" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>
  <circle cx="780" cy="480" r="10" fill="none" stroke="#ef4444" stroke-width="2"/>

  <!-- Footer Microtext -->
  <text x="40" y="475" font-family="monospace" font-size="12" fill="#94a3b8">MATCHED MASTER COORDINATE SYSTEM: 80 × 50 mm (CANON RE-ENTRY COMPLIANT)</text>
</svg>
`)}`;
