import {
    FunctionComponent,
    useContext,
    useRef,
    Dispatch,
    SetStateAction,
} from "react";
import styles from "./Task.module.scss";
import dragAndDropService from "../../services/dragAndDropService";
import KanbanContext from "../contexts/KanbanContext";

type thisProps = {
    task: task;
    sendModalInfo({
        taskId,
        panelId,
    }: {
        taskId?: string;
        panelId: string;
    }): void;
    onSetMessage: Dispatch<
        SetStateAction<{ content: string; isError: boolean }>
    >;
};

const Task: FunctionComponent<thisProps> = ({
    task,
    sendModalInfo,
    onSetMessage,
}) => {
    const kanbanCtx = useContext(KanbanContext);
    const taskElem = useRef(null);

    function handleStart() {
        if (!taskElem.current) return;

        const taskHtml = taskElem.current as HTMLElement;
        const { width } = taskHtml.getBoundingClientRect();
        taskHtml.style.setProperty("--task-width", width + "px");
        dragAndDropService.handleStart(task);
    }

    async function handleEnd() {
        const taskHtml = taskElem.current as unknown as HTMLElement;
        const toUpdateTask = JSON.parse(JSON.stringify(task));

        if (dragAndDropService.isMoving) {
            const currentPanel = toUpdateTask.statusPanel;
            if (!taskHtml) return;
            const panelsElem = kanbanCtx?.panels.map((panel) =>
                document.getElementById(panel.id)
            );
            if (!panelsElem || panelsElem.some((p) => p === null)) return;
            const overlappedPanel = dragAndDropService.checkOverlap(
                taskHtml,
                panelsElem as HTMLElement[]
            );
            if (overlappedPanel && currentPanel !== overlappedPanel.id) {
                dragAndDropService.isBlocked = true;
                onSetMessage({
                    content: `Moving ${task.title}`,
                    isError: false,
                });
                toUpdateTask.statusPanel = overlappedPanel.id;
                const ok = await kanbanCtx?.updateTask(toUpdateTask);
                if (!ok)
                    onSetMessage({
                        content: `Couldn't move task ${task.title}`,
                        isError: true,
                    });
                if (ok)
                    onSetMessage({
                        content: "",
                        isError: false,
                    });
                dragAndDropService.isBlocked = false;
            }
        } else {
            sendModalInfo({ taskId: task.id, panelId: task.statusPanel });
        }

        const taskWidth =
            getComputedStyle(taskHtml).getPropertyValue("--task-width");
        if (taskWidth !== "100%")
            taskHtml.style.setProperty("--task-width", "100%");
    }

    const isNewTaskButton = task.id === "newTask";

    return (
        <>
            {!isNewTaskButton && (
                <button
                    id={task.id}
                    ref={taskElem}
                    className={styles.taskBody}
                    {...(dragAndDropService.loadEvent("start", () =>
                        handleStart()
                    ) as any)}
                    {...(dragAndDropService.loadEvent("end", () => {
                        dragAndDropService.handleEnd(handleEnd, task);
                    }) as any)}
                >
                    <p>{task.title}</p>
                </button>
            )}
            {isNewTaskButton && (
                <button
                    id={task.id}
                    className={styles.taskBody}
                    onClick={() =>
                        sendModalInfo({
                            taskId: "",
                            panelId: task.statusPanel,
                        })
                    }
                >
                    <p>{task.title}</p>
                </button>
            )}
        </>
    );
};

export default Task;
