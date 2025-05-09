import { ethers } from 'ethers';
import { keyRotator, maskAddress } from './utils.js';

const LOVE_ABI = [{
  "inputs": [],
  "name": "loveSomini",
  "type": "function"
}];

export class AutoLove {
  constructor(config) {
    this.config = config;
    this.keyRotator = keyRotator(config.PRIVATE_KEYS);
    this.contract = new ethers.Contract(
      config.LOVE_CONTRACT_ADDRESS,
      LOVE_ABI,
      config.PROVIDER
    );
  }

  async execute() {
    try {
      const privateKey = this.keyRotator.next();
      const wallet = new ethers.Wallet(privateKey, this.config.PROVIDER);
      
      const tx = await this.contract.connect(wallet).loveSomini({
        gasPrice: ethers.parseUnits("30", "gwei"),
        gasLimit: 52542
      });
      
      return {
        success: true,
        hash: tx.hash,
        message: `Loved from ${maskAddress(wallet.address)}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Love failed: ${error.shortMessage || error.message}`
      };
    }
  }
}
