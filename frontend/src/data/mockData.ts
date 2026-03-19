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
    {
        id: 'log-1', createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
        spot: 'A-042', event: 'ENTRADA', ownerName: 'ALAN FERNANDES DA SILVA',
        ownerRole: 'ENCARREGADO', ownerPhone: '(62) 98420-5689', plate: 'KDC-1234',
        vehicleModel: 'TOYOTA COROLLA', vehicleColor: 'PRATA',
        operator: { fullName: 'Maria Silva Santos', role: 'OPERADOR' }
    },
    {
        id: 'log-2', createdAt: new Date(Date.now() - 65 * 60000).toISOString(),
        spot: 'A-015', event: 'SAIDA', ownerName: 'DANYLLO PEREIRA',
        ownerRole: 'ENCARREGADO', ownerPhone: '(62) 98420-5663', plate: 'ABC-5E21',
        vehicleModel: 'HONDA CIVIC', vehicleColor: 'PRETO',
        operator: { fullName: 'João Gomes Pereira', role: 'OPERADOR' }
    },
    {
        id: 'log-3', createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
        spot: 'A-088', event: 'RESERVA', ownerName: 'MARIA OLIVEIRA',
        ownerRole: 'MÉDICA', ownerPhone: '(62) 91234-5678', plate: 'XYZ-9876',
        vehicleModel: 'JEEP COMPASS', vehicleColor: 'BRANCO',
        operator: { fullName: 'Maria Silva Santos', role: 'OPERADOR' }
    },
    {
        id: 'log-4', createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
        spot: 'E-012', event: 'ENTRADA', ownerName: 'JOSE ALMEIDA',
        ownerRole: 'PRESTADOR', ownerPhone: null, plate: 'BRA-1A22',
        vehicleModel: 'VW SAVEIRO', vehicleColor: 'BRANCO',
        operator: { fullName: 'Ricardo Souza Lima', role: 'SUPERVISOR' }
    },
    {
        id: 'log-5', createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
        spot: 'A-042', event: 'SAIDA', ownerName: 'ALAN FERNANDES DA SILVA',
        ownerRole: 'ENCARREGADO', ownerPhone: '(62) 98420-5689', plate: 'KDC-1234',
        vehicleModel: 'TOYOTA COROLLA', vehicleColor: 'PRATA',
        operator: { fullName: 'João Gomes Pereira', role: 'OPERADOR' }
    },
    {
        id: 'log-6', createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
        spot: 'E-098', event: 'LIBERACAO', ownerName: 'CARLOS AUTÔNOMO',
        ownerRole: 'PRESTADOR', ownerPhone: '(62) 95555-6666', plate: 'XYZ-0001',
        vehicleModel: 'FORD RANGER', vehicleColor: 'BRANCO',
        operator: { fullName: 'Ricardo Souza Lima', role: 'ADMIN' }
    },
];
