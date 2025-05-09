import { ethers } from 'ethers';
import { random, keyRotator, maskAddress } from './utils.js';

export class AutoSend {
  constructor(config) {
    this.config = config;
    this.keyRotator = keyRotator(config.PRIVATE_KEYS);
  }

  async execute() {
    try {
      const privateKey = this.keyRotator.next();
      const wallet = new ethers.Wallet(privateKey, this.config.PROVIDER);

      // Generate amount random 0.0003 - 0.006 STT
      const amount = ethers.parseEther(
        (Math.random() * (0.006 - 0.0003) + 0.0003).toFixed(6)
      );

      // 1. Get fee data
      const feeData = await this.config.PROVIDER.getFeeData();
      if (!feeData.gasPrice) {
        throw new Error("Failed to get gas price");
      }

      // 2. Calculate gas cost
      const gasLimit = 21000n;
      const gasCost = feeData.gasPrice * gasLimit;

      // 3. Check balance
      const balance = await this.config.PROVIDER.getBalance(wallet.address);
      
      if (balance < amount + gasCost) {
        throw new Error(
          `Insufficient balance: ${ethers.formatEther(balance)} STT | Needed: ${ethers.formatEther(amount + gasCost)} STT`
        );
      }

      // 4. Send transaction
      const tx = await wallet.sendTransaction({
        to: ethers.Wallet.createRandom().address,
        value: amount,
        gasPrice: feeData.gasPrice,
        gasLimit: gasLimit
      });

      await tx.wait();

      return {
        success: true,
        hash: tx.hash,
        message: `Sent ${ethers.formatEther(amount)} STT to ${maskAddress(tx.to)}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Send failed: ${error.shortMessage || error.message}`
      };
    }
  }
}
