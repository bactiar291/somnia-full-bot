export const random = {
  delay: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  element: (arr) => arr[Math.floor(Math.random() * arr.length)],
  percentage: (min, max) => Math.random() * (max - min) + min
};

export const keyRotator = (keys) => {
  let index = 0;
  return {
    next: () => {
      const key = keys[index++ % keys.length]?.trim(); // Tambah trim()
      if (!/^0x[a-fA-F0-9]{64}$/.test(key)) {
        throw new Error(`Invalid private key format: ${key}`);
      }
      return key;
    }
  };
};

export const safeParseEther = (amount) => {
  try {
    return ethers.parseEther(amount.toString().replace(/[^0-9.]/g, ''));
  } catch {
    return 0n;
  }
};

export const maskAddress = (address) => 
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'invalid-address';
