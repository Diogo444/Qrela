function setActive(el, isActive) {
  el.dataset.active = isActive ? 'true' : 'false'
  if (el.getAttribute('role') === 'tab') {
    el.setAttribute('aria-selected', String(isActive))
    if (isActive) el.removeAttribute('tabindex')
    else el.setAttribute('tabindex', '-1')
  }
}

function setDisabled(el, isDisabled) {
  el.disabled = Boolean(isDisabled)
}

function renderGradientColors(container, colors) {
  if (!container) return

  const safeColors = Array.isArray(colors) ? colors : []

  while (container.children.length < safeColors.length) {
    const index = container.children.length

    const row = document.createElement('div')
    row.className = 'flex items-center justify-between gap-3'

    const label = document.createElement('label')
    label.className = 'text-sm font-medium'

    const controls = document.createElement('div')
    controls.className = 'flex items-center gap-2'

    const input = document.createElement('input')
    input.type = 'color'
    input.className = 'color-input'

    const removeButton = document.createElement('button')
    removeButton.type = 'button'
    removeButton.className = 'icon-btn icon-btn-sm'
    removeButton.textContent = '−'

    controls.append(input, removeButton)
    row.append(label, controls)
    container.append(row)
  }

  while (container.children.length > safeColors.length) {
    container.lastElementChild?.remove()
  }

  const canRemove = safeColors.length > 2

  Array.from(container.children).forEach((row, index) => {
    const color = safeColors[index] ?? '#000000'

    const label = row.querySelector('label')
    const input = row.querySelector('input[type="color"]')
    const removeButton = row.querySelector('button')

    const inputId = `qr-gradient-color-${index}`

    if (label) {
      label.textContent = `Couleur ${index + 1}`
      label.setAttribute('for', inputId)
    }

    if (input) {
      input.id = inputId
      input.dataset.gradientColorIndex = String(index)
      if (input.value !== color) input.value = color
    }

    if (removeButton) {
      removeButton.dataset.gradientRemoveIndex = String(index)
      removeButton.setAttribute('aria-label', `Supprimer la couleur ${index + 1}`)
      removeButton.disabled = !canRemove
    }
  })
}

export function render(dom, state, payloadResult) {
  // Main settings tabs
  for (const button of dom.mainTabButtons) {
    const isActive = button.dataset.mainTab === state.ui.mainTab
    setActive(button, isActive)
  }
  for (const panel of dom.mainTabPanels) {
    panel.hidden = panel.dataset.mainTabPanel !== state.ui.mainTab
  }

  // Payload tabs
  for (const button of dom.payloadTabButtons) {
    const isActive = button.dataset.payloadMode === state.payload.mode
    setActive(button, isActive)
  }
  for (const panel of dom.payloadTabPanels) {
    panel.hidden = panel.dataset.payloadPanel !== state.payload.mode
  }

  // Presets
  for (const button of dom.presetButtons) {
    setActive(button, button.dataset.preset === state.ui.preset)
  }

  // Inputs: payload
  dom.inputs.url.value = state.payload.url
  dom.inputs.text.value = state.payload.text
  dom.inputs.email.value = state.payload.email
  dom.inputs.emailSubject.value = state.payload.emailSubject
  dom.inputs.emailBody.value = state.payload.emailBody
  dom.inputs.phone.value = state.payload.phone
  dom.inputs.smsPhone.value = state.payload.smsPhone
  dom.inputs.smsMessage.value = state.payload.smsMessage
  dom.inputs.wifiSsid.value = state.payload.wifiSsid
  dom.inputs.wifiPassword.value = state.payload.wifiPassword
  dom.inputs.wifiAuth.value = state.payload.wifiAuth
  dom.inputs.wifiHidden.checked = state.payload.wifiHidden

  // Inputs: appearance
  dom.inputs.size.value = String(state.qr.size)
  dom.values.size.textContent = `${state.qr.size}px`

  dom.inputs.margin.value = String(state.qr.margin)
  dom.values.margin.textContent = `${state.qr.margin}px`

  dom.inputs.ecc.value = state.qr.ecc
  dom.inputs.dotsType.value = state.qr.dotsType
  dom.inputs.cornersSquareType.value = state.qr.cornersSquareType
  dom.inputs.cornersDotType.value = state.qr.cornersDotType

  dom.inputs.dotsColor.value = state.qr.dotsColor
  dom.inputs.cornersColor.value = state.qr.cornersColor
  dom.inputs.backgroundColor.value = state.qr.backgroundColor
  dom.inputs.backgroundTransparent.checked = state.qr.backgroundTransparent

  // Gradient
  dom.inputs.gradientEnabled.checked = state.qr.gradientEnabled
  dom.sections.gradientOptions.hidden = !state.qr.gradientEnabled
  dom.inputs.gradientType.value = state.qr.gradientType
  dom.inputs.gradientRotationDeg.value = String(state.qr.gradientRotationDeg)
  dom.values.gradientRotation.textContent = `${state.qr.gradientRotationDeg}°`
  renderGradientColors(dom.sections.gradientColors, state.qr.gradientColors)

  // Logo
  dom.inputs.logoSize.value = String(state.qr.logoSize)
  dom.values.logoSize.textContent = `${Math.round(state.qr.logoSize * 100)}%`
  dom.inputs.logoMargin.value = String(state.qr.logoMargin)
  dom.values.logoMargin.textContent = `${state.qr.logoMargin}px`
  dom.inputs.hideBackgroundDots.checked = state.qr.hideBackgroundDots
  dom.sections.logoRemove.hidden = !state.qr.logoDataUrl

  // Encoded content + actions
  dom.encodedOutput.value = payloadResult.ok ? payloadResult.data : ''

  setDisabled(dom.actions.copyContent, !payloadResult.ok)
  setDisabled(dom.actions.downloadPng, !payloadResult.ok)
  setDisabled(dom.actions.downloadSvg, !payloadResult.ok)

  // WiFi: disable password when nopass
  const wifiNeedsPassword = state.payload.wifiAuth !== 'nopass'
  dom.inputs.wifiPassword.disabled = !wifiNeedsPassword
}
