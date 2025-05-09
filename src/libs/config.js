import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadConfig = () => {
  const configPath = path.join(__dirname, '../../config/config.json');
  const pkPath = path.join(__dirname, '../../config/pk.txt');
  const rpcPath = path.join(__dirname, '../../config/rpc.txt');

  // Load config file
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  
  // Load and sanitize private keys
  const privateKeys = readFileSync(pkPath, 'utf-8')
    .split('\n')
    .map(l => l.trim().replace(/\r/g, ''))
    .filter(l => /^0x[a-fA-F0-9]{64}$/.test(l));

  // Load RPC URL
  const rpcUrl = readFileSync(rpcPath, 'utf-8')
    .split('\n')[0]
    .trim();

  // Validation
  if (!config.CHAIN_ID) throw new Error('CHAIN_ID harus diisi di config.json');
  if (!config.JUMP_CONTRACT_ADDRESS) throw new Error('JUMP_CONTRACT_ADDRESS harus diisi');
  
  console.log('[Config] Jumlah Private Keys:', privateKeys.length);
  console.log('[Config] Contoh Private Key:', privateKeys[0]?.slice(0, 10) + '...');
  console.log('[Config] RPC URL:', rpcUrl);
  console.log('[Config] Chain ID:', config.CHAIN_ID);

  return {
    ...config,
    PRIVATE_KEYS: privateKeys,
    PROVIDER: new ethers.JsonRpcProvider(rpcUrl, {
      chainId: config.CHAIN_ID,
      name: 'somnia'
    }),
    JUMP_GAS_PRICE: ethers.parseUnits(config.JUMP_GAS_PRICE || "30", "gwei"),
    JUMP_GAS_LIMIT: config.JUMP_GAS_LIMIT || 200000
  };
};
