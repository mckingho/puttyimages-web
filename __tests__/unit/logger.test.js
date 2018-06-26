import logger from '../../server/util/logger';

test('should log success', async () => {
  const spy = jest.spyOn(logger, 'log');
  expect(spy).not.toHaveBeenCalled();
  expect(logger.log('fatal', 'metric', { foo: 'bar' })).toBeDefined();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(logger.log('warn', 'application', { foo: 'bar' })).toBeDefined();
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockReset();
  spy.mockRestore();
});

test('should throw on undefined level or channel', async () => {
  expect(() => {
    logger.log('undefined', 'metric', { foo: 'bar' });
  }).toThrow();
  expect(() => {
    logger.log('info', 'undefined', { foo: 'bar' });
  }).toThrow();
});

test('should log alias function', async () => {
  expect(logger.trace('metric', { foo: 'bar' })).toBeDefined();
  expect(logger.debug('metric', { foo: 'bar' })).toBeDefined();
  expect(logger.info('metric', { foo: 'bar' })).toBeDefined();
  expect(logger.warn('metric', { foo: 'bar' })).toBeDefined();
  expect(logger.error('metric', { foo: 'bar' })).toBeDefined();
  expect(logger.fatal('metric', { foo: 'bar' })).toBeDefined();
});
