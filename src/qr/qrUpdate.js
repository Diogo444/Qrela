import { getPayloadResult } from './qrPayload.js'

function degreesToRadians(degrees) {
  return (Number(degrees) * Math.PI) / 180
}

export function buildQrOptions(state, data) {
  const qr = state.qr

  const dotsOptions = {
    type: qr.dotsType,
    color: qr.dotsColor,
  }

  if (qr.gradientEnabled) {
    const colors = Array.isArray(qr.gradientColors) ? qr.gradientColors.filter(Boolean) : []

    if (colors.length >= 2) {
      delete dotsOptions.color
      dotsOptions.gradient = {
        type: qr.gradientType,
        rotation: degreesToRadians(qr.gradientRotationDeg),
        colorStops: colors.map((color, index) => ({
          offset: colors.length === 1 ? 0 : index / (colors.length - 1),
          color,
        })),
      }
    }
  }

  return {
    width: qr.size,
    height: qr.size,
    data,
    margin: qr.margin,
    qrOptions: {
      errorCorrectionLevel: qr.ecc,
    },
    dotsOptions,
    cornersSquareOptions: {
      type: qr.cornersSquareType,
      color: qr.cornersColor,
    },
    cornersDotOptions: {
      type: qr.cornersDotType,
      color: qr.cornersColor,
    },
    backgroundOptions: {
      color: qr.backgroundTransparent ? 'transparent' : qr.backgroundColor,
    },
    image: qr.logoDataUrl || '',
    imageOptions: {
      hideBackgroundDots: qr.hideBackgroundDots,
      imageSize: qr.logoSize,
      margin: qr.logoMargin,
    },
  }
}

export function updateQr(qrInstance, state) {
  const payloadResult = getPayloadResult(state)
  const hasValidPayload = payloadResult.ok

  if (hasValidPayload) state.runtime.lastValidPayload = payloadResult.data

  const data = hasValidPayload ? payloadResult.data : state.runtime.lastValidPayload
  qrInstance.update(buildQrOptions(state, data))

  return payloadResult
}
