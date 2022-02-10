import { ethers, run } from "hardhat";

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
  name: string,
  ...constructorArgs: any[]
): Promise<any> {
  const factory = await ethers.getContractFactory(name);
  const contract = await factory.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}

export { verifyContract, deployContract };
