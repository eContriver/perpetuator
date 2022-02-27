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

  it("the message count is updated", async function () {
    expect(await this.perp.getPostCount()).to.equal(0);
    await this.perp.connect(this.bob).post("freedom for all!", {value: toWei("0.01")})
    const newPost = await this.perp.getPostCount()
    expect(await this.perp.getPostCount()).to.equal(1);
  });

  it("the message is updated", async function () {
    const msg = "freedom for all!"
    await this.perp.connect(this.bob).post(msg, {value: toWei("0.01")})
    const newPost = await this.perp.posts(0)
    expect(newPost.message).to.equal(msg);
  });

  it("cost changes", async function () {
    const amount = toWei("0.01")
    await this.perp.connect(this.alice).setPrice(amount.mul(2))
    await expect(this.perp.connect(this.bob).post("freedom for all!", {value: amount})).to.be.revertedWith("insufficient amount")
    expect(await this.perp.getPostCount()).to.equal(0);
    await this.perp.connect(this.bob).post("freedom for all!", {value: amount.mul(2)})
    expect(await this.perp.getPostCount()).to.equal(1);
  });

  it("owner receives", async function () {
    const amount = toWei("0.01")
    const initialBalance = await ethers.provider.getBalance(this.alice.address)
    await this.perp.connect(this.bob).post("freedom for all!", {value: amount})
    expect(await ethers.provider.getBalance(this.perp.address)).to.equal(0)
    const finalBalance = await ethers.provider.getBalance(this.alice.address)
    expect(finalBalance).to.equal(initialBalance.add(amount))
  });

  it("owner can withdraw", async function () {
    const amount = toWei("0.01")
    const initialBalance = await ethers.provider.getBalance(this.alice.address)
    await this.bob.sendTransaction({
      to: this.perp.address,
      value: amount,
    });
    expect(await ethers.provider.getBalance(this.perp.address)).to.equal(amount)
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

  it("too many characters", async function () {
    const length = 289
    const tooLong = "a".repeat(length)
    await expect(this.perp.connect(this.bob).post(tooLong, {value: toWei("0.01")})).to.be.revertedWith("character limit exceeded")
    await this.perp.connect(this.alice).setLimit(length)
    await this.perp.connect(this.bob).post(tooLong, {value: toWei("0.01")})
    const tooLong2 = "a".repeat(length+1)
    await expect(this.perp.connect(this.bob).post(tooLong2, {value: toWei("0.01")})).to.be.revertedWith("character limit exceeded")
  });
});
