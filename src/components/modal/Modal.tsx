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
    }: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >) {
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
                <button
                    className={styles.closeButton}
                    onClick={() => handleModalClose()}
                >
                    X
                </button>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <fieldset>
                        <div className={styles.inputContainer}>
                            <label htmlFor="title">Task title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                placeholder="Set title"
                                value={taskToUpdate.title}
                                onChange={(target) => handleChange(target)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                placeholder="Set description"
                                value={taskToUpdate.description}
                                onChange={(target) => handleChange(target)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <label>Status</label>
                            {kanbanCtx?.panels &&
                                kanbanCtx?.panels.map((panel) => (
                                    <div
                                        key={panel.id}
                                        className={styles.radioWrapper}
                                    >
                                        <input
                                            type="radio"
                                            id={`radio-id-${panel.id}`}
                                            name="statusPanel"
                                            value={panel.id}
                                            defaultChecked={
                                                panel.id ===
                                                taskData.statusPanel
                                            }
                                            onChange={(target) =>
                                                handleChange(target)
                                            }
                                        />
                                        <label htmlFor={`radio-id-${panel.id}`}>
                                            {panel.name}
                                        </label>
                                    </div>
                                ))}
                        </div>
                        <input
                            disabled={!submitEnabled}
                            type="submit"
                            value={loading ? "Loading" : "Submit"}
                        />
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default Modal;
