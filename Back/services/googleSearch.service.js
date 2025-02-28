const puppeteer = require('puppeteer')

async function search(query){
  // Launch the browser
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

  let cleanQuery = query
  if(query.includes("OR")) cleanQuery = query.split("OR")[0]
  if(cleanQuery.includes("AND")) cleanQuery = query.split("AND")[0]

  // Navigate to the Google search page
  // await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=10&output=search`) // google
  console.log(`https://duckduckgo.com/?t=h_&q=${encodeURIComponent(cleanQuery)}&ia=web`)
  await page.goto(`https://duckduckgo.com/?t=h_&q=${encodeURIComponent(cleanQuery)}&ia=web`)

  // Wait for the page to load
  // await page.waitForSelector('.g') // google
  await page.waitForSelector('li[data-layout="organic"]')

  // Extract the search results
  // const results = await page.$$('.g') // google
  const results = await page.$$('li[data-layout="organic"]')
  const output = []

  for (let i = 0; i < results.length && i < 10; i++) {
    const result = results[i]
    // const title = await result.$eval('h3', (element) => element.textContent) // google
    // const url = await result.$eval('a', (element) => element.href) // google
    const title = await result.$eval('h2', (element) => element.textContent)
    const url = await result.$eval('h2 a', (element) => element.href)

    output.push({
      title,
      url,
      // snippet,
    });
  }

  // Close the browser
  await browser.close()

  return output
}

module.exports = {
    search
}