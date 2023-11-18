import { expect, test } from 'vitest'
import { getRollingInterval } from './GraphLoader.lib'

test('creates date n days back in time', () => {
  const start = new Date()
  start.setFullYear(2023, 9, 9)
  start.setUTCHours(13, 37, 0, 0)

  const out = getRollingInterval(32, start)

  const p = {
    from: new Date('2023-09-07T00:00:00.000Z'),
    to: new Date('2023-10-09T00:00:00.000Z'),
    hours: 768,
  }
  expect(out).toEqual(p)
})
