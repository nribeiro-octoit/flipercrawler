const PuppeteerService = require('./services/PuppeteerService');
const SubtitlesService = require('./services/SubtitlesService');
const LoginService = require('./services/LoginService');
const fileSystem = require('fs');
const dotenv = require('dotenv');

class Service {

  constructor () {

    dotenv.config();

    console.debug(process.env.BASE_URL);

    this.PuppeteerService = new PuppeteerService();
    this.SubtitlesService = new SubtitlesService(this.PuppeteerService, process.env.BASE_URL);
    this.LoginService = new LoginService(this.PuppeteerService, process.env.BASE_URL, process.env.USER_LOGIN, process.env.USER_PWD);

  }

  async init () {
    try {

      await this.PuppeteerService.init();
      await this.LoginService.login();
      await this.SubtitlesService.search();
      await this.PuppeteerService.closeBrowser();

      // console.log(this.SubtitlesService.subMapping);
      console.debug('Foram encontradas ' + this.SubtitlesService.subMapping[0].length +' legendas.');

      fileSystem.writeFile('./src/subtitles.json', JSON.stringify(this.SubtitlesService.subMapping[0]), error => {
          if (error) throw error;
          console.log('The file has been saved at src/subtitles.json!');
      });
      
    } catch (error) {
      console.debug(error);
    }
    // finally {
    //   console.debug('Finalizar browser');
    //   this.PuppeteerService.closeBrowser();
    // }
  }

}

module.exports = Service;