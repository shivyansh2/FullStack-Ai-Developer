const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')) },
      { once: true }
    )
  })

export async function* streamReply(prompt, signal) {
  await sleep(900, signal)                                   // loading: waiting for first token
  if (/error/i.test(prompt)) throw new Error('Mock API failed (500).')
  const reply = `You said: "${prompt}". This reply streams in word by word, like a real LLM response.`
  for (const word of reply.split(' ')) {
    await sleep(60, signal)
    yield word + ' '                                         // each yield = one streamed token
  }
}