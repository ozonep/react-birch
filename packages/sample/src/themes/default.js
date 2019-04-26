import { colors } from './colors'

const { fontSizes, lineHeights } = {
  fontSizes: [12, 14, 16, 20, 24, 32, 40, 48],
  lineHeights: {
    condensedUltra: 1,
    condensed: 1.25,
    default: 1.5
  }
}

const theme = {
  name: 'default',
  vscode: 'vs',
  inspector: 'chromeLight',
  breakpoints: ['544px', '768px', '1012px', '1280px'],
  maxWidths: {
    small: '544px',
    medium: '768px',
    large: '1024px', //1012
    xlarge: '1280px'
  },
  fonts: {
    normal: fontStack(['-apple-system', 'sans']),
    heading: fontStack([
      'Georgia',
      'serif'
    ]),
    menu: fontStack([
      '-apple-system',
      'Segoe UI',
      'Helvetica',
      'Arial',
      'sans-serif'
    ]),
    mono: fontStack([
      'Menlo',
      'Monaco',
      'SFMono-Regular',
      'monospace'
    ])
  },
  colors,
  borders: [0, '1px solid'],
  fontSizes,
  fontWeights: {
    light: 300,
    normal: 400,
    bold: 700,
    content: 300,
    heading: 400
  },
  lineHeights,
  radii: [0, 3, 6],
  shadows: {
    small: '0 1px 1px rgba(27, 31, 35, 0.1)',
    medium: '0 1px 5px rgba(27, 31, 35, 0.15)',
    large: '0 1px 15px rgba(27, 31, 35, 0.15)',
    'extra-large': '0 10px 50px rgba(27, 31, 35, 0.07)'
  },
  space: [0, 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 112, 128]
}

export default theme
export { colors }

function fontStack(fonts) {
  return fonts.map(font => (font.includes(' ') ? `"${font}"` : font)).join(', ')
}
