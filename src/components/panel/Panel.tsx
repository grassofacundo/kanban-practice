import { FunctionComponent, useContext } from "react";
import Task from "../task/Task";
import styles from "./Panel.module.scss";
import KanbanContext from "../contexts/KanbanContext";
import kanbanService from "../../services/kanbanService";
import { panel, task } from "../../types/kanbanElements";
import dragAndDropService from "../../services/dragAndDropService";

type thisProps = {
    panelData: panel;
    onHandleModalOpen({
        taskId,
        panelId,
    }: {
        taskId?: string;
        panelId: string;
    }): void;
};

const Panel: FunctionComponent<thisProps> = ({
    panelData,
    onHandleModalOpen,
}) => {
    const kanbanCtx = useContext(KanbanContext);
    const tasks = kanbanService.getTasksByStatus(
        panelData.id,
        kanbanCtx?.tasks!
    );

    function handleCallback(taskId?: string) {
        onHandleModalOpen({ taskId, panelId: panelData.id });
    }

    return (
        <div id={panelData.id} className={styles.panelBody}>
            <h1>{panelData.name}</h1>
            <div className={styles.tasksContainer}>
                {tasks &&
                    tasks.map((task) => (
                        <Task
                            key={task.id}
                            task={task}
                            sendModalInfo={handleCallback}
                        ></Task>
                    ))}
                <button
                    className={styles.newTaskButton}
                    onClick={() => handleCallback()}
                >
                    New task
                </button>
            </div>
        </div>
    );
};

export default Panel;
