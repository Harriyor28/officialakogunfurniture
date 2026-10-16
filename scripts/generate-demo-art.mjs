// Generates original, stylized 3D furniture concept scenes for demonstration
// content. These are NOT photographs — replace them with real project
// photography as soon as it is available (Admin → Portfolio → Images).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "demo");
mkdirSync(outDir, { recursive: true });

const scenes = [
  { file: "wardrobe-1", label: "Fitted wardrobe", hue1: "#70452D", hue2: "#2A1A11", accent: "#C6A66B" },
  { file: "wardrobe-2", label: "Sliding wardrobe", hue1: "#5C3A26", hue2: "#1C120C", accent: "#A5A5AA" },
  { file: "kitchen-1", label: "Kitchen cabinetry", hue1: "#6B4A2F", hue2: "#221610", accent: "#C6A66B" },
  { file: "bedroom-1", label: "Bedroom set", hue1: "#4A3223", hue2: "#171719", accent: "#C6A66B" },
  { file: "living-1", label: "Living room", hue1: "#3D2C21", hue2: "#0B0B0D", accent: "#C6A66B" },
  { file: "office-1", label: "Office furniture", hue1: "#55402C", hue2: "#141416", accent: "#A5A5AA" },
  { file: "school-1", label: "School furniture", hue1: "#4E3B29", hue2: "#171719", accent: "#C6A66B" },
  { file: "doors-1", label: "Doors & fittings", hue1: "#63412A", hue2: "#1A100A", accent: "#C6A66B" },
  { file: "custom-1", label: "Custom piece", hue1: "#5F3D28", hue2: "#101012", accent: "#C6A66B" },
  { file: "hero-1", label: "", hue1: "#3A281C", hue2: "#0B0B0D", accent: "#C6A66B" },
  { file: "workshop-1", label: "Workshop", hue1: "#4A3324", hue2: "#0B0B0D", accent: "#A5A5AA" },
  { file: "detail-1", label: "Craft detail", hue1: "#70452D", hue2: "#171719", accent: "#C6A66B" },
];

function svg({ file, label, hue1, hue2, accent }, index) {
  const angle = 25 + index * 7;
  const safeLabel = label.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const furniture = {
    "wardrobe-1": `<ellipse cx="610" cy="756" rx="340" ry="35" fill="#090909" opacity=".42"/>
      <path d="M365 230 438 185h425l-72 45z" fill="url(#wood-light)"/><path d="M790 230l73-45v475l-73 46z" fill="url(#wood-dark)"/>
      <rect x="365" y="230" width="425" height="475" rx="3" fill="url(#wood)" stroke="${accent}" stroke-opacity=".48" stroke-width="3"/>
      <path d="M382 248h190v438H382zm202 0h190v438H584z" fill="url(#wood-light)" opacity=".22" stroke="${accent}" stroke-opacity=".5" stroke-width="2"/>
      <path d="M572 248v438m12-438v438" stroke="#1b100a" stroke-width="5" opacity=".6"/><rect x="550" y="430" width="8" height="58" rx="4" fill="${accent}"/><rect x="596" y="430" width="8" height="58" rx="4" fill="${accent}"/>
      <path d="M365 705h425v19H365z" fill="#2c1b12"/><path d="M382 723v23m391-23v23" stroke="#17100c" stroke-width="12"/>`,
    "wardrobe-2": `<ellipse cx="620" cy="758" rx="360" ry="32" fill="#090909" opacity=".45"/>
      <path d="M300 225 390 175h495l-90 50z" fill="url(#wood-light)"/><path d="M795 225l90-50v495l-90 48z" fill="url(#wood-dark)"/>
      <rect x="300" y="225" width="495" height="495" fill="url(#wood)" stroke="${accent}" stroke-opacity=".45" stroke-width="3"/>
      <rect x="318" y="243" width="221" height="459" fill="#49301e" stroke="${accent}" stroke-opacity=".35"/><rect x="548" y="243" width="229" height="459" fill="#332116" stroke="${accent}" stroke-opacity=".35"/>
      <path d="M325 250v443m10-443v443m10-443v443" stroke="${accent}" stroke-opacity=".16" stroke-width="2"/><path d="M548 243v459" stroke="#0d0b09" stroke-width="5"/>
      <rect x="526" y="420" width="7" height="65" rx="4" fill="${accent}"/><rect x="558" y="420" width="7" height="65" rx="4" fill="${accent}"/>
      <path d="M300 720h495v19H300z" fill="#21150e"/>`,
    "kitchen-1": `<path d="M205 650h790v64H205z" fill="#271a12"/><path d="M205 650l95-38h790l-95 38z" fill="#d1b88c"/>
      <path d="M300 315h670v240H300z" fill="url(#wood)" stroke="${accent}" stroke-opacity=".38" stroke-width="3"/>
      <path d="M300 315 365 280h670l-65 35z" fill="url(#wood-light)"/><path d="M970 315l65-35v240l-65 35z" fill="url(#wood-dark)"/>
      <path d="M315 330h205v205H315zm220 0h205v205H535zm220 0h200v205H755z" fill="#533723" stroke="${accent}" stroke-opacity=".42" stroke-width="2"/>
      <path d="M420 330v205m220-205v205m220-205v205" stroke="${accent}" stroke-opacity=".22" stroke-width="2"/><path d="M315 555h655v95H315z" fill="#392719"/>
      <path d="M235 610l70-34h390l-70 34z" fill="#decda8"/><path d="M235 610h390v133H235z" fill="url(#wood)"/><path d="M625 610l70-34v133l-70 34z" fill="url(#wood-dark)"/>
      <rect x="330" y="630" width="130" height="95" fill="#17191a" stroke="${accent}" stroke-opacity=".5" stroke-width="3"/><rect x="365" y="647" width="60" height="5" fill="${accent}" opacity=".7"/>
      <path d="M480 624v103m25-103v103" stroke="${accent}" stroke-opacity=".48" stroke-width="3"/><path d="M310 720v24m300-24v24" stroke="#180f0a" stroke-width="12"/>
      <path d="M360 235h245v68H360zm260 0h245v68H620z" fill="url(#wood-light)" stroke="${accent}" stroke-opacity=".4" stroke-width="2"/><path d="M600 235v68m260-68v68" stroke="#23170f" stroke-width="5"/>`,
    "bedroom-1": `<ellipse cx="615" cy="754" rx="420" ry="38" fill="#080808" opacity=".45"/>
      <path d="M250 565 365 485h520l125 82-128 145H368z" fill="#302014"/><path d="M250 565l118 52v176L250 730z" fill="#4a3020"/>
      <path d="M368 617h514l128-50v163L882 780H368z" fill="url(#wood)"/><path d="M368 617 490 520h400l-8 97z" fill="#e2d5bd"/>
      <path d="M490 520h400l-8 97H368z" fill="#f0e7d8"/><path d="M515 532h157l-10 65H495zm181 0h160l-7 65H686z" fill="#b8a58b"/>
      <path d="M250 565l118 52 122-97 125-35 140 37 135 45-8 50H368z" fill="#c7b69e" opacity=".65"/>
      <path d="M368 780v-36m514 36v-38" stroke="#1a100b" stroke-width="18"/><path d="M305 490V350h180v160" fill="url(#wood)" stroke="${accent}" stroke-opacity=".3" stroke-width="2"/>
      <path d="M326 372h138v93H326z" fill="#382518"/><path d="M520 395h70v8h-70m0 22h70v8h-70m0 22h70v8h-70" fill="${accent}" opacity=".5"/>
      <path d="M800 490v-170h145v206z" fill="#392619"/><path d="M815 335h115v62H815zm0 76h115v76H815z" fill="url(#wood-light)" opacity=".55"/>`,
    "living-1": `<ellipse cx="600" cy="748" rx="430" ry="38" fill="#080808" opacity=".42"/>
      <path d="M270 480 345 420h490l93 62-35 188-590-6z" fill="#74563f"/><path d="M270 480l75-60v199l-76 52z" fill="#513924"/>
      <path d="M363 455h210v142H363z" fill="#aa8665"/><path d="M581 455h225v142H581z" fill="#967354"/>
      <path d="M357 605h490l-22 100H385z" fill="#593e2c"/><path d="M385 704v32m436-32v32" stroke="#23160e" stroke-width="16"/>
      <path d="M382 467l35-65h125l28 65z" fill="#d4c1a7"/><path d="M601 467l28-65h137l32 65z" fill="#d8c5aa"/>
      <path d="M465 645 505 555h210l55 90-26 18H481z" fill="#c6a66b"/><path d="M505 555l44-32h210l-44 32z" fill="#e4d0ac"/>
      <path d="M555 663v53m170-53v53" stroke="#2c1c11" stroke-width="13"/><path d="M220 393h760" stroke="${accent}" stroke-opacity=".26" stroke-width="4"/>
      <path d="M940 365h35v142h-35z" fill="#2e2015"/><path d="M916 365h82l-17-54h-48z" fill="${accent}" opacity=".7"/>`,
    "office-1": `<ellipse cx="620" cy="754" rx="360" ry="31" fill="#070707" opacity=".45"/>
      <path d="M315 405h565l85 49H400z" fill="#c09b6c"/><path d="M400 454h565v42H400z" fill="url(#wood)"/><path d="M400 496h565v176H400z" fill="#3f2c1d"/>
      <path d="M420 512h245v142H420zm270 0h255v142H690z" fill="#4f3724" stroke="${accent}" stroke-opacity=".33" stroke-width="2"/>
      <path d="M545 518v132m270-132v132" stroke="${accent}" stroke-opacity=".35" stroke-width="3"/><path d="M430 672v64m502-64v64" stroke="#1a110b" stroke-width="20"/>
      <path d="M500 399V225h280v172z" fill="#24282a" stroke="${accent}" stroke-opacity=".4" stroke-width="3"/><path d="M520 245h240v132H520z" fill="#31464b"/>
      <path d="M640 397v32m-58 0h116" stroke="#aaa08f" stroke-width="10"/><path d="M355 580h-75v95h75" fill="#493221"/>
      <path d="M310 675v40m-44-40h88" stroke="#1c1712" stroke-width="13"/>`,
    "school-1": `<ellipse cx="605" cy="756" rx="440" ry="32" fill="#080808" opacity=".42"/>
      <path d="M210 395h300l55 35H265z" fill="#c2a071"/><path d="M265 430h300v28H265z" fill="url(#wood)"/><path d="M280 458v138m270-138v138" stroke="#3a2819" stroke-width="17"/>
      <path d="M610 330h300l55 35H665z" fill="#c2a071"/><path d="M665 365h300v28H665z" fill="url(#wood)"/><path d="M680 393v138m270-138v138" stroke="#3a2819" stroke-width="17"/>
      <path d="M345 605h190l30 20H375z" fill="#a98459"/><path d="M375 625h190v20H375z" fill="#4a3321"/><path d="M389 645v75m160-75v75" stroke="#302116" stroke-width="14"/>
      <path d="M715 540h190l30 20H745z" fill="#a98459"/><path d="M745 560h190v20H745z" fill="#4a3321"/><path d="M759 580v75m160-75v75" stroke="#302116" stroke-width="14"/>
      <path d="M210 280h790v6H210zm0 16h790v3H210z" fill="${accent}" opacity=".22"/>`,
    "doors-1": `<ellipse cx="610" cy="760" rx="300" ry="30" fill="#080808" opacity=".42"/>
      <path d="M355 195 450 145h420l-90 50z" fill="url(#wood-light)"/><path d="M780 195l90-50v525l-90 50z" fill="url(#wood-dark)"/>
      <path d="M355 195h425v525H355z" fill="#332216" stroke="${accent}" stroke-opacity=".6" stroke-width="4"/>
      <path d="M382 220h371v218H382zm0 245h371v230H382z" fill="url(#wood)" stroke="${accent}" stroke-opacity=".32" stroke-width="3"/>
      <path d="M397 235h341v185H397zm0 230h341v200H397z" fill="none" stroke="${accent}" stroke-opacity=".28" stroke-width="2"/>
      <circle cx="718" cy="465" r="13" fill="${accent}"/><path d="M800 285h14m-14 120h14m-14 122h14" stroke="#d5c29a" stroke-width="8"/>
      <path d="M335 720h470v18H335z" fill="#1c120c"/>`,
    "custom-1": `<ellipse cx="610" cy="750" rx="310" ry="35" fill="#080808" opacity=".44"/>
      <path d="M410 390q0-100 110-100h150q100 0 100 100v170H410z" fill="#6f5037" stroke="${accent}" stroke-opacity=".5" stroke-width="3"/>
      <path d="M445 390q0-62 74-62h154q63 0 63 62v98H445z" fill="#b49570"/><path d="M410 520h360v95H410z" fill="#806144"/>
      <path d="M390 465h70v155h-70zm330 0h70v155h-70z" fill="#4a3321"/><path d="M420 615v88m340-88v88" stroke="#24170e" stroke-width="20"/>
      <path d="M475 391q0-34 38-34t38 34v55h-76zm150 0q0-34 38-34t38 34v55h-76z" fill="#d5c3aa"/>
      <path d="M508 425v55m150-55v55" stroke="${accent}" stroke-width="2" opacity=".8"/><path d="M365 700h425" stroke="${accent}" stroke-width="3" opacity=".35"/>`,
    "workshop-1": `<ellipse cx="600" cy="752" rx="410" ry="35" fill="#070707" opacity=".45"/>
      <path d="M205 425h730l95 54H300z" fill="#c8a477"/><path d="M300 479h730v58H300z" fill="url(#wood)"/><path d="M335 537h78v168h-78zm580 0h78v168h-78z" fill="#3c2819"/>
      <path d="M360 555h535v105H360z" fill="#33251a" stroke="${accent}" stroke-opacity=".35" stroke-width="2"/>
      <path d="M430 403v-90h160v90m60 0v-140h190v140" fill="none" stroke="#392719" stroke-width="17"/>
      <path d="M447 328h122m99-40h154m-154 42h154m-154 42h154" stroke="${accent}" stroke-opacity=".46" stroke-width="5"/>
      <path d="M490 395l50-82 50 82zm250-5 22-70 22 70zm90 0 22-70 22 70z" fill="#a98a61"/>
      <path d="M690 599h90v46h-90z" fill="#171719" stroke="${accent}" stroke-opacity=".45" stroke-width="3"/><path d="M705 614h60" stroke="#d8c08e" stroke-width="3"/>`,
    "hero-1": `<ellipse cx="620" cy="754" rx="420" ry="32" fill="#070707" opacity=".45"/>
      <path d="M210 180h780v445H210z" fill="#24180f"/><path d="M240 180v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445m38-445v445" stroke="${accent}" stroke-opacity=".13" stroke-width="5"/>
      <path d="M350 440h500l90 48H440z" fill="#d3b98b"/><path d="M440 488h500v170H440z" fill="url(#wood)"/><path d="M440 658v55m470-55v55" stroke="#23160e" stroke-width="16"/>
      <path d="M480 510h200v120H480zm220 0h220v120H700z" fill="#382518" stroke="${accent}" stroke-opacity=".32" stroke-width="2"/>
      <path d="M540 510v120m220-120v120" stroke="${accent}" stroke-opacity=".4" stroke-width="3"/><path d="M210 715h780" stroke="${accent}" stroke-opacity=".22" stroke-width="4"/>`,
    "detail-1": `<ellipse cx="610" cy="750" rx="410" ry="38" fill="#080808" opacity=".42"/>
      <path d="M220 405h620l130 76H350z" fill="#d6ba8e"/><path d="M350 481h620v135H350z" fill="url(#wood)"/><path d="M350 616v92m570-92v92" stroke="#24170e" stroke-width="22"/>
      <path d="M400 433h420" stroke="#f4e4c4" stroke-width="5" opacity=".72"/><path d="M390 508h525" stroke="${accent}" stroke-opacity=".25" stroke-width="3"/>
      <path d="M480 374l110-54 238 7-108 54z" fill="#7a5030"/><path d="M480 374v26l240 6v-25z" fill="#51321e"/>
      <path d="M505 330l105-50 238 6-107 51z" fill="#b78653"/><path d="M505 330v25l236 6v-24z" fill="#70452d"/>
      <path d="M545 285l90-44 195 6-92 44z" fill="#dfc297"/><path d="M545 285v22l193 5v-21z" fill="#a77c4f"/>
      <path d="M260 240h170v6H260zm0 18h170v3H260z" fill="${accent}" opacity=".4"/>`,
  }[file] ?? `<path d="M300 260h560v430H300z" fill="url(#wood)" stroke="${accent}" stroke-opacity=".4" stroke-width="3"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="${safeLabel || "Furniture concept render"}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${hue1}"/>
      <stop offset="55%" stop-color="${hue2}"/>
      <stop offset="100%" stop-color="#0B0B0D"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${hue1}"/>
      <stop offset="100%" stop-color="${hue2}"/>
    </linearGradient>
    <linearGradient id="wood-light" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity=".8"/>
      <stop offset="100%" stop-color="${hue1}"/>
    </linearGradient>
    <linearGradient id="wood-dark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${hue2}"/>
      <stop offset="100%" stop-color="#0b0b0d"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#33271f"/><stop offset="1" stop-color="#171719"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#241b15"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur in="SourceAlpha" stdDeviation="16"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)"/>
  <path d="M0 0h1200v628L0 700z" fill="url(#wall)" opacity=".72"/>
  <path d="M0 700 1200 628v272H0z" fill="url(#floor)"/>
  <path d="M0 700 1200 628" stroke="${accent}" stroke-opacity=".22" stroke-width="3"/>
  <path d="M80 900 440 675m220 225L650 665m470 235L820 653" stroke="#d7bd92" stroke-opacity=".08" stroke-width="2"/>
  <path d="M140 120h920" stroke="${accent}" stroke-opacity=".2" stroke-width="2"/>
  <g filter="url(#shadow)">${furniture}</g>
  <path d="M0 0h1200v900H0z" fill="url(#bg)" opacity=".1"/>
  ${label ? `<text x="72" y="818" font-family="Georgia, 'Times New Roman', serif" font-size="42" fill="${accent}" opacity=".95">${safeLabel}</text>
  <text x="74" y="858" font-family="Helvetica, Arial, sans-serif" font-size="17" fill="#E5DED1" opacity=".7">CONCEPT RENDER / AKOGUN FURNITURE</text>` : ""}
</svg>
`;
}

for (const [i, scene] of scenes.entries()) {
  writeFileSync(join(outDir, `${scene.file}.svg`), svg(scene, i));
  console.log(`wrote ${scene.file}.svg`);
}
