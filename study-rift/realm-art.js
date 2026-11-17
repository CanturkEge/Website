const palettes = {
  oop: ["#b699ec", "#20182e", "#71608d"],
  database: ["#7dbbdc", "#0f2534", "#3d7293"],
  os: ["#e5a17d", "#30201b", "#90604d"],
  logic: ["#81d0b2", "#102921", "#4d8b77"],
  simulation: ["#e0c48b", "#292236", "#8b7ca1"],
  market: ["#e8bd78", "#302319", "#a87943"],
};
const scenes = {
  oop: (p) =>
    `<path d="M555 510V240a145 145 0 0 1 290 0v270" fill="#090c14" stroke="${p}" stroke-width="9"/><path d="M585 510V245a115 115 0 0 1 230 0v265" fill="url(#ID-glow)" stroke="${p}" stroke-opacity=".4" stroke-width="2"/><path d="M480 510h440M510 530h380M540 550h320" stroke="${p}" stroke-opacity=".25" stroke-width="14"/>${[
      [390, 290, -12],
      [970, 260, 15],
      [450, 155, 12],
      [910, 120, -16],
    ]
      .map(
        ([x, y, r]) =>
          `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-40-26Q-15-40 0-25Q25-38 47-24v65Q20 28 0 42Q-20 29-40 40Z" fill="#252134" stroke="${p}" stroke-width="2"/><path d="M0-25v67M-29-14l19-5m-19 20 19-5m22-11 22 5m-22 10 22 5" fill="none" stroke="${p}" stroke-opacity=".6"/></g>`,
      )
      .join(
        "",
      )}<path d="m700 185 34 59-34 59-34-59Z" fill="none" stroke="${p}" stroke-width="2"/><circle cx="700" cy="244" r="12" fill="${p}"/>`,
  database: (p) =>
    `<path d="M300 450H1100M360 470H1040" stroke="${p}" stroke-opacity=".15" stroke-width="3"/>${[
      [490, 340, 100],
      [700, 275, 165],
      [910, 340, 100],
    ]
      .map(
        ([x, y, h]) =>
          `<g><path d="M${x - 75} ${y - h}v${h}c0 38 150 38 150 0V${y - h}" fill="#142c3c" stroke="${p}" stroke-opacity=".7" stroke-width="2"/><ellipse cx="${x}" cy="${y - h}" rx="75" ry="25" fill="#244a61" stroke="${p}" stroke-width="2"/>${[0.25, 0.5, 0.75, 1].map((v) => `<path d="M${x - 75} ${y - h + h * v}c0 38 150 38 150 0" fill="none" stroke="${p}" stroke-opacity=".45"/>`).join("")}<circle cx="${x + 40}" cy="${y - 8}" r="4" fill="${p}"/></g>`,
      )
      .join(
        "",
      )}<path d="M490 385v55h420v-55M700 350v125M590 190h70m80 0h70" fill="none" stroke="${p}" stroke-width="2" stroke-dasharray="6 8"/><g fill="${p}"><circle cx="490" cy="440" r="6"/><circle cx="910" cy="440" r="6"/><circle cx="700" cy="475" r="9"/></g>`,
  os: (p) =>
    `<path d="M370 480V260l50-40v-80h95v90l45 30v220M840 480V260l45-30v-90h95v80l50 40v220" fill="#2d2421" stroke="${p}" stroke-opacity=".4" stroke-width="2"/><path d="M545 480V195l155-70 155 70v285" fill="#1c1719" stroke="${p}" stroke-opacity=".65" stroke-width="3"/><rect x="620" y="245" width="160" height="160" rx="16" fill="#392b26" stroke="${p}" stroke-width="3"/><rect x="648" y="273" width="104" height="104" rx="5" fill="url(#ID-glow)" stroke="${p}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((n) => `<path d="M${640 + n * 24} 222v23m0 160v23M597 ${266 + n * 24}h23m160 0h23" stroke="${p}" stroke-width="4" stroke-opacity=".65"/>`).join("")}<path d="M400 500h600M445 518h510" stroke="${p}" stroke-opacity=".15" stroke-width="12"/><path d="m688 300-19 31h28l-6 25 34-40h-27l8-16" fill="${p}"/>`,
  logic: (p) =>
    `<path d="M380 480h640M420 505h560" stroke="${p}" stroke-opacity=".2" stroke-width="12"/><path d="M500 460V180l200-90 200 90v280" fill="#142820" stroke="${p}" stroke-opacity=".35" stroke-width="2"/><path d="M625 225h70a70 70 0 0 1 0 140h-70Z" fill="url(#ID-glow)" stroke="${p}" stroke-width="4"/><path d="M425 235h100v25h100M425 340h110v-10h90M765 295h110v-60h110M700 365v60h165" fill="none" stroke="${p}" stroke-opacity=".8" stroke-width="3"/>${[
      [425, 235],
      [425, 340],
      [985, 235],
      [865, 425],
    ]
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="9" fill="#19382c" stroke="${p}" stroke-width="3"/>`,
      )
      .join(
        "",
      )}<path d="M560 165h35m210 0h35M530 400h40m260 0h40" stroke="${p}" stroke-opacity=".4" stroke-width="2"/><text x="694" y="310" text-anchor="middle" fill="${p}" font-family="monospace" font-size="37">&amp;</text>`,
  simulation: (p) =>
    `<circle cx="760" cy="280" r="137" fill="url(#ID-glow)"/><circle cx="760" cy="280" r="88" fill="#28213c" stroke="${p}" stroke-width="2"/><ellipse cx="760" cy="280" rx="245" ry="74" transform="rotate(-24 760 280)" fill="none" stroke="${p}" stroke-opacity=".55" stroke-width="2"/><ellipse cx="760" cy="280" rx="184" ry="145" transform="rotate(42 760 280)" fill="none" stroke="${p}" stroke-opacity=".2"/><circle cx="545" cy="377" r="17" fill="${p}"/><path d="M420 470c70 0 75-230 130-230s75 230 130 230 80-150 130-150 70 150 180 150" stroke="${p}" stroke-width="2" stroke-opacity=".55" fill="none"/><path d="M420 470h660" stroke="${p}" stroke-opacity=".25"/><path d="m753 237 39 25v45l-39 23-39-23v-45Z" fill="#332a43" stroke="${p}"/><g fill="${p}"><circle cx="739" cy="267" r="4"/><circle cx="768" cy="302" r="4"/><circle cx="755" cy="282" r="4"/></g>`,
  market: (p) =>
    `<path d="M380 470V225h640v245" fill="#251d19" stroke="${p}" stroke-opacity=".45" stroke-width="2"/><path d="m350 225 70-95h560l70 95Z" fill="#433023" stroke="${p}" stroke-opacity=".7" stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6].map((n) => `<path d="M${385 + n * 90} 225v28q45 38 90 0v-28" fill="${n % 2 ? "#684635" : "#342822"}" stroke="${p}" stroke-opacity=".2"/>`).join("")}<rect x="415" y="370" width="565" height="110" rx="4" fill="#35291f" stroke="${p}" stroke-opacity=".5"/>${[
      [500, 340, 0],
      [555, 338, 1],
      [615, 340, 0],
    ]
      .map(
        ([x, y, k]) =>
          `<path d="M${x - 8} ${y - 40}h16v13l20 35q5 12-10 12h-36q-15 0-10-12l20-35Z" fill="${k ? "#64728b" : "#a16472"}" stroke="${p}" stroke-width="2"/>`,
      )
      .join(
        "",
      )}<path d="m810 325 50-65 12 14-49 65-17 10-11-10Z" fill="#aaa3a0" stroke="${p}"/><path d="m785 330 35 30m-20-15-14 17" stroke="${p}" stroke-width="5"/><path d="M704 145v70m-25 0h50v65h-50Z" fill="#9d6f3b" stroke="${p}" stroke-width="2"/><circle cx="704" cy="250" r="12" fill="${p}"/>`,
};
export function realmArt(courseId, id = "world") {
  const [accent, dark, mid] = palettes[courseId] || palettes.oop,
    prefix = ("realm-" + id).replace(/[^a-z0-9_-]/gi, "");
  const scene = (scenes[courseId] || scenes.oop)(accent).replaceAll(
    "ID-",
    prefix + "-",
  );
  const stars = Array.from(
    { length: 42 },
    (_, i) =>
      `<circle cx="${(i * 173 + 37) % 1190}" cy="${(i * 79 + 41) % 480}" r="${i % 7 === 0 ? 2 : 1}" fill="${accent}" opacity="${i % 3 === 0 ? 0.45 : 0.15}"/>`,
  ).join("");
  return `<svg class="realm-art" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${{ oop: "Işık saçan kitaplar ve rün kapısı", database: "Bağlantılarla birleşen kayıt kuleleri", os: "Çekirdek işlemcili kadim demirhane", logic: "Mantık kapılarıyla örülü devre tapınağı", simulation: "Yörüngeler ve olasılık eğrileriyle gözlemevi", market: "İksirler, ekipmanlar ve fenerlerle gezgin pazarı" }[courseId] || "Ders dünyası"}"><defs><radialGradient id="${prefix}-bg"><stop stop-color="${mid}" stop-opacity=".42"/><stop offset="1" stop-color="${dark}"/></radialGradient><radialGradient id="${prefix}-glow"><stop stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity=".02"/></radialGradient><linearGradient id="${prefix}-fade" x2="0" y2="1"><stop stop-color="#070a11" stop-opacity="0"/><stop offset="1" stop-color="#070a11" stop-opacity=".85"/></linearGradient></defs><rect width="1200" height="600" fill="${dark}"/><rect width="1200" height="600" fill="url(#${prefix}-bg)"/>${stars}<path d="M50 540h1100M200 580 500 390m500 190L800 390" stroke="${accent}" stroke-opacity=".06" fill="none"/><g class="realm-scene">${scene}</g><rect y="440" width="1200" height="160" fill="url(#${prefix}-fade)"/></svg>`;
}
