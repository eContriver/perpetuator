const { expect } = require("chai");
const { ethers } = require("hardhat");
const toEther = ethers.utils.formatEther
const toWei = ethers.utils.parseEther

describe("Poster", function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
    this.Perp = await ethers.getContractFactory("Perpetuator");
  })
  
  beforeEach(async function () {
    this.perp = await this.Perp.deploy();
    await this.perp.deployed();
  })

  it("revert on insufficient amount", async function () {
    const msg = "freedom for all!"
    await expect(this.perp.connect(this.bob).post(msg)).to.be.revertedWith("insufficient amount")
  });

  it("the message is updated", async function () {
    const msg = "freedom for all!"
    await this.perp.connect(this.bob).post(msg, {value: toWei("0.01")})
    const newPost = await this.perp.posts(0)
    expect(newPost.message).to.equal(msg);
  });

  it("owner can withdraw", async function () {
    const amount = toWei("0.01")
    await this.perp.connect(this.bob).post("freedom for all!", {value: amount})
    const initialBalance = await ethers.provider.getBalance(this.alice.address)
    const txn = await this.perp.withdraw()
    const receipt = await txn.wait()
    const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice)
    const finalBalance = await ethers.provider.getBalance(this.alice.address)
    expect(finalBalance).to.equal(initialBalance.add(amount).sub(gasUsed))
  });

  it("non-owner cannot withdraw", async function () {
    const amount = toWei("0.01")
    await this.perp.connect(this.bob).post("freedom for all!", {value: amount})
    const initialBalance = await ethers.provider.getBalance(this.alice.address)
    await expect(this.perp.connect(this.bob).withdraw()).to.be.revertedWith("caller is not the owner")
  });
});
