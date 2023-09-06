type dbResponse<T> = {
    ok: boolean;
    error: string;
    body: T;
};

type message = {
    content: string;
    isError: boolean;
};
