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
  stage2Header: "02 // FORENSIC CASE STUDY (T-48 HOURS)",
  stage2Badge: "PRICE CRASH: -64.0%",
  metricLeftLabel: "WHAT RETAIL SAW (HYPE)",
  metricLeftValue: "ATH VOLUME",
  metricLeftSub: "Paid Influencer Tournament Push",
  metricRightLabel: "HIDDEN ON-CHAIN REALITY",
  metricRightValue: "$48.5M UNLOCK",
  metricRightSub: "VC Cliff Supply Shock Hit Market",
  chartLeftLabel: "RETAIL BUY PEAK (EXIT LIQUIDITY)",
  chartRightLabel: "▼ VC CLIFF DUMP (-64%)",
  barLeftLabel: "RETAIL CIRCULATING FLOAT: 22%",
  barLeftPct: 22,
  barRightLabel: "LOCKED VC / INSIDER SUPPLY: 78%",
  stage3Header: "03 // THE 60-SECOND SMART MONEY AUDIT",
  rule1Tag: "RULE #01 // DILUTION RATIO",
  rule1Badge: "FDV ÷ MCAP > 5x = EXIT LIQUIDITY",
  rule1Text: "Divide Fully Diluted Valuation by Market Cap",
  rule2Tag: "RULE #02 // CLIFF UNLOCK SHIELD",
  rule2Badge: "7-DAY BLACKOUT WINDOW",
  rule2Text: "Never Buy Within 7 Days of a >5% Supply Unlock",
  rule3Tag: "RULE #03 // TREASURY TELEMETRY",
  rule3Badge: "MULTISIG → CEX FLOW",
  rule3Text: "Track Multisig Outflows to Exchange Deposit Wallets",
  verdictPills: ["✓ FDV/MC < 5x", "✓ 7D UNLOCK SHIELD", "✓ CEX FLOW"],
};

const EMERALD = "#10B981";
const EMERALD_LIGHT = "#34D399";
const CRIMSON = "#F43F5E";
const AMBER = "#F59E0B";
const STEEL_WHITE = "#F8FAFC";
const SLATE_MUTED = "#94A3B8";
const OBSIDIAN_BG = "#06080C";

const VaultCubeIcon: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 240 240" fill="none">
    <polygon points="120,24 204,72 168,93 120,65 72,93 36,72" fill="#F8FAFC" />
    <polygon points="36,72 72,93 72,148 120,176 120,216 36,168" fill="#64748B" />
    <polygon points="204,72 204,168 120,216 120,176 168,148 168,93" fill="#10B981" />
    <polygon points="120,82 154,102 120,122 86,102" fill="#34D399" />
    <polygon points="86,102 120,122 120,160 86,140" fill="#059669" />
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
    config: { damping: 16, stiffness: 140, mass: 0.8 },
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

  const simulatedBlock = 21498310 + parseInt(episodeNumber || "1", 10) * 140 + Math.floor(frame / 18);

  const r1Start = phaseTimes.rule1Start ?? phaseTimes.phase3Start + 3.5;
  const r2Start = phaseTimes.rule2Start ?? phaseTimes.phase3Start + 9.5;
  const r3Start = phaseTimes.rule3Start ?? phaseTimes.phase3Start + 15.0;

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
      {bedFile && <Audio src={staticFile(bedFile)} volume={0.65} />}

      {/* Layer 1: Dark-Cinema Google Flow B-Roll Video */}
      <AbsoluteFill>
        <Loop durationInFrames={235}>
          <OffthreadVideo
            src={staticFile(brollFile)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.38) contrast(1.18) saturate(0.9)",
              transform: `scale(${interpolate(
                frame % 235,
                [0, 235],
                [1.02, 1.09]
              )})`,
            }}
          />
        </Loop>
      </AbsoluteFill>

      {/* Layer 2: Precision Vector Grid & Vignette Overlay */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(16,185,129,0.10) 0%, rgba(6,8,12,0.72) 55%, rgba(6,8,12,0.95) 100%)",
        }}
      >
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <pattern
              id="hudGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="rgba(255,255,255,0.032)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="1080" height="1920" fill="url(#hudGrid)" />
        </svg>
      </AbsoluteFill>

      {/* Layer 3: Top Institutional Telemetry Header */}
      <div
        style={{
          position: "absolute",
          top: 115,
          left: 56,
          right: 56,
          background: "rgba(9, 13, 22, 0.88)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 20,
          padding: "20px 28px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.65)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
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
            <VaultCubeIcon size={42} />
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
                ONCHAIN<span style={{ color: EMERALD }}>VAULT</span>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: SLATE_MUTED,
                  letterSpacing: "1.5px",
                }}
              >
                FORENSIC BRIEF // EP.{episodeNumber}
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
                background: "rgba(16, 185, 129, 0.14)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: 999,
                padding: "5px 14px",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  backgroundColor: EMERALD,
                  opacity: 0.5 + 0.5 * Math.sin(frame * 0.25),
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: EMERALD_LIGHT,
                  letterSpacing: "1.2px",
                }}
              >
                LIVE TELEMETRY
              </span>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
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
              background: `linear-gradient(90deg, ${EMERALD}, ${EMERALD_LIGHT})`,
            }}
          />
        </div>
      </div>

      {/* Layer 4: Dynamic Center Stage On-Chain HUD */}
      <div
        style={{
          position: "absolute",
          top: 285,
          left: 56,
          right: 56,
          height: 890,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translateY(${interpolate(cardSpring, [0, 1], [36, 0])}px) scale(${interpolate(
            cardSpring,
            [0, 1],
            [0.96, 1]
          )})`,
          opacity: interpolate(cardSpring, [0, 1], [0.15, 1]),
        }}
      >
        {/* ================= STAGE 1: WALLET / ANOMALY HOOK ================= */}
        {isStage1 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(9,13,22,0.96) 100%)",
              border: "2px solid rgba(244, 63, 94, 0.45)",
              borderRadius: 28,
              padding: 40,
              boxShadow:
                "0 35px 80px rgba(0,0,0,0.85), 0 0 70px rgba(244,63,94,0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 17,
                  fontWeight: 700,
                  color: SLATE_MUTED,
                  letterSpacing: 2,
                }}
              >
                {hud.stage1Header}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 800,
                  color: CRIMSON,
                  background: "rgba(244,63,94,0.15)",
                  border: "1px solid rgba(244,63,94,0.4)",
                  padding: "6px 16px",
                  borderRadius: 8,
                }}
              >
                {hud.stage1Badge}
              </span>
            </div>

            <div
              style={{
                background: "rgba(6, 8, 12, 0.85)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "28px 32px",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  color: SLATE_MUTED,
                  marginBottom: 10,
                }}
              >
                {hud.walletLabel}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 48,
                  fontWeight: 800,
                  color: EMERALD_LIGHT,
                  letterSpacing: "-1px",
                }}
              >
                {hud.walletAddress}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    color: STEEL_WHITE,
                    background: "rgba(255,255,255,0.08)",
                    padding: "6px 14px",
                    borderRadius: 8,
                  }}
                >
                  {hud.tag1}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    color: AMBER,
                    background: "rgba(245,158,11,0.14)",
                    padding: "6px 14px",
                    borderRadius: 8,
                  }}
                >
                  {hud.tag2}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "rgba(6, 8, 12, 0.7)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  color: SLATE_MUTED,
                  marginBottom: 18,
                  letterSpacing: 1.2,
                }}
              >
                LIVE ON-CHAIN LIQUIDITY ROUTING
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    background: "#111827",
                    border: `1.5px solid ${EMERALD}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    width: 245,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: SLATE_MUTED,
                    }}
                  >
                    {hud.nodeLeftTitle}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 19,
                      fontWeight: 800,
                      color: STEEL_WHITE,
                      marginTop: 4,
                    }}
                  >
                    {hud.nodeLeftValue}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    height: 4,
                    background: `linear-gradient(90deg, ${EMERALD}, ${CRIMSON})`,
                    margin: "0 12px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -26,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      color: CRIMSON,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hud.flowLabel}
                  </div>
                </div>

                <div
                  style={{
                    background: "#111827",
                    border: `1.5px solid ${CRIMSON}`,
                    borderRadius: 14,
                    padding: "16px 20px",
                    width: 245,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: SLATE_MUTED,
                    }}
                  >
                    {hud.nodeRightTitle}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 19,
                      fontWeight: 800,
                      color: CRIMSON,
                      marginTop: 4,
                    }}
                  >
                    {hud.nodeRightValue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: FORENSIC CASE STUDY ================= */}
        {isStage2 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(9,13,22,0.96) 100%)",
              border: "2px solid rgba(255, 255, 255, 0.14)",
              borderRadius: 28,
              padding: 38,
              boxShadow: "0 35px 80px rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 17,
                  fontWeight: 700,
                  color: SLATE_MUTED,
                  letterSpacing: 1.8,
                }}
              >
                {hud.stage2Header}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 800,
                  color: CRIMSON,
                  background: "rgba(244,63,94,0.16)",
                  border: "1px solid rgba(244,63,94,0.4)",
                  padding: "6px 16px",
                  borderRadius: 8,
                }}
              >
                {hud.stage2Badge}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div
                style={{
                  background: "rgba(6,8,12,0.85)",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: SLATE_MUTED,
                  }}
                >
                  {hud.metricLeftLabel}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 34,
                    fontWeight: 700,
                    color: EMERALD_LIGHT,
                    marginTop: 8,
                  }}
                >
                  {hud.metricLeftValue}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: "#CBD5E1",
                    marginTop: 6,
                  }}
                >
                  {hud.metricLeftSub}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(6,8,12,0.85)",
                  border: "1.5px solid rgba(244,63,94,0.45)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: SLATE_MUTED,
                  }}
                >
                  {hud.metricRightLabel}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 34,
                    fontWeight: 700,
                    color: CRIMSON,
                    marginTop: 8,
                  }}
                >
                  {hud.metricRightValue}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: "#CBD5E1",
                    marginTop: 6,
                  }}
                >
                  {hud.metricRightSub}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(6,8,12,0.85)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "24px 28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  color: SLATE_MUTED,
                  marginBottom: 12,
                }}
              >
                <span>{hud.chartLeftLabel}</span>
                <span style={{ color: CRIMSON, fontWeight: 700 }}>
                  {hud.chartRightLabel}
                </span>
              </div>
              <svg width="840" height="190" viewBox="0 0 840 190" fill="none">
                <line
                  x1="0"
                  y1="45"
                  x2="840"
                  y2="45"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="6 6"
                />
                <line
                  x1="0"
                  y1="135"
                  x2="840"
                  y2="135"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="6 6"
                />
                <path
                  d="M 10 150 L 120 135 L 230 110 L 340 65 L 440 24"
                  stroke={EMERALD}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 440 24 L 510 38 L 570 115 L 680 162 L 820 172"
                  stroke={CRIMSON}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <line
                  x1="440"
                  y1="10"
                  x2="440"
                  y2="180"
                  stroke={AMBER}
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />
                <circle cx="440" cy="24" r="9" fill={AMBER} />
              </svg>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                <span style={{ color: EMERALD_LIGHT }}>{hud.barLeftLabel}</span>
                <span style={{ color: CRIMSON }}>{hud.barRightLabel}</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 20,
                  background: "#1E293B",
                  borderRadius: 10,
                  overflow: "hidden",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    width: `${hud.barLeftPct}%`,
                    height: "100%",
                    background: EMERALD,
                  }}
                />
                <div
                  style={{
                    width: `${100 - hud.barLeftPct}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${AMBER}, ${CRIMSON})`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE 3: THE 3-RULE PLAYBOOK ================= */}
        {isStage3 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                background: "rgba(15,23,42,0.92)",
                border: `1.5px solid rgba(16,185,129,0.4)`,
                borderRadius: 20,
                padding: "18px 28px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 18,
                  fontWeight: 800,
                  color: EMERALD_LIGHT,
                  letterSpacing: 1.5,
                }}
              >
                {hud.stage3Header}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  color: STEEL_WHITE,
                  background: "rgba(255,255,255,0.08)",
                  padding: "5px 14px",
                  borderRadius: 8,
                }}
              >
                3 NON-NEGOTIABLE RULES
              </span>
            </div>

            {(() => {
              const active1 = currentTime >= r1Start;
              return (
                <div
                  style={{
                    background: active1
                      ? "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(9,13,22,0.98) 100%)"
                      : "rgba(9,13,22,0.65)",
                    border: active1
                      ? `2px solid ${EMERALD}`
                      : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 22,
                    padding: "24px 30px",
                    opacity: active1 ? 1 : 0.45,
                    boxShadow: active1
                      ? "0 20px 50px rgba(0,0,0,0.75)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 16,
                        fontWeight: 800,
                        color: EMERALD_LIGHT,
                      }}
                    >
                      {hud.rule1Tag}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        fontWeight: 800,
                        color: CRIMSON,
                        background: "rgba(244,63,94,0.15)",
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}
                    >
                      {hud.rule1Badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: STEEL_WHITE,
                    }}
                  >
                    {hud.rule1Text}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const active2 = currentTime >= r2Start;
              return (
                <div
                  style={{
                    background: active2
                      ? "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(9,13,22,0.98) 100%)"
                      : "rgba(9,13,22,0.65)",
                    border: active2
                      ? `2px solid ${AMBER}`
                      : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 22,
                    padding: "24px 30px",
                    opacity: active2 ? 1 : 0.45,
                    boxShadow: active2
                      ? "0 20px 50px rgba(0,0,0,0.75)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 16,
                        fontWeight: 800,
                        color: AMBER,
                      }}
                    >
                      {hud.rule2Tag}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        fontWeight: 800,
                        color: AMBER,
                        background: "rgba(245,158,11,0.15)",
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}
                    >
                      {hud.rule2Badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: STEEL_WHITE,
                    }}
                  >
                    {hud.rule2Text}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const active3 = currentTime >= r3Start;
              return (
                <div
                  style={{
                    background: active3
                      ? "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(9,13,22,0.98) 100%)"
                      : "rgba(9,13,22,0.65)",
                    border: active3
                      ? `2px solid ${EMERALD}`
                      : "1.5px solid rgba(255,255,255,0.08)",
                    borderRadius: 22,
                    padding: "24px 30px",
                    opacity: active3 ? 1 : 0.45,
                    boxShadow: active3
                      ? "0 20px 50px rgba(0,0,0,0.75)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 16,
                        fontWeight: 800,
                        color: EMERALD_LIGHT,
                      }}
                    >
                      {hud.rule3Tag}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        fontWeight: 800,
                        color: EMERALD_LIGHT,
                        background: "rgba(16,185,129,0.15)",
                        padding: "4px 12px",
                        borderRadius: 6,
                      }}
                    >
                      {hud.rule3Badge}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: STEEL_WHITE,
                    }}
                  >
                    {hud.rule3Text}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= STAGE 4: VERDICT & LOOP BRIDGE ================= */}
        {isStage4 && (
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(9,13,22,0.98) 100%)",
              border: `2.5px solid ${EMERALD}`,
              borderRadius: 28,
              padding: "44px 40px",
              boxShadow:
                "0 35px 90px rgba(0,0,0,0.9), 0 0 80px rgba(16,185,129,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 24,
            }}
          >
            <VaultCubeIcon size={88} />
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 17,
                fontWeight: 800,
                color: EMERALD_LIGHT,
                letterSpacing: 2.5,
                background: "rgba(16,185,129,0.14)",
                border: "1px solid rgba(16,185,129,0.35)",
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              ● SAVE THIS 60-SECOND CHECKLIST
            </div>

            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 48,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              DON&apos;T WATCH THE HYPE.
              <br />
              <span style={{ color: EMERALD_LIGHT }}>TRACK THE WALLETS.</span>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                color: "#CBD5E1",
              }}
            >
              {hud.verdictPills.map((pill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.07)",
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
                marginTop: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                fontWeight: 800,
                color: STEEL_WHITE,
                background: "rgba(16,185,129,0.2)",
                border: `1.5px solid ${EMERALD}`,
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
            bottom: 300,
            left: 56,
            right: 56,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(6, 8, 12, 0.90)",
              border: "1.5px solid rgba(255, 255, 255, 0.14)",
              borderRadius: 22,
              padding: "22px 32px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px 16px",
              minHeight: 110,
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
                  "64",
                  "64%",
                  "$485",
                  "$485m",
                  "$48m",
                  "unlock",
                  "exit",
                  "liquidity",
                  "never",
                  "5x",
                  "spoofing",
                  "honeypot",
                  "trap",
                  "crash",
                  "dump",
                  "sybil",
                ].includes(clean);
                const isAlpha = [
                  "0x71c89a2",
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
                ].includes(clean);

                const activeBg = isAlert
                  ? CRIMSON
                  : isAlpha
                  ? EMERALD
                  : "#FFFFFF";
                const activeColor = "#06080C";

                return (
                  <span
                    key={`${w.start}-${i}`}
                    style={{
                      fontFamily:
                        "'Space Grotesk', 'Inter', system-ui, sans-serif",
                      fontSize: 44,
                      fontWeight: 700,
                      letterSpacing: "-0.8px",
                      padding: isSpoken ? "4px 16px" : "4px 6px",
                      borderRadius: 10,
                      backgroundColor: isSpoken ? activeBg : "transparent",
                      color: isSpoken
                        ? activeColor
                        : isAlert
                        ? "#FDA4AF"
                        : isAlpha
                        ? "#6EE7B7"
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
