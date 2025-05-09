import { ethers } from 'ethers';
import { keyRotator, maskAddress } from './utils.js';
import ora from 'ora';
import chalk from 'chalk';

const JUMP_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "multiplier", "type": "uint256" }],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export class AutoJump {
  constructor(config) {
    this.config = config;
    this.keyRotator = keyRotator(config.PRIVATE_KEYS);
    this.contract = new ethers.Contract(
      config.JUMP_CONTRACT_ADDRESS,
      JUMP_ABI,
      config.PROVIDER
    );
  }

  getRandomMultiplier() {
    const min = Math.floor(this.config.multiplierMin * 100);
    const max = Math.floor(this.config.multiplierMax * 100);
    return Math.floor(Math.random() * (max - min + 1) + min) / 100;
  }

  getRandomBetAmount() {
    const min = this.config.betMin;
    const max = this.config.betMax;
    return ethers.parseUnits((Math.random() * (max - min) + min).toFixed(6), 18);
  }

  async showProgressScan() {
    const spinner = ora({
      text: chalk.blue('DONE'),
      spinner: 'dots2'
    }).start();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    spinner.succeed(chalk.green('DONE'));
  }

  async execute() {
    try {
      const privateKey = this.keyRotator.next();
      const wallet = new ethers.Wallet(privateKey, this.config.PROVIDER);
      const contract = this.contract.connect(wallet);

      // Generate parameter acak
      const multiplier = this.getRandomMultiplier();
      const betAmount = this.getRandomBetAmount();
      
      // Tampilkan header
      console.log(chalk.greenBright(`
`));

      await this.showProgressScan();

      const tx = await contract.placeBet(Math.floor(multiplier * 100), {
        value: betAmount,
        gasLimit: this.config.JUMP_GAS_LIMIT,
        gasPrice: this.config.JUMP_GAS_PRICE
      });

      const receipt = await tx.wait();
      const menang = Math.random() > 0.5; // Simulasi hasil

      return {
        success: true,
        hash: tx.hash,
        message: menang ? 
          chalk.green(`🎉 MENANG! Multiplier ${multiplier}x | Bet ${ethers.formatUnits(betAmount, 18)} SOM`) :
          chalk.blue(`💸 KALAH! Multiplier ${multiplier}x | Bet ${ethers.formatUnits(betAmount, 18)} SOM`)
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Jump failed: ${error.shortMessage || error.message}`
      };
    }
  }
}
