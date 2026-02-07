import {
  escapeWifiText,
  isBlank,
  validateEmail,
  validatePhone,
  validateUrl,
} from '../utils/validators.js'

export function getPayloadResult(state) {
  const payload = state.payload

  switch (payload.mode) {
    case 'url': {
      const result = validateUrl(payload.url)
      if (!result.ok) return { ok: false, errorMessage: result.errorMessage }
      return { ok: true, data: result.value }
    }

    case 'text': {
      const value = (payload.text ?? '').trim()
      if (isBlank(value)) return { ok: false, errorMessage: 'Le texte est requis.' }
      return { ok: true, data: value }
    }

    case 'email': {
      const emailResult = validateEmail(payload.email)
      if (!emailResult.ok) return { ok: false, errorMessage: emailResult.errorMessage }

      const subject = (payload.emailSubject ?? '').trim()
      const body = (payload.emailBody ?? '').trim()

      const params = new URLSearchParams()
      if (!isBlank(subject)) params.set('subject', subject)
      if (!isBlank(body)) params.set('body', body)

      const query = params.toString()
      return { ok: true, data: `mailto:${emailResult.value}${query ? `?${query}` : ''}` }
    }

    case 'phone': {
      const result = validatePhone(payload.phone, 'Le téléphone')
      if (!result.ok) return { ok: false, errorMessage: result.errorMessage }
      return { ok: true, data: `tel:${result.value}` }
    }

    case 'sms': {
      const phoneResult = validatePhone(payload.smsPhone, 'Le téléphone')
      if (!phoneResult.ok) return { ok: false, errorMessage: phoneResult.errorMessage }

      const message = (payload.smsMessage ?? '').trim()
      const query = isBlank(message) ? '' : `?body=${encodeURIComponent(message)}`
      return { ok: true, data: `sms:${phoneResult.value}${query}` }
    }

    case 'wifi': {
      const ssid = (payload.wifiSsid ?? '').trim()
      if (isBlank(ssid)) return { ok: false, errorMessage: 'Le SSID WiFi est requis.' }

      const auth = payload.wifiAuth ?? 'WPA'
      const password = (payload.wifiPassword ?? '').trim()
      const hidden = Boolean(payload.wifiHidden)

      if (auth !== 'nopass' && isBlank(password)) {
        return { ok: false, errorMessage: 'Le mot de passe WiFi est requis (ou choisissez "Sans mot de passe").' }
      }

      const t = auth === 'nopass' ? 'nopass' : auth
      const s = escapeWifiText(ssid)
      const p = escapeWifiText(password)
      const h = hidden ? 'true' : 'false'

      return {
        ok: true,
        data: `WIFI:T:${t};S:${s};P:${t === 'nopass' ? '' : p};H:${h};;`,
      }
    }

    default:
      return { ok: false, errorMessage: 'Type de contenu non supporté.' }
  }
}

