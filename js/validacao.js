export function valida(input) {
  const tipoDeInput = input.dataset.tipo;

  if (validadores[tipoDeInput]) {
    validadores[tipoDeInput](input);
  }

  if (input.validity.valid) {
    input.parentElement.classList.remove("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
  } else {
    input.parentElement.classList.add("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
      mostraMensagemDeErro(tipoDeInput, input);
  }
}

const tiposDeErro = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "customError",
];

const mensagensDeErro = {
  nome: {
    valueMissing: "O campo de nome não pode estar vazio.",
  },
  email: {
    valueMissing: "O campo de email não pode estar vazio.",
    typeMismatch: "O email digitado não é válido.",
  },
  senha: {
    valueMissing: "O campo de senha não pode estar vazio.",
    patternMismatch:
      "A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.",
  },
  dataNascimento: {
    valueMissing: "O campo de data de nascimento não pode estar vazio.",
    customError: "Você deve ser maior que 18 anos para se cadastrar.",
  },
  cpf: {
    valueMissing: "O campo de CPF não pode estar vazio.",
    customError: "O CPF digitado não é válido.",
  },
  cep: {
    valueMissing: "O campo de CEP não pode estar vazio.",
    patternMismatch: "O CEP digitado não é válido.",
    customError: "Não foi possível buscar o CEP.",
  },
  logradouro: {
    valueMissing: "O campo de logradouro não pode estar vazio.",
  },
  cidade: {
    valueMissing: "O campo de cidade não pode estar vazio.",
  },
  estado: {
    valueMissing: "O campo de estado não pode estar vazio.",
  },
};

const validadores = {
  dataNascimento: (input) => validaDataNascimento(input),
  cpf: (input) => validaCPF(input),
  cep: (input) => recuperarCEP(input),
};

function mostraMensagemDeErro(tipoDeInput, input) {
  let mensagem = "";
  tiposDeErro.forEach((erro) => {
    if (input.validity[erro]) {
      mensagem = mensagensDeErro[tipoDeInput][erro];
    }
  });

  return mensagem;
}

function validaDataNascimento(input) {
  const dataRecebida = new Date(input.value);
  let mensagem = "";

  if (!maiorQue18(dataRecebida)) {
    mensagem = "Você deve ser maior que 18 anos para se cadastrar.";
  }

  input.setCustomValidity(mensagem);
}

function maiorQue18(data) {
  const dataAtual = new Date();
  const dataMais18 = new Date(
    data.getUTCFullYear() + 18,
    data.getUTCMonth(),
    data.getUTCDate()
  );

  return dataMais18 <= dataAtual;
}

function validaCPF(input) {
  const cpfFormatado = input.value.replace(/\D/g, "");
  let mensagem = "";

  if (!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
    mensagem = "O CPF digitado não é válido.";
  }

  input.setCustomValidity(mensagem);
}

function checaCPFRepetido(cpf) {
  const valoresRepetidos = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];
  let cpfValido = true;

  valoresRepetidos.forEach((valor) => {
    if (valor == cpf) {
      cpfValido = false;
    }
  });

  return cpfValido;
}

function checaEstruturaCPF(cpf) {
  const multiplicador = 10;

  return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
  if (multiplicador >= 12) {
    return true;
  }

  let multiplicadorInicial = multiplicador;
  let soma = 0;
  const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split("");
  const digitoVerificador = cpf.charAt(multiplicador - 1);
  for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
    soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
    contador++;
  }

  if (digitoVerificador == confirmaDigito(soma)) {
    return checaDigitoVerificador(cpf, multiplicador + 1);
  }

  return false;
}

function confirmaDigito(soma) {
  return 11 - (soma % 11);
}

function recuperarCEP(input) {
  const cep = input.value.replace(/\D/g, "");
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const options = {
    method: "GET",
    mode: "cors",
    headers: {
      "content-type": "application/json;charset=utf-8",
    },
  };

  if (!input.validity.patternMismatch && !input.validity.valueMissing) {
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          input.setCustomValidity("Não foi possível buscar o CEP.");
          return;
        }
        input.setCustomValidity("");
        preencheCamposComCEP(data);
        return;
      });
  }
}

function preencheCamposComCEP(data) {
  const logradouro = document.querySelector('[data-tipo="logradouro"]');
  const cidade = document.querySelector('[data-tipo="cidade"]');
  const estado = document.querySelector('[data-tipo="estado"]');

  logradouro.value = data.logradouro;
  cidade.value = data.localidade;
  estado.value = data.uf;
}

export function validaNome(input) {
  const regexNome = /^[A-Za-zÀ-ÿ\s]{3,}$/;
  if (!regexNome.test(input.value.trim())) {
    input.setCustomValidity(
      "O campo de nome deve ter pelo menos 3 caracteres e não pode conter números."
    );
  } else {
    input.setCustomValidity("");
  }
}

export function validaQuantidade(input) {
  const regexQuantidade = /^[1-9]\d*$/;
  if (!regexQuantidade.test(input.value.trim())) {
    input.setCustomValidity(
      "A quantidade em estoque deve ser um número inteiro positivo maior que zero."
    );
  } else {
    input.setCustomValidity("");
  }
}

export function validaFormulario(form) {
  // Validar o campo Nome
  const nome = form.querySelector("#nome");
  validaNome(nome);

  const quantidade = form.querySelector("#quantidade");
  validaQuantidade(quantidade);

  if (!nome.validity.valid || !quantidade.validity.valid) {
    return false;
  }

  return true;
}
// Função para validar o campo Telefone (DDD + Número)
export function validaTelefone(input) {
  const telefone = input.value;
  // Regex para os diferentes formatos possíveis
  const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  const ddd = telefone.substring(0, 2);
  const dddValido = /^[1-9]{2}$/; // DDD deve ser entre 10 e 99

  if (!regexTelefone.test(telefone) || !dddValido.test(ddd)) {
    input.setCustomValidity(
      "Telefone inválido. O número deve seguir o formato: (83)99131-3434"
    );
  } else {
    input.setCustomValidity("");
  }
}

// Função para validar o campo Instagram (deve começar com @)
export function validaInstagram(input) {
  const instagram = input.value;

  if (!instagram.startsWith("@") || instagram.trim() === "") {
    input.setCustomValidity(
      "O Instagram deve começar com @ e não pode estar vazio."
    );
  } else {
    input.setCustomValidity("");
  }
}

// Função para validar o CPF
export function validaCPF(input) {
  const cpf = input.value.replace(/\D/g, ""); // Remove qualquer caractere não numérico
  const regexCpf = /^[0-9]{11}$/; // Verifica se tem 11 números

  if (!regexCpf.test(cpf)) {
    input.setCustomValidity("O CPF deve conter 11 dígitos numéricos.");
    return;
  }

  if (checaCPFRepetido(cpf) || !checaEstruturaCPF(cpf)) {
    input.setCustomValidity("O CPF digitado não é válido.");
  } else {
    input.setCustomValidity("");
  }
}

// Função para verificar se o CPF é repetido
function checaCPFRepetido(cpf) {
  const valoresRepetidos = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];

  return valoresRepetidos.includes(cpf);
}

// Função para verificar a estrutura do CPF (algoritmo dos dois últimos dígitos)
function checaEstruturaCPF(cpf) {
  let soma = 0;
  let resto;
  const cpfArray = cpf.split("");

  // Verificando o primeiro dígito
  for (let i = 0; i < 9; i++) {
    soma += cpfArray[i] * (10 - i);
  }

  resto = soma % 11;
  if (resto < 2) {
    if (cpfArray[9] !== "0") return false;
  } else {
    if (cpfArray[9] !== 11 - resto) return false;
  }

  // Verificando o segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += cpfArray[i] * (11 - i);
  }

  resto = soma % 11;
  if (resto < 2) {
    if (cpfArray[10] !== "0") return false;
  } else {
    if (cpfArray[10] !== 11 - resto) return false;
  }

  return true;
}

// Função de validação do formulário
export function validaFormulario(form) {
  // Validar o campo Telefone
  const telefone = form.querySelector("#telefone");
  validaTelefone(telefone);

  // Validar o campo Instagram
  const instagram = form.querySelector("#instagram");
  validaInstagram(instagram);

  // Validar o campo CPF
  const cpf = form.querySelector("#cpf");
  validaCPF(cpf);

  // Verifica se o formulário está válido
  if (
    !telefone.validity.valid ||
    !instagram.validity.valid ||
    !cpf.validity.valid
  ) {
    return false; // Impede o envio do formulário
  }

  return true; // Permite o envio do formulário
}
