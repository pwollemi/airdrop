import hre, { ethers } from "hardhat";

export async function impersonateAccount(account: string) {
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [account]}
    );
}

export async function stopImpersonatingAccount(account: string) {
    await hre.network.provider.request({
        method: "hardhat_stopImpersonatingAccount",
        params: [account]}
    );
}

export async function setNextBlockTimestamp(timestamp: number) {
    await hre.network.provider.request({
        method: "evm_setNextBlockTimestamp",
        params: [timestamp]}
    );
}

export async function getLatestBlockTimestamp() {
    return (await ethers.provider.getBlock("latest")).timestamp;
}

export async function mineBlock() : Promise<void> {
    await hre.network.provider.request({
        method: "evm_mine"
    });
}

export function getSelectors(contract: any) {
    const selectors = Object.keys(contract.interface.functions).map(v => ethers.utils.id(v).slice(0, 10));
    return selectors;
}

export async function impersonateForToken(tokenInfo: any, receiver: any, amount: any) {
    const token = await ethers.getContractAt("ERC20", tokenInfo.address);
    console.log(`Impersonating for ${tokenInfo.symbol}`);
    await receiver.sendTransaction({
      to: tokenInfo.holder,
      value: ethers.utils.parseEther("1.0")
    });
  
    await impersonateAccount(tokenInfo.holder);
    const signedHolder = await ethers.provider.getSigner(tokenInfo.holder);
    await token.connect(signedHolder).transfer(receiver.address, ethers.utils.parseUnits(amount, tokenInfo.decimals));
    await stopImpersonatingAccount(tokenInfo.holder);
  }
  