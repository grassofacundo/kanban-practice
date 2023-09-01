import { panel, task } from "../types/kanbanElements";

class KanbanService {
    getTaskById(taskId: string, allTasks: task[]): task | null {
        return allTasks.find((task) => task.id === taskId) ?? null;
    }

    getTasksByStatus(panelId: string, allTasks: task[]): task[] {
        return allTasks.filter((task) => task.statusPanel === panelId);
    }

    getPanelById(panelId: string, allPanels: panel[]): panel | null {
        return allPanels.find((panel) => panel.id === panelId) ?? null;
    }

    elementExists(id: string, existing: Array<task | panel>) {
        return !!existing.find((item) => item.id === id);
    }

    createUniqueId(existing: Array<task | panel>) {
        const length = 10;
        const limit = 100;
        let attempts = 0;
        let id = "";
        while (!id && attempts < limit) {
            id = Math.random()
                .toString(36)
                .substring(2, length + 2);
            if (this.elementExists(id, existing)) {
                id = "";
                attempts++;
            }
        }
        return id;
    }
}

const kanbanService = new KanbanService();
export default kanbanService;
