type statusName = string;

export interface task {
    id: string;
    title: string;
    description: string;
    statusPanel: statusName;
}

export interface panel {
    id: string;
    name: statusName;
    tasks?: task[];
}

export interface taskData {
    id?: string;
    title?: string;
    description?: string;
    statusPanel: statusName;
}
