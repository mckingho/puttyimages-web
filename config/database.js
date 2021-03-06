module.exports = {
  development: {
    database: process.env.DB_NAME || 'postgres',
    dialect: 'postgres',
    host: process.env.DB_HOSTNAME || 'db',
    password: process.env.DB_PASSWORD || null,
    pool: {
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 10000,
      evict: parseInt(process.env.DB_POOL_EVICT) || 10000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
    },
    username: process.env.DB_USERNAME || 'postgres',
  },
};
