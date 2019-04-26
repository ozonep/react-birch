import { useRef, useEffect } from "react";
import { ClasslistComposite } from "../models/decoration";
import { TreeViewModel, IContext, BirchItem } from "../../src";
import { DisposablesComposite } from 'birch-event-emitter';

export const useDecorations = (context: IContext) => {

  const { decorations: { activeItemDecoration, pseudoActiveItemDecoration }} = context
  
    const {model, treeViewHandleExtended, activeSelection: {updateActiveItem, updatePseudoActiveItem}} = context
    const disposables = useRef<DisposablesComposite>(new DisposablesComposite())
	
    useEffect(() => {
        /* MOUNT */
     
        model.current.decorations.addDecoration(activeItemDecoration.current)
        model.current.decorations.addDecoration(pseudoActiveItemDecoration.current)

        disposables.current.add(treeViewHandleExtended.current.onDidChangeModel((prevModel: TreeViewModel, newModel: TreeViewModel) => {
            updateActiveItem(null)
            updatePseudoActiveItem(null)
            prevModel.decorations.removeDecoration(activeItemDecoration.current)
            prevModel.decorations.removeDecoration(pseudoActiveItemDecoration.current)
            newModel.decorations.addDecoration(activeItemDecoration.current)
            newModel.decorations.addDecoration(pseudoActiveItemDecoration.current)
        }))

        /* UNMOUNT */
        return () => {
          model.current.decorations.removeDecoration(activeItemDecoration.current)
          model.current.decorations.removeDecoration(pseudoActiveItemDecoration.current)
          disposables.current.dispose()
      }

    }, [])
  
}

export const useDecorationsChild = ({ decorations, forceUpdate}: {decorations: ClasslistComposite, forceUpdate: () => void}) => {

  const prevDecorations = useRef<ClasslistComposite>(undefined);

  useEffect(() => {
    return () => {
      /* UNMOUNT */
      if (decorations) {
        decorations.removeChangeListener(forceUpdate)
      }
    }
  }, [decorations])

  useEffect(() => {

    if (prevDecorations.current) {
      prevDecorations.current.removeChangeListener(forceUpdate)
    }

    if (decorations) {
      decorations.addChangeListener(forceUpdate)
    } 

    prevDecorations.current = decorations

  }, [decorations])
}