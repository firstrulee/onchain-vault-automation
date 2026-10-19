import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const EPISODES = [
  { ep: "EP02", slot: "W1_02_WHALE_ACCUMULATION_RADAR", propsFile: "ep02_props.json" },
  { ep: "EP03", slot: "W1_03_PLAY_TO_AIRDROP_MATH", propsFile: "ep03_props.json" },
  { ep: "EP04", slot: "W1_04_DEX_LIQUIDITY_TRAP", propsFile: "ep04_props.json" },
  { ep: "EP05", slot: "W1_05_ORDERBOOK_SPOOFING", propsFile: "ep05_props.json" },
  { ep: "EP06", slot: "W1_06_GAMEFI_DEATH_SPIRAL", propsFile: "ep06_props.json" },
  { ep: "EP07", slot: "W1_07_INSIDER_WALLET_CLUSTERS", propsFile: "ep07_props.json" },
  { ep: "EP08", slot: "W1_08_FDV_VALUATION_ILLUSION", propsFile: "ep08_props.json" },
  { ep: "EP09", slot: "W1_09_HONEYPOT_CONTRACT_AUDIT", propsFile: "ep09_props.json" },
  { ep: "EP10", slot: "W1_10_L2_GAMING_TVL_MIGRATION", propsFile: "ep10_props.json" },
  { ep: "EP11", slot: "W1_11_CEX_LISTING_EXIT_TRAP", propsFile: "ep11_props.json" },
  { ep: "EP12", slot: "W1_12_SYBIL_FILTER_MATH", propsFile: "ep12_props.json" },
  { ep: "EP13", slot: "W1_13_STABLECOIN_DRY_POWDER", propsFile: "ep13_props.json" },
  { ep: "EP14", slot: "W1_14_SMART_MONEY_REBALANCE", propsFile: "ep14_props.json" },
];

async function main() {
  const rootDir = process.cwd();
  const entryPoint = path.join(rootDir, "src", "index.ts");
  const queueDir = path.join(rootDir, "queue");
  fs.mkdirSync(queueDir, { recursive: true });

  console.log("📦 Bundling Remotion project ONCE for all 13 episodes...");
  const bundleLocation = await bundle({
    entryPoint,
    publicDir: path.join(rootDir, "public"),
  });
  console.log("✅ Bundle ready:", bundleLocation);

  for (const item of EPISODES) {
    const outPath = path.join(queueDir, `${item.slot}.mp4`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1_000_000) {
      console.log(`⏭️ [${item.ep}] Already rendered (${outPath}), skipping.`);
      continue;
    }

    const propsPath = path.join(rootDir, "public", item.propsFile);
    const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf-8"));
    const brollPath = path.join(rootDir, "public", inputProps.brollFile);
    if (!fs.existsSync(brollPath)) {
      console.warn(`⚠️ [${item.ep}] Missing B-roll ${inputProps.brollFile}, falling back to ep01_flow_broll.mp4`);
      inputProps.brollFile = "ep01_flow_broll.mp4";
    }

    console.log(`🎬 [${item.ep}] Rendering ${item.slot}.mp4 (${inputProps.durationInFrames} frames)...`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "OnChainVaultShort",
      inputProps,
      timeoutInMilliseconds: 120000,
    });

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outPath,
      inputProps,
      concurrency: 3,
      timeoutInMilliseconds: 120000,
    });

    const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ [${item.ep}] Rendered ${item.slot}.mp4 (${sizeMb} MB)`);
  }

  console.log("🎉 ALL 13 QUEUE VIDEOS RENDERED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("❌ Batch render failed:", err);
  process.exit(1);
});
