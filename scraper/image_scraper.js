const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAjioImages() {
    const url = "https://www.ajio.com/men-western-wear/c/830216?query=%3Arelevance%3Al1l3nestedcategory%3AMen%20-%20Tshirts%3Al1l3nestedcategory%3AWomen%20-%20Tshirts&gridColumns=3&segmentIds=";
    
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set a realistic viewport
        await page.setViewport({ width: 1280, height: 800 });
        
        // Set a realistic User-Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Scroll down to load lazy-loaded images
        console.log("Scrolling to load more images...");
        await autoScroll(page);

        // Extract image sources
        console.log("Extracting image URLs...");
        const images = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('img');
            const sources = [];
            imgElements.forEach(img => {
                const src = img.src || img.dataset.src;
                if (src && src.startsWith('http') && (src.includes('assets.ajio.com') || src.includes('images.ajio.com'))) {
                    sources.push(src);
                }
            });
            return [...new Set(sources)]; // Return unique URLs
        });

        console.log(`Found ${images.length} unique Ajio images.`);
        
        // Save to file
        const outputPath = path.join(__dirname, 'scraped_images.txt');
        fs.writeFileSync(outputPath, images.join('\n'));
        
        console.log(`Image URLs saved to ${outputPath}`);
        
    } catch (error) {
        console.error("An error occurred:", error.message);
    } finally {
        await browser.close();
    }
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight || totalHeight > 5000) { // Limit scroll height for demonstration
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

scrapeAjioImages();
