const PALETTE_VIRIDIS = ['#440154', '#48186a', '#472d7b', '#424086', '#3b528b', '#33638d', '#2c728e', '#26828e', '#21918c', '#1fa088', '#28ae80', '#3fbc73', '#5ec962', '#84d44b', '#addc30', '#d8e219', '#fde725']
const PALETTE_HUTTON = ['#00a0f1', '#5ec418', '#910080', '#222183', '#ff7c00', '#c5e000', '#c83831', '#ff007a', '#fff600']

const getColor = (palette, index) => palette[index % palette.length]

/**
 * Determines the best text color (either white or black) given the background color
 * @param {String} backgroundColor The background color in HEX
 */
const getTextColor = (palette, index) => {
  const backgroundColor = getColor(palette, index)

  if (backgroundColor) {
    const rgb = hexToRgb(backgroundColor)
    if (!rgb) {
      return 'black'
    }
    const o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000)
    return (o > 125) ? 'black' : 'white'
  } else {
    return 'black'
  }
}

/**
 * Converts a HEX value into an RGB object
 * @param {String} hex The hex color
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
}

export {
  PALETTE_HUTTON,
  PALETTE_VIRIDIS,
  getColor,
  getTextColor,
  hexToRgb
}
