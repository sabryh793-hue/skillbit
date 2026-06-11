export default () => ({
    PORT: process.env.PORT || 5000,
    DATABASE_URL: process.env.DATABASE_URL,
    EMAIL: process.env.EMAIL,
    PASS: process.env.PASS,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    BEARER: process.env.BEARER,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    
})