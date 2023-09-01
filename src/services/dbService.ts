import { panel, task } from "../types/kanbanElements";

class DbService {
    // @ts-ignore
    hasDatabase = config.isDbEnabled; //Config exists as a global var (public/config.js)
    taskLocalStorageKey = "tasks";
    panelLocalStorageKey = "panels";

    async getAllTasks(): Promise<task[]> {
        let tasks: task[] = [];
        if (this.hasDatabase) {
            const response = await fetch("getAllTasksApi");
            const tasksRes = (await response.json()) as task[];
            tasks = [...tasksRes];
        } else {
            const tasksLs = localStorage.getItem(this.taskLocalStorageKey);
            const tasksArr = tasksLs ? JSON.parse(tasksLs) : [];
            tasks = [...tasksArr];
        }
        return tasks;
    }

    async getAllPanels(): Promise<panel[]> {
        let panel: panel[] = [];
        if (this.hasDatabase) {
            const response = await fetch("getAllPanelsApi");
            const panelsRes = (await response.json()) as panel[];
            panel = [...panelsRes];
        } else {
            const panelsLs = localStorage.getItem(this.panelLocalStorageKey);
            const panelsArr = panelsLs ? JSON.parse(panelsLs) : [];
            panel = [...panelsArr];
        }
        return panel;
    }

    async createPanel(panel: panel): Promise<boolean> {
        if (this.hasDatabase) {
            const response = await fetch("postPanelApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(panel),
            });
            return response.ok;
        } else {
            const allPanels = await this.getAllPanels();
            allPanels.push(panel);
            localStorage.setItem(
                this.panelLocalStorageKey,
                JSON.stringify(allPanels)
            );
            return true;
        }
    }

    async createTask(task: task): Promise<boolean> {
        if (this.hasDatabase) {
            const response = await fetch("postTaskApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });
            return response.ok;
        } else {
            const allTasks = await this.getAllTasks();
            allTasks.push(task);
            localStorage.setItem(
                this.taskLocalStorageKey,
                JSON.stringify(allTasks)
            );
            return true;
        }
    }

    async updateTask(task: task) {
        if (this.hasDatabase) {
            const response = await fetch("updateTaskApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });
            return response.ok;
        } else {
            const allTasks = await this.getAllTasks();
            const updatedArray = allTasks.map((t) => {
                if (t.id === task.id) {
                    t.statusPanel = task.statusPanel;
                    t.title = task.title;
                    t.description = task.description;
                }
                return t;
            });
            localStorage.setItem(
                this.taskLocalStorageKey,
                JSON.stringify(updatedArray)
            );
            return true;
        }
    }
}

const dbService = new DbService();
export default dbService;
