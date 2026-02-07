export const PRESETS = {
  classic: {
    label: 'Classic',
    qr: {
      dotsColor: '#0F172A',
      cornersColor: '#0F172A',
      backgroundColor: '#FFFFFF',
      backgroundTransparent: false,
      gradientEnabled: false,
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'dot',
    },
  },
  dark: {
    label: 'Dark',
    qr: {
      dotsColor: '#E5E7EB',
      cornersColor: '#E5E7EB',
      backgroundColor: '#0F172A',
      backgroundTransparent: false,
      gradientEnabled: false,
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
    },
  },
  neon: {
    label: 'Neon',
    qr: {
      dotsColor: '#38BDF8',
      cornersColor: '#22C55E',
      backgroundColor: '#0F172A',
      backgroundTransparent: false,
      gradientEnabled: true,
      gradientType: 'linear',
      gradientRotationDeg: 45,
      gradientColors: ['#38BDF8', '#22C55E'],
      dotsType: 'dots',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
    },
  },
  soft: {
    label: 'Soft',
    qr: {
      dotsColor: '#334155',
      cornersColor: '#0F172A',
      backgroundColor: '#FFFFFF',
      backgroundTransparent: false,
      gradientEnabled: false,
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
    },
  },
  'high-contrast': {
    label: 'High contrast',
    qr: {
      dotsColor: '#000000',
      cornersColor: '#000000',
      backgroundColor: '#FFFFFF',
      backgroundTransparent: false,
      gradientEnabled: false,
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
    },
  },
}

export function applyPresetToState(state, presetKey) {
  const preset = PRESETS[presetKey]
  if (!preset) return

  state.ui.preset = presetKey
  Object.assign(state.qr, preset.qr)
}
