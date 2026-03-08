export const validateFilters = (filters: any) => {
    const validatedFilters = { ...filters };

    if (typeof filters.username !== 'string') {
        validatedFilters.username = '';
    }

    if (typeof filters.action !== 'string') {
        validatedFilters.action = '';
    }

    if (typeof filters.page !== 'number' || filters.page < 1) {
        validatedFilters.page = 1;
    }

    return validatedFilters;
};