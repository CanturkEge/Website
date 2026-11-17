const paths = {
  sword: "m14.5 3 6.5 0 0 6.5-9 9-6.5-6.5 9-9ZM4 14l6 6m-3-3-4 4m12-14 2 2",
  wand: "m4 20 12-12 4 4L8 24M15 2v3m5-1-2 2m5 2h-3M4 5v4M2 7h4",
  home: "m3 10 9-7 9 7v10H3ZM9 20v-7h6v7",
  portal: "M5 21V10a7 7 0 0 1 14 0v11M2 21h20M9 21V11a3 3 0 0 1 6 0v10",
  shield: "m12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6ZM8 12l3 3 5-6",
  armor: "m8 3-5 3 2 6 2-1v10h10V11l2 1 2-6-5-3-4 3Z",
  book: "M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1m0-15c4-3 8-2 10-1v15c-4-2-7-1-10 1ZM12 5v15",
  scroll:
    "M6 3h13v15a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3h11a3 3 0 0 0 6 0M6 3a3 3 0 0 0-3 3v8M8 7h7M8 11h7",
  gem: "m7 3-5 6 10 13L22 9l-5-6ZM2 9h20M7 3l5 19 5-19",
  chest: "M3 10V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3ZM3 10h18v11H3ZM10 9h4v6h-4Z",
  heart: "M12 21 3.5 12.5C-2 6 6-1 12 6c6-7 14 0 8.5 6.5Z",
  flame: "M12 2c1 5 8 7 8 13a8 8 0 0 1-16 0c0-4 3-6 5-8 0 5 3 5 3 5s3-3 0-10Z",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 22v-3a8 8 0 0 1 16 0v3",
  tree: "M12 2v8m-7 4v-4h14v4M12 10v4M2 14h6v6H2Zm7 0h6v6H9Zm7 0h6v6h-6Z",
  chart: "M4 3v18h18M8 17v-4m5 4V9m5 8V5",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m4 12 5 5L20 6",
  lock: "M6 10V7a6 6 0 0 1 12 0v3M4 10h16v12H4ZM12 14v4",
  coin: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M14 8h-4v4h4v4h-4M12 6v12",
  bolt: "m14 2-9 12h6l-1 8 9-13h-6Z",
  close: "m5 5 14 14M5 19 19 5",
  potion: "M9 2h6M10 2v6L5 17a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V2M7 15h10",
  training: "M3 7v10m3-13v16M6 12h12M18 4v16m3-13v10",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 3 2 2-1 3 3 3 3-1 2 3 3-1 1-3 3-1 2-3-2-2 1-3-3-3-3 1-2-2Z",
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.gem}"/></svg>`;
export function portalArt(id = "portal", hue = "purple") {
  return `<svg class="portal-art" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mor ışık saçan kadim bir zindan kapısı"><defs><radialGradient id="${id}g"><stop stop-color="#9b71f0" stop-opacity=".7"/><stop offset="1" stop-color="#121525" stop-opacity="0"/></radialGradient><linearGradient id="${id}r" x2="0" y2="1"><stop stop-color="#dbbfff"/><stop offset="1" stop-color="#6542ae"/></linearGradient><linearGradient id="${id}s" x2="0" y2="1"><stop stop-color="#201e39"/><stop offset="1" stop-color="#0c0f18"/></linearGradient><filter id="${id}b"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="800" height="400" fill="#10131e"/><circle cx="553" cy="190" r="240" fill="url(#${id}g)"/><path d="m0 220 80-68 60 35 80-94 64 103 95-47 68 58 110-134 80 94 100-30 63 57v206H0Z" fill="#171b29"/><path d="m0 290 91-43 118 31 120-50 96 60 98-39 102 24 175-22v149H0Z" fill="#0d111b"/><path d="M436 325V158a118 118 0 0 1 236 0v167" fill="url(#${id}s)" stroke="#373047" stroke-width="32"/><path d="M445 326V160a110 110 0 0 1 220 0v166" fill="none" stroke="#a16dff" stroke-width="13" filter="url(#${id}b)"/><path d="M450 324V160a105 105 0 0 1 210 0v164" fill="none" stroke="url(#${id}r)" stroke-width="4"/><path d="M476 322V161a79 79 0 0 1 158 0v161" fill="none" stroke="#715291" stroke-width="1"/><path d="m529 153 26-28 25 28-25 47Z" fill="none" stroke="#b997ec" stroke-width="2"/><path d="m555 141-11 20h12l-4 20 17-27h-12Z" fill="#b997ec"/><path d="m424 330 268 0 38 16H397ZM398 350h330l34 18H365ZM367 374h390l43 26H321Z" fill="#262338" stroke="#534267"/><path d="M423 106h-38v226h38M691 106h35v226h-35" fill="#222231"/><path d="M384 146h38m-38 73h38m-38 74h38m270-146h34m-34 73h34m-34 74h34" stroke="#51405b" stroke-width="2"/><path d="m96 347 21-90 13 88 54-39-30 56M738 390l21-76 7 70" fill="#090d14"/><g fill="#c6a2ff"><circle cx="499" cy="226" r="2"/><circle cx="600" cy="260" r="1.8"/><circle cx="564" cy="306" r="2"/><circle cx="612" cy="118" r="1.4"/><circle cx="468" cy="174" r="1.7"/><circle cx="697" cy="69" r="1"/></g></svg>`;
}
export function knightArt() {
  return `<svg class="knight-art" viewBox="0 0 380 480" role="img" aria-label="Mor rünlerle kuşanmış gölge avcısı"><defs><radialGradient id="aura"><stop stop-color="#9e69e2" stop-opacity=".3"/><stop offset="1" stop-color="#9e69e2" stop-opacity="0"/></radialGradient><linearGradient id="metal" x2="1" y2="1"><stop stop-color="#686480"/><stop offset=".45" stop-color="#35354e"/><stop offset="1" stop-color="#171b2a"/></linearGradient></defs><ellipse cx="190" cy="445" rx="125" ry="17" fill="#03050c"/><ellipse cx="190" cy="250" rx="180" ry="230" fill="url(#aura)"/><ellipse cx="190" cy="440" rx="110" ry="22" fill="none" stroke="#71618e" stroke-dasharray="8 12"/><path d="M145 118q-42 12-48 78L68 421l80-37 45 34 67-23 47 26-30-219q-6-73-48-82Z" fill="#181c2b" stroke="#3c354e"/><path d="m145 143-36 207 41-62 42 88 17-154 47 112-27-193Z" fill="#25283d"/><path d="m148 122-34 31 5 58 37 14 76-5 35-30-14-40-30-24Z" fill="url(#metal)" stroke="#70627e"/><path d="m157 149 35 15 35-15-10 75h-49Z" fill="#303348" stroke="#776587"/><path d="m160 166 32 16 32-16m-59 28 27 14 28-14" fill="none" stroke="#7d5b9a" stroke-width="2"/><path d="m189 167-6 19 10 10 8-11Z" fill="#d1a2ff"/><path d="m129 140-31 21-14 38 33 10 35-36Zm114-4 34 24 14 34-32 16-32-34Z" fill="url(#metal)" stroke="#78658c"/><path d="m100 202-5 66 19 13 22-62m125-9 14 57-19 17-22-65" fill="#292d42" stroke="#746281"/><path d="m91 264-4 38 22 8 10-35m136 2 4 34 22-9-6-35" fill="url(#metal)" stroke="#736381"/><path d="m161 223-13 85 32 3 12-63 11 63 33-3-15-85Z" fill="#222638" stroke="#6b5b78"/><path d="m151 300-5 64 28 3 8-59m21 0 9 59 27-4-5-62" fill="url(#metal)" stroke="#635972"/><path d="m144 363-9 56-11 13 49-1-1-64m39 0 4 64h48l-17-15-9-53" fill="#272b3d" stroke="#675b73"/><path d="m155 116 5-43 32-24 33 25 2 42-33 28Z" fill="#202438" stroke="#9a7dae"/><path d="m161 79 31-16 28 15-10 36-17 17-19-18Z" fill="#161b2b"/><path d="m169 98 17 5m11 0 17-5" stroke="#cb9eff" stroke-width="3"/><path d="m192 66 1 30" stroke="#695779"/><path d="m275 296 6-5 58 127-11 30-15-19Z" fill="#a98bd0" stroke="#e2caff"/><path d="m267 302 29-12" stroke="#c6a0eb" stroke-width="6"/><path d="m92 300-22 71 4 18 14-10 22-72Z" fill="#9175b2" stroke="#cab1e5"/><g fill="#c49bf2"><circle cx="63" cy="235" r="2"/><circle cx="289" cy="125" r="2"/><circle cx="134" cy="56" r="1.5"/><circle cx="302" cy="329" r="2"/></g></svg>`;
}
