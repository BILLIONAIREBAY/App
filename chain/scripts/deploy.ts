import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=== LUMINESCENCE V3 - CONTRACT DEPLOYMENT ===");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  console.log("1/4 Deploying MockUSDFx (Stablecoin)...");
  const MockUSDFx = await ethers.getContractFactory("MockUSDFx");
  const usdFx = await MockUSDFx.deploy(deployer.address);
  await usdFx.waitForDeployment();
  const usdFxAddress = await usdFx.getAddress();
  console.log("✓ MockUSDFx deployed to:", usdFxAddress);

  console.log("\n2/4 Deploying MockJusticeProtocol (Freeze/Seize)...");
  const MockJusticeProtocol = await ethers.getContractFactory("MockJusticeProtocol");
  const justiceProtocol = await MockJusticeProtocol.deploy(deployer.address);
  await justiceProtocol.waitForDeployment();
  const justiceAddress = await justiceProtocol.getAddress();
  console.log("✓ MockJusticeProtocol deployed to:", justiceAddress);

  console.log("\n3/4 Deploying Fx721L (Living Asset NFT)...");
  const Fx721L = await ethers.getContractFactory("Fx721L");
  const fx721l = await Fx721L.deploy(deployer.address);
  await fx721l.waitForDeployment();
  const fx721lAddress = await fx721l.getAddress();
  console.log("✓ Fx721L deployed to:", fx721lAddress);

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("MockUSDFx:         ", usdFxAddress);
  console.log("MockJusticeProtocol:", justiceAddress);
  console.log("Fx721L:            ", fx721lAddress);
  
  console.log("\n=== VERIFICATION COMMANDS ===");
  console.log(`npx hardhat verify --network baseSepolia ${usdFxAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network baseSepolia ${justiceAddress} ${deployer.address}`);
  console.log(`npx hardhat verify --network baseSepolia ${fx721lAddress} ${deployer.address}`);

  console.log("\n=== SAVE TO .env ===");
  console.log(`USDFX_CONTRACT_ADDRESS=${usdFxAddress}`);
  console.log(`JUSTICE_PROTOCOL_ADDRESS=${justiceAddress}`);
  console.log(`FX721L_CONTRACT_ADDRESS=${fx721lAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
