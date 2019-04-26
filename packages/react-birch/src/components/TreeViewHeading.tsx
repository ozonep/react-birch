import * as React from 'react'
import { useMemo } from 'react'
import styled from 'styled-components'
import { space, fontFamily, color } from 'styled-system'
import { ITreeViewExtendedHandle } from '../types';

const Flex = styled.div.attrs({
})`
  display: flex;
  ${space};
`

const HeadingText = styled.li.attrs({
  py: 2,
  fontFamily: 'heading',
  color: 'gray.5'
})`
  position: relative;
  display: block;
  overflow: hidden;
  font-size: 12px;
  letter-spacing: 0.33em;
  text-decoration: none;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  flex: 1 1 1auto;
  ${space} ${fontFamily} ${color};
`

const HeadingIcon = styled('i')`
  font-size: 14px;
  text-align: center;
  height: 14px;
  width: 14px;
  cursor: pointer;
  margin-right: 10px;

  &:before {
    height: inherit;
    width: inherit;
    display: inline-block;
    content: ${props => props.icon};
  }
`

export const TreeViewHeadingIcons = styled.div`
  margin-left: auto;
  opacity: 0;
  display: flex;
`

export interface TreeViewHeadingProps {
  title: string,
  titleMenus: { command: string, icon: string, onClick: (handle: ITreeViewExtendedHandle) => void }[]
}

interface TreeViewHeadingPropsInternal extends TreeViewHeadingProps {
  handle: React.MutableRefObject<ITreeViewExtendedHandle>
}

export const TreeViewHeading = ({ title, titleMenus, handle }: TreeViewHeadingPropsInternal) => {

  const icons = useMemo(() => titleMenus.map(({ command, icon, onClick }) =>
    <HeadingIcon key={command} onClick={() => { onClick(handle.current) }} icon={icon} />
  ), titleMenus)

  return (
    <Flex mr={2}>
      <HeadingText>{title}</HeadingText>
      <TreeViewHeadingIcons>
        {icons}
      </TreeViewHeadingIcons>
    </Flex>
  )
  
}
