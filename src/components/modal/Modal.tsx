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
import keyService from "../../services/keyService";
import Spinner from "../utils/spinner/Spinner";

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
    const [taskToUpdate, setTaskToUpdate] = useState<taskData>(
        loadTask(taskData)
    );
    const [submitEnabled, setSubmitEnabled] = useState(false);
    const [message, setMessage] = useState<string>("");
    const [showMessage, setShowMessage] = useState<boolean>(false);
    const [hasErrors, setHasErrors] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    function tasksExists(): Boolean {
        return !!(
            taskData.id &&
            kanbanCtx?.tasks &&
            keyService.elementExists(taskData.id, kanbanCtx?.tasks)
        );
    }

    function loadTask(taskData: taskData): taskData {
        if (taskExist()) {
            return kanbanCtx!.getTaskById(taskData.id!)!;
        } else {
            return {
                id: keyService.createUniqueId(kanbanCtx?.tasks!),
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
        setShowMessage(false);
        setHasErrors(false);
        const key = target.name;
        const value = target.value;
        setTaskToUpdate({ ...taskToUpdate, [key]: value });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!kanbanCtx) return;

        setLoading(true);
        setHasErrors(false);
        setShowMessage(false);
        let ok = false;
        if (taskExist()) {
            ok = await kanbanCtx?.updateTask(taskToUpdate as task);
        } else {
            ok = await kanbanCtx?.createTask(taskToUpdate);
        }

        if (ok) {
            setHasErrors(false);
            setMessage(taskExist() ? "Task updated" : "Task created");
            setSubmitEnabled(false);
        } else {
            setHasErrors(true);
            setMessage(
                taskExist()
                    ? "Task not updated. Try again"
                    : "Task not created. Try again"
            );
        }
        setShowMessage(true);
        setLoading(false);
    }

    useEffect(() => {
        const allFieldsFilled = Object.values(taskToUpdate).every(
            (taskPropertyValue) => taskPropertyValue !== ""
        );
        const originalTask = taskExist()
            ? kanbanCtx!.getTaskById(taskData.id!)
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
                    onClick={() => (!loading ? handleModalClose() : {})}
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
                        <div className={styles.submitWrapper}>
                            <button disabled={!submitEnabled} type="submit">
                                {loading ? <Spinner /> : "Submit"}
                            </button>
                            {showMessage && (
                                <p
                                    className={`${
                                        hasErrors
                                            ? styles.error
                                            : styles.success
                                    }`}
                                >
                                    {message}
                                </p>
                            )}
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default Modal;
