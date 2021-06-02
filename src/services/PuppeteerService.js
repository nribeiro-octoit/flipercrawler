const puppeteer = require('puppeteer');

class PuppeteerService {

  constructor () {
    this.browser = null;
    // this.width = 1024;
    // this.height = 1024;
  }

  async init () {
    this.browser = await puppeteer.launch({
      // headless: false,
      // devtools: true,
      slowMo: 100,
      executablePath: process.env.CHROMIUM_PATH,
      // 'defaultViewport' : { 'width' : this.width, 'height' : this.height },
      args: [
        // Required for Docker version of Puppeteer
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // This will write shared memory files into /tmp instead of /dev/shm,
        // because Docker’s default for /dev/shm is 64MB
        '--disable-dev-shm-usage'
      ]
    });
  }

  async newPage () {
    let newBrowserPage = this.browser.newPage();
    return newBrowserPage;
  }

  async closeBrowser () {
    await this.browser.close();
  }
}

module.exports = PuppeteerService;