import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.join(__dirname, 'src', 'assets', 'aircraft');

// Ensure directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const aircraft = [
    { name: 'cessna-152', label: 'Cessna 152', color: '#e74c3c' },
    { name: 'cessna-172', label: 'Cessna 172', color: '#3498db' },
    { name: 'cessna-182', label: 'Cessna 182', color: '#2ecc71' },
    { name: 'cessna-310', label: 'Cessna 310R', color: '#9b59b6' },
    { name: 'piper-pa18', label: 'Super Cub', color: '#f1c40f' },
    { name: 'piper-pa28', label: 'Cherokee', color: '#e67e22' },
    { name: 'piper-arrow', label: 'Piper Arrow', color: '#d35400' },
    { name: 'piper-pa44', label: 'Seminole', color: '#16a085' },
    { name: 'beechcraft-duke', label: 'Beechcraft Duke', color: '#2c3e50' },
    { name: 'beechcraft-bonanza', label: 'Bonanza A36', color: '#8e44ad' },
    { name: 'beechcraft-baron-58', label: 'Baron 58', color: '#2980b9' },
    { name: 'diamond-da40', label: 'Diamond DA40', color: '#95a5a6' },
    { name: 'maule-m7', label: 'Maule M-7', color: '#27ae60' }
];

aircraft.forEach(plane => {
    const svgContent = `
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${plane.color}" fill-opacity="0.1"/>
  <rect width="100%" height="100%" stroke="${plane.color}" stroke-width="10" fill="none"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="${plane.color}" text-anchor="middle" dominant-baseline="middle">
    ${plane.label}
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="20" fill="#666" text-anchor="middle">
    Image Placeholder
  </text>
  <!-- Simple aircraft icon -->
  <path d="M150 150 L450 150 L450 160 L320 160 L320 250 L380 250 L380 260 L220 260 L220 250 L280 250 L280 160 L150 160 Z" fill="${plane.color}" opacity="0.2" transform="translate(0, -80)"/>
</svg>`;

    const filePath = path.join(targetDir, `${plane.name}.svg`);
    fs.writeFileSync(filePath, svgContent);
    console.log(`Created ${plane.name}.svg`);
});
