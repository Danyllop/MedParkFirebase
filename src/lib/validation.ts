/**
 * Validates a CPF (Cadastro de Pessoas Físicas) number.
 */
export const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

/**
 * Validates a Brazilian phone number (with DDD and 9th digit).
 */
export const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Supports (XX) 9XXXX-XXXX or (XX) XXXX-XXXX
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Validates a Vehicle Plate (Old and Mercosul formats).
 */
export const validatePlate = (plate: string): boolean => {
    const cleanPlate = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Old format: ABC1234
    const oldFormat = /^[A-Z]{3}\d{4}$/;
    // Mercosul format: ABC1D23
    const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;

    return oldFormat.test(cleanPlate) || mercosulFormat.test(cleanPlate);
};
