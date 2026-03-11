export const mockEmployees = [
    { id: 1, name: 'ALAN FERNANDES DA SILVA', cpf: '353.791.447-48', role: 'ENCARREGADO', location: 'ED DE INTERNAÇÃO 2 ANDAR', bond: 'EBSERH', phone: '(62) 98420-5689', status: 'ATIVO', registrationType: 'PERMANENTE' },
    { id: 2, name: 'DANYLLO PEREIRA', cpf: '025.756.941-32', role: 'ENCARREGADO', location: 'ED DE INTERNAÇÃO 2 ANDAR', bond: 'EBSERH', phone: '(62) 98420-5663', status: 'ATIVO', registrationType: 'PROVISÓRIO', expirationDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0] },
    { id: 3, name: 'MARIA OLIVEIRA', cpf: '123.456.789-00', role: 'MÉDICA', location: 'BLOCO CIRÚRGICO', bond: 'UFG', phone: '(62) 91234-5678', status: 'ATIVO', registrationType: 'PROVISÓRIO', expirationDate: new Date().toISOString().split('T')[0] },
];

export const mockVehicles = [
    { id: 1, ownerId: 1, owner: 'ALAN FERNANDES DA SILVA', plate: 'KDC-1234', model: 'TOYOTA COROLLA', color: 'PRATA', status: 'ATIVO', isPrincipal: true, createdAt: '2026-03-01T10:30:00Z' },
    { id: 2, ownerId: 2, owner: 'DANYLLO PEREIRA', plate: 'ABC-5E21', model: 'HONDA CIVIC', color: 'PRETO', status: 'ATIVO', isPrincipal: true, createdAt: '2026-03-05T14:45:00Z' },
    { id: 3, ownerId: 3, owner: 'MARIA OLIVEIRA', plate: 'XYZ-9876', model: 'JEEP COMPASS', color: 'BRANCO', status: 'ATIVO', isPrincipal: true, createdAt: '2026-03-08T09:15:00Z' },
];

export const mockCompanies = [
    { id: 1, name: 'LOGICUP SOLUTIONS', cnpj: '12.345.678/0001-90', segment: 'TECNOLOGIA', contact: '(62) 98888-7777', status: 'ATIVO' },
    { id: 2, name: 'LIMP MAIS LTDA', cnpj: '98.765.432/0001-11', segment: 'SERVIÇOS GERAIS', contact: '(62) 97777-6666', status: 'INATIVO' },
];

export const mockProvidersList = [
    { id: 1, name: 'JOÃO SILVA', cpf: '123.456.789-00', companyId: 1, companyName: 'LOGICUP SOLUTIONS', role: 'DESENVOLVEDOR', phone: '(62) 91111-2222', status: 'ATIVO' },
    { id: 2, name: 'MARIA SANTOS', cpf: '987.654.321-11', companyId: 2, companyName: 'LIMP MAIS LTDA', role: 'AUXILIAR DE LIMPEZA', phone: '(62) 93333-4444', status: 'ATIVO' },
    { id: 3, name: 'CARLOS AUTÔNOMO', cpf: '555.444.333-22', companyId: null, companyName: 'AUTÔNOMO', role: 'REPAROS', phone: '(62) 95555-6666', status: 'ATIVO' },
];

export const mockProviderVehicles = [
    { id: 1, plate: 'ABC-1234', model: 'TOYOTA COROLLA', color: 'PRATA', ownerId: 1, ownerName: 'JOÃO SILVA', companyId: 1, providerId: 1, status: 'ATIVO', createdAt: new Date().toISOString() },
    { id: 2, plate: 'XYZ-9876', model: 'FORD RANGER', color: 'BRANCO', ownerId: 3, ownerName: 'CARLOS AUTÔNOMO', companyId: null, providerId: 3, status: 'ATIVO', createdAt: new Date().toISOString() },
];

export const historyData = [
    { id: 1, timestamp: '10/03/2026 14:30', spot: 'A-042', event: 'ENTRADA', owner: 'ALAN FERNANDES DA SILVA', plate: 'KDC-1234', operator: 'MARIA SILVA' },
    { id: 2, timestamp: '10/03/2026 15:15', spot: 'A-015', event: 'SAÍDA', owner: 'DANYLLO PEREIRA', plate: 'ABC-5E21', operator: 'JOÃO GOMES' },
    { id: 3, timestamp: '10/03/2026 15:45', spot: 'A-088', event: 'RESERVA', owner: 'MARIA OLIVEIRA', plate: 'XYZ-9876', operator: 'MARIA SILVA' },
    { id: 4, timestamp: '10/03/2026 16:20', spot: 'E-012', event: 'ENTRADA', owner: 'JOSE ALMEIDA', plate: 'BRA-1A22', operator: 'RICARDO SOUZA' },
    { id: 5, timestamp: '10/03/2026 17:05', spot: 'A-042', event: 'SAÍDA', owner: 'ALAN FERNANDES DA SILVA', plate: 'KDC-1234', operator: 'JOÃO GOMES' },
];
