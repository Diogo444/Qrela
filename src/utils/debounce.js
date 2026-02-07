export function debounce(callback, waitMs = 100) {
  let timeoutId = 0

  function debounced(...args) {
    if (timeoutId) window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      timeoutId = 0
      callback(...args)
    }, waitMs)
  }

  debounced.cancel = () => {
    if (timeoutId) window.clearTimeout(timeoutId)
    timeoutId = 0
  }

  return debounced
}

