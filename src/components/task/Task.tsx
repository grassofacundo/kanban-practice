import { FunctionComponent, useContext } from "react";
import styles from "./Task.module.scss";
import { task } from "../../types/kanbanElements";
import dragAndDropService from "../../services/dragAndDropService";
import KanbanContext from "../contexts/KanbanContext";

type thisProps = {
    task: task;
    sendModalInfo(taskId: string): void;
};

const Task: FunctionComponent<thisProps> = ({ task, sendModalInfo }) => {
    const kanbanCtx = useContext(KanbanContext);

    async function handleEnd() {
        if (dragAndDropService.isMoving) {
            const currentPanel = task.statusPanel;
            const taskElem = document.getElementById(task.id);
            if (!taskElem) return;
            const panelsElem = kanbanCtx?.panels.map((panel) =>
                document.getElementById(panel.id)
            );
            if (panelsElem?.some((p) => p === null)) return;
            const overlappedPanel = dragAndDropService.checkOverlap(
                taskElem,
                panelsElem!
            );
            if (overlappedPanel && currentPanel !== overlappedPanel.id) {
                console.log(`Overlapped on element ${overlappedPanel.id}`);
                task.statusPanel = overlappedPanel.id;
                await kanbanCtx?.updateTask(task);
            }
        } else {
            sendModalInfo(task.id);
        }
    }

    return (
        <button
            id={task.id}
            className={styles.taskBody}
            {...(dragAndDropService.loadEvent("start", () =>
                dragAndDropService.handleStart(task)
            ) as any)}
            {...(dragAndDropService.loadEvent("end", () => {
                dragAndDropService.handleEnd(handleEnd, task);
            }) as any)}
            //onPointerDown={() => dragAndDropService.handlePointerDown(task)}
            //onPointerUp={() => dragAndDropService.handlePointerUp(handleMove, task)}
        >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
        </button>
    );
};

export default Task;
