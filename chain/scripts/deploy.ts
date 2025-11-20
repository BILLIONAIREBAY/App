import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Fx721L contract with account:", deployer.address);

  const Fx721L = await ethers.getContractFactory("Fx721L");
  const fx721l = await Fx721L.deploy(deployer.address);

  await fx721l.waitForDeployment();

  const contractAddress = await fx721l.getAddress();
  console.log("Fx721L deployed to:", contractAddress);
  
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress} ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
