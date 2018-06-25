import { LOG_LEVEL_MAP } from '../../constant';

const loggerConfig = require('../../config/logger');

const channelLogger = {
  application: (level, obj) => {
    if (loggerConfig.logChannel.application) {
      console.log(level); // eslint-disable-line no-console
      console.log(obj); // eslint-disable-line no-console
    }
    return true;
  },
  metric: (level, obj) => {
    if (loggerConfig.logChannel.metric) {
      console.log(level); // eslint-disable-line no-console
      console.log(obj); // eslint-disable-line no-console
    }
    return true;
  },
};

const logger = {
  log: (level, channel, obj) => {
    if (!(level in LOG_LEVEL_MAP)) {
      throw new Error('invalid log level');
    }
    if (typeof channelLogger[channel] !== 'function') {
      throw new Error('invalid log channel');
    }
    if (LOG_LEVEL_MAP[level] >= LOG_LEVEL_MAP[loggerConfig.logLevel]) {
      return channelLogger[channel](level, obj);
    }
    return true;
  },
};

Object.keys(LOG_LEVEL_MAP).forEach((lvl) => {
  if (
    hasOwnProperty.call(LOG_LEVEL_MAP, lvl) &&
    lvl !== 'all' &&
    lvl !== 'off'
  ) {
    logger[lvl] = (channel, obj) => logger.log(lvl, channel, obj);
  }
});

export default logger;
