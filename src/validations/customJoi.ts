import Joi from 'joi';

/**
 * Valida um CPF (Cadastro de Pessoas Físicas)
 * @param value CPF a ser validado
 * @returns true se o CPF for válido, false caso contrário
 */
const validateCPF = (value: string): boolean => {
  const cpf = value.replace(/[\D]/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  return remainder === parseInt(cpf.substring(10, 11));
};

/**
 * Valida um CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * @param value CNPJ a ser validado
 * @returns true se o CNPJ for válido, false caso contrário
 */
const validateCNPJ = (value: string): boolean => {
  const cnpj = value.replace(/[\D]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Valida primeiro dígito verificador
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Valida segundo dígito verificador
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
};

// Extensão Joi para validação de CPF/CNPJ
const customJoi = Joi.extend((joi) => ({
  type: 'document',
  base: joi.string(),
  messages: {
    'document.cpf': 'CPF inválido',
    'document.cnpj': 'CNPJ inválido',
    'document.invalid': 'Documento inválido. Deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)'
  },
  rules: {
    cpf: {
      validate(value, helpers) {
        const cleanValue = value.replace(/[\D]/g, '');
        if (cleanValue.length !== 11) {
          return helpers.error('document.cpf');
        }
        return validateCPF(value) ? value : helpers.error('document.cpf');
      }
    },
    cnpj: {
      validate(value, helpers) {
        const cleanValue = value.replace(/[\D]/g, '');
        if (cleanValue.length !== 14) {
          return helpers.error('document.cnpj');
        }
        return validateCNPJ(value) ? value : helpers.error('document.cnpj');
      }
    },
    cpfCnpj: {
      validate(value, helpers) {
        const cleanValue = value.replace(/[\D]/g, '');
        
        if (cleanValue.length === 11) {
          return validateCPF(value) ? value : helpers.error('document.cpf');
        } else if (cleanValue.length === 14) {
          return validateCNPJ(value) ? value : helpers.error('document.cnpj');
        }
        
        return helpers.error('document.invalid');
      }
    }
  }
}));

export { customJoi };
