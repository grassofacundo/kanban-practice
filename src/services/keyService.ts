class KeyService {
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

const keyService = new KeyService();
export default keyService;
