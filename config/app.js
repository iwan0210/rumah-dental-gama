module.exports = {
    name: process.env.APP_NAME,
    shortName: process.env.APP_SHORT_NAME,

    address: process.env.APP_ADDRESS,
    phone: process.env.APP_PHONE,

    maps: {
        embedUrl: process.env.APP_GOOGLE_MAPS_EMBED,
        url: process.env.APP_GOOGLE_MAPS_URL
    }
}