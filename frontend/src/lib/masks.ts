/**
 * Applies a mask to a CPF string.
 */
export const maskCPF = (value: string): string => {
    return value
        .replace(/\D/g, '') // Remove non-digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); // Limit total digits
};

/**
 * Applies a mask to a Brazilian phone number.
 */
export const maskPhone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length <= 10) {
        // (00) 0000-0000
        return cleanValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    } else {
        // (00) 00000-0000
        return cleanValue
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
};
