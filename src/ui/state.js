import { applyPresetToState } from '../utils/presets.js'

export function createInitialState() {
  const initial = {
    ui: {
      mainTab: 'content',
      preset: 'classic',
    },
    payload: {
      mode: 'url',
      url: 'https://exemple.com',
      text: '',
      email: '',
      emailSubject: '',
      emailBody: '',
      phone: '',
      smsPhone: '',
      smsMessage: '',
      wifiSsid: '',
      wifiPassword: '',
      wifiAuth: 'WPA',
      wifiHidden: false,
    },
    qr: {
      size: 320,
      margin: 8,
      ecc: 'M',
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      dotsColor: '#0F172A',
      cornersColor: '#0F172A',
      backgroundColor: '#FFFFFF',
      backgroundTransparent: false,
      gradientEnabled: false,
      gradientType: 'linear',
      gradientRotationDeg: 0,
      gradientColors: ['#38BDF8', '#22C55E'],
      logoDataUrl: '',
      logoSize: 0.32,
      logoMargin: 0,
      hideBackgroundDots: true,
    },
    runtime: {
      lastValidPayload: 'https://exemple.com',
    },
  }

  applyPresetToState(initial, initial.ui.preset)
  initial.runtime.lastValidPayload = initial.payload.url
  return initial
}

export const state = createInitialState()

export function resetState() {
  const next = createInitialState()
  for (const key of Object.keys(state)) delete state[key]
  Object.assign(state, next)
}
