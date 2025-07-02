'use client'

import React, { useRef } from 'react';
import Image from 'next/image';
import Logo from '../assets/img/LogoN.png';
import Imagem1 from '../assets/img/pet.jpeg';
import Imagem2 from '../assets/img/IMG_1725.png';
import imagem3 from "../assets/img/IMG_8434.jpg";
import imagem4 from "../assets/img/IMG_9057.jpg";
import imagem5 from "../assets/img/IMG_9602.jpg";
import imagem6 from "../assets/img/IMG_9603.jpg";
import imagem7 from "../assets/img/fala.jpeg";
import imagem8 from "../assets/img/comunidade.jpeg";
import imagem9 from "../assets/img/diploma.jpeg";
import imagem10 from "../assets/img/IMG_8429.jpg";
import imagem11 from "../assets/img/palank.jpeg";

export default function RenatoLyraHomePage() {
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="bg-[#007cb2] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src={Logo} alt="Renato Lyra" width={150} height={150} className="rounded-full" />
          </div>
          <nav className="space-x-6">
            <a href="#sobre" className="hover:underline">Sobre</a>
            <a href="#servicos" className="hover:underline">Serviços</a>
            <a href="#fotos" className="hover:underline">Fotos</a>
          </nav>
        </div>
      </header>

      {/* Sobre */}
      <section id="sobre" className="py-12 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="w-full h-auto rounded-xl overflow-hidden shadow-md">
            <Image
              src={imagem11}
              alt="Renato Lyra em ação"
              className="w-full h-auto object-cover rounded-xl"
              placeholder="blur"
            />
          </div>
          <div className="text-justify">
            <h3 className="text-2xl font-bold mb-4 text-[#007cb2]">Quem é Renato Lyra</h3>
            <p className="text-lg leading-relaxed text-gray-800">
              Renato Lyra é vereador de Caruaru e atual Secretário de Sustentabilidade e Bem-Estar Animal, com uma trajetória marcada pelo compromisso com o desenvolvimento humano, ambiental e social da cidade. Reconhecido por sua atuação firme e sensível nas causas que mais afetam a vida das pessoas, Renato é um defensor incansável dos animais, da justiça social e da preservação do meio ambiente.
              <br /><br />
              Sua atuação se destaca pela presença constante nas comunidades, pelo olhar atento às necessidades dos bairros mais carentes, e pela promoção de políticas públicas eficazes nas áreas de saúde, educação, proteção animal e sustentabilidade. À frente da Secretaria de Sustentabilidade, tem ampliado a pauta ambiental de Caruaru, enfrentando os desafios impostos pelas mudanças climáticas com ações práticas e integradas que fortalecem a resiliência da cidade.
              <br /><br />
              Renato Lyra é mais que um representante político — é um ativista que se dedica diariamente à construção de uma Caruaru mais justa, inclusiva, sustentável e solidária. Seu trabalho conecta as necessidades reais da população com soluções acessíveis, inovadoras e humanas, fazendo da política um verdadeiro instrumento de transformação social.
            </p>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-12 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center min-h-[500px]">
          <div className="flex flex-col justify-center h-full text-justify">
            <h3 className="text-2xl font-bold text-[#007cb2] mb-4">Serviços</h3>
            <p className="text-lg text-gray-700 mb-4">
              Nosso mandato é pautado pelo compromisso com as causas que realmente importam. Dedicamos atenção especial aos <strong>cuidados com os animais</strong>, promovendo ações de bem-estar, acolhimento e atendimento veterinário. Também valorizamos profundamente a <strong>educação</strong>, investindo em iniciativas que fortalecem o aprendizado e ampliam oportunidades para crianças, jovens e adultos em nossa cidade.
              <br /><br />
              Se você precisa cadastrar um <strong>atendimento PET</strong> ou deseja solicitar algum <strong>serviço público essencial</strong>, estamos aqui para ajudar. Clique no botão abaixo e participe ativamente da construção de uma Caruaru mais justa, humana e inclusiva.
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center mt-4 bg-[#007cb2] text-white px-6 py-3 rounded-full font-medium hover:bg-[#00689c] transition text-center"
            >
              Clique aqui para solicitar algum serviço
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-1/2 h-[320px] relative rounded-xl overflow-hidden shadow-md">
                <Image src={Imagem1} alt="Atendimento pet" fill className="object-cover" />
              </div>
              <div className="w-1/2 h-[320px] relative rounded-xl overflow-hidden shadow-md">
                <Image src={imagem5} alt="Ação com comunidade" fill className="object-cover" />
              </div>
            </div>
            <div className="w-full aspect-video relative rounded-xl overflow-hidden shadow-md">
              <Image src={imagem6} alt="Renato em visita" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="fotos" className="py-12 px-4 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-[#007cb2] mb-6">Galeria</h3>

        <div className="flex items-center gap-4">
          <button
            onClick={() => scroll('left')}
            className="text-3xl text-[#007cb2] bg-transparent hover:scale-110 transition-transform"
            aria-label="Voltar"
          >
            &lt;
          </button>

          <div
            ref={carouselRef}
            className="flex space-x-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 hide-scrollbar"
          >
            {[imagem3, imagem4, imagem8, imagem9, imagem10].map((img, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-72 snap-start rounded-lg overflow-hidden shadow-md"
              >
                <Image
                  src={img}
                  alt={`Renato em ação ${idx + 1}`}
                  width={500}
                  height={300}
                  className="object-cover w-full h-64"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="text-3xl text-[#007cb2] bg-transparent hover:scale-110 transition-transform"
            aria-label="Avançar"
          >
            &gt;
          </button>
        </div>
      </section>

      {/* Footer */}
        <footer className="bg-[#007cb2] text-white py-6 px-4">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-sm">
    <p>© {new Date().getFullYear()} Renato Lyra. Todos os direitos reservados.</p>
    <p>
      Desenvolvido por{' '}
      <a
        href="https://solutionscompanyltda.com.br/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-200 transition"
      >
        Solutions Company LTDA
      </a>
    </p>
  </div>
</footer>
    </div>
  );
}
