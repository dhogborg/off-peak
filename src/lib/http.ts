export async function handledFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)
  if (!response.ok) {
    const body = await response.text()
    if (body && body.indexOf && body.indexOf('{') === 0) {
      const js = JSON.parse(body)
      if (js && js.error) {
        throw new Error(`${response.status} ${response.statusText}: ${js.error}`)
      }
    }

    throw new Error(`${response.status}: ${response.statusText}`)
  }

  return response
}
