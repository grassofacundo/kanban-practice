import { FunctionComponent, useContext } from "react";
import Task from "../task/Task";
import styles from "./Panel.module.scss";
import KanbanContext from "../contexts/KanbanContext";
import kanbanService from "../../services/kanbanService";
import { panel } from "../../types/kanbanElements";

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
    //Add create new task at last
    tasks.push({
        id: "newTask",
        title: "Create new task",
        description: "",
        statusPanel: panelData.id,
    });

    return (
        <div id={panelData.id} className={styles.panelBody}>
            <h3>{panelData.name}</h3>
            <div className={styles.tasksContainer}>
                {tasks &&
                    tasks.map((task) => (
                        <Task
                            key={task.id}
                            task={task}
                            sendModalInfo={onHandleModalOpen}
                        ></Task>
                    ))}
            </div>
        </div>
    );
};

export default Panel;
