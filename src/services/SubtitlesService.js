class SubtitlesService {
  constructor (PuppeteerService, _BASE_URL_) {
    this.PuppeteerService = PuppeteerService;
    this._BASE_URL_ = _BASE_URL_;
    this.subMapping = [];
    this.searchWords= 'Breaking Bad';
    this.searchByTitle = 'Breaking.Bad'
  }

  async search () {
    console.debug('Iniciando search');

    try {

      const newPage = await this.PuppeteerService.newPage();

      console.log('Carregar página de busca...');
      await newPage.goto(`http://legendas.tv/busca/${this.searchWords}`);
      await newPage.waitForSelector('#resultado_busca');
      newPage.waitForNavigation();

      console.log('Captura de legendas...');

      newPage.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

      let isFound = await newPage.evaluate(() => document.body.contains(document.querySelector('#resultado_busca > a')));

      while (isFound) {
        try {
          if (isFound) {
            await newPage.click('#resultado_busca > a');

            await newPage.waitForSelector('#resultado_busca > a')
            .then(() => {
              isFound = true;
            })
            .catch((error) => {
              console.debug(error);
              isFound = false;
            });
          }
        } catch (error) {
          console.debug(error);
          isFound = false;
        }
      }

      await this.scrap(newPage);

      this.subMapping[0] = this.subMapping[0].filter((sub) => {
        return sub.title.includes(this.searchByTitle);
      })
      
      for (const item of this.subMapping[0]) {
        await newPage.goto(item.link);

        const ratio = await this.scrapVotes(newPage);

        item.like_ratio = ratio;

        delete item.link;
      }
      
    } catch (error) {
      console.debug(`SubtitlesService Error at scrap method: ${error}`);
    }
  }

  async scrap (page) {

      const subtitles = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('#resultado_busca article > div'));

        return items.map(item => {
            const href = item.querySelector('a').href;
            const hash = href.split('/')[4];

            let metadata = item.querySelector('.f_left > p.data');

            let user = metadata.querySelector('a').text;

            metadata = metadata.innerText.split(',');

            let downloads = metadata[0];
            downloads = parseInt(downloads.split(' ')[0]);

            let score = metadata[1];
            score = parseInt(score.split(' ')[2]);

            let submissionDate = metadata[2].trim();
            submissionDate = submissionDate.split(' ')[4];
            submissionDate = submissionDate.split('/');
            submissionDate = (new Date(submissionDate[2] +'-'+ submissionDate[1] + '-' + submissionDate[0])).toJSON();

            return {
                link: href,  
                title: item.querySelector('a').innerText,
                download: `http://legendas.tv/downloadarquivo/${hash}`,
                language: item.querySelector('img').alt,
                score,
                user,
                downloads,
                submissionDate,
                like_ratio: 0.00
            }
          });
      });  

      this.subMapping.push(subtitles);
  }

  async scrapVotes(page) {

    const like_ratio = await page.evaluate(() => { 
      const positive = parseFloat(document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(1)').innerText);
      const negative = parseFloat(document.querySelector('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) > p:nth-child(2)').innerText);

      let ratio = 0.00;
        console.log(`positive: ${positive}`);
        if (typeof positive !== 'undefined' && positive) {
          ratio = positive.toFixed(2);

        }

        console.log(`negative: ${negative}`);
        if (typeof negative !== 'undefined' && negative) {
          ratio = (ratio/negative).toFixed(2);
        }
        
        console.log(`ratio: ${Number(Math.round(ratio+'e2')+'e-2')}`);
        return Number(Math.round(ratio+'e2')+'e-2');
     });

     return like_ratio;
  }
}

module.exports =  SubtitlesService;