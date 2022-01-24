import { ethers, run } from "hardhat";

declare type ContractName =
  | "WORLD"
  | "Governance"
  | "GenesisETH"
  | "GenesisMatic"
  | "mockERC20"
  | "mockToken"
  | "Farm"
  | "LiquidityTest";

async function verifyContract(
  address: string,
  ...constructorArguments: any[]
): Promise<void> {
  await run("verify:verify", {
    address,
    constructorArguments,
  });
}

async function deployContract(
  name: ContractName,
  ...constructorArgs: any[]
): Promise<any> {
  const factory = await ethers.getContractFactory(name);
  const contract = await factory.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}

export { verifyContract, deployContract };
