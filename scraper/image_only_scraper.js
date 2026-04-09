const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function scrapeImagesOnly() {
    console.log("Fetching images from Ajio...");
    
    // Using your exact working URL and headers
    const url = `https://www.ajio.com/api/category/830216?fields=SITE&currentPage=0&pageSize=45&format=json&query=%3Arelevance%3Al1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts&gridColumns=3&facets=l1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts&segmentIds=&advfilter=true&platform=Desktop&showAdsOnNextPage=true&is_ads_enable_plp=true&displayRatings=true&segmentIds=&enableRushDelivery=true&vertexEnabled=false&visitorId=445885058.1775652377&userEncryptedId=c28fb742f5d038b0cd082f108a4cf2d5c6c8d63b7456741b71ec78df03075ee0&previousSource=Saas&plaAdsProvider=OSMOS&plaAdsEliminationDisabled=false&plpBannerAdsEnabled=false&state=&city=&zone=&userRestriction=&userState=NON_LOGGED_IN`;

    const args = [
        url,
        '-H', 'sec-ch-ua-platform: "Windows"',
        '-H', 'Referer: https://www.ajio.com/men-western-wear/c/830216',
        '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
        '-H', 'Accept: application/json',
        '-H', 'clientIP: 117.213.200.3, 117.239.141.14, 23.15.40.173, 23.64.59.229, 23.197.28.175',
        '-H', 'ai: www.ajio.com',
        '-H', 'vr: WEB-1.15.0',
        '-H', 'os: 4',
        '-H', 'ua: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0'
    ];

    try {
        const result = spawnSync('curl.exe', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        
        if (!result.stdout || result.stdout.trim().startsWith('<HTML>')) {
            throw new Error("Access Denied or Empty Response.");
        }

        const data = JSON.parse(result.stdout);

        // Extracting only the image URLs from the product list
        const imageList = data.products.map(p => 
            p.fnlColorVariantData?.outfitPictureURL || p.images?.[0]?.url
        ).filter(url => url);

        console.log(`\nSuccessfully found ${imageList.length} images:\n`);
        console.log(imageList.join('\n'));

        // Save to a text file
        const outputPath = path.join(__dirname, 'images.txt');
        fs.writeFileSync(outputPath, imageList.join('\n'));
        console.log(`\n✅ Saved to: ${outputPath}`);

    } catch (err) {
        console.error(`Error: ${err.message}. Make sure your tokens are fresh!`);
    }
}

scrapeImagesOnly();
