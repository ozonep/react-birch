import parentTheme from './default'

const COLORS = [
  'gray',
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'brand',
  'accent'
]

const theme = Object.assign({}, parentTheme, {
  name: 'light',
  vscode: 'vs',
  inspector: 'chromeLight',
  colors: Object.assign({}, parentTheme.colors)
})

theme.colors.brand = theme.colors.gray
theme.colors.accent = theme.colors.blue
theme.colors.primary = theme.colors.brand[2]
theme.colors.primaryBg = theme.colors.white

export default theme

function fontStack(fonts) {
  return fonts.map(font => (font.includes(' ') ? `"${font}"` : font)).join(', ')
}

