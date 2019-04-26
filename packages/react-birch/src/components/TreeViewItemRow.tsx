import * as React from 'react'

import {
  BirchFolder,
  BirchItem,
  PromptHandleRename,
  PromptHandle,
} from '../models'

import {
  EnumBirchItemType,
  EnumTreeItemType,
  ITreeViewItemRendererProps
} from '../types'

import { useCallback, forwardRef, useState } from 'react';
import cn from 'classnames'

import styled from 'styled-components'
import Octicon, { File } from '@githubprimer/octicons-react'
import { themeGet, color, space } from 'styled-system'
import { useDecorationsChild } from './BirchUseDecorations';
import { usePromptsChild } from './BirchUsePrompts';

/* STYLED WIDGETS */

const Icon = styled(Octicon)`
  ${color};
  ${space};
`

const WidgetStyle = styled('a')`
  margin-left: auto;
  top: 0;
  padding: 4px 8px 4px 6px;
  color: ${themeGet('colors.gray.6')} !important;
  cursor: pointer;
  transition: all 0.5s;
  opacity: 0;

  &:hover {
    color: ${themeGet('colors.gray.3')} !important;
    background-color: ${themeGet('colors.gray.6')};
  }
`

const TreeViewItemRowStyle = styled('div')`
  font: inherit;
  text-align: left;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 2px 0;
  margin-left: 2px;
  cursor: pointer;
  padding-left: ${props => 16 * (props['data-depth'] - 1)}px;
  border-radius: ${themeGet('radii.1')}px;
  display: flex;

  &:hover,
  &.pseudo-active {
    background-color: ${themeGet('colors.gray.7')};
  }

  &:hover ${WidgetStyle} {
    opacity: 1;
  }

  &.active,
  &.prompt {
    background-color: ${themeGet('colors.accent.5')};
  }

  &.dragover {
     background-color: ${themeGet('colors.accent.6')};
  }


`

const FolderToggleIcon = styled.span`

  display: inline-block;
  font: normal normal normal 18px/1 'default-icons';
  font-size: 18px;
  text-align: center;
  height: 18px;
  width: 18px;

  &:before {
    height: inherit;
    width: inherit;
    display: inline-block;
 
    content: ${({ open }) => (!open) ?
    "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iIzY0NjQ2NSIgZD0iTTYgNHY4bDQtNC00LTR6bTEgMi40MTRMOC41ODYgOCA3IDkuNTg2VjYuNDE0eiIvPjwvc3ZnPg==')"
    : "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iIzY0NjQ2NSIgZD0iTTExIDEwSDUuMzQ0TDExIDQuNDE0VjEweiIvPjwvc3ZnPg==')"
  };
  }
`

const TreeViewItemLabel = styled.span`
    display: flex;
    align-items: center;
    color: ${themeGet('colors.primary')};
  `

const TreeViewItemFileName = styled.span`

    font: inherit;
    color: inherit;
    user-select: none;
    margin-left: 3px;

    & input[type='text'] {
      display: block;
      width: 94%;
      margin: 0;
      font: inherit;
      border-radius: 3px;
      padding: 1px 2px;
      border: 0;
      background: ${themeGet('colors.offwhite')};
      color: inherit;
      outline: none;
      position: relative;
      z-index: 1;
      margin-top: -2px;
      top: 1px;
      left: -2px;

      &:focus {
        box-shadow: 0px 0px 1px 1px ${themeGet('colors.accent.5')};
      }
    }
`

const useForceUpdate = () => {
	const forceUpdater = useState(0)[1]
	return (resolver?: Function) => forceUpdater((_st) => { resolver && resolver(); return (_st + 1) })
}

export const TreeViewItemStyled = forwardRef(({ item, itemType, onClick, decorations, itemMenus, ...props }: ITreeViewItemRendererProps, ref) => {

  const forceUpdate =useForceUpdate() 

  /**
	 * Cascade Decorations
	 */
  useDecorationsChild({ decorations,  forceUpdate })

  /**
	 * isPrompt state helper for Renaming and Adding New Folders and Items
	 */
  const isPrompt = usePromptsChild(itemType)[0]

  /**
  * On Click Callback
  */
  const handleClick = useCallback((ev: React.MouseEvent) => {
    if (
      itemType === EnumBirchItemType.BirchItem ||
      itemType === EnumBirchItemType.BirchFolder
    ) {
      onClick(ev, item as BirchItem, itemType)
    }
  }, [item, itemType, onClick])

  if (item["disposed"]) {
    return null
  }

  /**
  * Current item state helpers
  */
 const isDirExpanded =
    itemType === EnumBirchItemType.BirchFolder
      ? (item as BirchFolder).expanded
      : itemType === EnumBirchItemType.RenamePrompt &&
        (item as PromptHandleRename).target.type === EnumTreeItemType.Folder
        ? ((item as PromptHandleRename).target as BirchFolder).expanded
        : false

  const itemOrFolder =
    itemType === EnumBirchItemType.BirchItem ||
      itemType === EnumBirchItemType.NewItemPrompt ||
      (itemType === EnumBirchItemType.RenamePrompt &&
        (item as PromptHandleRename).target.constructor === BirchItem)
      ? 'item'
      : 'folder'

  /**
  * Create right hand side icon array
  */
  const icons = itemMenus.map(({ icon, command, onClick }) =>
    <WidgetStyle key={command} onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      onClick(item)
    }}>
      {icon}
    </WidgetStyle>
  )

  /**
  * Render item row
  */
  return (
    <TreeViewItemRowStyle
      ref={ref}
      className={cn(decorations ? decorations.classlist : null)}
      data-depth={item.depth}
      onClick={handleClick}
      title={!isPrompt ? (item as BirchItem).path : undefined}
      {...props}
    >
      {itemOrFolder === 'folder' ? (
        <FolderToggleIcon open={isDirExpanded} />
      ) : null}

      <TreeViewItemLabel className="birch-label">
        {itemOrFolder === 'item' && (
          <Icon mx={1} verticalAlign="middle" size="small" icon={File} />
        )}
        <TreeViewItemFileName >
          {isPrompt && item instanceof PromptHandle ? <item.ProxiedInput /> : (item as BirchItem).label}
        </TreeViewItemFileName>
      </TreeViewItemLabel>
      {icons}
    </TreeViewItemRowStyle>
  )
})