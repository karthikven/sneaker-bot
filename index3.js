const puppeteer = require('puppeteer-extra')
const fs = require('fs/promises')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const {executablePath} = require('puppeteer')

puppeteer.use(StealthPlugin())

const url = 'https://www.vegnonveg.com/footwear'
const sneaker_name = "FORUM LOW 'CLOUD WHITE/GREEN/GUM 3'"
const timeout = 500

// four steps: 1. launch browser 2. go to page and get list of sneakers 3. find sneaker and go to sneaker page 4. screenshot

const launchBrowser = async() => {
	try {
		return await puppeteer.launch({ headless: true, executablePath: executablePath() })
	} catch (err) {
		console.err("Failed to launch browser, error - ", err)
		throw err
	}
}

const getSneakerData = async (page, url) => {

	try {

		await page.goto(url, { waitUntil: 'networkidle2' });

		// Wait for the page to load completely
	  	await page.waitForSelector('div.product');

	  	let sneakerData = new Map();

		while (sneakerData.size <= 300) {
			await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
			await page.waitForTimeout(1000);
		    let newSneakerData = await page.evaluate( () => {
		    	const anchors = Array.from(document.querySelectorAll('div.product a'));
		      	return anchors.map(anchor => {
		        const nameElement = anchor.querySelector('span.p-name');
		        return {
		        	name: nameElement ? nameElement.innerText.trim() : '',
		          	href: anchor.href
		          }
		      })
		    })
		    newSneakerData.forEach(sneaker => {
		    	sneakerData.set(sneaker.name, sneaker.href)
		    })
		}

		// make sure sneakerData is not empty
		if (sneakerData.size == 0) {
			throw new Error('No sneakers were found in this page')
		}
		// console.log("sneakerData: ", sneakerData)

		return sneakerData

	} catch (err) {
		console.error("Failed to get sneaker data, error - ", err)
		throw err
	}
}

const findSneaker = async (page, sneakerData, sneakerName) => {
	// Check if the sneaker is in the data
	if (!sneakerData.has(sneakerName)) {
		throw new Error(`Sneaker "${sneakerName}" not found in the data.`)
	}
	try {
		// navigate to url
		await page.goto(sneakerData.get(sneakerName), { waitUntil: 'networkidle2' });	
	} catch (err) {
		console.error("failed to find sneaker", err)
		throw err
	}
}

const selectSize = async (page, size) => {
	try {
		// Open the dropdown menu
		await page.click('div.select');

		// Wait for the dropdown menu to appear
		await page.waitForSelector('.dropdown-menu.variant-dropdown', {visible: true});

		// Find the <li> element with the matching data-size attribute and click it
		await page.evaluate((size) => {
			const lis = document.querySelectorAll('.dropdown-menu.variant-dropdown li');
			let sizeOption = null;
			for (let i = 0; i < lis.length; i++) {
				if (lis[i].dataset.size === size.toString()) {
					sizeOption = lis[i];
					break
				}
			}

			// const sizeOption = Array.from(document.querySelectorAll('.dropdown-menu.variant-dropdown li')).find(li => li.dataset.size === size.toString());
			if (sizeOption) {
				sizeOption.click();
			}
		}, size)

	} catch (err) {
		console.error("Failed to select size", err);
		throw err
	}
}

const addToCart = async (page) => {
	try {
		await page.waitForTimeout(500)
		await page.click('button.add_to_bag')
		await page.waitForTimeout(500)
	} catch (err) {
		console.error("Failed to add to cart", err);
		throw err
	}
}

const goToCheckout = async (page, checkout_url) => {
	try {
		await page.goto(checkout_url, { waitUntil: 'networkidle2' });
		// await page.click('.ico.ico-cart')
		// wait for page to navigate to the cart page
		// await page.waitForNavigation({ waitUntil: 'networkidle2' });
	} catch(err) {
		console.error("Failed to navigate to checkout", err)
		throw err
	}
}

const main = async () => {

	let browser;
	
	try {

		const url = 'https://www.vegnonveg.com/footwear'
		const cart_url = 'https://www.vegnonveg.com/cart'
		const checkout_url = 'https://www.vegnonveg.com/checkout'
		const sneaker_name = "DUNK HI RETRO BTTYS 'STADIUM GREEN/WHITE-STADIUM GREEN-WHITE'"	
		const sneaker_size = 9
		let timeout = 500
		// launch browser
		browser = await launchBrowser()		
		// create a new page
		const page = await browser.newPage();
		// get sneakerData
		const sneakerData = await getSneakerData(page, url)
		// go to page for sneakers
		const sneakerPage = await findSneaker(page, sneakerData, sneaker_name)		
		// select size
		const selectSneakerSize = await selectSize(page, sneaker_size)
		// add to cart
		const addSneakerToCart = await addToCart(page)
		// go to cart
		const goToCheckoutPage = await goToCheckout(page, checkout_url)

		await page.waitForTimeout(timeout)
  		await page.screenshot({ path: 'testresult5.png', fullPage: true })

	} catch (err) {
		console.error(err);
	} 
	finally {
		if (browser) {
			return
			await browser.close()
		}
	}
}

main()
