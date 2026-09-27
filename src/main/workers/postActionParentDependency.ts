
import {UploadPostAction, UploadPostActionResult} from './UploadPostAction.js'

export class PostActionParentDependency implements Dependency {
    constructor(
        public readonly dependentQueueActionID: string,
        public resolved: boolean = false
    ) {}

    async attemptResolution(context: ActionContext, attachedAction: UploadPostAction): Promise<boolean> {

        try {
            const result = context.getResult<UploadPostActionResult>(this.dependentQueueActionID);

            attachedAction.input.options.parentId = result.post_id.toString();

            this.setSelfAsResolved()
            return true;
            
        } catch(err: any) {
            if (err instanceof Error) {
                if (!err.cause) throw err;

                if (err.cause === 0) {
                    this.setSelfAsResolved();
                    return true;
                }

                return false;
            }

            throw err;
        }

        return false;
    }

    private setSelfAsResolved() {
        this.resolved = true;
    }
}