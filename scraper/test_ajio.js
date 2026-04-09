const axios = require('axios');

async function testAjio() {
    const url = 'https://www.ajio.com/api/category/830216?fields=SITE&currentPage=0&pageSize=45&format=json&query=%3Arelevance%3Al1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts%3Al1l3nestedcategory%3AMen+-+Shirts%3Al1l3nestedcategory%3AWomen+-+Shirts&gridColumns=3&facets=l1l3nestedcategory%3AMen+-+Tshirts%3Al1l3nestedcategory%3AWomen+-+Tshirts%3Al1l3nestedcategory%3AMen+-+Shirts%3Al1l3nestedcategory%3AWomen+-+Shirts&segmentIds=&advfilter=true&platform=Desktop&showAdsOnNextPage=true&is_ads_enable_plp=true&displayRatings=true&segmentIds=&enableRushDelivery=true&vertexEnabled=false&visitorId=445885058.1775652377&userEncryptedId=c28fb742f5d038b0cd082f108a4cf2d5c6c8d63b7456741b71ec78df03075ee0&previousSource=Saas&plaAdsProvider=OSMOS&plaAdsEliminationDisabled=false&plpBannerAdsEnabled=false&state=&city=&zone=&userRestriction=&userState=NON_LOGGED_IN';
    
    const headers = {
        'sec-ch-ua-platform': '"Windows"',
        'Referer': 'https://www.ajio.com/men-western-wear/c/830216?query=%3Arelevance%3Al1l3nestedcategory%3AMen%20-%20Tshirts%3Al1l3nestedcategory%3AWomen%20-%20Tshirts&gridColumns=3',
        'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Microsoft Edge";v="146"',
        'sec-ch-ua-mobile': '?0',
        'ai': 'www.ajio.com',
        'clientIP': '117.213.200.3, 117.239.141.14, 23.15.40.173, 23.64.59.229, 23.197.28.175',
        'vr': 'WEB-1.15.0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0',
        'Accept': 'application/json',
        'os': '4',
        'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0'
    };

    try {
        const response = await axios.get(url, { headers });
        console.log(JSON.stringify({
            status: response.status,
            productCount: response.data.products ? response.data.products.length : 0,
            firstProductName: response.data.products && response.data.products[0] ? response.data.products[0].name : 'N/A'
        }, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data).substring(0, 500));
        }
    }
}

testAjio();
