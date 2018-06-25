module.exports = {
  logChannel: {
    application: process.env.LOG_APPLICATION || true,
    metric: process.env.LOG_METRIC || true,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};
