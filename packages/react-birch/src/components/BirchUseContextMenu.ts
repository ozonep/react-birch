import * as React from 'react'
import {  useCallback, } from 'react';

import { useContextMenu } from '../services/contextMenu'

import {
    BirchItem,
    BirchItemOrFolder,
    BirchFolder,
} from '../models'

import {
    EnumBirchItemType, IContext,
} from '../types'


export const useContextMenuContainer = (context: IContext) => {

   const [ showContextMenu ] = useContextMenu()

    const {
      treeViewHandleExtended, 
      model, 
      activeSelection: {pseudoActiveItem, activeItem},
      props: { options: { contributes: { contextMenus }}}
    } = context

    const getBoundingClientRectForItem = (
      item: BirchItem | BirchFolder
    ) => {
      const divRef = context.itemIdToRefMap.get(item.id)
      if (divRef) {
        return divRef.getBoundingClientRect()
      }
      return null
    }
    
    const handleContextMenu = useCallback((ev: React.MouseEvent) => {

        let target: BirchItemOrFolder

        // capture ctx menu triggered through context menu button on keyboard
        if (ev.nativeEvent.which === 0) {
            target = pseudoActiveItem.current || activeItem.current
            if (target) {
                const rect = getBoundingClientRectForItem(target)
                if (rect) {
                    return showContextMenu(ev, contextMenus, treeViewHandleExtended.current, target, { x: (rect.left + rect.width), y: (rect.top | rect.height) })
                }
            }
        }

        return showContextMenu(ev, contextMenus, treeViewHandleExtended.current, model.current.root)

    }, [])

    const handleItemContextMenu = useCallback((ev: React.MouseEvent, item: BirchItemOrFolder) => {
        ev.stopPropagation()
        return showContextMenu(ev, contextMenus, treeViewHandleExtended.current, item)
    }, [])

    context.contextMenu = { handleContextMenu, handleItemContextMenu }

}

export const useContextMenuChild = ({item, itemType, handleItemContextMenu }) => {

    const handleContextMenuChild = useCallback((ev: React.MouseEvent) => {
        // context menu event when caused by user pressing context menu key on keyboard is handled in parent component
        if (ev.nativeEvent.which === 0) {
          return
        }
         if (
          itemType === EnumBirchItemType.BirchItem ||
          itemType === EnumBirchItemType.BirchFolder
        ) {
          handleItemContextMenu(ev, item as BirchItem, itemType)
        }
      }, [item, itemType, handleItemContextMenu])

      return { onContextMenu: handleContextMenuChild }

}
