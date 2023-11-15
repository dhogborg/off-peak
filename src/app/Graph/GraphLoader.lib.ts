export interface Period {
  from: Date
  to: Date
  hours: number
}

export function getMonthIntervalFor(month: number): Period {
  const now = new Date()
  now.setHours(0)
  now.setMinutes(0)
  now.setSeconds(0)
  now.setMilliseconds(0)

  // look at previous years numbers if month is ahead of current month
  const year = month > now.getMonth() ? -1 : 0

  const from = new Date()
  from.setFullYear(now.getFullYear() + year, month, 1)
  from.setUTCHours(0, 0, 0, 0)

  const to = new Date(from)
  to.setFullYear(now.getFullYear() + year, month + 1, 1)

  const ms = to.getTime() - from.getTime()
  const hours = Math.floor(ms / 1000 / 60 / 60)

  return { from, to, hours }
}

export function getRollingInterval(days: number, start?: Date): Period {
  const from = start ? new Date(start) : new Date()
  from.setUTCHours(0, 0, 0, 0)
  from.setDate(from.getDate() - days)

  const to = start ? new Date(start) : new Date()
  to.setUTCHours(0, 0, 0, 0)

  const ms = to.getTime() - from.getTime()
  const hours = Math.floor(ms / 1000 / 60 / 60)

  return { from, to, hours }
}
