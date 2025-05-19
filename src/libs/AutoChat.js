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
"GN degens!",
"Hello anon!",
"Up only!",
"Wagmi!",
"Ngmi...",
"Let's pump it!",
"Bear vibes?",
"Bullish AF!",
"Stay based!",
"LFG!",
"Y’all bullish?",
"FOMO kicking in!",
"No rug pls!",
"Any alpha?",
"Just vibin’",
"Touch grass!",
"Don’t get rekt!",
"GM kings!",
"Sup frens?",
"Wen Lambo?",
"Wen Binance?",
"Buy the dip!",
"Hodl tight!",
"Still holding?",
"Wen airdrop?",
"To the moon!",
"Daily cope!",
"Moon soon?",
"Zoom zoom!",
"Flippening soon?",
"Chart lookin spicy!",
"Staking yet?",
"Gas too high!",
"Let’s build!",
"YOLO trade!",
"Making it?",
"Paper hands?",
"Diamond hands!",
"Back to work!",
"Need exit pls!",
"Sir, pls pump!",
"Wen listing?",
"Who shilled this?",
"Sniffing rugs...",
"Wagmi vibes!",
"Feeling poor?",
"ETH up?",
"BTC dump?",
"Bridge today?",
"Chain down?",
"Rekt again...",
"Still alive!",
"Bear market chill.",
"Hopeium levels?",
"Pepe when?",
"Waitin’ dip!",
"Exit scam soon?",
"Cashin out?",
"Ape in now!",
"Gas war time!",
"Sniped first!",
"Bots win again...",
"Try again GM!",
"Don’t fade this!",
"Wen DAO?",
"Stablecoin broke?",
"Dev do something!",
"Rug pulled?",
"Wen whitelist?",
"Drop confirmed!",
"Early or late?",
"Sleeping on this?",
"Overpriced JPGs!",
"Let’s goo!",
"Wen reveal?",
"Can’t stop now!",
"Airdrop farming?",
"Wen testnet?",
"Touching ATH!",
"Below ICO price!",
"Check the chart!",
"Burn it all!",
"Tokenomics sus?",
"NGMI vibes...",
"Pump it louder!",
"Big news soon?",
"Buy signal?",
"Short squeeze?",
"Feels like 2021!",
"Echo pump?",
"Mainnet wen?",
"Launch delayed...",
"Holding breath!",
"Farmers unite!",
"Trade or fade?",
"Mint live now!",
"Another ponzi?",
"DEX issues again?"

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
