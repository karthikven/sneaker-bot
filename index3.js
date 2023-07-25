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
		console.log("sneakerData: ", sneakerData)

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

async function main() {
	try {

		const url = 'https://www.vegnonveg.com/footwear'
		const sneaker_name = "FORUM LOW 'CLOUD WHITE/GREEN/GUM 3'"
		
		// launch browser
		const browser = await launchBrowser()		
		// create a new page
		const page = await browser.newPage();
		// get sneakerData
		const sneakerData = await getSneakerData(page, url)
		
		await browser.close()

	} catch (err) {
		console.error(err);
	}
}

main()
