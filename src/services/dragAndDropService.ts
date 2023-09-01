import { PointerEvent } from "react";
import { task } from "../types/kanbanElements";

class DragAndDropService {
    taskData: task | null = null;
    isPointerDown = false;
    isMoving = false;

    handlePointerDown(task: task) {
        this.taskData = task;
        this.isPointerDown = true;
        this.isMoving = false;
    }

    handlePointerMove(event: PointerEvent<HTMLDivElement>) {
        if (!this.isPointerDown || !this.taskData) {
            this.reset();
            return;
        }

        this.isMoving = true;
        const taskElem = document.getElementById(this.taskData.id);
        if (taskElem) {
            const style = taskElem.style;
            if (style.position !== "absolute") style.position = "absolute";
            if (style.pointerEvents !== "none") {
                style.pointerEvents = "none";
            }
            style.left = event.clientX - 5 + "px";
            style.top = event.clientY - 5 + "px";
        }
    }

    handlePointerUp(callback: Function, task?: task) {
        if (!callback || !this.taskData) return;

        if (task?.id === this.taskData?.id && !this.isMoving) {
            this.reset();
            callback();
            return;
        }

        if (this.taskData && this.isMoving) {
            callback();
            this.reset();
            return;
        }

        this.reset();
    }

    reset() {
        if (this.taskData) {
            const taskElem = document.getElementById(this.taskData.id);
            if (taskElem) {
                taskElem.style.position = "";
                taskElem.style.pointerEvents = "";
            }
        }
        this.taskData = null;
        this.isPointerDown = false;
        this.isMoving = false;
    }
}

const dragAndDropService = new DragAndDropService();
export default dragAndDropService;
