import { FunctionComponent } from "react";
import styles from "./Task.module.scss";
import { task } from "../../types/kanbanElements";
import dragAndDropService from "../../services/dragAndDropService";

type thisProps = {
    task: task;
    sendModalInfo(taskId: string): void;
};

const Task: FunctionComponent<thisProps> = ({ task, sendModalInfo }) => {
    return (
        <button
            id={task.id}
            className={styles.taskBody}
            onPointerDown={() => dragAndDropService.handlePointerDown(task.id)}
            onPointerMove={() => dragAndDropService.handlePointerMove(task.id)}
            onPointerUp={() =>
                dragAndDropService.handlePointerUp(task.id, () =>
                    sendModalInfo(task.id)
                )
            }
        >
            <h3>{task.title}</h3>
            <p>{task.description}</p>
        </button>
    );
};

export default Task;
