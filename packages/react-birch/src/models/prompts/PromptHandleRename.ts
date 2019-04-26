import { BirchFolder, BirchItem } from '../../models'
import { PromptHandle } from './PromptHandle'

export class PromptHandleRename extends PromptHandle {
	constructor(public readonly originalLabel: string, public readonly target: BirchItem | BirchFolder) {
		super()
		this.$.value = originalLabel
		this.setSelectionRange(0, originalLabel.lastIndexOf('.'))
	}

	get id(): number {
		return this.target.id
	}

	get depth() {
		return this.target.depth
	}
}
