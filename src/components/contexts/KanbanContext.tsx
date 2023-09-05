import {
    FunctionComponent,
    ReactNode,
    createContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { panel, task, taskData } from "../../types/kanbanElements";
import dbService from "../../services/dbService";
import keyService from "../../services/keyService";

type thisProps = {
    children: ReactNode;
};
interface KanbanContextInterface {
    tasks: task[];
    panels: panel[];
    createPanel(status: string): Promise<boolean>;
    createTask(taskData: taskData): Promise<boolean>;
    updateTask(task: task): Promise<boolean>;
    getTaskById(taskId: string): task | null;
    getTasksByStatus(panelId: string): task[];
    getPanelById(panelId: string): panel | null;
}

const KanbanContext = createContext<KanbanContextInterface | null>(null);

export const KanbanProvider: FunctionComponent<thisProps> = ({ children }) => {
    const [tasks, setTasks] = useState<task[]>([]);
    const [panels, setPanels] = useState<panel[]>([]);
    const [prevState, setPrevState] = useState<task[] | panel[]>([]);
    const [restore, setRestore] = useState<"" | "task" | "panel">("");
    const loading = useRef(false);

    async function createTask(taskData: taskData): Promise<boolean> {
        const newTask: task = {
            id: keyService.createUniqueId(tasks),
            title: taskData.title!,
            description: taskData.description!,
            statusPanel: taskData.statusPanel!,
        };
        const response = await dbService.createTask(newTask);
        if (response.ok) setTasks([...tasks, newTask]);
        return response.ok;
    }

    async function updateTask(task: task): Promise<boolean> {
        setPrevState(JSON.parse(JSON.stringify(tasks)));
        const updatedTasks = tasks.map((t) => {
            if (t.id === task.id) {
                t.statusPanel = task.statusPanel;
                t.title = task.title;
                t.description = task.description;
            }
            return t;
        });
        setTasks(updatedTasks);
        const response = await dbService.updateTask(task);

        if (!response.ok) {
            console.log("error");
            setRestore("task");
        }
        return response.ok;
    }

    async function createPanel(name: string): Promise<boolean> {
        const newPanel: panel = {
            id: keyService.createUniqueId(panels),
            name,
        };
        const response = await dbService.createPanel(newPanel);
        if (response.ok) setPanels([...panels, newPanel]);
        return response.ok;
    }

    function getTaskById(taskId: string): task | null {
        return tasks.find((task) => task.id === taskId) ?? null;
    }

    function getTasksByStatus(panelId: string): task[] {
        return tasks.filter((task) => task.statusPanel === panelId);
    }

    function getPanelById(panelId: string): panel | null {
        return panels.find((panel) => panel.id === panelId) ?? null;
    }

    useEffect(() => {
        async function fetchAllData() {
            loading.current = true;
            try {
                let panelsLoaded = false;
                let panels = [] as panel[];
                let attempts = 0;
                while (!panelsLoaded && attempts < 10) {
                    const response = await dbService.getAllPanels();
                    if (!response.ok) {
                        console.log("Re trying panel");
                        attempts++;
                    } else {
                        panelsLoaded = true;
                        panels = response.body;
                    }
                }
                if (attempts >= 10) {
                    alert(
                        "Error connecting to database. Please, contact support"
                    );
                    return;
                }
                let tasksLoaded = false;
                let tasks = [] as task[];
                attempts = 0;
                while (!tasksLoaded && attempts < 10) {
                    const response = await dbService.getAllTasks();
                    if (!response.ok) {
                        console.log("Re trying task");
                        attempts++;
                    } else {
                        tasksLoaded = true;
                        tasks = response.body;
                    }
                }
                if (attempts >= 10) {
                    alert(
                        "Error connecting to database. Please, contact support"
                    );
                    return;
                }
                setPanels(panels);
                setTasks(tasks);
            } catch (error) {
                console.error(error);
            }
        }

        if (!loading.current) fetchAllData();
    }, []);

    useEffect(() => {
        if (restore === "task") setTasks([...prevState] as task[]);
        if (restore === "panel") setPanels([...prevState] as panel[]);
        if (restore === "task" || restore === "panel") setRestore("");
    }, [restore]);

    return (
        <KanbanContext.Provider
            value={{
                tasks,
                panels,
                createPanel,
                createTask,
                updateTask,
                getTaskById,
                getTasksByStatus,
                getPanelById,
            }}
        >
            {children}
        </KanbanContext.Provider>
    );
};

export default KanbanContext;
