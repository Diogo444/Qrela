export function isBlank(value) {
  return !value || value.trim() === ''
}

export function validateUrl(input) {
  const raw = (input ?? '').trim()
  if (isBlank(raw)) return { ok: false, errorMessage: "L'URL est requise." }

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw) ? raw : `https://${raw}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, errorMessage: "Seules les URLs http(s) sont supportées." }
    }
    return { ok: true, value: url.toString() }
  } catch {
    return { ok: false, errorMessage: "Le format de l'URL semble invalide." }
  }
}

export function validateEmail(input) {
  const raw = (input ?? '').trim()
  if (isBlank(raw)) return { ok: false, errorMessage: "L'email est requis." }

  // Simple, pragmatic validation (no heavy RFC parser).
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)
  if (!isValid) return { ok: false, errorMessage: "Le format de l'email semble invalide." }
  return { ok: true, value: raw }
}

export function normalizePhone(input) {
  const raw = (input ?? '').trim()
  const stripped = raw.replace(/[^\d+]/g, '')
  if (stripped.startsWith('+')) return `+${stripped.slice(1).replace(/\+/g, '')}`
  return stripped.replace(/\+/g, '')
}

export function validatePhone(input, label = 'Le téléphone') {
  const normalized = normalizePhone(input)
  if (isBlank(normalized)) return { ok: false, errorMessage: `${label} est requis.` }

  const digitsOnly = normalized.replace(/\D/g, '')
  if (digitsOnly.length < 3) {
    return { ok: false, errorMessage: `${label} semble trop court.` }
  }

  return { ok: true, value: normalized }
}

export function escapeWifiText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/:/g, '\\:')
}

