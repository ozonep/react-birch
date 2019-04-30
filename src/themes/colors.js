const Color = require('color')

const Colors = {
  yellow: Color('#DFDC38'),
  purple: Color('#76546a'),
  green: Color('#b5d061'),
  blue: Color('#6BB1B9'),
  pink: Color('#fe877f'),
  red: Color('#ff5b50'),
  orange: Color('#FF7E4B'),
  black: Color('#000'),
  white: Color('#FFF'),
  offblack: Color('#353F40'),
  offwhite: Color('#F8F8F8'),
  gray: Color('#657172')
}

const toShades = color => {
  const amt = 0.2

  return [
    color
      .darken(amt)
      .darken(amt)
      .darken(amt)
      .darken(amt),
    color
      .darken(amt)
      .darken(amt)
      .darken(amt),
    color.darken(amt).darken(amt),
    color.darken(amt),
    color,
    color.lighten(amt),
    color.lighten(amt).lighten(amt),
    color
      .lighten(amt)
      .lighten(amt)
      .lighten(amt),
    color
      .lighten(amt)
      .lighten(amt)
      .lighten(amt)
      .lighten(amt)
  ].map(color => color.hex())
}

const {
  yellow,
  purple,
  green,
  blue,
  pink,
  red,
  orange,
  black,
  white,
  gray,
  offblack,
  offwhite
} = {
  yellow: toShades(Colors.yellow),
  purple: toShades(Colors.purple),
  green: toShades(Colors.green),
  blue: toShades(Colors.blue),
  pink: toShades(Colors.pink),
  red: toShades(Colors.red),
  orange: toShades(Colors.orange),
  black: Colors.black.hex(),
  white: Colors.white.hex(),
  offblack: Colors.offblack.hex(),
  offwhite: Colors.offwhite.hex(),
  gray: toShades(Colors.gray)
}

gray[0] = offblack
gray[8] = offwhite
gray[1] = Colors.offblack.lighten(0.05).hex()
gray[7] = Colors.offwhite.darken(0.05).hex()

export const colors = {
  bodytext: gray[4],
  black,
  offwhite,
  offblack,
  white,
  gray,
  blue,
  green,
  orange,
  purple,
  pink,
  red,
  yellow,
  blackfade15: 'rgba(27, 31, 35, 0.15)',
  blackfade20: 'rgba(27, 31, 35, 0.20)',
  whitefade15: 'rgba(255, 255, 255, 0.15)',
  state: {
    error: red[4],
    failure: red[4],
    pending: yellow[4],
    queued: yellow[4],
    success: green[4],
    unknown: gray[4]
  },

  input: {
    text: black,
    background: white,
    border: gray[2],
    borderHover: gray[3],
    borderFocus: gray[4],
    placeholder: gray[5],
    backgroundReadOnly: orange[2],
    placeholderReadOnly: orange[3],
    borderError: red[5]
  },

  brand: blue,
  content: gray,
  accent: pink,
  primary: blue[4],
  primaryBg: white
}
