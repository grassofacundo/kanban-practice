type statusName = string;

type task = {
    id: string;
    title: string;
    description: string;
    statusPanel: statusName;
};

type panel = {
    id: string;
    name: statusName;
    tasks?: task[];
};

type taskData = {
    id?: string;
    title?: string;
    description?: string;
    statusPanel: statusName;
};
