export const errorString = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }
  if (typeof err === 'string') {
    return err
  }
  return 'Unknown error'
}

export function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}
