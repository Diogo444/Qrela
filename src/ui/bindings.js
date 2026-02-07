import { downloadPng, downloadSvg } from '../qr/qrExport.js'
import { createQrInstance } from '../qr/qrInstance.js'
import { getPayloadResult } from '../qr/qrPayload.js'
import { updateQr } from '../qr/qrUpdate.js'
import { debounce } from '../utils/debounce.js'
import { contrastRatio } from '../utils/colors.js'
import { applyPresetToState, PRESETS } from '../utils/presets.js'
import { render } from './render.js'
import { resetState, state } from './state.js'
import { initTutorials } from './tutorials.js'

function getDom() {
  const appRoot = document.getElementById('app')
  if (!appRoot) return null

  const get = (id) => document.getElementById(id)
  const qrMount = get('qr-mount')
  const payloadUrl = get('payload-url')
  if (!qrMount || !payloadUrl) return null

  return {
    root: document,
    appRoot,
    qrMount,
    statusMessage: get('status-message'),
    encodedOutput: get('encoded-output'),
    mainTabButtons: Array.from(document.querySelectorAll('[data-main-tab]')),
    mainTabPanels: Array.from(document.querySelectorAll('[data-main-tab-panel]')),
    payloadTabButtons: Array.from(document.querySelectorAll('[data-payload-mode]')),
    payloadTabPanels: Array.from(document.querySelectorAll('[data-payload-panel]')),
    presetButtons: Array.from(document.querySelectorAll('[data-preset]')),
    sections: {
      gradientOptions: get('gradient-options'),
      gradientColors: get('qr-gradient-colors'),
      logoRemove: get('logo-remove'),
    },
    actions: {
      downloadPng: get('download-png'),
      downloadSvg: get('download-svg'),
      resetAll: get('reset-all'),
      copyContent: get('copy-content'),
      gradientAddColor: get('qr-gradient-add-color'),
    },
    inputs: {
      // payload
      url: get('payload-url'),
      text: get('payload-text'),
      email: get('payload-email'),
      emailSubject: get('payload-email-subject'),
      emailBody: get('payload-email-body'),
      phone: get('payload-phone'),
      smsPhone: get('payload-sms-phone'),
      smsMessage: get('payload-sms-message'),
      wifiSsid: get('payload-wifi-ssid'),
      wifiPassword: get('payload-wifi-password'),
      wifiAuth: get('payload-wifi-auth'),
      wifiHidden: get('payload-wifi-hidden'),

      // appearance
      size: get('qr-size'),
      margin: get('qr-margin'),
      ecc: get('qr-ecc'),
      dotsType: get('qr-dots-type'),
      cornersSquareType: get('qr-corners-square'),
      cornersDotType: get('qr-corners-dot'),
      dotsColor: get('qr-dots-color'),
      cornersColor: get('qr-corners-color'),
      backgroundColor: get('qr-background-color'),
      backgroundTransparent: get('qr-background-transparent'),

      // gradient
      gradientEnabled: get('qr-gradient-enabled'),
      gradientType: get('qr-gradient-type'),
      gradientRotationDeg: get('qr-gradient-rotation'),

      // logo
      logoUpload: get('qr-logo-upload'),
      logoSize: get('qr-logo-size'),
      logoMargin: get('qr-logo-margin'),
      hideBackgroundDots: get('qr-hide-background-dots'),
      removeLogo: get('qr-remove-logo'),
    },
    values: {
      size: get('qr-size-value'),
      margin: get('qr-margin-value'),
      gradientRotation: get('qr-gradient-rotation-value'),
      logoSize: get('qr-logo-size-value'),
      logoMargin: get('qr-logo-margin-value'),
    },
  }
}

function setStatus(dom, kind, message) {
  dom.statusMessage.dataset.kind = kind
  dom.statusMessage.textContent = message
}

function safeNumber(value, fallback) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const MIN_QR_CONTRAST = 3

function getContrastIssue(qr) {
  if (qr.backgroundTransparent) return null

  const background = qr.backgroundColor
  const gradientColors = Array.isArray(qr.gradientColors) ? qr.gradientColors.filter(Boolean) : []
  const usesGradient = Boolean(qr.gradientEnabled) && gradientColors.length >= 2

  const dotColors = usesGradient ? gradientColors : [qr.dotsColor]
  for (let index = 0; index < dotColors.length; index += 1) {
    const ratio = contrastRatio(dotColors[index], background)
    if (ratio !== null && ratio < MIN_QR_CONTRAST) {
      return { area: usesGradient ? 'gradient' : 'dots', index, ratio }
    }
  }

  const cornersRatio = contrastRatio(qr.cornersColor, background)
  if (cornersRatio !== null && cornersRatio < MIN_QR_CONTRAST) {
    return { area: 'corners', ratio: cornersRatio }
  }

  return null
}

function contrastMessage(issue) {
  if (!issue) return ''
  const base = 'Contraste insuffisant avec le fond. Essayez une couleur plus foncée (ou changez le fond).'

  if (issue.area === 'gradient') {
    return `Dégradé : la couleur ${issue.index + 1} manque de contraste. ${base}`
  }

  if (issue.area === 'dots') {
    return `Couleur principale : ${base}`
  }

  if (issue.area === 'corners') {
    return `Couleur des coins : ${base}`
  }

  return base
}

function pickSafeNextGradientColor(qr) {
  if (qr.backgroundTransparent) return qr.dotsColor

  const background = qr.backgroundColor
  const used = new Set((Array.isArray(qr.gradientColors) ? qr.gradientColors : []).map((c) => String(c).toUpperCase()))

  const candidates = ['#38BDF8', '#22C55E', '#A855F7', '#F97316', '#F43F5E', '#FACC15', '#E5E7EB', qr.dotsColor]

  for (const candidate of candidates) {
    const normalized = String(candidate).toUpperCase()
    if (used.has(normalized)) continue

    const ratio = contrastRatio(normalized, background)
    if (ratio === null || ratio >= MIN_QR_CONTRAST) return normalized
  }

  return qr.dotsColor
}

function adjustInitialMobileQrSize(appState, qrMount) {
  if (!qrMount) return

  const isMobile = window.matchMedia('(max-width: 639px)').matches
  if (!isMobile) return

  const mountWidth = qrMount.clientWidth
  const recommended = mountWidth ? Math.max(240, Math.min(280, mountWidth)) : 280

  // Snap to slider step (8px) + respect current min/max.
  const snapped = Math.round(recommended / 8) * 8
  appState.qr.size = Math.min(1024, Math.max(128, snapped))
}

export function initGenerator() {
  initTutorials(document)

  const dom = getDom()
  if (!dom) return

  adjustInitialMobileQrSize(state, dom.qrMount)

  const qr = createQrInstance(state)
  dom.qrMount.innerHTML = ''
  qr.append(dom.qrMount)

  let lastPayload = getPayloadResult(state)

  const announceOk = debounce(() => {
    setStatus(dom, 'ok', 'QR mis à jour.')
  }, 350)

  function refresh() {
    lastPayload = updateQr(qr, state)
    render(dom, state, lastPayload)

    if (lastPayload.ok) announceOk()
    else {
      announceOk.cancel()
      setStatus(dom, 'error', lastPayload.errorMessage)
    }
  }

  // Initial
  refresh()

  // Main settings tabs
  dom.appRoot.addEventListener('click', (event) => {
    const mainTabButton = event.target.closest('[data-main-tab]')
    if (mainTabButton) {
      state.ui.mainTab = mainTabButton.dataset.mainTab
      render(dom, state, lastPayload)
    }
  })

  // Payload tabs
  dom.appRoot.addEventListener('click', (event) => {
    const payloadButton = event.target.closest('[data-payload-mode]')
    if (!payloadButton) return
    state.payload.mode = payloadButton.dataset.payloadMode
    refresh()
  })

  // Presets
  dom.appRoot.addEventListener('click', (event) => {
    const presetButton = event.target.closest('[data-preset]')
    if (!presetButton) return

    const presetKey = presetButton.dataset.preset
    if (!PRESETS[presetKey]) return
    applyPresetToState(state, presetKey)
    refresh()
  })

  const refreshDebounced = debounce(refresh, 120)

  // Payload inputs
  dom.inputs.url.addEventListener('input', (e) => {
    state.payload.url = e.target.value
    refreshDebounced()
  })
  dom.inputs.text.addEventListener('input', (e) => {
    state.payload.text = e.target.value
    refreshDebounced()
  })
  dom.inputs.email.addEventListener('input', (e) => {
    state.payload.email = e.target.value
    refreshDebounced()
  })
  dom.inputs.emailSubject.addEventListener('input', (e) => {
    state.payload.emailSubject = e.target.value
    refreshDebounced()
  })
  dom.inputs.emailBody.addEventListener('input', (e) => {
    state.payload.emailBody = e.target.value
    refreshDebounced()
  })
  dom.inputs.phone.addEventListener('input', (e) => {
    state.payload.phone = e.target.value
    refreshDebounced()
  })
  dom.inputs.smsPhone.addEventListener('input', (e) => {
    state.payload.smsPhone = e.target.value
    refreshDebounced()
  })
  dom.inputs.smsMessage.addEventListener('input', (e) => {
    state.payload.smsMessage = e.target.value
    refreshDebounced()
  })
  dom.inputs.wifiSsid.addEventListener('input', (e) => {
    state.payload.wifiSsid = e.target.value
    refreshDebounced()
  })
  dom.inputs.wifiPassword.addEventListener('input', (e) => {
    state.payload.wifiPassword = e.target.value
    refreshDebounced()
  })
  dom.inputs.wifiAuth.addEventListener('change', (e) => {
    state.payload.wifiAuth = e.target.value
    refresh()
  })
  dom.inputs.wifiHidden.addEventListener('change', (e) => {
    state.payload.wifiHidden = e.target.checked
    refresh()
  })

  // Appearance inputs
  dom.inputs.size.addEventListener('input', (e) => {
    state.qr.size = safeNumber(e.target.value, state.qr.size)
    refreshDebounced()
  })
  dom.inputs.margin.addEventListener('input', (e) => {
    state.qr.margin = safeNumber(e.target.value, state.qr.margin)
    refreshDebounced()
  })
  dom.inputs.ecc.addEventListener('change', (e) => {
    state.qr.ecc = e.target.value
    refresh()
  })
  dom.inputs.dotsType.addEventListener('change', (e) => {
    state.qr.dotsType = e.target.value
    refresh()
  })
  dom.inputs.cornersSquareType.addEventListener('change', (e) => {
    state.qr.cornersSquareType = e.target.value
    refresh()
  })
  dom.inputs.cornersDotType.addEventListener('change', (e) => {
    state.qr.cornersDotType = e.target.value
    refresh()
  })

  dom.inputs.dotsColor.addEventListener('input', (e) => {
    const next = e.target.value
    const issue = getContrastIssue({ ...state.qr, dotsColor: next })
    if (issue) {
      e.target.value = state.qr.dotsColor
      setStatus(dom, 'error', contrastMessage(issue))
      return
    }

    state.qr.dotsColor = next
    refreshDebounced()
  })
  dom.inputs.cornersColor.addEventListener('input', (e) => {
    const next = e.target.value
    const issue = getContrastIssue({ ...state.qr, cornersColor: next })
    if (issue) {
      e.target.value = state.qr.cornersColor
      setStatus(dom, 'error', contrastMessage(issue))
      return
    }

    state.qr.cornersColor = next
    refreshDebounced()
  })
  dom.inputs.backgroundColor.addEventListener('input', (e) => {
    const next = e.target.value
    const issue = getContrastIssue({ ...state.qr, backgroundColor: next, backgroundTransparent: false })
    if (issue) {
      e.target.value = state.qr.backgroundColor
      setStatus(dom, 'error', contrastMessage(issue))
      return
    }

    state.qr.backgroundColor = next
    refreshDebounced()
  })
  dom.inputs.backgroundTransparent.addEventListener('change', (e) => {
    const next = e.target.checked

    if (next) {
      state.qr.backgroundTransparent = true
      refresh()
      return
    }

    const issue = getContrastIssue({ ...state.qr, backgroundTransparent: false })
    if (issue) {
      e.target.checked = true
      setStatus(dom, 'error', contrastMessage(issue))
      return
    }

    state.qr.backgroundTransparent = false
    refresh()
  })

  // Gradient
  dom.inputs.gradientEnabled.addEventListener('change', (e) => {
    const next = e.target.checked

    if (!next) {
      const issue = getContrastIssue({ ...state.qr, gradientEnabled: false })
      if (issue) {
        e.target.checked = true
        setStatus(dom, 'error', contrastMessage(issue))
        return
      }

      state.qr.gradientEnabled = false
      refresh()
      return
    }

    let nextGradientColors = Array.isArray(state.qr.gradientColors) ? state.qr.gradientColors : []
    if (nextGradientColors.length < 2) nextGradientColors = [state.qr.dotsColor, state.qr.dotsColor]

    let issue = getContrastIssue({ ...state.qr, gradientEnabled: true, gradientColors: nextGradientColors })
    if (issue) {
      nextGradientColors = [state.qr.dotsColor, state.qr.dotsColor]
      issue = getContrastIssue({ ...state.qr, gradientEnabled: true, gradientColors: nextGradientColors })
    }

    if (issue) {
      e.target.checked = false
      setStatus(dom, 'error', contrastMessage(issue))
      return
    }

    state.qr.gradientColors = nextGradientColors
    state.qr.gradientEnabled = true
    refresh()
  })
  dom.inputs.gradientType.addEventListener('change', (e) => {
    state.qr.gradientType = e.target.value
    refresh()
  })
  dom.inputs.gradientRotationDeg.addEventListener('input', (e) => {
    state.qr.gradientRotationDeg = safeNumber(e.target.value, state.qr.gradientRotationDeg)
    refreshDebounced()
  })

  if (dom.actions.gradientAddColor && dom.sections.gradientColors) {
    dom.actions.gradientAddColor.addEventListener('click', () => {
      const current = Array.isArray(state.qr.gradientColors) ? state.qr.gradientColors : []
      const nextColor = pickSafeNextGradientColor(state.qr)
      const next = [...current, nextColor]

      const issue = getContrastIssue({ ...state.qr, gradientColors: next })
      if (issue) {
        setStatus(dom, 'error', contrastMessage(issue))
        return
      }

      state.qr.gradientColors = next
      refreshDebounced()
    })

    dom.sections.gradientColors.addEventListener('input', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const input = target.closest('input[type="color"][data-gradient-color-index]')
      if (!input) return

      const index = Number(input.dataset.gradientColorIndex)
      if (!Number.isInteger(index)) return

      const current = Array.isArray(state.qr.gradientColors) ? state.qr.gradientColors : []
      if (index < 0 || index >= current.length) return

      const nextColors = [...current]
      nextColors[index] = input.value

      const issue = getContrastIssue({ ...state.qr, gradientColors: nextColors })
      if (issue) {
        input.value = current[index]
        setStatus(dom, 'error', contrastMessage(issue))
        return
      }

      state.qr.gradientColors = nextColors
      refreshDebounced()
    })

    dom.sections.gradientColors.addEventListener('click', (event) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const button = target.closest('button[data-gradient-remove-index]')
      if (!button) return

      const index = Number(button.dataset.gradientRemoveIndex)
      if (!Number.isInteger(index)) return

      const current = Array.isArray(state.qr.gradientColors) ? state.qr.gradientColors : []
      if (current.length <= 2) {
        setStatus(dom, 'error', 'Dégradé : minimum 2 couleurs.')
        return
      }

      if (index < 0 || index >= current.length) return
      const nextColors = current.filter((_, i) => i !== index)

      const issue = getContrastIssue({ ...state.qr, gradientColors: nextColors })
      if (issue) {
        setStatus(dom, 'error', contrastMessage(issue))
        return
      }

      state.qr.gradientColors = nextColors
      refreshDebounced()
    })
  }

  // Logo
  dom.inputs.logoUpload.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('read_error'))
        reader.readAsDataURL(file)
      })

      state.qr.logoDataUrl = dataUrl
      refresh()
      setStatus(dom, 'ok', 'Logo ajouté.')
    } catch {
      setStatus(dom, 'error', "Impossible de lire l'image (format non supporté).")
    }
  })
  dom.inputs.removeLogo.addEventListener('click', () => {
    state.qr.logoDataUrl = ''
    dom.inputs.logoUpload.value = ''
    refresh()
  })
  dom.inputs.logoSize.addEventListener('input', (e) => {
    state.qr.logoSize = Math.min(0.6, Math.max(0.1, safeNumber(e.target.value, state.qr.logoSize)))
    refreshDebounced()
  })
  dom.inputs.logoMargin.addEventListener('input', (e) => {
    state.qr.logoMargin = safeNumber(e.target.value, state.qr.logoMargin)
    refreshDebounced()
  })
  dom.inputs.hideBackgroundDots.addEventListener('change', (e) => {
    state.qr.hideBackgroundDots = e.target.checked
    refresh()
  })

  // Actions
  dom.actions.resetAll.addEventListener('click', () => {
    resetState()
    refresh()
    setStatus(dom, 'ok', 'Paramètres réinitialisés.')
  })

  dom.actions.copyContent.addEventListener('click', async () => {
    const payload = getPayloadResult(state)
    if (!payload.ok) {
      setStatus(dom, 'error', payload.errorMessage)
      return
    }

    try {
      await navigator.clipboard.writeText(payload.data)
      setStatus(dom, 'ok', 'Contenu encodé copié.')
    } catch {
      setStatus(dom, 'error', "Impossible de copier automatiquement (permissions navigateur).")
    }
  })

  dom.actions.downloadPng.addEventListener('click', () => {
    const payload = getPayloadResult(state)
    if (!payload.ok) {
      setStatus(dom, 'error', payload.errorMessage)
      return
    }
    downloadPng(qr, 'qr-code')
    setStatus(dom, 'ok', 'Téléchargement PNG lancé.')
  })

  dom.actions.downloadSvg.addEventListener('click', () => {
    const payload = getPayloadResult(state)
    if (!payload.ok) {
      setStatus(dom, 'error', payload.errorMessage)
      return
    }
    downloadSvg(qr, 'qr-code')
    setStatus(dom, 'ok', 'Téléchargement SVG lancé.')
  })
}
