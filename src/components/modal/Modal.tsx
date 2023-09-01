import {
    FunctionComponent,
    useContext,
    FormEvent,
    useState,
    ChangeEvent,
    useEffect,
    useCallback,
} from "react";
import TaskContext from "../contexts/KanbanContext";
import { task, taskData } from "../../types/kanbanElements";
import styles from "./Modal.module.scss";
import kanbanService from "../../services/kanbanService";

type thisProps = {
    taskData: taskData;
    handleModalClose(): void;
};

const Modal: FunctionComponent<thisProps> = ({
    taskData,
    handleModalClose,
}) => {
    const kanbanCtx = useContext(TaskContext);
    const taskExist = useCallback(tasksExists, []);
    const [taskToUpdate, setTaskToUpdate] = useState(loadTask(taskData));
    const [submitEnabled, setSubmitEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    function tasksExists(): Boolean {
        return !!(
            taskData.id &&
            kanbanCtx?.tasks &&
            kanbanService.elementExists(taskData.id, kanbanCtx?.tasks)
        );
    }

    function loadTask(taskData: taskData): taskData {
        if (taskExist()) {
            return kanbanService.getTaskById(taskData.id!, kanbanCtx?.tasks!)!;
        } else {
            return {
                id: kanbanService.createUniqueId(kanbanCtx?.tasks!),
                title: "",
                description: "",
                statusPanel: taskData.statusPanel,
            };
        }
    }

    function handleChange({
        target,
    }: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const key = target.name;
        const value = target.value;
        setTaskToUpdate({ ...taskToUpdate, [key]: value });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        if (taskExist()) {
            await kanbanCtx?.updateTask(taskToUpdate as task);
            handleModalClose();
        } else {
            await kanbanCtx?.createTask(taskToUpdate);
            handleModalClose();
        }

        setLoading(false);
    }

    useEffect(() => {
        const allFieldsFilled = Object.values(taskToUpdate).every(
            (taskPropertyValue) => taskPropertyValue !== ""
        );
        const originalTask = taskExist()
            ? kanbanService.getTaskById(taskData.id!, kanbanCtx?.tasks!)
            : null;
        const hasChanged =
            !taskExist() ||
            Object.keys(taskToUpdate).some(
                // @ts-ignore
                (taskKey) => taskToUpdate[taskKey] !== originalTask[taskKey]
            );

        if (allFieldsFilled && hasChanged) {
            setSubmitEnabled(true);
        } else {
            setSubmitEnabled(false);
        }
    }, [taskToUpdate]);

    return (
        <div className={styles.modalBody}>
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {kanbanCtx?.panels && (
                        <select
                            name="statusPanel"
                            id={kanbanCtx?.panels[0].id}
                            onChange={(target) => handleChange(target)}
                        >
                            {kanbanCtx?.panels.map((panel) => (
                                <option key={panel.id} value={panel.id}>
                                    {panel.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <input
                        type="text"
                        name="title"
                        placeholder="Set title"
                        value={taskToUpdate.title}
                        onChange={(target) => handleChange(target)}
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Set description"
                        value={taskToUpdate.description}
                        onChange={(target) => handleChange(target)}
                    />
                    <input
                        disabled={!submitEnabled}
                        type="submit"
                        value={loading ? "Loading" : "Submit"}
                    />
                </form>
            </div>
        </div>
    );
};

export default Modal;
