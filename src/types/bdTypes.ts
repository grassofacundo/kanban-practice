type dbResponse<T> = {
    ok: boolean;
    error: string;
    body: T;
};
