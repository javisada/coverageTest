import { expect } from "chai";
import hardhat from "hardhat";
import { BigNumber } from "ethers";

const { ethers } = hardhat;

describe("PrivateBank", function () {
    let privateBank;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        const PrivateBank = await ethers.getContractFactory("PrivateBank");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        privateBank = await PrivateBank.deploy();
        await privateBank.deployed();
    });

    describe("Deposits", function () {
        it("Should accept deposits and update balances", async function () {
            await privateBank.connect(addr1).deposit({ value: ethers.utils.parseEther("1") });
            expect(await privateBank.getUserBalance(addr1.address)).to.equal(ethers.utils.parseEther("1"));

            await privateBank.connect(addr2).deposit({ value: ethers.utils.parseEther("2") });
            expect(await privateBank.getUserBalance(addr2.address)).to.equal(ethers.utils.parseEther("2"));
        });
    });

    describe("Withdrawals", function () {
        it("Should allow withdrawals and update balances", async function () {
            await privateBank.connect(addr1).deposit({ value: ethers.utils.parseEther("1") });

            await expect(() => privateBank.connect(addr1).withdraw())
                .to.changeEtherBalance(addr1, ethers.utils.parseEther("1"));

            expect(await privateBank.getUserBalance(addr1.address)).to.equal(0);
        });

        it("Should fail if balance is zero", async function () {
            await expect(privateBank.connect(addr1).withdraw()).to.be.revertedWith("Insufficient balance");
        });

        it("Should fail if transfer fails", async function () {
            // Send some ether to addr1 to ensure it has funds
            await addr2.sendTransaction({ to: addr1.address, value: ethers.utils.parseEther("1") });

            await privateBank.connect(addr1).deposit({ value: ethers.utils.parseEther("1") });

            // Simulate transfer failure by changing the address balance
            await ethers.provider.send("hardhat_setBalance", [addr1.address, "0x0"]);

            await expect(privateBank.connect(addr1).withdraw()).to.be.reverted;
        });
    });

    describe("Get Balance", function () {
        it("Should return the correct contract balance", async function () {
            // Send some ether to addr1 to ensure it has funds
            await addr2.sendTransaction({ to: addr1.address, value: ethers.utils.parseEther("1") });

            await privateBank.connect(addr1).deposit({ value: ethers.utils.parseEther("1") });
            await privateBank.connect(addr2).deposit({ value: ethers.utils.parseEther("2") });

            expect(await privateBank.getBalance()).to.equal(ethers.utils.parseEther("3"));
        });
    });
});













