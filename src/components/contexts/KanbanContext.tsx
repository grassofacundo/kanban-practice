import {
    FunctionComponent,
    ReactNode,
    createContext,
    useEffect,
    useState,
} from "react";
import { panel, task, taskData } from "../../types/kanbanElements";
import dbService from "../../services/dbService";
import kanbanService from "../../services/kanbanService";

type thisProps = {
    children: ReactNode;
};
interface KanbanContextInterface {
    tasks: task[];
    panels: panel[];
    createPanel(status: string): Promise<boolean>;
    createTask(taskData: taskData): Promise<boolean>;
    updateTask(task: task): Promise<boolean>;
}

const KanbanContext = createContext<KanbanContextInterface | null>(null);

export const KanbanProvider: FunctionComponent<thisProps> = ({ children }) => {
    const [tasks, setTasks] = useState<task[]>([]);
    const [panels, setPanels] = useState<panel[]>([]);

    async function createTask(taskData: taskData): Promise<boolean> {
        const newTask: task = {
            id: kanbanService.createUniqueId(tasks),
            title: taskData.title!,
            description: taskData.description!,
            statusPanel: taskData.statusPanel!,
        };
        const taskCreated = await dbService.createTask(newTask);
        if (taskCreated) setTasks([...tasks, newTask]);
        return taskCreated;
    }

    async function updateTask(task: task): Promise<boolean> {
        const taskUpdated = await dbService.updateTask(task);
        if (taskUpdated) {
            const updatedTasks = tasks.map((t) => {
                if (t.id === task.id) {
                    t.statusPanel = task.statusPanel;
                    t.title = task.title;
                    t.description = task.description;
                }
                return t;
            });
            setTasks(updatedTasks);
        }
        return taskUpdated;
    }

    async function createPanel(name: string): Promise<boolean> {
        const newPanel: panel = {
            id: kanbanService.createUniqueId(panels),
            name,
        };
        const panelCreated = await dbService.createPanel(newPanel);
        if (panelCreated) setPanels([...panels, newPanel]);
        return panelCreated;
    }

    useEffect(() => {
        async function fetchAllData() {
            try {
                const tasksFromDb = await dbService.getAllTasks();
                const panelsFromDb = await dbService.getAllPanels();
                if (tasksFromDb.length > 0) {
                    setTasks(tasksFromDb);
                }
                setPanels(panelsFromDb.length > 0 ? panelsFromDb : []);
            } catch (error) {
                console.error(error);
            }
        }

        fetchAllData();
    }, []);

    return (
        <KanbanContext.Provider
            value={{
                tasks,
                panels,
                createPanel,
                createTask,
                updateTask,
            }}
        >
            {children}
        </KanbanContext.Provider>
    );
};

export default KanbanContext;
