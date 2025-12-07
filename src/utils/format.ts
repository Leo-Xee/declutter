export function formatNumberIntl(value?: string | number | null) {
    if (value === null || value === undefined || value === '') return '';

    const num = Number(value);

    if (Number.isNaN(num) || !Number.isFinite(num)) return '';

    return Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(num);
}
