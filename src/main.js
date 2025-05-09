import { loadConfig } from './libs/config.js';
import { AutoDeploy } from './libs/AutoDeploy.js';
import { AutoSwap } from './libs/AutoSwap.js';
import { AutoLove } from './libs/AutoLove.js';
import { AutoSend } from './libs/AutoSend.js';
import { AutoChat } from './libs/AutoChat.js';
import { AutoJump } from './libs/AutoJump.js';
import { random } from './libs/utils.js';
import ora from 'ora';
import chalk from 'chalk';

class BotOrchestrator {
  constructor() {
    this.config = loadConfig();
    this.bots = [
      new AutoDeploy(this.config),
      new AutoSwap(this.config),
      new AutoLove(this.config),
      new AutoSend(this.config),
      new AutoChat(this.config),
      new AutoJump(this.config)
    ];
    this.cycleCount = 1;
    this.startTime = Date.now();
    this.timerInterval = null;
  }

  getElapsedTime() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      process.stdout.write(chalk.dim(`\r⏱  Waktu aktif: ${this.getElapsedTime()} `));
    }, 1000);
  }

  async start() {
    console.clear();
    this.printBanner();
    this.startTimer();

    while (true) {
      console.log(chalk.dim(`\n=== Siklus ${this.cycleCount++} ===`));
      await this.runRandomBot();
      await this.delay();
    }
  }

  printBanner() {
    console.log(chalk.cyanBright(`
    ███████╗ ██████╗ ███╗   ███╗███╗   ██╗██╗ █████╗ 
    ██╔════╝██╔═══██╗████╗ ████║████╗  ██║██║██╔══██╗
    ███████╗██║   ██║██╔████╔██║██╔██╗ ██║██║███████║
    ╚════██║██║   ██║██║╚██╔╝██║██║╚██╗██║██║██╔══██║
    ███████║╚██████╔╝██║ ╚═╝ ██║██║ ╚████║██║██║  ██║
    ╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
    `));
    
    console.log(chalk.yellow('🔥 Fitur Aktif:'));
    console.log(chalk.yellow('├── Deploy Kontrak ERC20'));
    console.log(chalk.yellow('├── Swap PING/PONG'));
    console.log(chalk.yellow('├── Love Somini'));
    console.log(chalk.yellow('├── Send STT Acak'));
    console.log(chalk.yellow('├── Chat On-Chain'));
    console.log(chalk.yellow('└── Somnia Jump Game\n'));
  }

  async runRandomBot() {
    const bot = random.element(this.bots);
    const spinner = ora({
      text: chalk.yellow(`Memulai ${bot.constructor.name.replace('Auto', '')}...`),
      spinner: 'dots2',
      color: 'yellow'
    }).start();

    try {
      const result = await bot.execute();
      
      if (result.success) {
        spinner.succeed([
          chalk.green(`✅ ${result.message}`),
          chalk.dim(`TX: ${result.hash}`)
        ].join('\n'));
      } else {
        spinner.fail(chalk.red(`⚠️  ${result.error}`));
      }
    } catch (error) {
      spinner.fail(chalk.red(`💀 Error fatal: ${error.message}`));
    }
  }

  async delay() {
    const delay = random.delay(7000, 17000);
    const waitSpinner = ora({
      text: chalk.blue(`Menunggu ${(delay/1000).toFixed(1)} detik`),
      spinner: 'bouncingBar'
    }).start();

    await new Promise(resolve => {
      const start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = delay - elapsed;
        waitSpinner.text = chalk.blue(
          `Menunggu ${(remaining/1000).toFixed(1).padStart(4, ' ')} detik ` + 
          this.getProgressBar(remaining/delay)
        );
        if (remaining <= 0) {
          clearInterval(interval);
          waitSpinner.stop();
          resolve();
        }
      }, 100);
    });
  }

  getProgressBar(percentage) {
    const filled = Math.round(20 * (1 - percentage));
    return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(20 - filled));
  }
}

// Handle exit
process.on('SIGINT', () => {
  console.log(chalk.red('\n\n🛑 Bot dihentikan oleh pengguna'));
  process.exit();
});

// Jalankan bot
try {
  new BotOrchestrator().start();
} catch (error) {
  console.error(chalk.red('🔥 Error inisialisasi:'), error);
  process.exit(1);
}
