import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║  LUMINESCENCE V3 - CORE DEPLOYMENT (TACHE 2+4)           ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");
  
  console.log("🔑 Deployer Address:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);
  console.log("\n" + "─".repeat(63) + "\n");

  // 1. MockUSDFx (Stablecoin pour tests)
  console.log("📦 [1/5] Deploying MockUSDFx (ERC20 Stablecoin)...");
  const MockUSDFx = await ethers.getContractFactory("MockUSDFx");
  const usdFx = await MockUSDFx.deploy(deployer.address);
  await usdFx.waitForDeployment();
  const usdFxAddress = await usdFx.getAddress();
  console.log("   ✅ MockUSDFx deployed:", usdFxAddress);

  // 2. MockJusticeProtocol (Freeze/Seize Authority)
  console.log("\n🏛️  [2/5] Deploying MockJusticeProtocol...");
  const MockJusticeProtocol = await ethers.getContractFactory("MockJusticeProtocol");
  const justiceProtocol = await MockJusticeProtocol.deploy(deployer.address);
  await justiceProtocol.waitForDeployment();
  const justiceAddress = await justiceProtocol.getAddress();
  console.log("   ✅ MockJusticeProtocol deployed:", justiceAddress);

  // 3. Fx721L (Living Asset NFT)
  console.log("\n💎 [3/5] Deploying Fx721L (Living Asset NFT)...");
  const Fx721L = await ethers.getContractFactory("Fx721L");
  const fx721l = await Fx721L.deploy(deployer.address);
  await fx721l.waitForDeployment();
  const fx721lAddress = await fx721l.getAddress();
  console.log("   ✅ Fx721L deployed:", fx721lAddress);

  // 4. AuraRegistry (Global Stolen Items Registry - LE GARDIEN)
  console.log("\n🛡️  [4/5] Deploying AuraRegistry (Smart Trap Core)...");
  const AuraRegistry = await ethers.getContractFactory("AuraRegistry");
  const auraRegistry = await AuraRegistry.deploy(deployer.address, justiceAddress);
  await auraRegistry.waitForDeployment();
  const auraRegistryAddress = await auraRegistry.getAddress();
  console.log("   ✅ AuraRegistry deployed:", auraRegistryAddress);

  // 5. FxCharitySplitter (TACHE 4: L'ÂME ET LE GÉNIE)
  console.log("\n💝 [5/5] Deploying FxCharitySplitter (Atomic Split Payments)...");
  const FxCharitySplitter = await ethers.getContractFactory("FxCharitySplitter");
  const charitySplitter = await FxCharitySplitter.deploy();
  await charitySplitter.waitForDeployment();
  const charitySplitterAddress = await charitySplitter.getAddress();
  console.log("   ✅ FxCharitySplitter deployed:", charitySplitterAddress);

  console.log("\n" + "─".repeat(63));
  console.log("\n📋 DEPLOYMENT SUMMARY\n");
  console.log("MockUSDFx:            ", usdFxAddress);
  console.log("MockJusticeProtocol:  ", justiceAddress);
  console.log("Fx721L:               ", fx721lAddress);
  console.log("AuraRegistry:         ", auraRegistryAddress);
  console.log("FxCharitySplitter:    ", charitySplitterAddress);
  
  console.log("\n" + "─".repeat(63));
  console.log("\n🔍 VERIFICATION COMMANDS (Base Sepolia)\n");
  console.log(`npx hardhat verify --network baseSepolia ${usdFxAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network baseSepolia ${justiceAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network baseSepolia ${fx721lAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network baseSepolia ${auraRegistryAddress} ${deployer.address} ${justiceAddress}`);
  console.log(`npx hardhat verify --network baseSepolia ${charitySplitterAddress}`);

  console.log("\n" + "─".repeat(63));
  console.log("\n📝 BACKEND ENVIRONMENT VARIABLES (.env)\n");
  console.log(`USDFX_CONTRACT_ADDRESS=${usdFxAddress}`);
  console.log(`JUSTICE_PROTOCOL_ADDRESS=${justiceAddress}`);
  console.log(`FX721L_CONTRACT_ADDRESS=${fx721lAddress}`);
  console.log(`AURA_REGISTRY_ADDRESS=${auraRegistryAddress}`);
  console.log(`FX_CHARITY_SPLITTER_ADDRESS=${charitySplitterAddress}`);
  console.log(`BASE_SEPOLIA_RPC=https://sepolia.base.org`);

  console.log("\n╔═══════════════════════════════════════════════════════════╗");
  console.log("║  🎯 DEPLOYMENT COMPLETE - L'ÂME ET LE GÉNIE READY        ║");
  console.log("╚═══════════════════════════════════════════════════════════╝\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ DEPLOYMENT FAILED:\n", error);
    process.exit(1);
  });
