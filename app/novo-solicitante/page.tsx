'use client';

import { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { registrarSolicitante } from "./action";
import { getToken, parseJwt } from '../../utils/auth';
import { getLideres } from '../../core/Liderers';

function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === parseInt(cpf.charAt(10));
}

function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

function maskCEP(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
}

function maskTitulo(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3')
    .trim()
    .slice(0, 14);
}

interface Lider {
  id: number;
  nome: string;
  bairro: string;
}

export default function RegistroPage() {
  const [focused, setFocused] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    titulo: '',
    telefone: '',
    email: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    zona: '',
    pontoReferencia: '',
    secao: '',
    senha: '',
    indicadoPor: '',
    meio: '',
    zonaEleitoral: '',
    observacoes: '',
    liderNome: '',
    liderId: '',
  });

  // console.log('📤 Enviando para API:', form);


  const [errors, setErrors] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [liderDropdownOpen, setLiderDropdownOpen] = useState(false);
  const [lideres, setLideres] = useState<{ id: number, nome: string, bairro: string }[]>([]);

  useEffect(() => {
    const token = getToken();
    const decoded = token ? parseJwt(token) : null;
    const adminStatus = decoded?.adm === true;

    if (!token) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = "/login";
      return;
    }

    if (!adminStatus) {
      alert('Acesso restrito a administradores');
      window.location.href = "/dashboard";
      return;
    }

    getLideres(token)
      .then((data) => setLideres(data))
      .catch((err) => {
        console.error("Erro ao buscar líderes", err);
        setLideres([]);
      });

    setIsAdmin(adminStatus);
    setIsLoading(false);
  }, []);

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#b5e4f1] px-4 py-8">
        <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg text-center">
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'cpf') newValue = maskCPF(value);
    if (name === 'telefone') newValue = maskPhone(value);
    if (name === 'cep') newValue = maskCEP(value);
    if (name === 'titulo') newValue = maskTitulo(value);

    if (name === 'cep') {
      const cleanCep = newValue.replace(/\D/g, '');
      const maskedCep = maskCEP(newValue);
      setForm(prev => ({ ...prev, cep: maskedCep }));

      if (cleanCep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setForm(prev => ({
              ...prev,
              cep: maskedCep,
              endereco: data.logradouro || '',
              bairro: data.bairro || ''
            }));
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
        }
      }
    } else {
      setForm(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async () => {
    const camposObrigatorios = Object.entries(form)
      .filter(([campo, valor]) =>
        campo !== 'indicadoPor' &&
        campo !== 'meio' &&
        !valor.trim()
      );

    if (camposObrigatorios.length > 0) {
      const nomesCampos = camposObrigatorios.map(([campo]) => campo);
      setErrors(nomesCampos);
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!isValidCPF(form.cpf)) {
      alert('CPF inválido.');
      return;
    }

    if (form.titulo.replace(/\D/g, '').length !== 12) {
      alert('Título de eleitor inválido. Deve conter 12 dígitos.');
      return;
    }

    setErrors([]);

    try {
      await registrarSolicitante({
        nomeCompleto: form.nome,
        cpf: form.cpf,
        titulo: form.titulo,
        telefoneContato: form.telefone,
        email: form.email,
        cep: form.cep,
        endereco: form.endereco,
        num: form.numero,
        bairro: form.bairro,
        zona: form.zona,
        pontoReferencia: form.pontoReferencia,
        secaoEleitoral: form.secao,
        senha: form.senha,
        indicadoPor: form.indicadoPor,
        meio: form.meio,
        zonaEleitoral: form.zonaEleitoral,
        observacoes: form.observacoes,
        liderNome: form.liderNome,
      });


      window.location.href = "/dashboard";
    } catch (err) {
      alert(err instanceof Error ? `Erro: ${err.message}` : 'Erro desconhecido ao salvar solicitante.');
    }
  };

  const isError = (campo: string) => errors.includes(campo);

  //  {isAdmin && (

  //  )}

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#b5e4f1] px-4 py-8">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-[#007cb2] border-b border-black pb-1 mb-4">Solicitante</h2>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Dados Pessoal</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">*Nome completo:</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className={`w-full border ${isError('nome') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-sm font-medium">*CPF:</label>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className={`w-full border ${isError('cpf') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Título de Eleitor:</label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                className={`w-full border ${isError('titulo') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-sm font-medium">*Seção Eleitoral:</label>
              <input
                type="text"
                name="secao"
                value={form.secao}
                onChange={handleChange}
                className={`w-full border ${isError('secao') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-sm font-medium">*Telefone:</label>
              <input
                type="text"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className={`w-full border ${isError('telefone') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>
          </div>

          {/* Linha separada com Email e Senha lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-bold">*Digite Seu E-mail:</label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full border ${isError('email') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-sm font-bold">*Crie Sua Senha:</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className={`w-full border ${isError('senha') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>
          </div>

          {/* Linha com Indicado por quem e Meio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            <div>
              <label className="text-sm font-medium">Indicado por quem:</label>
              <input
                type="text"
                name="indicadoPor"
                value={form.indicadoPor}
                onChange={handleChange}
                className={`w-full border ${isError('indicadoPor') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              />
            </div>

            <div className="mb-4">
              <div className="relative">
                <label className="text-sm font-medium">Líder responsável:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.liderId ? `${lideres.find(l => l.id.toString() === form.liderId)?.nome || ''} - ${lideres.find(l => l.id.toString() === form.liderId)?.bairro || ''}` : ''}
                    readOnly
                    onClick={() => setLiderDropdownOpen(!liderDropdownOpen)}
                    className={`w-full border ${isError('liderId') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none cursor-pointer`}
                    placeholder="Selecione um líder..."
                  />
                  <FaChevronDown
                    className={`absolute right-3 top-3 text-[#007cb2] pointer-events-none transition-transform ${liderDropdownOpen ? 'rotate-180' : ''}`}
                    size={14}
                  />
                </div>

                {liderDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border border-[#007cb2] rounded shadow-lg">
                    {lideres.map(lider => (
                      <div
                        key={lider.id}
                        className="px-4 py-2 hover:bg-[#c4f9ff] cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setForm(prev => ({
                            ...prev,
                            liderId: lider.id.toString(),
                            liderNome: lider.nome
                          }));
                          setLiderDropdownOpen(false);
                        }}
                      >
                        <div className="font-medium">{lider.nome}</div>
                        <div className="text-xs text-gray-600">{lider.bairro}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium">*Por qual meio:</label>
              <select
                name="meio"
                value={form.meio}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full appearance-none border ${isError('meio') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 pr-10 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              >
                <option value="">Selecione</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
              <FaChevronDown
                className={`absolute right-3 top-[35px] text-[#007cb2] pointer-events-none transition-transform duration-200 ${focused || form.meio ? 'rotate-180' : ''}`}
                size={14}
              />
            </div>
          </div>
        </div>


        <div className="mb-4">
          <h3 className="font-semibold mb-2">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['Cep:', 'cep'],
              ['Endereço:', 'endereco'],
              ['Número:', 'numero'],
              ['Bairro:', 'bairro'],
              ['Ponto Referência:', 'pontoReferencia'],
              ['Zona eleitoral:', 'zonaEleitoral']
            ].map(([label, name]) => (
              <div key={name}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  name={name}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className={`w-full border ${isError(name) ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
                />
              </div>
            ))}

            <div className="relative">
              <label className="text-sm font-medium">*Zona:</label>
              <select
                name="zona"
                value={form.zona}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full appearance-none border ${isError('zona') ? 'border-red-500' : 'border-[#007cb2]'} rounded px-2 py-1 pr-10 focus:ring-2 focus:ring-[#007cb2] focus:outline-none`}
              >
                <option value="">Selecione</option>
                <option value="Urbana">Urbana</option>
                <option value="Rural">Rural</option>
              </select>

              <FaChevronDown
                className={`absolute right-3 top-[35px] text-[#007cb2] pointer-events-none transition-transform duration-200 ${focused || form.zona ? 'rotate-180' : ''}`}
                size={14}
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Observações</h3>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            rows={3}
            placeholder="Digite informações adicionais, anotações ou histórico..."
            className="w-full border border-[#007cb2] rounded px-2 py-1 focus:ring-2 focus:ring-[#007cb2] focus:outline-none resize-none"
          />
        </div>


        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-100 border border-gray-300 text-gray-800 px-5 py-2 rounded hover:bg-gray-200 transition"
          >
            Voltar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#007cb2] text-white px-6 py-2 rounded hover:bg-[#00689c] transition"
          >
            Gravar
          </button>
        </div>
      </div>
    </div>
  );
}
