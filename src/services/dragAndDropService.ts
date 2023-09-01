class DragAndDropService {
    taskId = "";
    isPointerDown = false;
    isMoving = false;

    handlePointerDown(taskId: string) {
        this.taskId = taskId;
        this.isPointerDown = true;
    }

    handlePointerMove(taskId: string) {
        if (!this.isPointerDown) return;
        console.log(taskId);
        console.log(this.taskId);
        console.log(this.isPointerDown);
        if (taskId === this.taskId && this.isPointerDown) {
            console.log("Moving");
            this.isMoving = true;
        }
    }

    handlePointerUp(taskId: string, callback: Function) {
        if (taskId === this.taskId && !this.isMoving) callback();

        this.taskId = "";
        this.isPointerDown = false;
        this.isMoving = false;
    }
}

const dragAndDropService = new DragAndDropService();
export default dragAndDropService;
