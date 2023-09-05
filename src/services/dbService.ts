import { panel, task } from "../types/kanbanElements";

class DbService {
    hasDatabase: boolean = false;
    panelList: string[] = ["To do", "In progress", "Done"];
    hasFixedPanels: boolean = true;
    taskLocalStorageKey = "tasks";
    panelLocalStorageKey = "panels";
    loadingTime = 0;
    canHaveError = false;

    async getAllTasks(): Promise<dbResponse<task[]>> {
        const response: dbResponse<task[]> = {
            ok: false,
            error: "",
            body: [],
        };
        if (this.hasDatabase) {
            const apiResponse = await fetch("getAllTasksApi");
            response.ok = apiResponse.ok;
            if (response.ok) {
                const tasksRes = (await apiResponse.json()) as task[];
                response.body = [...tasksRes];
            } else {
                response.error = "Couldn't get tasks from DB";
            }
        } else {
            const tasksLs = localStorage.getItem(this.taskLocalStorageKey);
            await this.sleep();
            response.ok = !this.getError();
            if (response.ok) {
                const tasksArr = tasksLs ? JSON.parse(tasksLs) : [];
                response.body = [...tasksArr];
            } else {
                response.error =
                    "Couldn't get tasks from DB. Please, refresh the page";
            }
        }
        return response;
    }

    async getAllPanels(): Promise<dbResponse<panel[]>> {
        const response: dbResponse<panel[]> = {
            ok: false,
            error: "",
            body: [],
        };
        if (this.hasFixedPanels && this.panelList.length > 0) {
            await this.sleep();
            response.ok = !this.getError();
            if (response.ok) {
                this.panelList.forEach((p, index: number) =>
                    response.body.push({ id: index.toString(), name: p })
                );
            } else {
                response.error =
                    "Couldn't get panels from DB. Please, refresh the page";
            }
        }
        if (!this.hasFixedPanels) {
            if (this.hasDatabase) {
                const apiResponse = await fetch("getAllPanelsApi");
                response.ok = apiResponse.ok;
                if (response.ok) {
                    const panelsRes = (await apiResponse.json()) as panel[];
                    response.body = [...panelsRes];
                } else {
                    response.error =
                        "Couldn't get panels from DB. Please, refresh the page";
                }
            } else {
                const panelsLs = localStorage.getItem(
                    this.panelLocalStorageKey
                );
                await this.sleep();
                response.ok = !this.getError();
                if (response.ok) {
                    const panelsArr = panelsLs ? JSON.parse(panelsLs) : [];
                    response.body = [...panelsArr];
                }
            }
        }

        return response;
    }

    async createPanel(panel: panel): Promise<dbResponse<null>> {
        const response: dbResponse<null> = {
            ok: false,
            error: "",
            body: null,
        };
        if (this.hasDatabase) {
            const apiResponse = await fetch("postPanelApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(panel),
            });
            response.ok = apiResponse.ok;
            if (!response.ok)
                response.error = "Couldn't create panel.Try again";
        } else {
            const allPanels = await this.getAllPanels();
            response.ok = allPanels.ok;
            if (response.ok) {
                allPanels.body.push(panel);
                localStorage.setItem(
                    this.panelLocalStorageKey,
                    JSON.stringify(allPanels.body)
                );
            } else {
                response.error = "Couldn't create panel.Try again";
            }
        }

        return response;
    }

    async createTask(task: task): Promise<dbResponse<null>> {
        const response: dbResponse<null> = {
            ok: false,
            error: "",
            body: null,
        };
        if (this.hasDatabase) {
            const apiResponse = await fetch("postTaskApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });
            response.ok = apiResponse.ok;
            if (!response.ok)
                response.error = "Couldn't create panel.Try again";
        } else {
            const allTasks = await this.getAllTasks();
            response.ok = allTasks.ok;
            if (response.ok) {
                allTasks.body.push(task);
                localStorage.setItem(
                    this.taskLocalStorageKey,
                    JSON.stringify(allTasks.body)
                );
            } else {
                response.error = "Couldn't create panel.Try again";
            }
        }

        return response;
    }

    async updateTask(task: task): Promise<dbResponse<null>> {
        const response: dbResponse<null> = {
            ok: false,
            error: "",
            body: null,
        };
        if (this.hasDatabase) {
            const apiResponse = await fetch("updateTaskApi", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });
            response.ok = apiResponse.ok;
            if (!response.ok) response.error = "Couldn't update task.Try again";
        } else {
            const allTasks = await this.getAllTasks();
            response.ok = allTasks.ok;
            if (response.ok) {
                const updatedArray = allTasks.body.map((t) => {
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
            } else {
                response.error = "Couldn't update task.Try again";
            }
        }

        return response;
    }

    getError() {
        const randomNumber = Math.floor(Math.random() * 4);
        const hasError = randomNumber !== 0;
        const canHaveErrors = this.canHaveError;
        return canHaveErrors ? hasError : false;
    }

    async sleep() {
        await new Promise((resolve) => setTimeout(resolve, this.loadingTime));
        return;
    }
}

const dbService = new DbService();
export default dbService;
