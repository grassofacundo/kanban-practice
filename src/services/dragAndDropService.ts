import { TouchEvent, PointerEvent } from "react";
import browserService from "./browserService";

class DragAndDropService {
    taskData: task | null = null;
    isPointerDown = false;
    isMoving = false;
    hasTouchScreen = false;
    timeOutId = 0;
    threshold = 250;
    canMove = false;
    isBlocked = false;

    init() {
        this.hasTouchScreen = browserService.hasTouchscreen();
        if (!this.hasTouchScreen) this.threshold = 0;
    }

    loadEvent(eventName: string, callback: Function) {
        if (this.hasTouchScreen) {
            switch (eventName) {
                case "start":
                    return { onTouchStart: callback };
                case "move":
                    return { onTouchMove: callback };
                case "end":
                    return { onTouchEnd: callback };

                default:
                    break;
            }
        } else {
            switch (eventName) {
                case "start":
                    return { onPointerDown: callback };
                case "move":
                    return { onPointerMove: callback };
                case "end":
                    return { onPointerUp: callback };

                default:
                    break;
            }
        }
    }

    handleStart(task: task) {
        if (this.isBlocked) return;

        this.timeOutId = setTimeout(() => {
            this.canMove = true;
        }, this.threshold);

        this.taskData = task;
        this.isPointerDown = true;
        this.isMoving = false;
    }

    handleMove(
        event: TouchEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>
    ) {
        if (!this.hasTouchScreen) event.preventDefault();

        if (
            !this.isPointerDown ||
            !this.taskData ||
            !this.canMove ||
            this.isBlocked
        ) {
            this.reset();
            return;
        }

        this.isMoving = true;
        const taskElem = document.getElementById(this.taskData.id);
        if (taskElem) {
            const style = taskElem.style;
            if (style.position !== "absolute") style.position = "absolute";

            const client = { x: 0, y: 0 };
            if (this.hasTouchScreen) {
                const ev = event as TouchEvent<HTMLDivElement>;
                client.x = ev.touches[0].clientX;
                client.y = ev.touches[0].clientY;
            } else {
                const ev = event as PointerEvent<HTMLDivElement>;
                client.x = ev.clientX;
                client.y = ev.clientY;
            }

            style.left = client.x - 5 + "px";
            style.top = client.y - 5 + "px";
        }
    }

    handleEnd(callback: Function, task?: task) {
        if (!callback || !this.taskData || this.isBlocked) return;

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

    checkOverlap(
        elem: HTMLElement,
        targetElements: HTMLElement[]
    ): HTMLElement | null {
        const rect1 = elem.getBoundingClientRect();

        let overlappedElement = null;
        for (const target of targetElements) {
            const rect2 = target.getBoundingClientRect();

            const horizontalTouch =
                rect1.right >= rect2.left && rect1.left <= rect2.right;

            const verticalTouch =
                rect1.bottom >= rect2.top && rect1.top <= rect2.bottom;

            if (horizontalTouch && verticalTouch) {
                overlappedElement = target;
                break;
            }
        }

        return overlappedElement;
    }

    reset() {
        clearInterval(this.timeOutId);
        this.canMove = false;
        if (this.taskData) {
            const taskElem = document.getElementById(this.taskData.id);
            if (taskElem) {
                taskElem.style.position = "";
            }
        }
        this.taskData = null;
        this.isPointerDown = false;
        this.isMoving = false;
    }
}

const dragAndDropService = new DragAndDropService();
export default dragAndDropService;
