function normalizeHex(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  const hex = raw.startsWith('#') ? raw.slice(1) : raw
  if (hex.length === 3 && /^[\da-fA-F]{3}$/.test(hex)) {
    return `#${hex
      .split('')
      .map((c) => `${c}${c}`)
      .join('')}`.toUpperCase()
  }

  if (hex.length === 6 && /^[\da-fA-F]{6}$/.test(hex)) {
    return `#${hex}`.toUpperCase()
  }

  return null
}

function hexToRgb(hexColor) {
  const normalized = normalizeHex(hexColor)
  if (!normalized) return null

  const hex = normalized.slice(1)
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  }
}

function srgbToLinear(channel) {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(colorA, colorB) {
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)
  if (!rgbA || !rgbB) return null

  const luminanceA = 0.2126 * srgbToLinear(rgbA.r) + 0.7152 * srgbToLinear(rgbA.g) + 0.0722 * srgbToLinear(rgbA.b)
  const luminanceB = 0.2126 * srgbToLinear(rgbB.r) + 0.7152 * srgbToLinear(rgbB.g) + 0.0722 * srgbToLinear(rgbB.b)

  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

