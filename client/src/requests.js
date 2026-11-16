export default class Requests {
    static async request(input, init) {
        const response = await fetch(input, init);

        if (response.status === 401) {
            window.dispatchEvent(new Event('unauthorized'));
            return response;
        }

        if (!response.ok)
            console.error(await response.text());

        return response;
    };

    static async withLoading(action, setIsLoadingActive) {
        setIsLoadingActive(true);
        try {
            return await action();
        } finally {
            setIsLoadingActive(false);
        }
    };
}