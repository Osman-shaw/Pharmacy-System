export const logDebug = (message: string) => {
    if (process.env.NODE_ENV !== 'production') {
        console.debug(`[DEBUG]: ${message}`);
    }
};