import { ethers } from 'ethers';
import { random, keyRotator, maskAddress } from './utils.js';

const SWAP_ABI = [{
  "inputs": [
    {
      "components": [
        { "internalType": "address", "name": "tokenIn", "type": "address" },
        { "internalType": "address", "name": "tokenOut", "type": "address" },
        { "internalType": "uint24", "name": "fee", "type": "uint24" },
        { "internalType": "address", "name": "recipient", "type": "address" },
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
        { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
      ],
      "internalType": "struct ExactInputSingleParams",
      "name": "params",
      "type": "tuple"
    }
  ],
  "name": "exactInputSingle",
  "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
  "stateMutability": "payable",
  "type": "function"
}];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns(bool)",
  "function allowance(address,address) view returns (uint256)"
];

export class AutoSwap {
  constructor(config) {
    this.config = config;
    this.keyRotator = keyRotator(config.PRIVATE_KEYS);
    this.swapContract = new ethers.Contract(
      config.SWAP_CONTRACT_ADDRESS,
      SWAP_ABI,
      config.PROVIDER
    );
    
    // Minimal cadangan token yang harus tetap ada di wallet
    this.MIN_RESERVE = ethers.parseUnits("1", 18); // 1 token
    this.SWAP_PERCENTAGE = { // Persentase swap dari saldo tersedia
      min: 0.1, // 10%
      max: 0.5  // 50%
    };
  }

  async checkApproval(wallet, tokenAddress, amount) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    const allowance = await tokenContract.allowance(
      wallet.address,
      this.config.SWAP_CONTRACT_ADDRESS
    );
    
    if (allowance < amount) {
      const tx = await tokenContract.approve(
        this.config.SWAP_CONTRACT_ADDRESS,
        amount
      );
      await tx.wait();
    }
  }

  async getBalances(wallet) {
    const pingContract = new ethers.Contract(
      this.config.PING_TOKEN_ADDRESS, 
      ERC20_ABI, 
      wallet
    );
    
    const pongContract = new ethers.Contract(
      this.config.PONG_TOKEN_ADDRESS, 
      ERC20_ABI, 
      wallet
    );

    return {
      ping: await pingContract.balanceOf(wallet.address),
      pong: await pongContract.balanceOf(wallet.address)
    };
  }

  calculateSwapAmount(balance, minReserve) {
    const availableBalance = balance - minReserve;
    if (availableBalance <= 0) return 0n;
    
    const percentage = Math.random() * 
      (this.SWAP_PERCENTAGE.max - this.SWAP_PERCENTAGE.min) + 
      this.SWAP_PERCENTAGE.min;
      
    return availableBalance * BigInt(Math.floor(percentage * 100)) / 100n;
  }

  async execute() {
    try {
      const privateKey = this.keyRotator.next();
      const wallet = new ethers.Wallet(privateKey, this.config.PROVIDER);
      
      // 1. Dapatkan saldo kedua token
      const balances = await this.getBalances(wallet);
      
      // 2. Tentukan arah swap berdasarkan saldo terbanyak
      let tokenIn, tokenOut;
      if (balances.ping > balances.pong) {
        tokenIn = this.config.PING_TOKEN_ADDRESS;
        tokenOut = this.config.PONG_TOKEN_ADDRESS;
      } else {
        tokenIn = this.config.PONG_TOKEN_ADDRESS;
        tokenOut = this.config.PING_TOKEN_ADDRESS;
      }

      // 3. Hitung jumlah swap
      const tokenInBalance = tokenIn === this.config.PING_TOKEN_ADDRESS 
        ? balances.ping 
        : balances.pong;
      
      const amountIn = this.calculateSwapAmount(tokenInBalance, this.MIN_RESERVE);
      if (amountIn <= 0n) {
        throw new Error("Saldo tidak cukup untuk melakukan swap");
      }

      // 4. Approve jika diperlukan
      await this.checkApproval(wallet, tokenIn, amountIn);

      // 5. Eksekusi swap
      const params = {
        tokenIn,
        tokenOut,
        fee: 500,
        recipient: wallet.address,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      };

      const tx = await this.swapContract.connect(wallet).exactInputSingle(params, {
        gasLimit: 300000
      });

      return {
        success: true,
        hash: tx.hash,
        message: `Swap ${ethers.formatUnits(amountIn, 18)} ${
          tokenIn === this.config.PING_TOKEN_ADDRESS ? "PING" : "PONG"
        } → ${tokenOut === this.config.PONG_TOKEN_ADDRESS ? "PONG" : "PING"}`
      };

    } catch (error) {
      return {
        success: false,
        error: `Swap gagal: ${error.shortMessage || error.message}`
      };
    }
  }
}
