import styled from 'styled-components'
import { themeGet } from 'styled-system'

export const SidePanel = styled.div`
  width: 350px;
  height: calc(100vh - 20px);
  margin: 0;
  padding: 10px;
  background: ${themeGet('colors.offwhite')};
  overflow-y: auto;
`
