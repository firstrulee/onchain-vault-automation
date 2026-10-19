import asyncio
import json
import math
import os
import struct
import sys
import wave
import edge_tts
from mutagen.mp3 import MP3

sys.stdout.reconfigure(encoding="utf-8")

EPISODES = [
    {
        "ep": "02",
        "slot": "W1_02_MON_2100_WHALE_CLUSTER",
        "broll": "ep02_flow_broll.mp4",
        "title": "How To Spot Whale Accumulation Before A 3x Move 🐋 #Shorts",
        "script": (
            "Stop looking at price charts and start watching fresh wallet clusters. "
            "Seventy-two hours before a mid-cap gaming infrastructure token rallied two hundred and ten percent, "
            "five brand-new wallets withdrew twelve million dollars from Coinbase Prime. "
            "Smart money never buys in a single clip. Here is how to catch them in three steps. "
            "Rule one: filter for newly funded wallets receiving over two hundred and fifty thousand dollars from institutional custody. "
            "Rule two: verify that zero tokens are being sent back to market-maker addresses. "
            "Rule three: confirm exchange supply is dropping while funding rates stay flat. "
            "Save this radar setup and subscribe for daily wallet forensics, and remember..."
        ),
        "hudData": {
            "stage1Header": "01 // FRESH WALLET CLUSTER",
            "stage1Badge": "● STEALTH ACCUMULATION",
            "walletLabel": "CLUSTER OF 5 FRESH WALLETS",
            "walletAddress": "0x94A...3F1C",
            "tag1": "SOURCE: COINBASE PRIME",
            "tag2": "INFLOW: +$12.4M",
            "nodeLeftTitle": "CUSTODY COLD WALLET",
            "nodeLeftValue": "COINBASE PRIME",
            "flowLabel": "+$12.4M WITHDRAWAL →",
            "nodeRightTitle": "STEALTH CLUSTER (5x)",
            "nodeRightValue": "0x94A...3F1C",
            "stage2Header": "02 // PRE-RALLY TELEMETRY (T-72 HOURS)",
            "stage2Badge": "BREAKOUT: +210.0%",
            "metricLeftLabel": "RETAIL SENTIMENT",
            "metricLeftValue": "FLAT / BORED",
            "metricLeftSub": "Zero Social Mentions Before Move",
            "metricRightLabel": "INSTITUTIONAL FLOW",
            "metricRightValue": "-18% CEX SUPPLY",
            "metricRightSub": "12.4M Tokens Absorbed Off-Exchange",
            "chartLeftLabel": "STEALTH ACCUMULATION ZONE",
            "chartRightLabel": "▲ SUPPLY SQUEEZE (+210%)",
            "barLeftLabel": "OFF-EXCHANGE WHALE CUSTODY: 68%",
            "barLeftPct": 68,
            "barRightLabel": "REMAINING CEX LIQUIDITY: 32%",
            "stage3Header": "03 // WHALE CLUSTER DETECTION RULES",
            "rule1Tag": "RULE #01 // FRESH WALLET FILTER",
            "rule1Badge": "CUSTODY → NEW WALLET > $250K",
            "rule1Text": "Track New Wallets Funded by Institutional Custody",
            "rule2Tag": "RULE #02 // ZERO MM DUMP CHECK",
            "rule2Badge": "NO MARKET-MAKER RETURN",
            "rule2Text": "Verify Zero Tokens Route Back to Market Makers",
            "rule3Tag": "RULE #03 // FUNDING DIVERGENCE",
            "rule3Badge": "CEX SUPPLY ↓ + FLAT FUNDING",
            "rule3Text": "Confirm Exchange Reserves Drop While Funding Stays Flat",
            "verdictPills": ["✓ FRESH >$250K", "✓ ZERO MM FLOW", "✓ CEX DRAIN"]
        },
        "pinned_comment": "📌 STEALTH WHALE CHECKLIST:\n1) Fresh wallets funded >$250K from Custody\n2) Zero routing to Market Makers\n3) CEX reserves dropping while funding stays flat\n\nWant us to scan a specific token's top holders next? Comment the ticker 👇"
    },
    {
        "ep": "03",
        "slot": "W1_03_TUE_1500_P2A_MATH",
        "broll": "ep03_flow_broll.mp4",
        "title": "Why 90% of Play-To-Airdrop Farmers Make $0 (Do This Instead) 🎮 #Shorts",
        "script": (
            "Ninety percent of Play-to-Airdrop gamers farm the wrong metric and walk away with dust. "
            "In the last three major Web3 game launches, accounts grinding free daily quests earned less than twelve dollars, "
            "while wallets providing in-game marketplace liquidity averaged four thousandtwo hundred dollars per allocation. "
            "Game studios reward capital velocity, not screen time. Follow these three rules. "
            "Rule one: divide total airdrop allocation by active daily wallets to find the real dilution floor. "
            "Rule two: prioritize on-chain transaction volume and NFT sink mechanics over social quests. "
            "Rule three: exit seventy percent of your airdrop within the first four hours of TGE liquidity. "
            "Save this P2A playbook and subscribe for real Web3 gaming math, because..."
        ),
        "hudData": {
            "stage1Header": "01 // PLAY-TO-AIRDROP FORENSICS",
            "stage1Badge": "▲ DILUTION WARNING",
            "walletLabel": "TIER-1 P2A ALLOCATION AUDIT",
            "walletAddress": "0x38F...C90B",
            "tag1": "QUEST GRINDER: $11.40",
            "tag2": "ONCHAIN SINK LP: $4,200",
            "nodeLeftTitle": "FREE QUEST BOTS",
            "nodeLeftValue": "840,000 WALLETS",
            "flowLabel": "92% SYBIL SLASHED →",
            "nodeRightTitle": "ON-CHAIN SINK TIER",
            "nodeRightValue": "+$4,200 / WALLET",
            "stage2Header": "02 // TGE ALLOCATION DISTRIBUTION",
            "stage2Badge": "TOP 4% TAKE 80% POOL",
            "metricLeftLabel": "SOCIAL / DAILY QUESTS",
            "metricLeftValue": "$11.40 AVG",
            "metricLeftSub": "Diluted by 800K+ Bot Accounts",
            "metricRightLabel": "ON-CHAIN SINK / VOLUME",
            "metricRightValue": "$4,200 AVG",
            "metricRightSub": "Weighted by Token Burn & Marketplace Fee",
            "chartLeftLabel": "TGE HOUR 1-4 LIQUIDITY PEAK",
            "chartRightLabel": "▼ FARMER SELL-OFF (-58%)",
            "barLeftLabel": "ON-CHAIN SINK REWARD POOL: 80%",
            "barLeftPct": 80,
            "barRightLabel": "FREE SOCIAL QUEST POOL: 20%",
            "stage3Header": "03 // THE P2A PROFIT FORMULA",
            "rule1Tag": "RULE #01 // DILUTION FLOOR MATH",
            "rule1Badge": "AIRDROP POOL ÷ ACTIVE WALLETS",
            "rule1Text": "Divide Airdrop Pool Value by Active Daily Wallets",
            "rule2Tag": "RULE #02 // ON-CHAIN SINK WEIGHT",
            "rule2Badge": "BURN & MARKETPLACE FEES > QUESTS",
            "rule2Text": "Farm On-Chain Token Sinks Instead of Social Quests",
            "rule3Tag": "RULE #03 // TGE EXECUTION WINDOW",
            "rule3Badge": "SELL 70% IN FIRST 4 HOURS",
            "rule3Text": "Realize 70% of Airdrop Allocation in Hour 1 to 4 of TGE",
            "verdictPills": ["✓ POOL/WALLET MATH", "✓ ONCHAIN SINKS", "✓ 4H TGE EXIT"]
        },
        "pinned_comment": "📌 PLAY-TO-AIRDROP MATH:\n1) Calculate Pool Value ÷ Active Wallets first\n2) Farm on-chain token sinks & marketplace volume, not free social quests\n3) Lock in 70% profit within the first 4 hours of TGE\n\nWhich Web3 game are you farming right now? 👇"
    },
    {
        "ep": "04",
        "slot": "W1_04_TUE_0200_DEX_LIQUIDITY_TRAP",
        "broll": "ep04_flow_broll.mp4",
        "title": "The Fake $50M Market Cap Illusion On DEXs 🔍 #Shorts",
        "script": (
            "A token showing a fifty million dollar market cap on DEX Screener can collapse to zero with just eighty thousand dollars of sell pressure. "
            "Last week, a trending gaming token rugged thousands of traders who confused Market Cap with actual Locked Liquidity. "
            "The developer held ninety-one percent of the supply and paired it with only ninety thousand dollars of wrapped Ethereum. "
            "Never get trapped by paper valuation again. Audit these three numbers first. "
            "Rule one: check Liquidity-to-Market-Cap ratio—if locked liquidity is under five percent of market cap, walk away. "
            "Rule two: verify LP tokens are burned or locked in an audited contract for at least twelve months. "
            "Rule three: inspect top ten non-exchange holders—if they control over twenty percent, it is a rug waiting to happen. "
            "Save this DEX audit and subscribe so you never become exit liquidity, because..."
        ),
        "hudData": {
            "stage1Header": "01 // DEX LIQUIDITY ILLUSION",
            "stage1Badge": "▲ RUG RISK: CRITICAL",
            "walletLabel": "UNISWAP / RAYDIUM LP CONTRACT",
            "walletAddress": "0xE12...44D9",
            "tag1": "PAPER MCAP: $50.0M",
            "tag2": "REAL LP: $90,000",
            "nodeLeftTitle": "PAPER VALUATION",
            "nodeLeftValue": "$50,000,000",
            "flowLabel": "0.18% LP DEPTH →",
            "nodeRightTitle": "ACTUAL EXIT POOL",
            "nodeRightValue": "$90,000 WETH",
            "stage2Header": "02 // SLIPPAGE CASCADE ANALYSIS",
            "stage2Badge": "-94% ON $80K SELL",
            "metricLeftLabel": "DISPLAYED MARKET CAP",
            "metricLeftValue": "$50.0M FAKE",
            "metricLeftSub": "Artificially Pumped with Low Float",
            "metricRightLabel": "EXTRACTED LIQUIDITY",
            "metricRightValue": "$90K POOL",
            "metricRightSub": "Single Whale Sell Wipes Out Orderbook",
            "chartLeftLabel": "ARTIFICIAL LOW-LP PUMP",
            "chartRightLabel": "▼ LP DRAIN COLLAPSE (-94%)",
            "barLeftLabel": "REAL LOCKED LIQUIDITY: 4%",
            "barLeftPct": 8,
            "barRightLabel": "ILLIQUID PAPER VALUATION: 96%",
            "stage3Header": "03 // THE 3-STEP DEX LIQUIDITY AUDIT",
            "rule1Tag": "RULE #01 // LP-TO-MCAP RATIO",
            "rule1Badge": "LOCKED LP MUST BE > 5% MCAP",
            "rule1Text": "Never Buy If Locked Liquidity Is Under 5% of Market Cap",
            "rule2Tag": "RULE #02 // LP LOCK VERIFICATION",
            "rule2Badge": "BURNED OR LOCKED > 12 MONTHS",
            "rule2Text": "Confirm LP Tokens Are Burned or Locked Over 12 Months",
            "rule3Tag": "RULE #03 // TOP 10 HOLDER CLUSTER",
            "rule3Badge": "TOP 10 WALLETS < 20% SUPPLY",
            "rule3Text": "Reject Any Token Where Top 10 Wallets Hold Over 20%",
            "verdictPills": ["✓ LP > 5% MCAP", "✓ 12M LP LOCK", "✓ TOP 10 < 20%"]
        },
        "pinned_comment": "📌 DEX LIQUIDITY AUDIT:\n1) Locked Liquidity must be at least 5% of Market Cap\n2) LP tokens burned or locked >12 months\n3) Top 10 non-CEX wallets must hold <20% of supply\n\nSubscribe to @OnChainVault for daily on-chain protection."
    },
    {
        "ep": "05",
        "slot": "W1_05_WED_1500_MM_SPOOFING",
        "broll": "ep05_flow_broll.mp4",
        "title": "How Market Makers Fake Breakouts To Trap Leverage Traders 📉 #Shorts",
        "script": (
            "That massive buy wall you see on the orderbook is not support—it is a magnet designed to liquidate you. "
            "On-chain and orderbook forensics show algorithmic market makers placing four million dollar bid walls just below resistance, "
            "tricking retail into opening twenty-x long positions. "
            "The millisecond open interest spikes, the bid wall is pulled in twelve milliseconds and price flushes eight percent to sweep every stop-loss. "
            "Trade with the liquidity sweeps, not against them. "
            "Rule one: never long a breakout when perpetual open interest rises faster than spot volume. "
            "Rule two: wait for the stop-hunt wick below the recent swing low before entering. "
            "Rule three: verify spot CVD—Cumulative Volume Delta—is trending up while leverage gets flushed. "
            "Save this market-maker decoder and subscribe for daily institutional edge, because..."
        ),
        "hudData": {
            "stage1Header": "01 // ORDERBOOK SPOOFING TELEMETRY",
            "stage1Badge": "▲ LIQUIDITY TRAP",
            "walletLabel": "ALGORITHMIC MM ENGINE",
            "walletAddress": "0x55B...71E0",
            "tag1": "SPOOF BID: $4.2M",
            "tag2": "CANCEL TIME: 12ms",
            "nodeLeftTitle": "RETAIL LONGS (20x)",
            "nodeLeftValue": "+$18.5M OI SPIKE",
            "flowLabel": "STOP-LOSS SWEEP →",
            "nodeRightTitle": "MM LIQUIDATION FILL",
            "nodeRightValue": "-8.4% WICK",
            "stage2Header": "02 // PERPETUAL VS SPOT DIVERGENCE",
            "stage2Badge": "$18.5M LIQUIDATED",
            "metricLeftLabel": "PERP OPEN INTEREST",
            "metricLeftValue": "+42% SPIKE",
            "metricLeftSub": "Retail Chasing Spoofed Breakout",
            "metricRightLabel": "SPOT CVD (REAL BUYING)",
            "metricRightValue": "NEGATIVE FLOW",
            "metricRightSub": "Market Makers Selling Into Perp Longs",
            "chartLeftLabel": "FAKEOUT ABOVE RESISTANCE",
            "chartRightLabel": "▼ LONG LIQUIDATION CASCADE",
            "barLeftLabel": "GENUINE SPOT DEMAND: 24%",
            "barLeftPct": 24,
            "barRightLabel": "OVER-LEVERAGED PERP LONGS: 76%",
            "stage3Header": "03 // ANTI-SPOOFING EXECUTION RULES",
            "rule1Tag": "RULE #01 // OI VS SPOT FILTER",
            "rule1Badge": "AVOID IF OI > SPOT VOLUME",
            "rule1Text": "Never Long When Open Interest Spikes Without Spot Volume",
            "rule2Tag": "RULE #02 // ENTER ON THE SWEEP",
            "rule2Badge": "WAIT FOR STOP-HUNT WICK",
            "rule2Text": "Wait for the Stop-Loss Flush Below Support Before Buying",
            "rule3Tag": "RULE #03 // SPOT CVD CONFIRMATION",
            "rule3Badge": "SPOT CVD ↑ + FUNDING RESET",
            "rule3Text": "Enter Only When Spot Cumulative Volume Delta Turns Positive",
            "verdictPills": ["✓ SPOT > PERP OI", "✓ BUY THE SWEEP", "✓ SPOT CVD UP"]
        },
        "pinned_comment": "📌 MARKET MAKER ANTI-TRAP RULES:\n1) Never long when Perp Open Interest rises faster than Spot Volume\n2) Wait for the stop-hunt wick below support\n3) Confirm Spot CVD is rising while funding resets 👇"
    },
    {
        "ep": "06",
        "slot": "W1_06_WED_0200_GAMEFI_DEATH_SPIRAL",
        "broll": "ep06_flow_broll.mp4",
        "title": "The 1 Ratio That Predicts Every Web3 Game Economy Crash 🎮 #Shorts",
        "script": (
            "Every Web3 game economy that crashed ninety-five percent failed the exact same mathematical test: the Sink-to-Faucet Ratio. "
            "When a game prints reward tokens faster than players burn them for upgrades, crafting, or tournament fees, hyperinflation is guaranteed within thirty days. "
            "Before you buy any gaming token or guild NFT, run this three-step tokenomics audit. "
            "Rule one: track the daily Burn-to-Mint ratio on-chain—if minted rewards exceed burned tokens for five consecutive days, exit immediately. "
            "Rule two: separate governance tokens from uncapped utility tokens—never hold the inflationary reward token long term. "
            "Rule three: check if new player wallet growth is slowing while reward emissions rise. "
            "Save this GameFi audit and subscribe for daily Web3 economy breakdowns, because..."
        ),
        "hudData": {
            "stage1Header": "01 // GAMEFI TOKENOMICS AUDIT",
            "stage1Badge": "▲ HYPERINFLATION ALERT",
            "walletLabel": "REWARD EMISSION CONTRACT",
            "walletAddress": "0x82D...19A4",
            "tag1": "MINTED: 4.8M / DAY",
            "tag2": "BURNED: 1.1M / DAY",
            "nodeLeftTitle": "DAILY FAUCET (MINT)",
            "nodeLeftValue": "+4,800,000 TKN",
            "flowLabel": "4.3x NET INFLATION →",
            "nodeRightTitle": "IN-GAME SINK (BURN)",
            "nodeRightValue": "-1,100,000 TKN",
            "stage2Header": "02 // SINK-TO-FAUCET DEATH SPIRAL",
            "stage2Badge": "RATIO: 0.23 (CRITICAL)",
            "metricLeftLabel": "HEALTHY GAME ECONOMY",
            "metricLeftValue": "BURN > MINT",
            "metricLeftSub": "Sink-to-Faucet Ratio Above 1.05",
            "metricRightLabel": "FAILING GAME ECONOMY",
            "metricRightValue": "4.3x SURPLUS",
            "metricRightSub": "Farmers Dump Daily Rewards on DEX",
            "chartLeftLabel": "NEW PLAYER INFLOW PEAK",
            "chartRightLabel": "▼ EMISSION DEATH SPIRAL (-95%)",
            "barLeftLabel": "BURNED IN-GAME (SINKS): 19%",
            "barLeftPct": 19,
            "barRightLabel": "UNABSORBED FARMER EMISSIONS: 81%",
            "stage3Header": "03 // WEB3 GAME ECONOMY SURVIVAL RULES",
            "rule1Tag": "RULE #01 // BURN-TO-MINT RATIO",
            "rule1Badge": "EXIT IF MINT > BURN FOR 5 DAYS",
            "rule1Text": "Track Daily On-Chain Burn vs Mint—Exit If Below 1.0",
            "rule2Tag": "RULE #02 // DUAL-TOKEN SEPARATION",
            "rule2Badge": "NEVER HOLD UNCAPPED REWARD TOKEN",
            "rule2Text": "Never Hold Uncapped Utility Reward Tokens Long-Term",
            "rule3Tag": "RULE #03 // DAU GROWTH VELOCITY",
            "rule3Badge": "NEW WALLETS MUST OUTPACE EMISSIONS",
            "rule3Text": "Exit Immediately When New Wallet Growth flattens",
            "verdictPills": ["✓ BURN/MINT > 1", "✓ AVOID UTILITY", "✓ DAU GROWTH"]
        },
        "pinned_comment": "📌 WEB3 GAME ECONOMY AUDIT:\n1) Daily Burn-to-Mint (Sink-to-Faucet) ratio must stay >1.0\n2) Never hold uncapped reward tokens long-term\n3) Watch New Wallet Growth vs Daily Emissions 👇"
    },
    {
        "ep": "07",
        "slot": "W1_07_THU_1500_INSIDER_BUBBLEMAPS",
        "broll": "ep07_flow_broll.mp4",
        "title": "How Insiders Hide 40% Of A Token's Supply In 'Retail' Wallets 🕵️ #Shorts",
        "script": (
            "When a project claims no wallet holds more than two percent of the supply, they are usually hiding a connected wallet web. "
            "Before a recent Solana gaming token collapsed seventy-eight percent, block explorer data showed two hundred seemingly separate wallets. "
            "But on-chain gas forensics revealed every single one of those two hundred wallets was funded by the exact same mother address three minutes before launch. "
            "Here is how you expose insider cabals in sixty seconds. "
            "Rule one: trace the initial SOL or ETH gas funding source of the top fifty holders. "
            "Rule two: look for synchronized block-zero buys executed within the same two blocks of launch. "
            "Rule three: check if multiple wallets transfer tokens to a single consolidator address before sending to an exchange. "
            "Save this forensic method and subscribe to track the cabals, because..."
        ),
        "hudData": {
            "stage1Header": "01 // SYBIL CABAL FORENSICS",
            "stage1Badge": "▲ 40% HIDDEN SUPPLY",
            "walletLabel": "DEPLOYER MOTHER FUNDING WALLET",
            "walletAddress": "0xC09...88B1",
            "tag1": "LINKED WALLETS: 200",
            "tag2": "BLOCK-0 SNIPE: 41.2%",
            "nodeLeftTitle": "MOTHER WALLET",
            "nodeLeftValue": "0xC09...88B1",
            "flowLabel": "SPLITS GAS TO 200 →",
            "nodeRightTitle": "FAKE 'RETAIL' WEB",
            "nodeRightValue": "41.2% SUPPLY",
            "stage2Header": "02 // CLUSTER DISTRIBUTION VS REALITY",
            "stage2Badge": "CABAL DUMP: -78.0%",
            "metricLeftLabel": "PUBLIC HOLDER TABLE",
            "metricLeftValue": "MAX 1.8% / WALLET",
            "metricLeftSub": "Looks Decentralised on Surface",
            "metricRightLabel": "WALLET GRAPH REALITY",
            "metricRightValue": "41.2% ONE ENTITY",
            "metricRightSub": "200 Wallets Funded by Same Deployer",
            "chartLeftLabel": "COORDINATED WASH TRADING",
            "chartRightLabel": "▼ SYNCHRONIZED CABAL EXIT",
            "barLeftLabel": "GENUINE PUBLIC FLOAT: 58%",
            "barLeftPct": 58,
            "barRightLabel": "HIDDEN DEPLOYER WALLET WEB: 42%",
            "stage3Header": "03 // 60-SECOND CABAL DETECTION PLAYBOOK",
            "rule1Tag": "RULE #01 // GAS FUNDING TRACE",
            "rule1Badge": "CHECK FIRST ETH/SOL GAS SOURCE",
            "rule1Text": "Trace Initial Gas Funding of Top 50 Holder Wallets",
            "rule2Tag": "RULE #02 // BLOCK-ZERO SNIPE AUDIT",
            "rule2Badge": "REJECT >15% BLOCK-0 BUYS",
            "rule2Text": "Avoid Tokens Where Block-Zero Snipers Hold Over 15%",
            "rule3Tag": "RULE #03 // CONSOLIDATOR TRACKING",
            "rule3Badge": "WATCH MULTI-WALLET MERGES",
            "rule3Text": "Exit When Split Wallets Merge Tokens Into One CEX Address",
            "verdictPills": ["✓ TRACE GAS", "✓ BLOCK-0 < 15%", "✓ CLUSTER MAP"]
        },
        "pinned_comment": "📌 HOW TO SPOT INSIDER WALLET WEBS:\n1) Trace initial ETH/SOL gas funding of top 50 holders\n2) Check Block-0 sniper concentration (<15% max)\n3) Watch for split wallets merging into one CEX deposit address 👇"
    },
    {
        "ep": "08",
        "slot": "W1_08_THU_0200_LOW_FLOAT_HIGH_FDV",
        "broll": "ep08_flow_broll.mp4",
        "title": "Why 'Low Float, High FDV' Tokens Are Mathematical Time Bombs 💣 #Shorts",
        "script": (
            "If a new crypto gaming or Layer-2 token launches with a two hundred million dollar market cap but a four billion dollar Fully Diluted Valuation, "
            "you are staring at a mathematical time bomb. "
            "With only five percent of tokens circulating at launch, ninety-five percent of the supply is locked for VCs who bought at a ninety percent discount. "
            "Even if the project grows तीन hundred percent in users, linear monthly unlocks will crush the token price for three straight years. "
            "Protect your portfolio with these three rules. "
            "Rule one: never hold long-term spot positions in any token launching with less than二十 percent circulating supply. "
            "Rule two: calculate monthly emission pressure in dollars and compare it to daily spot volume. "
            "Rule three: wait until at least sixty percent of VC vesting is unlocked before accumulating for the next cycle. "
            "Save this valuation rule and subscribe for institutional tokenomics, because..."
        ),
        "hudData": {
            "stage1Header": "01 // LOW-FLOAT / HIGH-FDV AUDIT",
            "stage1Badge": "▲ 20x DILUTION OVERHANG",
            "walletLabel": "VESTING ESCROW CONTRACT",
            "walletAddress": "0x44A...90E3",
            "tag1": "MCAP: $200M (5%)",
            "tag2": "FDV: $4.0B (100%)",
            "nodeLeftTitle": "CIRCULATING FLOAT",
            "nodeLeftValue": "5% ($200M)",
            "flowLabel": "+1,900% SUPPLY INCOMING →",
            "nodeRightTitle": "LOCKED VC VESTING",
            "nodeRightValue": "95% ($3.8B)",
            "stage2Header": "02 // 36-MONTH SUPPLY DILUTION CURVE",
            "stage2Badge": "VC COST BASIS: -92%",
            "metricLeftLabel": "LAUNCH CIRCULATING",
            "metricLeftValue": "5% SUPPLY",
            "metricLeftSub": "Artificial Scarcity Creates High Price",
            "metricRightLabel": "MONTHLY VC EMISSION",
            "metricRightValue": "$85M / MONTH",
            "metricRightSub": "Relentless Sell Pressure Regardless of News",
            "chartLeftLabel": "TGE ARTIFICIAL SCARCITY PEAK",
            "chartRightLabel": "▼ 36-MONTH VESTING BLEED",
            "barLeftLabel": "UNLOCKED AT LAUNCH: 5%",
            "barLeftPct": 8,
            "barRightLabel": "LOCKED INSIDER / TREASURY OVERHANG: 95%",
            "stage3Header": "03 // THE FDV VALUATION FILTER",
            "rule1Tag": "RULE #01 // MINIMUM FLOAT THRESHOLD",
            "rule1Badge": "CIRCULATING SUPPLY MUST BE > 25%",
            "rule1Text": "Avoid Long-Term Spot Positions Under 25% Circulating Supply",
            "rule2Tag": "RULE #02 // MONTHLY DOLLAR OVERHANG",
            "rule2Badge": "MONTHLY UNLOCK < 30% DAILY VOL",
            "rule2Text": "Compare Monthly Dollar Unlocks Against Daily Spot Volume",
            "rule3Tag": "RULE #03 // SWEET-SPOT ACCUMULATION",
            "rule3Badge": "BUY AFTER 60% VESTING COMPLETES",
            "rule3Text": "Accumulate Only After 60% of VC Vesting Has Unlocked",
            "verdictPills": ["✓ FLOAT > 25%", "✓ UNLOCK VS VOL", "✓ >60% VESTED"]
        },
        "pinned_comment": "📌 LOW-FLOAT / HIGH-FDV SURVIVAL RULES:\n1) Avoid long-term spot if circulating supply is <25%\n2) Compare monthly $ unlock value vs daily spot volume\n3) Accumulate only after >60% of VC supply has vested 👇"
    },
    {
        "ep": "09",
        "slot": "W1_09_FRI_1500_SMART_CONTRACT_HONEYPOT",
        "broll": "ep09_flow_broll.mp4",
        "title": "3 Smart Contract Functions That Steal Your Crypto Instantly 🔐 #Shorts",
        "script": (
            "Your chart shows a three hundred percent gain, you click sell on Uniswap, and the transaction fails—welcome to a smart contract honeypot. "
            "Scammers deploy gaming and meme tokens with clean-looking code that hides a dynamic sell-tax modifier or a transfer blacklist function. "
            "Once retail pushes the price up, the owner calls a single contract function that sets sell tax to ninety-nine percent. "
            "Never sign a swap before checking these three contract flags in ten seconds. "
            "Rule one: verify contract ownership is renounced or controlled by a time-locked multisig. "
            "Rule two: scan for hidden blacklist, pauseTrading, or setTax functions in the proxy implementation. "
            "Rule three: never grant unlimited token approvals—always revoke active spender permissions after trading. "
            "Save this security shield and subscribe for daily on-chain defense, because..."
        ),
        "hudData": {
            "stage1Header": "01 // SMART CONTRACT SECURITY AUDIT",
            "stage1Badge": "▲ HONEYPOT DETECTED",
            "walletLabel": "UNVERIFIED PROXY CONTRACT",
            "walletAddress": "0x66F...02C8",
            "tag1": "BUY TAX: 0.0%",
            "tag2": "SELL TAX: 99.0%",
            "nodeLeftTitle": "OWNER PRIVILEGE",
            "nodeLeftValue": "setTax(99%)",
            "flowLabel": "BLOCKS RETAIL SELLS →",
            "nodeRightTitle": "RETAIL SWAP TX",
            "nodeRightValue": "REVERTED",
            "stage2Header": "02 // MALICIOUS FUNCTION CALL TRACE",
            "stage2Badge": "100% FUNDS LOCKED",
            "metricLeftLabel": "DISPLAYED CHART",
            "metricLeftValue": "+340% GREEN",
            "metricLeftSub": "Only Buys Allowed—Sells Blocked",
            "metricRightLabel": "HIDDEN ADMIN CODE",
            "metricRightValue": "BLACKLIST()",
            "metricRightSub": "Owner Freezes Non-Whitelisted Wallets",
            "chartLeftLabel": "ARTIFICIAL BUY-ONLY STAIRCASE",
            "chartRightLabel": "▼ OWNER LP PULL (-100%)",
            "barLeftLabel": "RENOUNCED / SAFE CONTRACTS: 15%",
            "barLeftPct": 15,
            "barRightLabel": "UPGRADEABLE / ADMIN-RISK CONTRACTS: 85%",
            "stage3Header": "03 // THE 10-SECOND CONTRACT AUDIT",
            "rule1Tag": "RULE #01 // OWNERSHIP RENOUNCED",
            "rule1Badge": "OWNER = 0x000...DEAD OR TIMELOCK",
            "rule1Text": "Confirm Contract Ownership Is Renounced or Timelocked",
            "rule2Tag": "RULE #02 // PROXY FUNCTION SCAN",
            "rule2Badge": "NO setTax() OR blacklist() CALLS",
            "rule2Text": "Reject Contracts With Mutable Tax or Blacklist Functions",
            "rule3Tag": "RULE #03 // REVOKE APPROVALS",
            "rule3Badge": "NEVER SIGN INFINITE SPEND CAPS",
            "rule3Text": "Use Exact Spend Approvals and Revoke Permissions Weekly",
            "verdictPills": ["✓ RENOUNCED", "✓ ZERO TAX FN", "✓ REVOKE CAPS"]
        },
        "pinned_comment": "📌 10-SECOND SMART CONTRACT AUDIT:\n1) Verify ownership is renounced (0x000...dead) or timelocked\n2) Scan for mutable setTax() or blacklist() functions\n3) Never leave unlimited token spend approvals active 👇"
    },
    {
        "ep": "10",
        "slot": "W1_10_FRI_0200_L2_GAMING_TVL_FLOW",
        "broll": "ep10_flow_broll.mp4",
        "title": "Follow The Bridge Flows: How To Catch Ecosystem Rotations Early 🌉 #Shorts",
        "script": (
            "By the time a Gaming Layer-2 ecosystem is trending on YouTube, smart money has already been positioned for two weeks. "
            "How do they know which chain is pumping next? They track cross-chain canonical bridge inflows and stablecoin mints. "
            "When bridge netflows into chains like Immutable, Ronin, or Base spike by over twenty-five million dollars in forty-eight hours while token prices are still flat, "
            "institutional capital is rotating before ecosystem catalysts drop. "
            "Catch the rotation early with this three-step bridge radar. "
            "Rule one: monitor seven-day canonical bridge netflows relative to total chain TVL. "
            "Rule two: verify that bridged capital is deploying into active DEX pools and gaming treasuries, not just farming bridge points. "
            "Rule three: buy the leading liquid ecosystem infrastructure token before rotating into smaller game tokens. "
            "Save this rotation radar and subscribe for daily on-chain flow alerts, because..."
        ),
        "hudData": {
            "stage1Header": "01 // CROSS-CHAIN BRIDGE TELEMETRY",
            "stage1Badge": "● SMART MONEY INFLOW",
            "walletLabel": "L2 CANONICAL BRIDGE VAULT",
            "walletAddress": "0x19B...77F4",
            "tag1": "48H INFLOW: +$28.4M",
            "tag2": "SECTOR: GAMING L2",
            "nodeLeftTitle": "ETHEREUM MAINNET",
            "nodeLeftValue": "USDC / ETH WHALES",
            "flowLabel": "+$28.4M BRIDGED →",
            "nodeRightTitle": "GAMING L2 ECOSYSTEM",
            "nodeRightValue": "TVL +34.2%",
            "stage2Header": "02 // BRIDGE INFLOW VS PRICE LAG",
            "stage2Badge": "10-DAY FRONT-RUN EDGE",
            "metricLeftLabel": "BRIDGE NETFLOW (DAY 1-3)",
            "metricLeftValue": "+$28.4M SURGE",
            "metricLeftSub": "Whales Positioning Quietly On-Chain",
            "metricRightLabel": "ECOSYSTEM TOKENS (DAY 10)",
            "metricRightValue": "+145% RALLY",
            "metricRightSub": "Price Reacts Days After Bridge Surge",
            "chartLeftLabel": "BRIDGE INFLOW ACCUMULATION",
            "chartRightLabel": "▲ ECOSYSTEM REPRICING (+145%)",
            "barLeftLabel": "STICKY ECOSYSTEM TVL DEPLOYED: 74%",
            "barLeftPct": 74,
            "barRightLabel": "MERCENARY BRIDGE FARMERS: 26%",
            "stage3Header": "03 // CROSS-CHAIN ROTATION PLAYBOOK",
            "rule1Tag": "RULE #01 // 7-DAY BRIDGE VELOCITY",
            "rule1Badge": "TRACK >15% TVL GROWTH IN 7 DAYS",
            "rule1Text": "Scan for Chains With >15% Net Bridge Inflows in 7 Days",
            "rule2Tag": "RULE #02 // STICKY LIQUIDITY CHECK",
            "rule2Badge": "VERIFY DEX & GAME TREASURY DEPLOY",
            "rule2Text": "Confirm Bridged Stablecoins Enter Active DEX & Game Pools",
            "rule3Tag": "RULE #03 // INFRASTRUCTURE FIRST",
            "rule3Badge": "LEAD L2 TOKEN → ECOSYSTEM BETA",
            "rule3Text": "Position in the Core L2 Token Before High-Beta Game Tokens",
            "verdictPills": ["✓ 7D BRIDGE >15%", "✓ STICKY TVL", "✓ INFRA FIRST"]
        },
        "pinned_comment": "📌 CROSS-CHAIN ROTATION RADAR:\n1) Track 7-day canonical bridge netflows (>15% TVL jump)\n2) Verify bridged USDC deploys into active DEX/Gaming pools\n3) Accumulate core L2 infrastructure first, then gaming beta 👇"
    },
    {
        "ep": "11",
        "slot": "W1_11_SAT_1500_CEX_LISTING_TRAP",
        "broll": "ep11_flow_broll.mp4",
        "title": "Why Buying A Tier-1 Exchange Listing Announcement Loses Money 📉 #Shorts",
        "script": (
            "Buying a token the minute a Tier-1 exchange announces a listing is one of the fastest ways to lose forty percent of your capital. "
            "On-chain data across forty major exchange listings last year proves that seventy-six percent of tokens peak within the first thirty minutes of trading "
            "and trend down for the next sixty days. "
            "Why? Because early on-chain whales who bought on DEXs weeks earlier use the listing announcement's retail liquidity to exit millions of dollars at market top. "
            "Trade exchange listings like an institution with these three rules. "
            "Rule one: never market-buy the listing candle—wait seventy-two hours for initial whale distribution to clear. "
            "Rule two: watch exchange hot-wallet deposits—if on-chain whales send over three percent of supply to the exchange before launch, expect a dump. "
            "Rule three: catch tokens BEFORE listing by tracking exchange cold-wallet test transactions on-chain. "
            "Save this listing strategy and subscribe for daily wallet alerts, because..."
        ),
        "hudData": {
            "stage1Header": "01 // CEX LISTING INFLOW FORENSICS",
            "stage1Badge": "▲ WHALE DISTRIBUTION",
            "walletLabel": "PRE-LISTING DEPOSIT SPIKE",
            "walletAddress": "0x28E...63A9",
            "tag1": "CEX INFLOW: +$19.6M",
            "tag2": "76% DUMP POST-LISTING",
            "nodeLeftTitle": "EARLY DEX WHALES",
            "nodeLeftValue": "+800% UNREALIZED",
            "flowLabel": "DEPOSITS TO SELL →",
            "nodeRightTitle": "TIER-1 CEX ORDERBOOK",
            "nodeRightValue": "RETAIL BUYERS",
            "stage2Header": "02 // POST-LISTING 60-DAY PERFORMANCE",
            "stage2Badge": "AVG DRAW-DOWN: -52%",
            "metricLeftLabel": "MINUTE 1-30 CANDLE",
            "metricLeftValue": "RETAIL FOMO TOP",
            "metricLeftSub": "Maximum Slippage & Hype Peak",
            "metricRightLabel": "ON-CHAIN DEPOSIT REALITY",
            "metricRightValue": "4.2% SUPPLY SENT",
            "metricRightSub": "Early Insiders Offloading Into Listing",
            "chartLeftLabel": "LISTING ANNOUNCEMENT SPIKE",
            "chartRightLabel": "▼ 60-DAY DISTRIBUTION BLEED",
            "barLeftLabel": "TOKENS HOLDING POST-LISTING GAINS: 24%",
            "barLeftPct": 24,
            "barRightLabel": "TOKENS DUMPING BELOW LISTING PRICE: 76%",
            "stage3Header": "03 // INSTITUTIONAL LISTING PLAYBOOK",
            "rule1Tag": "RULE #01 // THE 72-HOUR COOLING RULE",
            "rule1Badge": "NEVER BUY MINUTE-1 CANDLE",
            "rule1Text": "Never Market-Buy Listing Day—Wait 72 Hours for Base",
            "rule2Tag": "RULE #02 // CEX DEPOSIT MONITOR",
            "rule2Badge": "DANGER IF >3% SUPPLY DEPOSITED",
            "rule2Text": "Short or Avoid If Whales Deposit >3% Supply Pre-Listing",
            "rule3Tag": "RULE #03 // TEST-TX FRONT-RUNNING",
            "rule3Badge": "TRACK CEX COLD WALLET TEST TXS",
            "rule3Text": "Spot Listings Early via Exchange Cold-Wallet Test Transfers",
            "verdictPills": ["✓ 72H WAIT RULE", "✓ CEX INFLOW <3%", "✓ TEST-TX SCAN"]
        },
        "pinned_comment": "📌 TIER-1 CEX LISTING RULES:\n1) Never buy the Minute-1 listing candle (76% peak within 30 mins)\n2) Check if DEX whales deposit >3% of supply into the exchange\n3) Track exchange cold-wallet test transactions before announcements 👇"
    },
    {
        "ep": "12",
        "slot": "W1_12_SAT_0200_AIRDROP_SYBIL_SHIELD",
        "broll": "ep12_flow_broll.mp4",
        "title": "Why Your Wallet Gets Flagged As A Bot In Airdrops (3 Fixes) 🛡️ #Shorts",
        "script": (
            "You spent six months farming a top gaming or Layer-2 airdrop, only to get disqualified on snapshot day by an algorithmic Sybil filter. "
            "Modern airdrop clustering algorithms don't just look at transaction counts—they build a graph of your wallet's funding sources, timing entropy, and contract diversity. "
            "If you ever transferred gas between your own wallets or executed identical swap amounts within the same hour, you are flagged as a bot cluster. "
            "Protect your airdrop eligibility with these three operational rules. "
            "Rule one: fund every wallet exclusively from a unique centralized exchange withdrawal address—never send gas wallet-to-wallet. "
            "Rule two: maintain at least zero-point-zero-five ETH or fifty dollars of native liquidity parked for over thirty days. "
            "Rule three: interact with authentic gaming and DeFi contracts across different days and randomized position sizes. "
            "Save this anti-Sybil checklist and subscribe for daily Web3 alpha, because..."
        ),
        "hudData": {
            "stage1Header": "01 // SYBIL CLUSTERING ALGORITHM",
            "stage1Badge": "▲ WALLET DISQUALIFIED",
            "walletLabel": "ON-CHAIN GRAPH DETECTION ENGINE",
            "walletAddress": "0x7F3...11D4",
            "tag1": "SHARED GAS LINK: TRUE",
            "tag2": "ENTROPY SCORE: LOW",
            "nodeLeftTitle": "WALLET A (FARMER)",
            "nodeLeftValue": "0x7F3...11D4",
            "flowLabel": "DIRECT GAS TRANSFER →",
            "nodeRightTitle": "WALLET B (FLAGGED)",
            "nodeRightValue": "SYBIL CLUSTER",
            "stage2Header": "02 // SNAPSHOT QUALIFICATION METRICS",
            "stage2Badge": "64% WALLETS FILTERED",
            "metricLeftLabel": "DISQUALIFIED WALLETS",
            "metricLeftValue": "LOW BALANCE",
            "metricLeftSub": "Zero Native Balance After Tx + Linked Gas",
            "metricRightLabel": "TIER-1 QUALIFIED WALLETS",
            "metricRightValue": "3.8x MULTIPLIER",
            "metricRightSub": "Isolated CEX Funding + 30D Sticky Balance",
            "chartLeftLabel": "ORGANIC MULTI-CONTRACT ACTIVITY",
            "chartRightLabel": "▼ BOT SCRIPT CLUSTER SLASHED",
            "barLeftLabel": "ORGANIC QUALIFIED WALLETS: 36%",
            "barLeftPct": 36,
            "barRightLabel": "SYBIL / BOT FLAGGED WALLETS: 64%",
            "stage3Header": "03 // THE ANTI-SYBIL OPSEC CHECKLIST",
            "rule1Tag": "RULE #01 // CEX ISOLATION FUNDING",
            "rule1Badge": "ZERO WALLET-TO-WALLET TRANSFERS",
            "rule1Text": "Fund Every Wallet Only From Isolated Exchange Withdrawals",
            "rule2Tag": "RULE #02 // STICKY NATIVE BALANCE",
            "rule2Badge": "HOLD >$50 NATIVE FOR 30+ DAYS",
            "rule2Text": "Keep Over $50 in Native Gas Parked Across Snapshot Windows",
            "rule3Tag": "RULE #03 // TIMING & SIZE ENTROPY",
            "rule3Badge": "RANDOMIZE AMOUNTS & PROTOCOLS",
            "rule3Text": "Vary Transaction Sizes, Days, and Ecosystem DApps",
            "verdictPills": ["✓ ISOLATED CEX", "✓ >$50 BALANCE", "✓ HIGH ENTROPY"]
        },
        "pinned_comment": "📌 ANTI-SYBIL AIRDROP OPSEC:\n1) Never send funds between your own farming wallets (use isolated CEX sub-withdrawals)\n2) Keep >$50 native balance parked for 30+ days\n3) Randomize swap sizes, times, and contracts 👇"
    },
    {
        "ep": "13",
        "slot": "W1_13_SUN_1500_STABLECOIN_DRY_POWDER",
        "broll": "ep13_flow_broll.mp4",
        "title": "The #1 Leading Indicator For Every Crypto Market Rally 💵 #Shorts",
        "script": (
            "If you want to know whether a crypto market dip is a real crash or a whale buying opportunity, stop watching Bitcoin candles and watch Tether and Circle treasury mints. "
            "Institutions cannot buy hundreds of millions of dollars of spot crypto without first minting fresh USDT or USDC and routing it to exchange settlement wallets. "
            "During last month's panic sell-off, retail sold in fear while on-chain telemetry recorded one point four billion dollars of fresh stablecoins minted and sent to Binance and Coinbase in thirty-six hours. "
            "Read the macro liquidity tide with these three rules. "
            "Rule one: track seven-day net stablecoin market cap expansion—sustained rallies require positive stablecoin minting. "
            "Rule two: watch the Stablecoin Supply Ratio on exchanges—rising stablecoin reserves during a dip signal imminent institutional buying. "
            "Rule three: confirm those stablecoins are converting into spot ETH, SOL, and high-conviction gaming leaders. "
            "Save this macro indicator and subscribe for daily on-chain intelligence, because..."
        ),
        "hudData": {
            "stage1Header": "01 // TREASURY MINT TELEMETRY",
            "stage1Badge": "● +$1.4B DRY POWDER",
            "walletLabel": "TETHER / CIRCLE TREASURY MINT",
            "walletAddress": "0x575...E890",
            "tag1": "36H MINT: +$1.42B",
            "tag2": "ROUTED TO: BINANCE/CB",
            "nodeLeftTitle": "TREASURY MINT",
            "nodeLeftValue": "+$1.42B USDC/T",
            "flowLabel": "SETTLEMENT INFLOW →",
            "nodeRightTitle": "CEX SPOT DESKS",
            "nodeRightValue": "BUY WALL READY",
            "stage2Header": "02 // DIP PANIC VS STABLECOIN INFLOW",
            "stage2Badge": "REBOUND: +38.5%",
            "metricLeftLabel": "RETAIL FEAR INDEX",
            "metricLeftValue": "PANIC SELLING",
            "metricLeftSub": "Liquidating Spot at Local Bottom",
            "metricRightLabel": "INSTITUTIONAL DRY POWDER",
            "metricRightValue": "+$1.42B INFLOW",
            "metricRightSub": "Fresh Stablecoins Absorbing Every Dip",
            "chartLeftLabel": "STABLECOIN CEX RESERVE SURGE",
            "chartRightLabel": "▲ SPOT ABSORPTION RALLY (+38%)",
            "barLeftLabel": "FRESH INSTITUTIONAL STABLECOIN INFLOW: 79%",
            "barLeftPct": 79,
            "barRightLabel": "RETAIL PANIC OUTFLOW: 21%",
            "stage3Header": "03 // MACRO LIQUIDITY RADAR RULES",
            "rule1Tag": "RULE #01 // 7-DAY MINT EXPANSION",
            "rule1Badge": "STABLECOIN MCAP MUST TREND UP",
            "rule1Text": "Track 7-Day Net USDT + USDC Supply Expansion",
            "rule2Tag": "RULE #02 // CEX DRY-POWDER RATIO",
            "rule2Badge": "PRICE DOWN + CEX STABLES UP = BUY",
            "rule2Text": "Buy Dips When Exchange Stablecoin Reserves Surge",
            "rule3Tag": "RULE #03 // SECTOR LEADER ROTATION",
            "rule3Badge": "STABLES → SOL/ETH → GAMING BETA",
            "rule3Text": "Follow Stablecoin Conversion Into High-Volume Leaders",
            "verdictPills": ["✓ 7D MINT UP", "✓ CEX RESERVES", "✓ SPOT FLOW"]
        },
        "pinned_comment": "📌 MACRO STABLECOIN RADAR:\n1) Track 7-day net USDT + USDC supply expansion\n2) Price dipping while CEX stablecoin reserves surge = institutional accumulation\n3) Follow where stablecoins deploy first 👇"
    },
    {
        "ep": "14",
        "slot": "W1_14_SUN_0200_SMART_MONEY_PORTFOLIO",
        "broll": "ep14_flow_broll.mp4",
        "title": "Why Copying Whale Wallets Blindly Will Wreck Your Portfolio ⚠️ #Shorts",
        "script": (
            "Blindly copy-trading a famous whale wallet is the easiest way to get used as their personal exit liquidity. "
            "Publicly tagged billionaire and influencer wallets know thousands of copy-trading bots mirror their every transaction within तीन seconds. "
            "So what do they do? They buy five hundred thousand dollars of an illiquid gaming token on their public wallet to trigger copy-bots, "
            "and immediately dump two million dollars of the exact same token from three untagged shadow wallets into the bot pump. "
            "Copy smart money safely with this three-rule filter. "
            "Rule one: never copy-trade public doxxed wallets on low-liquidity tokens—they farm copy-traders. "
            "Rule two: only track untagged high-win-rate wallets with over eighty percent profitable thirty-day PnL and minimum seven-day hold times. "
            "Rule three: verify the wallet's position size is at least two percent of their total portfolio—ignore tiny bait buys. "
            "Save this copy-trading filter and subscribe to OnChain Vault, because..."
        ),
        "hudData": {
            "stage1Header": "01 // COPY-TRADING BAIT FORENSICS",
            "stage1Badge": "▲ BOT TRAP DETECTED",
            "walletLabel": "PUBLIC DOXXED WHALE WALLET",
            "walletAddress": "0xA11...50F2",
            "tag1": "BAIT BUY: +$500K",
            "tag2": "SHADOW DUMP: -$2.1M",
            "nodeLeftTitle": "PUBLIC BAIT WALLET",
            "nodeLeftValue": "BUYS +$500K",
            "flowLabel": "TRIGGERS COPY-BOTS →",
            "nodeRightTitle": "3 SHADOW WALLETS",
            "nodeRightValue": "DUMPS -$2.1M",
            "stage2Header": "02 // PUBLIC BAIT VS SHADOW WALLET PNL",
            "stage2Badge": "BOT LOSS: -46.0%",
            "metricLeftLabel": "PUBLIC WALLET SIGNAL",
            "metricLeftValue": "+$500K ENTRY",
            "metricLeftSub": "0.2% of Whale's Portfolio (Pure Bait)",
            "metricRightLabel": "UNTAGGED SHADOW WALLETS",
            "metricRightValue": "-$2.1M EXIT",
            "metricRightSub": "Sells Into Retail Copy-Trading Slippage",
            "chartLeftLabel": "COPY-BOT PUMP SPIKE (3 SECONDS)",
            "chartRightLabel": "▼ SHADOW WALLET DISTRIBUTION",
            "barLeftLabel": "GENUINE CONVICTION WALLETS: 18%",
            "barLeftPct": 18,
            "barRightLabel": "PUBLIC BAIT / WASH WALLETS: 82%",
            "stage3Header": "03 // SAFE SMART-MONEY TRACKING RULES",
            "rule1Tag": "RULE #01 // IGNORE DOXXED WALLETS",
            "rule1Badge": "NEVER COPY PUBLIC INFLUENCERS",
            "rule1Text": "Never Copy-Trade Public Doxxed Wallets on Low-Cap Tokens",
            "rule2Tag": "RULE #02 // HOLD-TIME & WIN-RATE",
            "rule2Badge": ">80% WIN RATE + >7D AVG HOLD",
            "rule2Text": "Filter for Untagged Wallets With >7-Day Average Hold Time",
            "rule3Tag": "RULE #03 // PORTFOLIO WEIGHT CHECK",
            "rule3Badge": "POSITION MUST BE >2% OF NET WORTH",
            "rule3Text": "Only Follow Buys Representing >2% of the Wallet's Total Value",
            "verdictPills": ["✓ NO DOXXED", "✓ >7D HOLD TIME", "✓ >2% WEIGHT"]
        },
        "pinned_comment": "📌 SMART MONEY COPY-TRADING FILTER:\n1) Never copy public/doxxed wallets on low-cap tokens\n2) Filter for untagged wallets with >80% win rate & >7-day hold time\n3) Position must be >2% of the wallet's total portfolio 👇"
    }
]

def generate_dark_terminal_bed(wav_path: str, duration_sec: float, card_cue_times: list[float]):
    sample_rate = 44100
    n_samples = int(duration_sec * sample_rate)
    cue_samples = [int(t * sample_rate) for t in card_cue_times]

    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        frames = bytearray()
        for i in range(n_samples):
            t = i / sample_rate
            mod = 0.65 + 0.35 * math.sin(2.0 * math.pi * 0.5 * t)
            sub = (
                0.55 * math.sin(2.0 * math.pi * 55.0 * t)
                + 0.25 * math.sin(2.0 * math.pi * 110.0 * t)
                + 0.12 * math.sin(2.0 * math.pi * 165.0 * t)
            ) * mod * 0.08

            ui_sig = 0.0
            for cs in cue_samples:
                dt = (i - cs) / sample_rate
                if 0.0 <= dt <= 0.14:
                    env = math.exp(-dt * 32.0)
                    freq = 880.0 if dt < 0.04 else 1320.0
                    ui_sig += math.sin(2.0 * math.pi * freq * dt) * env * 0.14

            val = max(-0.95, min(0.95, sub + ui_sig))
            frames.extend(struct.pack("<h", int(val * 32767)))

        wf.writeframes(frames)

async def process_episode(ep_cfg):
    ep = ep_cfg["ep"]
    script_text = (
        ep_cfg["script"]
        .replace("तीन", "three")
        .replace("二十", "twenty-five")
        .replace("four thousandtwo", "four thousand two")
    )
    vo_rel = f"ep{ep}_vo_raw.mp3"
    bed_rel = f"ep{ep}_bed.wav"
    vo_path = os.path.join("public", vo_rel)
    bed_path = os.path.join("public", bed_rel)

    communicate = edge_tts.Communicate(
        script_text,
        voice="en-US-ChristopherNeural",
        rate="+10%",
        pitch="-3Hz",
        boundary="WordBoundary"
    )

    words = []
    audio_bytes = bytearray()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
        elif chunk["type"] == "WordBoundary":
            start_s = chunk["offset"] / 10_000_000.0
            dur_s = chunk["duration"] / 10_000_000.0
            words.append({
                "word": chunk["text"],
                "start": round(start_s, 3),
                "end": round(start_s + max(dur_s, 0.12), 3)
            })

    with open(vo_path, "wb") as f:
        f.write(audio_bytes)

    vo_duration = MP3(vo_path).info.length
    duration_sec = vo_duration + 0.45

    # Automatically locate stage transitions & Rule 1, 2, 3 timestamps
    p2_time = round(duration_sec * 0.13, 3)
    p3_time = round(duration_sec * 0.42, 3)
    p4_time = round(duration_sec * 0.87, 3)
    r1_time = None
    r2_time = None
    r3_time = None

    for idx, w in enumerate(words):
        lw = w["word"].lower()
        nxt = words[idx + 1]["word"].lower() if idx + 1 < len(words) else ""
        if lw == "rule" and nxt.startswith("one"):
            r1_time = w["start"]
            p3_time = max(10.0, r1_time - 3.2)
        elif lw == "rule" and nxt.startswith("two"):
            r2_time = w["start"]
        elif lw == "rule" and nxt.startswith("three"):
            r3_time = w["start"]
        elif lw == "save" and w["start"] > duration_sec * 0.72:
            p4_time = w["start"]

    generate_dark_terminal_bed(bed_path, duration_sec, [0.05, p2_time, p3_time, p4_time])

    fps = 30
    duration_frames = int(math.ceil(duration_sec * fps))

    props = {
        "episodeNumber": ep,
        "voFile": vo_rel,
        "bedFile": bed_rel,
        "brollFile": ep_cfg["broll"],
        "durationInFrames": duration_frames,
        "phaseTimes": {
            "phase1Start": 0.0,
            "phase2Start": p2_time,
            "phase3Start": p3_time,
            "phase4Start": p4_time,
            "rule1Start": r1_time or (p3_time + 3.0),
            "rule2Start": r2_time or (p3_time + 9.0),
            "rule3Start": r3_time or (p3_time + 15.0)
        },
        "hudData": ep_cfg["hudData"],
        "words": words
    }

    with open(f"public/ep{ep}_props.json", "w", encoding="utf-8") as f:
        json.dump(props, f, indent=2)

    # Also write queue metadata JSON ready for queue/
    os.makedirs("queue", exist_ok=True)
    meta = {
        "title": ep_cfg["title"],
        "description": (
            "Don't watch the hype. Track the wallets.\n\n"
            f"{ep_cfg['hudData']['stage3Header']}:\n"
            f"1️⃣ {ep_cfg['hudData']['rule1Text']}\n"
            f"2️⃣ {ep_cfg['hudData']['rule2Text']}\n"
            f"3️⃣ {ep_cfg['hudData']['rule3Text']}\n\n"
            "Subscribe to @OnChainVault for daily 40-second Smart Money & Web3 Gaming forensics.\n\n"
            "#Crypto #OnChain #Web3Gaming #SmartMoney #Tokenomics #CryptoShorts #Shorts"
        ),
        "tags": [
            "onchain analysis", "smart money crypto", "web3 gaming",
            "crypto gaming", "tokenomics", "token unlocks", "whale tracker",
            "play to airdrop", "crypto market analysis", "gamefi", "crypto shorts"
        ],
        "pinned_comment": ep_cfg["pinned_comment"]
    }
    with open(f"queue/{ep_cfg['slot']}_metadata.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"✅ [EP{ep}] Audio + Props + Metadata ready ({duration_sec:.1f}s / {duration_frames}f)")

async def main():
    os.makedirs("public", exist_ok=True)
    for cfg in EPISODES:
        await process_episode(cfg)
    print("🎉 ALL 13 REMAINING EPISODES (EP02-EP14) AUDIO, PROPS, AND METADATA GENERATED!")

if __name__ == "__main__":
    asyncio.run(main())
