const puppeteer = require('puppeteer-extra')
const fs = require('fs/promises')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const {executablePath} = require('puppeteer')

puppeteer.launch({ headless: true, executablePath: executablePath() }).then(async browser => {
  const url = 'https://www.vegnonveg.com/footwear'
  const sneaker_name = "FORUM LOW 'CLOUD WHITE/GREEN/GUM 3'"
  const timeout = 500

  // Create a new page
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait for the page to load completely
  await page.waitForSelector('div.product');

  let sneakerData = [];

  while (sneakerData.length <= 300) {
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForTimeout(1000);  // adjust as needed
    sneakerData = await page.evaluate( () => {
      const anchors = Array.from(document.querySelectorAll('div.product a'));
      return anchors.map(anchor => {
        const nameElement = anchor.querySelector('span.p-name');
        return {
          name: nameElement ? nameElement.innerText.trim() : '',
          href: anchor.href
        }
      })
    })
  }

  console.log("sneakerData: ", sneakerData)

  // Find the desired sneaker and navigate to its page

  let foundSneaker = false;

  for (let sneaker of sneakerData) {
        if (sneaker.name === sneaker_name) {
            await page.goto(sneaker.href, { waitUntil: 'networkidle2' });
            foundSneaker = true
            break;
        }
  }

  if (!foundSneaker) {
    console.log("Sneaker was not found")
  }

  await page.waitForTimeout(timeout)
  
  await page.screenshot({ path: 'testresult.png', fullPage: true })

  await browser.close();

}).catch(err => console.error(err));
