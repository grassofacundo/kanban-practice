import { FunctionComponent, useContext, useEffect, useState } from "react";
import { panel } from "../../types/kanbanElements";
import Task from "../task/Task";
import KanbanContext from "../contexts/KanbanContext";
import styles from "./Panel.module.scss";

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
    const tasks = kanbanCtx!.getTasksByStatus(panelData.id);
    const [message, setMessage] = useState<{
        content: string;
        isError: boolean;
    }>({ content: "", isError: false });

    //Add create new task at last
    tasks.push({
        id: "newTask",
        title: "Create new task",
        description: "",
        statusPanel: panelData.id,
    });

    useEffect(() => {
        if (message.content) {
            setTimeout(() => {
                setMessage({ content: "", isError: false });
            }, 5000);
        }
    }, [message]);

    return (
        <div id={panelData.id} className={styles.panelBody}>
            <h3>{panelData.name}</h3>
            <span
                className={`${message.content ? styles.show : ""} ${
                    message.isError ? styles.error : ""
                }`}
            >
                {message.content}
            </span>
            <div className={styles.tasksContainer}>
                {tasks &&
                    tasks.map((task) => (
                        <Task
                            key={task.id}
                            task={task}
                            sendModalInfo={onHandleModalOpen}
                            onSetMessage={setMessage}
                        ></Task>
                    ))}
            </div>
        </div>
    );
};

export default Panel;
