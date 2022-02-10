/* eslint-disable no-await-in-loop */
import { ethers } from "hardhat";
import { solidity } from "ethereum-waffle";
import chai from 'chai';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { deployContract } from "../helper/deployer";
import { MemeCoin } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe('MemeCoin', () => {
  let token: MemeCoin;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let tom: SignerWithAddress;
  let kate: SignerWithAddress;
  let tax: SignerWithAddress;
  let charity: SignerWithAddress;

  const totalAmount = ethers.utils.parseUnits("1000000", 18);
  const taxPercent = 10; // 1%
  const charityPercent = 5; // 0.5%

  before(async () => {
    [owner, alice, bob, tom, kate, tax, charity] = await ethers.getSigners();

    token = await deployContract("MemeCoin", "test", "test", totalAmount, tax.address, charity.address);
  });

  describe("Secuirity", () => {
    it("Setters can only be called by the owner", async () => {
      await expect(token.connect(alice).setTaxWallet(tax.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(token.connect(alice).setCharityWallet(tax.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(token.connect(alice).setTaxPercent(taxPercent)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(token.connect(alice).excludeAddressFromTax(alice.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(token.connect(alice).includeAddressForTax(alice.address)).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(token.connect(alice).setCharityPercent(charityPercent)).to.be.revertedWith("Ownable: caller is not the owner");

      await token.setTaxWallet(tax.address);
      await token.setCharityWallet(charity.address);
      await token.setTaxPercent(taxPercent);
      await token.setCharityPercent(charityPercent);
    });
  });

  describe("Tax and Charity", () => {
    it("Tax and charity incurred by default", async () => {
      const amount = totalAmount.div(10);
      const taxAmt = amount.mul(taxPercent).div(1000);
      const charityAmt = amount.mul(charityPercent).div(1000);
      await token.transfer(alice.address, amount);
      
      expect(await token.balanceOf(alice.address)).to.be.equal(amount.sub(taxAmt).sub(charityAmt));
      expect(await token.balanceOf(tax.address)).to.be.equal(taxAmt);
      expect(await token.balanceOf(charity.address)).to.be.equal(charityAmt);
    });

    it("Receiver excluded from tax", async () => {
      await token.excludeAddressFromTax(bob.address);
      const amount = totalAmount.div(10);
      await token.transfer(bob.address, amount);
      
      expect(await token.balanceOf(bob.address)).to.be.equal(amount);
    });

    it("Include into tax again", async () => {
      await token.includeAddressForTax(bob.address);
      const amount = totalAmount.div(10);
      const taxAmt = amount.mul(taxPercent).div(1000);
      const charityAmt = amount.mul(charityPercent).div(1000);

      const bob0 = await token.balanceOf(bob.address);
      const tax0 = await token.balanceOf(tax.address);
      const charity0 = await token.balanceOf(charity.address);
      await token.transfer(bob.address, amount);
      const bob1 = await token.balanceOf(bob.address);
      const tax1 = await token.balanceOf(tax.address);
      const charity1 = await token.balanceOf(charity.address);
      
      expect(bob1.sub(bob0)).to.be.equal(amount.sub(taxAmt).sub(charityAmt));
      expect(tax1.sub(tax0)).to.be.equal(taxAmt);
      expect(charity1.sub(charity0)).to.be.equal(charityAmt);
    });

    it("Sender excluded from tax", async () => {
      await token.excludeAddressFromTax(owner.address);
      const amount = totalAmount.div(10);
      await token.transfer(tom.address, amount);
      
      expect(await token.balanceOf(tom.address)).to.be.equal(amount);
    });
  });
});
