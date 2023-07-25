const puppeteer = require('puppeteer-extra')
const fs = require('fs/promises')


// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const {executablePath} = require('puppeteer')



puppeteer.launch({ headless: true, executablePath: executablePath() }).then(async browser => {
  console.log('Running tests..')
  let url = 'https://www.vegnonveg.com/products/nike-zoom-lebron-iii-qs-blackmetallic-silver-university-red'
  let cart_url = "https://www.vegnonveg.com/cart"
  let checkout_url = "https://www.vegnonveg.com/checkout"

  let timeout = 500

  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForTimeout(timeout)
  
//   const snkrs = await page.evaluate(() => {
//   	return Array.from(document.querySelectorAll(".p-name")).map(x => x.textContent)
//   })
// 
//   console.log(snkrs)

  // click on size
  await page.click('body > div.page.bg-grey > div.bg-grey.relative > div.container.pd-v-25 > div.flex.gutter > div.col-12-12.col-xs-5-12 > div:nth-child(1) > form > div:nth-child(3) > div > div.col-6-12.col-sm-5-12 > div > div > span')
  await page.waitForTimeout(timeout)

  // select size
  await page.click('body > div.page.bg-grey > div.bg-grey.relative > div.container.pd-v-25 > div.flex.gutter > div.col-12-12.col-xs-5-12 > div:nth-child(1) > form > div:nth-child(3) > div > div.col-6-12.col-sm-5-12 > div > ul > li:nth-child(8)')
  await page.waitForTimeout(timeout)

  // select add to cart
  await page.click('body > div.page.bg-grey > div.bg-grey.relative > div.container.pd-v-25 > div.flex.gutter > div.col-12-12.col-xs-5-12 > div:nth-child(1) > form > div.mt-10 > button')
  await page.waitForTimeout(timeout)
  
  // go to cart
  await page.goto(cart_url)
  await page.waitForTimeout(timeout)

  // checkout
  await page.goto(checkout_url)
  await page.waitForTimeout(timeout)
  
  await page.screenshot({ path: 'testresult.png', fullPage: true })
  await browser.close()
  console.log(`All done, check the screenshot. ✨`)

})


