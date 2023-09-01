import { FunctionComponent } from "react";
import styles from "./Task.module.scss";
import { task } from "../../types/kanbanElements";
import dragAndDropService from "../../services/dragAndDropService";

type thisProps = {
    task: task;
    sendModalInfo(taskId: string): void;
};

const Task: FunctionComponent<thisProps> = ({ task, sendModalInfo }) => {
    function handleMove() {
        if (dragAndDropService.isMoving) return;
        sendModalInfo(task.id);
    }

    return (
        <button
            id={task.id}
            className={styles.taskBody}
            onPointerDown={() => dragAndDropService.handlePointerDown(task)}
            onPointerUp={() =>
                dragAndDropService.handlePointerUp(handleMove, task)
            }
        >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
        </button>
    );
};

export default Task;
