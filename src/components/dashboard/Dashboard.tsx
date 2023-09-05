import {
    FunctionComponent,
    useContext,
    useState,
    FormEvent,
    TouchEvent,
    PointerEvent,
} from "react";
import Panel from "../panel/Panel";
import TaskContext from "../contexts/KanbanContext";
import Modal from "../modal/Modal";
import styles from "./Dashboard.module.scss";
import { taskData } from "../../types/kanbanElements";
import dragAndDropService from "../../services/dragAndDropService";
import dbService from "../../services/dbService";
import PanelSkeleton from "../panel/PanelSkeleton";
import ThemeChanger from "../themeChanger/ThemeChanger";

type thisProps = {};

const Dashboard: FunctionComponent<thisProps> = () => {
    const kanbanCtx = useContext(TaskContext);
    const [modalData, setModalData] = useState<taskData | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [newPanelName, setNewPanelName] = useState<string>("");
    const [loading, isLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        isLoading(true);
        await kanbanCtx?.createPanel(newPanelName);
        setNewPanelName("");
        isLoading(false);
    }

    function handleModalOpen({
        taskId,
        panelId,
    }: {
        taskId?: string;
        panelId: string;
    }) {
        const newModalData = {
            id: taskId ?? "",
            statusPanel: panelId,
        };
        setModalData(newModalData);
        setModalOpen(true);
    }

    function handleModalClose() {
        setModalData(null);
        setModalOpen(false);
    }

    const hasPanels = !!kanbanCtx && kanbanCtx?.panels?.length! > 0;

    return (
        <div
            className={`${
                !dbService.hasFixedPanels ? styles.hasPanelCreate : ""
            } ${styles.dashboardBody}`}
            {...(dragAndDropService.loadEvent(
                "move",
                (
                    e: TouchEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>
                ) => dragAndDropService.handleMove(e)
            ) as any)}
        >
            {hasPanels &&
                kanbanCtx.panels.map((panel, i) => (
                    <Panel
                        key={i}
                        panelData={panel}
                        onHandleModalOpen={handleModalOpen}
                    />
                ))}
            {!hasPanels && [1, 2, 3].map((x) => <PanelSkeleton key={x} />)}
            {!dbService.hasFixedPanels && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="New panel name"
                        onChange={({ target }) => setNewPanelName(target.value)}
                    />
                    <input
                        disabled={loading || !newPanelName}
                        type="submit"
                        value="Submit"
                    />
                </form>
            )}
            {modalOpen && modalData && (
                <Modal
                    taskData={modalData}
                    handleModalClose={handleModalClose}
                />
            )}
            {<ThemeChanger />}
        </div>
    );
};

export default Dashboard;
