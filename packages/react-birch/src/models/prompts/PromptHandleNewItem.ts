import { BirchFolder, BirchItem } from '../../models'
import { PromptHandle } from './PromptHandle'
import { EnumTreeItemType} from '../../types'

export class PromptHandleNewItem extends PromptHandle {
	private _id: number = BirchItem.nextId()
	constructor(public readonly type: EnumTreeItemType, public readonly parent: BirchFolder) {
		super()
	}

	get id(): number {
		return this._id
	}

	get depth() {
		return this.parent.depth + 1
	}
}
