import * as React from 'react'
import { useCallback, memo, useState } from 'react';

import {
  BirchFolder,
  BirchItem,
  PromptHandleNewItem,
  PromptHandleRename,
} from '../models'

import {
  EnumBirchItemType,
  ITreeViewItemRendererProps,
  IContext
} from '../types'

import { useDragDropChild } from './BirchUseDragDrop';
import { useContextMenuChild } from './BirchUseContextMenu';

export const renderBirchTreeViewItem = (context: IContext) => {

  const {
    getItemAtIndex,
    activeSelection: { activeItem, pseudoActiveItem },
    dragDrop: { dragged },
    props: { options: { contributes: { itemMenus } }, children }
  } = context

  const renderItem = useCallback(({ index, style }): JSX.Element => {

    const { item, itemType: type } = getItemAtIndex(index)
    return <BirchTreeViewItem
      key={(item as any).id}
      style={style}
      item={item}
      itemType={type}
      depth={item.depth}
      context={context}
      children={children}
      expanded={type === EnumBirchItemType.BirchFolder ? (item as BirchFolder).expanded : void 0}
    />
  }, [
      getItemAtIndex,
      itemMenus,
      activeItem.current,
      pseudoActiveItem.current,
      dragged
    ])

  return renderItem

}

interface BirchTreeViewItemProps {
  item: BirchItem | BirchFolder | PromptHandleNewItem | PromptHandleRename
  itemType: EnumBirchItemType,
  depth: number,
  expanded: boolean,
  context: IContext,
  style: any,
  children: React.FC<ITreeViewItemRendererProps>
}

const useForceUpdate = () => {
  const forceUpdater = useState(0)[1]
  return (resolver) => forceUpdater((_st) => { resolver && resolver(); return (_st + 1) })
}

const BirchTreeViewItem = memo((props: BirchTreeViewItemProps) => {

  const lastItemPath = React.useRef<string>()

  const {
    item,
    itemType,
    style,
    children,
    context: {
      itemIdToRefMap,
      model,
      dragDrop: { dragAndDropService },
      contextMenu: { handleItemContextMenu },
      activeSelection: { handleItemClicked },
      props: { options: { contributes: { itemMenus, contextMenus, keybindings } } }
    }
  } = props

  ;(item as BirchItem).forceUpdate = useForceUpdate()

  const divRef = useCallback((r: HTMLDivElement) => {
    if (r === null) {
      itemIdToRefMap.delete(item.id)
    } else {
      itemIdToRefMap.set(item.id, r)
    }
  }, [item.id])

  const [dragProps] = useDragDropChild({
    itemIdToRefMap,
    item,
    itemType,
    dragAndDropService
  })

  const {
    onContextMenu
  } = useContextMenuChild({
    item,
    itemType,
    handleItemContextMenu
  })

  React.useEffect(() => {
    const thisItem: BirchItem = props.itemType === EnumBirchItemType.BirchItem || props.itemType === EnumBirchItemType.BirchFolder
      ? props.item as BirchItem
      : props.itemType === EnumBirchItemType.RenamePrompt
        ? (props.item as PromptHandleRename).target
        : props.itemType === EnumBirchItemType.NewItemPrompt || props.itemType === EnumBirchItemType.NewFolderPrompt
          ? (props.item as PromptHandleNewItem).parent
          : null

    if (thisItem && thisItem.path) {
      lastItemPath.current = thisItem.path
    } else {
      lastItemPath.current = null
    }

  }, [item])

  return React.createElement(
    children,
    Object.assign({
      ref: divRef,
      item,
      itemType,
      decorations: model.current.decorations.getDecorations(item as any),
      onClick: handleItemClicked,
      itemMenus,
      onContextMenu,
      style
    }, dragProps as any))
})