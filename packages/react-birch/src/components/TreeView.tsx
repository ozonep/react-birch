import * as React from 'react'
import styled from 'styled-components'
import { themeGet } from 'styled-system'
import { TreeViewHeading, TreeViewHeadingIcons, TreeViewHeadingProps } from './TreeViewHeading'
import { ITreeViewExtendedHandle, ITreeViewProps } from '../types';
import { BirchTreeView } from './BirchTreeView';

const HeadingContainer = styled.div`
  width: 100%;
  background: ${themeGet('colors.offwhite')};
  &:hover ${TreeViewHeadingIcons} {
    opacity: 1;
  }
`

const TreeViewWrapperStyled = styled.div`
	flex: 1 0 auto;
	font-family: 'Tinia Serif', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'sans-serif';
	font-size: ${themeGet('fontSizes.1')}px;
	color: ${themeGet('colors.primary')};
	background: ${themeGet('colors.gray.8')};
	display: inline-block;
	width: 100%;

	& .birch-tree-view:focus {
	outline: none;
	}

	& .birch-tree-view::-webkit-scrollbar {
		width: 8px;
		height: 8px;
		&-track {
			background: transparent;
		}
		&-corner {
			background: transparent;
		}
		&-thumb {
			background: ${themeGet('colors.offwhite')};
			&:hover {
				background: ${themeGet('colors.offwhite')};
			}
		}
`

export const TreeView = (props: ITreeViewProps & TreeViewHeadingProps) => {

  const treeViewHandleExtended = React.useRef<ITreeViewExtendedHandle>(null)

  return (
    <HeadingContainer>
      <TreeViewHeading handle={treeViewHandleExtended} title={props.title} titleMenus={props.options.contributes.titleMenus} />
      <TreeViewWrapperStyled>
        <BirchTreeView handle={treeViewHandleExtended} {...props} />
      </TreeViewWrapperStyled>
    </HeadingContainer>
  )

}
