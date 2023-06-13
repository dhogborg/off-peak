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

  const from = new Date(now)
  from.setFullYear(now.getFullYear() + year, month, 1)

  const to = new Date(from)
  to.setFullYear(now.getFullYear() + year, month + 1, 1)

  const ms = to.getTime() - from.getTime()
  const hours = Math.floor(ms / 1000 / 60 / 60)

  return { from, to, hours }
}

export function getYearIntervalFor(year: number): Period {
  const now = new Date()
  now.setHours(0)
  now.setMinutes(0)
  now.setSeconds(0)
  now.setMilliseconds(0)

  const from = new Date(year, 0, 1)

  let to: Date;
  if (year < now.getFullYear()) {
    to = new Date(year+1, 12, 31)  // if year is last year, stop on New Year's eve
  } else {
    to = now  // if year is this year, stop today
  }

  const ms = to.getTime() - from.getTime()
  const hours = Math.floor(ms / 1000 / 60 / 60)

  return { from, to, hours }
}
