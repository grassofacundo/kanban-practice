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
import keyService from "../../services/keyService";
import Spinner from "../utils/spinner/Spinner";
import styles from "./Modal.module.scss";

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
    const [message, setMessage] = useState<message>({
        content: "",
        isError: false,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [closingModal, setClosingModal] = useState(false);

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
        hideMsg();
        const key = target.name;
        const value = target.value;
        setTaskToUpdate({ ...taskToUpdate, [key]: value });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!kanbanCtx) return;

        setLoading(true);
        hideMsg();
        let ok = false;
        if (taskExist()) {
            ok = await kanbanCtx?.updateTask(taskToUpdate as task);
        } else {
            ok = await kanbanCtx?.createTask(taskToUpdate);
        }

        if (ok) {
            setMessage({
                content: taskExist() ? "Task updated" : "Task created",
                isError: false,
            });
            setSubmitEnabled(false);
            handleClose();
        } else {
            setMessage({
                content: taskExist()
                    ? "Task not updated. Try again"
                    : "Task not created. Try again",
                isError: true,
            });
            setLoading(false);
        }
    }

    async function deleteTask() {
        if (!taskData.id) return;

        setLoading(true);
        hideMsg();
        const ok = await kanbanCtx!.deleteTask(taskData.id);

        if (ok) {
            setMessage({ content: "Task deleted", isError: false });
            setSubmitEnabled(false);
            handleClose();
        } else {
            setMessage({
                content: "Task not deleted. Try again",
                isError: true,
            });
            setLoading(false);
        }
    }

    function hideMsg() {
        setMessage({ content: "", isError: false });
    }

    function handleClose() {
        setTimeout(() => {
            setClosingModal(true);
        }, 1000);
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
            <div
                className={`${styles.formContainer} ${
                    closingModal ? styles.closing : ""
                }`}
                onAnimationEnd={() => {
                    closingModal ? handleModalClose() : {};
                }}
            >
                <button
                    className={styles.closeButton}
                    disabled={loading || closingModal}
                    onClick={() => setClosingModal(true)}
                >
                    {loading ? <Spinner /> : "X"}
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
                        <div className={styles.modalFooter}>
                            <div className={styles.submitWrapper}>
                                <button
                                    disabled={!submitEnabled || closingModal}
                                    type="submit"
                                >
                                    {loading ? <Spinner /> : "Submit"}
                                </button>
                                {message.content && (
                                    <p
                                        className={`${
                                            message.isError
                                                ? styles.error
                                                : styles.success
                                        }`}
                                    >
                                        {message.content}
                                    </p>
                                )}
                            </div>
                            {taskExist() && (
                                <button
                                    disabled={loading || closingModal}
                                    onClick={() => deleteTask()}
                                >
                                    {loading ? <Spinner /> : "Delete"}
                                </button>
                            )}
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default Modal;
