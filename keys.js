module.exports = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.FB_USER || 'root',
        password: process.env.DB_PASS || '123456',
        database: process.env.DB_NAME || 'contactlist',
        charset : 'utf8'
    }
}