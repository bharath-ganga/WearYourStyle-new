const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fetchProducts(page = 0) {
    console.log(`Fetching page ${page}...`);
    
    const url = `https://www.ajio.com/api/category/830216?fields=SITE&currentPage=${page}&pageSize=45&format=json&query=%3Arelevance%3Al1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts&gridColumns=3&facets=l1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts&segmentIds=&advfilter=true&platform=Desktop&showAdsOnNextPage=true&is_ads_enable_plp=true&displayRatings=true&segmentIds=&enableRushDelivery=true&vertexEnabled=false&visitorId=445885058.1775652377&userEncryptedId=c28fb742f5d038b0cd082f108a4cf2d5c6c8d63b7456741b71ec78df03075ee0&previousSource=Saas&plaAdsProvider=OSMOS&plaAdsEliminationDisabled=false&plpBannerAdsEnabled=false&state=&city=&zone=&userRestriction=&userState=NON_LOGGED_IN`;

    const args = [
        url,
        '-H', 'sec-ch-ua-platform: "Windows"',
        '-H', 'Referer: https://www.ajio.com/men-western-wear/c/830216?query=%3Arelevance%3Al1l3nestedcategory%3AMen%20-%20Tshirts%3Al1l3nestedcategory%3AWomen%20-%20Tshirts%3Al1l3nestedcategory%3AMen%20-%20Shirts%3Al1l3nestedcategory%3AWomen%20-%20Shirts&gridColumns=3&segmentIds=',
        '-H', 'sec-ch-ua: "Chromium";v="146", "Not-A.Brand";v="24", "Microsoft Edge";v="146"',
        '-H', 'sec-ch-ua-mobile: ?0',
        '-H', 'ai: www.ajio.com',
        '-H', 'clientIP: 117.213.200.3, 117.239.141.14, 23.15.40.173, 23.64.59.229, 23.197.28.175',
        '-H', 'vr: WEB-1.15.0',
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
        '-H', 'Accept: application/json',
        '-H', 'os: 4',
        '-H', 'ua: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0'
    ];

    try {
        const result = spawnSync('curl.exe', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        
        if (result.error) {
            throw new Error(result.error.message);
        }

        const output = result.stdout;
        if (!output || output.trim().startsWith('<HTML>')) {
            throw new Error('Received HTML error page instead of JSON. Access Denied.');
        }

        const data = JSON.parse(output);

        return data.products.map(product => {
            return {
                code: product.code,
                imgSource: product.fnlColorVariantData ? product.fnlColorVariantData.outfitPictureURL : (product.images && product.images[0] ? product.images[0].url : ''),
                title: product.name,
                brand: product.fnlColorVariantData ? product.fnlColorVariantData.brandName : 'Unknown Brand',
                price: product.price ? product.price.value : 0,
                rating: product.averageRating || 0,
                sizes: ["S", "M", "L", "XL"],
                colors: ["#3C4242", "#EDD146"],
                stock: 50,
                category: product.brickNameText || 'Clothing'
            };
        });
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        return [];
    }
}

/**
 * Main scraper function
 */
async function runScraper(pages = 1) {
    let allProducts = [];
    
    for (let i = 0; i < pages; i++) {
        const products = await fetchProducts(i);
        allProducts = [...allProducts, ...products];
        // Brief delay to be polite
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Scraped total ${allProducts.length} products.`);
    
    // Save to a JSON file that can be used for migration
    const outputPath = path.join(__dirname, 'scraped_products.json');
    fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
    console.log(`Products saved to ${outputPath}`);
    
    return allProducts;
}

// Run the scraper for 2 pages by default
runScraper(2);