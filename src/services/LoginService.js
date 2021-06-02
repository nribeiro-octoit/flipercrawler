class LoginService {

  constructor (PuppeteerService, _BASE_URL_, _USER_LOGIN_, _USER_PWD_ ) {
    this.PuppeteerService = PuppeteerService;
    this._BASE_URL_ = _BASE_URL_;
    this._USER_LOGIN_ = _USER_LOGIN_;
    this._USER_PWD_ = _USER_PWD_;
  }

  async login () {
    try {
      
      const newPage = await this.PuppeteerService.newPage();

      await newPage.goto(`${this._BASE_URL_}/login`);

      await newPage.type('#UserUsername', this._USER_LOGIN_);
      await newPage.type('#UserPassword', this._USER_PWD_);
      await newPage.click('#UserLoginForm .btn');

    } catch (error) {
      console.debug(`Error at LoginService: ${error}`);
    }
  }
}

module.exports = LoginService;