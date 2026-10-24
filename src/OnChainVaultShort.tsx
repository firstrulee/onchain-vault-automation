import React from "react";
import {
  AbsoluteFill,
  Audio,
  Loop,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface WordItem {
  word: string;
  start: number;
  end: number;
}

export interface HudStageData {
  layoutMode?: number; // 0..6 distinct visual engines
  accentPrimary?: string;
  accentSecondary?: string;
  accentDanger?: string;
  headerTag?: string;
  stage1Header: string;
  stage1Badge: string;
  walletLabel: string;
  walletAddress: string;
  tag1: string;
  tag2: string;
  nodeLeftTitle: string;
  nodeLeftValue: string;
  flowLabel: string;
  nodeRightTitle: string;
  nodeRightValue: string;
  stage2Header: string;
  stage2Badge: string;
  metricLeftLabel: string;
  metricLeftValue: string;
  metricLeftSub: string;
  metricRightLabel: string;
  metricRightValue: string;
  metricRightSub: string;
  chartLeftLabel: string;
  chartRightLabel: string;
  barLeftLabel: string;
  barLeftPct: number;
  barRightLabel: string;
  stage3Header: string;
  rule1Tag: string;
  rule1Badge: string;
  rule1Text: string;
  rule2Tag: string;
  rule2Badge: string;
  rule2Text: string;
  rule3Tag: string;
  rule3Badge: string;
  rule3Text: string;
  verdictHeadline?: string;
  verdictSubline?: string;
  verdictPills: [string, string, string];
}

export interface OnChainVaultProps {
  episodeNumber: string;
  voFile: string;
  bedFile: string;
  brollFile: string;
  durationInFrames: number;
  phaseTimes: {
    phase1Start: number;
    phase2Start: number;
    phase3Start: number;
    phase4Start: number;
    rule1Start?: number;
    rule2Start?: number;
    rule3Start?: number;
  };
  hudData?: HudStageData;
  words: WordItem[];
}

const DEFAULT_HUD: HudStageData = {
  layoutMode: 0,
  accentPrimary: "#06B6D4",
  accentSecondary: "#6366F1",
  accentDanger: "#F43F5E",
  headerTag: "SONAR TELEMETRY",
  stage1Header: "01 // INSIDER WALLET ALERT",
  stage1Badge: "▲ ANOMALY DETECTED",
  walletLabel: "TRACKED VC / MARKET-MAKER MULTISIG",
  walletAddress: "0x71C...89A2",
  tag1: "SECTOR: WEB3 GAMING & AI",
  tag2: "CEX INFLOW: ACTIVE",
  nodeLeftTitle: "VC TREASURY",
  nodeLeftValue: "0x71C...89A2",
  flowLabel: "-$14.2M OUTFLOW →",
  nodeRightTitle: "EXCHANGE HOT WALLET",
  nodeRightValue: "BINANCE DEP",
  stage2Header: "02 // FORENSIC CASE STUDY",
  stage2Badge: "PRICE CRASH: -64.0%",
  metricLeftLabel: "WHAT RETAIL SAW",
  metricLeftValue: "ATH VOLUME",
  metricLeftSub: "Paid Influencer Push",
  metricRightLabel: "ON-CHAIN REALITY",
  metricRightValue: "$48.5M UNLOCK",
  metricRightSub: "VC Supply Shock",
  chartLeftLabel: "RETAIL BUY PEAK",
  chartRightLabel: "▼ VC CLIFF DUMP (-64%)",
  barLeftLabel: "RETAIL FLOAT: 22%",
  barLeftPct: 22,
  barRightLabel: "INSIDER LOCKED: 78%",
  stage3Header: "03 // THE 60-SECOND PLAYBOOK",
  rule1Tag: "RULE #01 // DILUTION RATIO",
  rule1Badge: "FDV ÷ MCAP < 5x",
  rule1Text: "Divide Fully Diluted Valuation by Market Cap",
  rule2Tag: "RULE #02 // CLIFF UNLOCK SHIELD",
  rule2Badge: "7-DAY BLACKOUT",
  rule2Text: "Never Buy Within 7 Days of a >5% Supply Unlock",
  rule3Tag: "RULE #03 // TREASURY TELEMETRY",
  rule3Badge: "MULTISIG → CEX FLOW",
  rule3Text: "Track Multisig Outflows to Exchange Deposit Wallets",
  verdictHeadline: "DECODE THE CHAIN.",
  verdictSubline: "NEVER BE EXIT LIQUIDITY.",
  verdictPills: ["✓ FDV/MC < 5x", "✓ 7D UNLOCK SHIELD", "✓ CEX FLOW"],
};

const VaultCubeIcon: React.FC<{ size?: number; primary?: string; secondary?: string }> = ({
  size = 44,
  primary = "#10B981",
  secondary = "#38BDF8",
}) => (
  <svg width={size} height={size} viewBox="0 0 240 240" fill="none">
    <polygon points="120,24 204,72 168,93 120,65 72,93 36,72" fill="#F8FAFC" />
    <polygon points="36,72 72,93 72,148 120,176 120,216 36,168" fill="#64748B" />
    <polygon points="204,72 204,168 120,216 120,176 168,148 168,93" fill={primary} />
    <polygon points="120,82 154,102 120,122 86,102" fill={secondary} />
    <polygon points="86,102 120,122 120,160 86,140" fill={primary} />
    <polygon points="154,102 154,140 120,160 120,122" fill="#F8FAFC" />
  </svg>
);

export const OnChainVaultShort: React.FC<OnChainVaultProps> = ({
  episodeNumber,
  voFile,
  bedFile,
  brollFile,
  durationInFrames,
  phaseTimes,
  hudData,
  words,
}) => {
  const hud = { ...DEFAULT_HUD, ...(hudData || {}) };
  const epNumInt = parseInt(episodeNumber || "1", 10);
  const mode = hud.layoutMode ?? epNumInt % 7;

  const PRIMARY = hud.accentPrimary || "#06B6D4";
  const SECONDARY = hud.accentSecondary || "#6366F1";
  const DANGER = hud.accentDanger || "#F43F5E";
  const STEEL_WHITE = "#F8FAFC";
  const SLATE_MUTED = "#94A3B8";
  const OBSIDIAN_BG = "#05070B";

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));

  const isStage1 = currentTime < phaseTimes.phase2Start;
  const isStage2 =
    currentTime >= phaseTimes.phase2Start && currentTime < phaseTimes.phase3Start;
  const isStage3 =
    currentTime >= phaseTimes.phase3Start && currentTime < phaseTimes.phase4Start;
  const isStage4 = currentTime >= phaseTimes.phase4Start;

  const stageStartTime = isStage1
    ? 0
    : isStage2
    ? phaseTimes.phase2Start
    : isStage3
    ? phaseTimes.phase3Start
    : phaseTimes.phase4Start;

  const stageFrame = Math.max(0, Math.round((currentTime - stageStartTime) * fps));
  const cardSpring = spring({
    frame: stageFrame,
    fps,
    config: { damping: 15, stiffness: 145, mass: 0.78 },
  });

  const PHRASE_SIZE = 4;
  const phrases: { words: WordItem[]; start: number; end: number }[] = [];
  for (let i = 0; i < words.length; i += PHRASE_SIZE) {
    const chunk = words.slice(i, i + PHRASE_SIZE);
    phrases.push({
      words: chunk,
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
    });
  }

  const activePhrase =
    phrases.find((p, idx) => {
      const nextStart = phrases[idx + 1] ? phrases[idx + 1].start : 999;
      return currentTime >= p.start - 0.08 && currentTime < nextStart;
    }) || phrases[0];

  const simulatedBlock = 21640100 + epNumInt * 317 + Math.floor(frame / 14);
  const r1Start = phaseTimes.rule1Start ?? phaseTimes.phase3Start + 3.0;
  const r2Start = phaseTimes.rule2Start ?? phaseTimes.phase3Start + 8.5;
  const r3Start = phaseTimes.rule3Start ?? phaseTimes.phase3Start + 14.0;

  const radarAngle = (frame * 3.2) % 360;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: OBSIDIAN_BG,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        color: STEEL_WHITE,
        overflow: "hidden",
      }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Space+Grotesk:wght@700&display=swap');`}
      </style>

      {voFile && <Audio src={staticFile(voFile)} volume={1.0} />}
      {bedFile && <Audio src={staticFile(bedFile)} volume={0.58} />}

      {/* Layer 1: Full-Bleed Distinct Google Flow 9:16 B-Roll */}
      <AbsoluteFill>
        <Loop durationInFrames={235}>
          <OffthreadVideo
            src={staticFile(brollFile)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.42) contrast(1.16) saturate(1.05)",
              transform: `scale(${interpolate(
                frame % 235,
                [0, 235],
                [1.01, 1.08]
              )})`,
            }}
          />
        </Loop>
      </AbsoluteFill>

      {/* Layer 2: Theme-Specific Atmospheric Gradient & Custom Background Geometry */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 34%, ${PRIMARY}22 0%, rgba(5,7,11,0.74) 58%, rgba(5,7,11,0.96) 100%)`,
        }}
      >
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern
              id={`grid-${mode}`}
              width={mode % 2 === 0 ? "72" : "48"}
              height={mode % 2 === 0 ? "72" : "48"}
              patternUnits="userSpaceOnUse"
            >
              {mode % 3 === 0 ? (
                <circle cx="36" cy="36" r="1.5" fill="rgba(255,255,255,0.08)" />
              ) : (
                <path
                  d="M 72 0 L 0 0 0 72"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              )}
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill={`url(#grid-${mode})`} />
        </svg>
      </AbsoluteFill>

      {/* Layer 3: Top Telemetry Header (Styled by Theme) */}
      <div
        style={{
          position: "absolute",
          top: 108,
          left: 52,
          right: 52,
          background: "rgba(8, 12, 20, 0.88)",
          border: `1.5px solid ${PRIMARY}55`,
          borderRadius: mode % 2 === 0 ? 22 : 14,
          padding: "18px 26px",
          boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 35px ${PRIMARY}18`,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <VaultCubeIcon size={40} primary={PRIMARY} secondary={SECONDARY} />
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#FFFFFF",
                }}
              >
                ONCHAIN<span style={{ color: PRIMARY }}>VAULT</span>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: SLATE_MUTED,
                  letterSpacing: "1.6px",
                }}
              >
                {hud.headerTag || "ON-CHAIN INTEL"} // EP.{episodeNumber}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: `${PRIMARY}22`,
                border: `1px solid ${PRIMARY}66`,
                borderRadius: 999,
                padding: "4px 14px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: PRIMARY,
                  opacity: 0.5 + 0.5 * Math.sin(frame * 0.28),
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: PRIMARY,
                  letterSpacing: "1.2px",
                }}
              >
                MODE 0{mode + 1} // LIVE
              </span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "#64748B",
              }}
            >
              BLK #{simulatedBlock.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: 5,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
            }}
          />
        </div>
      </div>

      {/* Layer 4: Center Visual Engine (7 Distinct Archetypes!) */}
      <div
        style={{
          position: "absolute",
          top: 275,
          left: 52,
          right: 52,
          height: 910,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateY(${interpolate(cardSpring, [0, 1], [32, 0])}px) scale(${interpolate(
            cardSpring,
            [0, 1],
            [0.96, 1]
          )})`,
          opacity: interpolate(cardSpring, [0, 1], [0.15, 1]),
        }}
      >
        {/* ================= STAGE 1: DISTINCT VISUAL HOOK BY ARCHETYPE ================= */}
        {isStage1 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(13,18,30,0.93) 0%, rgba(7,10,18,0.97) 100%)",
              border: `2px solid ${PRIMARY}66`,
              borderRadius: 28,
              padding: 36,
              boxShadow: `0 35px 80px rgba(0,0,0,0.88), 0 0 60px ${PRIMARY}22`,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* Stage 1 Top Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: PRIMARY,
                  letterSpacing: 1.8,
                }}
              >
                {hud.stage1Header}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  fontWeight: 800,
                  color: DANGER,
                  background: `${DANGER}22`,
                  border: `1px solid ${DANGER}66`,
                  padding: "6px 14px",
                  borderRadius: 8,
                }}
              >
                {hud.stage1Badge}
              </span>
            </div>

            {/* ARCHETYPE-SPECIFIC STAGE 1 VISUAL WIDGET */}
            {mode === 0 && (
              /* MODE 0: 360° SONAR RADAR SCANNER */
              <div style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(5,7,11,0.85)", borderRadius: 22, padding: 26, border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg width="260" height="260" viewBox="0 0 260 260">
                  <circle cx="130" cy="130" r="118" stroke={`${PRIMARY}55`} strokeWidth="2" fill="rgba(6,182,212,0.05)" />
                  <circle cx="130" cy="130" r="82" stroke={`${PRIMARY}33`} strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
                  <circle cx="130" cy="130" r="44" stroke={`${PRIMARY}33`} strokeWidth="1.5" fill="none" />
                  <line x1="12" y1="130" x2="248" y2="130" stroke="rgba(255,255,255,0.08)" />
                  <line x1="130" y1="12" x2="130" y2="248" stroke="rgba(255,255,255,0.08)" />
                  <g transform={`rotate(${radarAngle} 130 130)`}>
                    <path d="M 130 130 L 130 12 A 118 118 0 0 1 225 65 Z" fill={`${PRIMARY}33`} />
                    <line x1="130" y1="130" x2="130" y2="12" stroke={PRIMARY} strokeWidth="3" />
                  </g>
                  <circle cx="175" cy="78" r="9" fill={DANGER} />
                  <circle cx="175" cy="78" r={14 + (frame % 16)} stroke={DANGER} strokeWidth="2" fill="none" opacity={1 - (frame % 16) / 16} />
                  <circle cx="82" cy="168" r="7" fill={PRIMARY} />
                  <circle cx="158" cy="182" r="7" fill={SECONDARY} />
                </svg>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: SLATE_MUTED }}>{hud.walletLabel}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 42, fontWeight: 800, color: PRIMARY }}>{hud.walletAddress}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, background: "rgba(255,255,255,0.08)", padding: "6px 12px", borderRadius: 8 }}>{hud.tag1}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: SECONDARY, background: `${SECONDARY}22`, padding: "6px 12px", borderRadius: 8 }}>{hud.tag2}</span>
                  </div>
                </div>
              </div>
            )}

            {mode === 1 && (
              /* MODE 1: FUTURES LIQUIDATION HEATMAP BANDS */
              <div style={{ background: "rgba(5,7,11,0.88)", borderRadius: 22, padding: 28, border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: SLATE_MUTED }}>{hud.walletLabel}</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, color: PRIMARY }}>{hud.walletAddress}</span>
                </div>
                {[
                  { lbl: "SHORT LIQ CLUSTER (+12%)", w: 92, col: "#FACC15", val: hud.nodeRightValue },
                  { lbl: "HIGH LEVERAGE ZONE (+6%)", w: 74, col: PRIMARY, val: hud.flowLabel },
                  { lbl: "SPOT MID-PRICE TRAP", w: 48, col: "#38BDF8", val: hud.nodeLeftValue },
                  { lbl: "LONG STOP CASCADE (-9%)", w: 86, col: DANGER, val: hud.tag2 },
                ].map((band, bIdx) => (
                  <div key={bIdx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                      <span style={{ color: "#CBD5E1" }}>{band.lbl}</span>
                      <span style={{ color: band.col, fontWeight: 800 }}>{band.val}</span>
                    </div>
                    <div style={{ width: "100%", height: 18, background: "#111827", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${band.w}%`, height: "100%", background: `linear-gradient(90deg, ${band.col}44, ${band.col})` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mode === 2 && (
              /* MODE 2: DUAL TACHOMETER GAMEFI GAUGES */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { title: hud.nodeLeftTitle, val: hud.nodeLeftValue, sub: hud.tag1, col: PRIMARY, pct: 0.82 },
                  { title: hud.nodeRightTitle, val: hud.nodeRightValue, sub: hud.tag2, col: DANGER, pct: 0.91 },
                ].map((g, gi) => (
                  <div key={gi} style={{ background: "rgba(5,7,11,0.88)", borderRadius: 22, padding: 24, border: `1.5px solid ${g.col}55`, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <svg width="210" height="125" viewBox="0 0 210 125">
                      <path d="M 20 110 A 85 85 0 0 1 190 110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" strokeLinecap="round" />
                      <path d="M 20 110 A 85 85 0 0 1 190 110" fill="none" stroke={g.col} strokeWidth="16" strokeLinecap="round" strokeDasharray="267" strokeDashoffset={267 * (1 - g.pct * Math.min(1, stageFrame / 25))} />
                      <text x="105" y="96" textAnchor="middle" fill="#FFFFFF" fontSize="28" fontWeight="800" fontFamily="Space Grotesk">{g.val}</text>
                    </svg>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: g.col, marginTop: 6 }}>{g.title}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SLATE_MUTED, marginTop: 4 }}>{g.sub}</div>
                  </div>
                ))}
              </div>
            )}

            {mode === 3 && (
              /* MODE 3: SOLIDITY SMART CONTRACT X-RAY DECOMPILER */
              <div style={{ background: "#04060A", borderRadius: 20, padding: "22px 26px", border: `1.5px solid ${DANGER}88`, fontFamily: "'JetBrains Mono', monospace", position: "relative", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: SLATE_MUTED, marginBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10 }}>
                  <span>CONTRACT: {hud.walletAddress}</span>
                  <span style={{ color: PRIMARY }}>{hud.tag1}</span>
                </div>
                {[
                  { ln: "041", code: "function _transfer(address from, address to, uint256 amt) internal {", danger: false },
                  { ln: "042", code: `  require(!isBlacklisted[from], "${hud.nodeLeftValue}");`, danger: true },
                  { ln: "043", code: `  if (to == dexPair) { taxRate = ${hud.nodeRightValue}; }`, danger: true },
                  { ln: "044", code: `  uint256 fee = amt * taxRate / 100; // ${hud.flowLabel}`, danger: false },
                  { ln: "045", code: "  super._transfer(from, treasuryVault, fee);", danger: false },
                ].map((line, lIdx) => (
                  <div key={lIdx} style={{ display: "flex", gap: 14, fontSize: 16, padding: "7px 10px", borderRadius: 8, background: line.danger ? `${DANGER}28` : "transparent", color: line.danger ? "#FECDD3" : "#A7F3D0", fontWeight: line.danger ? 800 : 500 }}>
                    <span style={{ color: "#475569" }}>{line.ln}</span>
                    <span>{line.code}</span>
                  </div>
                ))}
              </div>
            )}

            {mode === 4 && (
              /* MODE 4: MIRRORED L2 ORDERBOOK DEPTH WALL */
              <div style={{ background: "rgba(5,7,11,0.88)", borderRadius: 22, padding: 24, border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 15 }}>
                  <span style={{ color: PRIMARY, fontWeight: 800 }}>BIDS // {hud.nodeLeftTitle}: {hud.nodeLeftValue}</span>
                  <span style={{ color: DANGER, fontWeight: 800 }}>ASKS // {hud.nodeRightTitle}: {hud.nodeRightValue}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[88, 64, 42, 95].map((w, i) => (
                      <div key={i} style={{ height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6, display: "flex", justifyContent: "flex-end", overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", background: i === 3 ? `${SECONDARY}99` : `${PRIMARY}88` }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[45, 72, 94, 58].map((w, i) => (
                      <div key={i} style={{ height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6, overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", background: `${DANGER}99` }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 800, color: "#FACC15" }}>
                  ⚡ {hud.walletAddress} // {hud.flowLabel}
                </div>
              </div>
            )}

            {mode === 5 && (
              /* MODE 5: CROSS-CHAIN BRIDGE ORBITAL ROUTER */
              <div style={{ background: "rgba(5,7,11,0.88)", borderRadius: 22, padding: 26, border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color: PRIMARY, textAlign: "center" }}>
                  {hud.walletAddress}
                </div>
                <svg width="840" height="140" viewBox="0 0 840 140">
                  <rect x="20" y="30" width="210" height="80" rx="16" fill="#0F172A" stroke={PRIMARY} strokeWidth="2" />
                  <text x="125" y="65" textAnchor="middle" fill="#94A3B8" fontSize="13" fontFamily="JetBrains Mono">{hud.nodeLeftTitle}</text>
                  <text x="125" y="92" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="800" fontFamily="JetBrains Mono">{hud.nodeLeftValue}</text>

                  <path d="M 230 70 C 330 20, 510 120, 610 70" fill="none" stroke={SECONDARY} strokeWidth="4" strokeDasharray="8 6" />
                  <circle cx={230 + ((frame * 8) % 380)} cy="70" r="9" fill={PRIMARY} />
                  <text x="420" y="42" textAnchor="middle" fill={PRIMARY} fontSize="16" fontWeight="800" fontFamily="JetBrains Mono">{hud.flowLabel}</text>

                  <rect x="610" y="30" width="210" height="80" rx="16" fill="#0F172A" stroke={DANGER} strokeWidth="2" />
                  <text x="715" y="65" textAnchor="middle" fill="#94A3B8" fontSize="13" fontFamily="JetBrains Mono">{hud.nodeRightTitle}</text>
                  <text x="715" y="92" textAnchor="middle" fill={DANGER} fontSize="20" fontWeight="800" fontFamily="JetBrains Mono">{hud.nodeRightValue}</text>
                </svg>
              </div>
            )}

            {mode === 6 && (
              /* MODE 6: INSTITUTIONAL DONUT WHEEL ALLOCATION */
              <div style={{ display: "flex", alignItems: "center", gap: 28, background: "rgba(5,7,11,0.88)", borderRadius: 22, padding: 26, border: "1px solid rgba(255,255,255,0.08)" }}>
                <svg width="240" height="240" viewBox="0 0 240 240">
                  <circle cx="120" cy="120" r="88" fill="none" stroke="#1E293B" strokeWidth="28" />
                  <circle cx="120" cy="120" r="88" fill="none" stroke={PRIMARY} strokeWidth="28" strokeDasharray="310 552" transform="rotate(-90 120 120)" />
                  <circle cx="120" cy="120" r="88" fill="none" stroke={SECONDARY} strokeWidth="28" strokeDasharray="150 552" strokeDashoffset="-310" transform="rotate(-90 120 120)" />
                  <circle cx="120" cy="120" r="88" fill="none" stroke={DANGER} strokeWidth="28" strokeDasharray="92 552" strokeDashoffset="-460" transform="rotate(-90 120 120)" />
                  <text x="120" y="115" textAnchor="middle" fill="#94A3B8" fontSize="13" fontFamily="JetBrains Mono">TRACKED NAV</text>
                  <text x="120" y="142" textAnchor="middle" fill="#FFFFFF" fontSize="26" fontWeight="800" fontFamily="Space Grotesk">{hud.nodeLeftValue}</text>
                </svg>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: SLATE_MUTED }}>{hud.walletLabel}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color: PRIMARY }}>{hud.walletAddress}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: "#E2E8F0" }}>• {hud.tag1}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: SECONDARY }}>• {hud.tag2}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: DANGER }}>• {hud.flowLabel}</div>
                </div>
              </div>
            )}

            {/* Bottom Summary Strip in Stage 1 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "16px 24px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: SLATE_MUTED }}>{hud.nodeLeftTitle}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: STEEL_WHITE }}>{hud.nodeLeftValue}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 800, color: PRIMARY }}>
                {hud.flowLabel}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: SLATE_MUTED }}>{hud.nodeRightTitle}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color: DANGER }}>{hud.nodeRightValue}</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: FORENSIC DATA VISUALIZATION BY ARCHETYPE ================= */}
        {isStage2 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(13,18,30,0.94) 0%, rgba(7,10,18,0.98) 100%)",
              border: `2px solid ${SECONDARY}66`,
              borderRadius: 28,
              padding: 36,
              boxShadow: "0 35px 80px rgba(0,0,0,0.88)",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: SECONDARY, letterSpacing: 1.6 }}>
                {hud.stage2Header}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: DANGER, background: `${DANGER}22`, border: `1px solid ${DANGER}66`, padding: "6px 16px", borderRadius: 8 }}>
                {hud.stage2Badge}
              </span>
            </div>

            {/* Dual Comparison Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ background: "rgba(5,7,11,0.86)", border: `1.5px solid ${PRIMARY}55`, borderRadius: 20, padding: 22 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SLATE_MUTED }}>{hud.metricLeftLabel}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, color: PRIMARY, marginTop: 6 }}>{hud.metricLeftValue}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#CBD5E1", marginTop: 6 }}>{hud.metricLeftSub}</div>
              </div>
              <div style={{ background: "rgba(5,7,11,0.86)", border: `1.5px solid ${DANGER}66`, borderRadius: 20, padding: 22 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SLATE_MUTED }}>{hud.metricRightLabel}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, color: DANGER, marginTop: 6 }}>{hud.metricRightValue}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#CBD5E1", marginTop: 6 }}>{hud.metricRightSub}</div>
              </div>
            </div>

            {/* DISTINCT STAGE 2 CHART ENGINE PER MODE */}
            <div style={{ background: "rgba(5,7,11,0.88)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: SLATE_MUTED, marginBottom: 12 }}>
                <span>{hud.chartLeftLabel}</span>
                <span style={{ color: DANGER, fontWeight: 700 }}>{hud.chartRightLabel}</span>
              </div>

              {mode % 3 === 1 ? (
                /* JAPANESE CANDLESTICK CHART */
                <svg width="840" height="185" viewBox="0 0 840 185">
                  {[
                    { x: 45, hi: 120, lo: 165, o: 155, c: 130, bull: true },
                    { x: 115, hi: 95, lo: 145, o: 130, c: 105, bull: true },
                    { x: 185, hi: 70, lo: 120, o: 105, c: 80, bull: true },
                    { x: 255, hi: 42, lo: 95, o: 80, c: 52, bull: true },
                    { x: 325, hi: 14, lo: 75, o: 52, c: 28, bull: true },
                    { x: 395, hi: 8, lo: 95, o: 28, c: 78, bull: false },
                    { x: 465, hi: 60, lo: 135, o: 78, c: 122, bull: false },
                    { x: 535, hi: 105, lo: 160, o: 122, c: 148, bull: false },
                    { x: 605, hi: 125, lo: 175, o: 148, c: 166, bull: false },
                    { x: 675, hi: 140, lo: 180, o: 166, c: 174, bull: false },
                    { x: 745, hi: 150, lo: 182, o: 174, c: 178, bull: false },
                  ].map((cd, cIdx) => {
                    const col = cd.bull ? PRIMARY : DANGER;
                    const top = Math.min(cd.o, cd.c);
                    const h = Math.max(8, Math.abs(cd.c - cd.o));
                    return (
                      <g key={cIdx}>
                        <line x1={cd.x} y1={cd.hi} x2={cd.x} y2={cd.lo} stroke={col} strokeWidth="3" />
                        <rect x={cd.x - 16} y={top} width="32" height={h} rx="4" fill={col} />
                      </g>
                    );
                  })}
                </svg>
              ) : mode % 3 === 2 ? (
                /* VERTICAL MULTI-BAR HISTOGRAM COMPARISON */
                <svg width="840" height="185" viewBox="0 0 840 185">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((bIdx) => {
                    const xBase = 40 + bIdx * 98;
                    const hGreen = Math.max(18, 120 - bIdx * 12);
                    const hRed = 30 + bIdx * 18;
                    return (
                      <g key={bIdx}>
                        <rect x={xBase} y={175 - hGreen} width="28" height={hGreen} rx="5" fill={PRIMARY} />
                        <rect x={xBase + 34} y={175 - hRed} width="28" height={hRed} rx="5" fill={DANGER} />
                      </g>
                    );
                  })}
                </svg>
              ) : (
                /* BUBBLE CLUSTER NETWORK TOPOLOGY */
                <svg width="840" height="185" viewBox="0 0 840 185">
                  <line x1="420" y1="92" x2="160" y2="42" stroke={DANGER} strokeWidth="2.5" strokeDasharray="5 5" />
                  <line x1="420" y1="92" x2="180" y2="148" stroke={DANGER} strokeWidth="2.5" strokeDasharray="5 5" />
                  <line x1="420" y1="92" x2="670" y2="40" stroke={PRIMARY} strokeWidth="2.5" />
                  <line x1="420" y1="92" x2="690" y2="145" stroke={DANGER} strokeWidth="2.5" />
                  <circle cx="160" cy="42" r="24" fill="#111827" stroke={PRIMARY} strokeWidth="3" />
                  <circle cx="180" cy="148" r="24" fill="#111827" stroke={PRIMARY} strokeWidth="3" />
                  <circle cx="670" cy="40" r="28" fill="#111827" stroke={DANGER} strokeWidth="3" />
                  <circle cx="690" cy="145" r="28" fill="#111827" stroke={DANGER} strokeWidth="3" />
                  <circle cx="420" cy="92" r="42" fill={DANGER} />
                  <text x="420" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="JetBrains Mono">CORE</text>
                </svg>
              )}
            </div>

            {/* Bottom Ratio Split Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                <span style={{ color: PRIMARY }}>{hud.barLeftLabel}</span>
                <span style={{ color: DANGER }}>{hud.barRightLabel}</span>
              </div>
              <div style={{ width: "100%", height: 18, background: "#1E293B", borderRadius: 9, overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${hud.barLeftPct}%`, height: "100%", background: PRIMARY }} />
                <div style={{ width: `${100 - hud.barLeftPct}%`, height: "100%", background: `linear-gradient(90deg, ${SECONDARY}, ${DANGER})` }} />
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: 3-RULE PROTOCOL (VARIED CARD LAYOUTS) ================= */}
        {isStage3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                background: "rgba(13,18,30,0.92)",
                border: `1.5px solid ${PRIMARY}66`,
                borderRadius: 20,
                padding: "16px 26px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 800, color: PRIMARY, letterSpacing: 1.5 }}>
                {hud.stage3Header}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: STEEL_WHITE, background: "rgba(255,255,255,0.08)", padding: "5px 14px", borderRadius: 8 }}>
                VERIFIED PROTOCOL
              </span>
            </div>

            {[
              { active: currentTime >= r1Start, tag: hud.rule1Tag, badge: hud.rule1Badge, text: hud.rule1Text, col: PRIMARY, num: "01" },
              { active: currentTime >= r2Start, tag: hud.rule2Tag, badge: hud.rule2Badge, text: hud.rule2Text, col: SECONDARY, num: "02" },
              { active: currentTime >= r3Start, tag: hud.rule3Tag, badge: hud.rule3Badge, text: hud.rule3Text, col: DANGER, num: "03" },
            ].map((r, rIdx) => (
              <div
                key={rIdx}
                style={{
                  background: r.active
                    ? "linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(8,12,22,0.98) 100%)"
                    : "rgba(8,12,22,0.62)",
                  border: r.active ? `2px solid ${r.col}` : "1.5px solid rgba(255,255,255,0.08)",
                  borderLeft: r.active ? `10px solid ${r.col}` : "1.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "22px 28px",
                  opacity: r.active ? 1 : 0.42,
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  boxShadow: r.active ? `0 18px 45px rgba(0,0,0,0.75), 0 0 30px ${r.col}22` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 38,
                    fontWeight: 800,
                    color: r.col,
                    minWidth: 58,
                    textAlign: "center",
                  }}
                >
                  {r.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 800, color: r.col }}>
                      {r.tag}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 800, color: "#FFFFFF", background: `${r.col}33`, border: `1px solid ${r.col}77`, padding: "3px 12px", borderRadius: 6 }}>
                      {r.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 25, fontWeight: 700, color: STEEL_WHITE, lineHeight: 1.25 }}>
                    {r.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= STAGE 4: VERDICT & LOOP BRIDGE ================= */}
        {isStage4 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(13,18,30,0.96) 0%, rgba(7,10,18,0.99) 100%)",
              border: `2.5px solid ${PRIMARY}`,
              borderRadius: 28,
              padding: "42px 38px",
              boxShadow: `0 35px 90px rgba(0,0,0,0.92), 0 0 75px ${PRIMARY}28`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 22,
            }}
          >
            <VaultCubeIcon size={84} primary={PRIMARY} secondary={SECONDARY} />
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                fontWeight: 800,
                color: PRIMARY,
                letterSpacing: 2.2,
                background: `${PRIMARY}20`,
                border: `1px solid ${PRIMARY}66`,
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              ● INSTITUTIONAL TELEMETRY VERIFIED
            </div>

            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 46,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              {hud.verdictHeadline || "DON'T WATCH THE HYPE."}
              <br />
              <span style={{ color: PRIMARY }}>
                {hud.verdictSubline || "TRACK THE WALLETS."}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 15,
                color: "#E2E8F0",
              }}
            >
              {hud.verdictPills.map((pill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: `1px solid ${SECONDARY}55`,
                    padding: "10px 16px",
                    borderRadius: 10,
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>

            <div
              style={{
                marginTop: 6,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 21,
                fontWeight: 800,
                color: STEEL_WHITE,
                background: `${PRIMARY}28`,
                border: `1.5px solid ${PRIMARY}`,
                padding: "14px 34px",
                borderRadius: 14,
              }}
            >
              SUBSCRIBE // @OnChainVault
            </div>
          </div>
        )}
      </div>

      {/* Layer 5: Lower-Third Kinetic Subtitle Bar */}
      {activePhrase && (
        <div
          style={{
            position: "absolute",
            bottom: 295,
            left: 52,
            right: 52,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(5, 7, 11, 0.92)",
              border: `1.5px solid ${PRIMARY}44`,
              borderRadius: 22,
              padding: "20px 30px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.88)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px 15px",
              minHeight: 108,
            }}
          >
            {(() => {
              let spokenIdx = -1;
              for (let idx = 0; idx < activePhrase.words.length; idx++) {
                if (currentTime >= activePhrase.words[idx].start - 0.02) {
                  spokenIdx = idx;
                }
              }
              return activePhrase.words.map((w, i) => {
                const isSpoken = i === spokenIdx;
                const clean = w.word.toLowerCase().replace(/[^a-z0-9%$]/g, "");
                const isAlert = [
                  "dumped",
                  "liquidation",
                  "liquidated",
                  "unlock",
                  "exit",
                  "liquidity",
                  "never",
                  "spoofing",
                  "honeypot",
                  "trap",
                  "crash",
                  "dump",
                  "sybil",
                  "exploit",
                  "drain",
                  "rug",
                  "fake",
                  "wash",
                ].includes(clean);
                const isAlpha = [
                  "smart",
                  "money",
                  "rule",
                  "one",
                  "two",
                  "three",
                  "save",
                  "subscribe",
                  "whales",
                  "airdrop",
                  "inflow",
                  "minted",
                  "alpha",
                  "audit",
                  "vault",
                  "oracle",
                  "staking",
                ].includes(clean);

                const activeBg = isAlert
                  ? DANGER
                  : isAlpha
                  ? PRIMARY
                  : "#FFFFFF";

                return (
                  <span
                    key={`${w.start}-${i}`}
                    style={{
                      fontFamily:
                        "'Space Grotesk', 'Inter', system-ui, sans-serif",
                      fontSize: 43,
                      fontWeight: 700,
                      letterSpacing: "-0.8px",
                      padding: isSpoken ? "4px 16px" : "4px 6px",
                      borderRadius: 10,
                      backgroundColor: isSpoken ? activeBg : "transparent",
                      color: isSpoken
                        ? "#05070B"
                        : isAlert
                        ? "#FDA4AF"
                        : isAlpha
                        ? PRIMARY
                        : "#F1F5F9",
                      transform: isSpoken ? "scale(1.06)" : "scale(1.0)",
                    }}
                  >
                    {w.word}
                  </span>
                );
              });
            })()}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
