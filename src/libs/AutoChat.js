import { ethers } from 'ethers';
import { random, keyRotator, maskAddress } from './utils.js';

const CHAT_ABI = [{
    inputs: [{ name: "message", type: "string" }],
    name: "addFun",
    type: "function",
  },
];

export class AutoChat {
  constructor(config) {
    this.config = config;
    this.keyRotator = keyRotator(config.PRIVATE_KEYS);
    this.messages = [
      "GM frens!",
      "Wen moon?",
      "LFG!!",
      "Somnia to the moon!",
      "Bullish on this"
    ];
  }

  async execute() {
    try {
      const privateKey = this.keyRotator.next();
      const wallet = new ethers.Wallet(privateKey, this.config.PROVIDER);
      const contract = new ethers.Contract(
        this.config.CHAT_CONTRACT_ADDRESS,
        CHAT_ABI,
        wallet
      );

      const message = random.element(this.messages);
      const tx = await contract.addFun(message, {
        value: ethers.parseUnits("0.0001", "ether")
      });

      return {
        success: true,
        hash: tx.hash,
        message: `Chatted: "${message}"`
      };
    } catch (error) {
      return {
        success: false,
        error: `Chat failed: ${error.shortMessage || error.message}`
      };
    }
  }
}
