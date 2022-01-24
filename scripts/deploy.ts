import { ethers } from "hardhat";

async function deployContracts() {

}

async function main() {
  await deployContracts();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error); // eslint-disable-line no-console
    process.exit(1);
  });
