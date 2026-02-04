import { useState, useEffect, FormEvent } from 'react';
import svgPaths from "../../imports/svg-fwymm7vmaf";
import imgListasYoutubeadm1 from "../../assets/LISTAS-YOUTUBEADM.jpg";
import imgListasYoutubeXm1 from "../../assets/LISTAS-YOUTUBE-XM.jpg";
import imgListasYoutubeSfl1 from "../../assets/LISTAS-YOUTUBE-SFL.jpg";
import imgListasYoutubePyf1 from "../../assets/LISTAS-YOUTUBE-PYF.jpg";
import imgListasYoutubeNdn1 from "../../assets/LISTAS-YOUTUBE-NDN.jpg";
import imgListasYoutubeLn1 from "../../assets/LISTAS-YOUTUBE-LN.jpg";
import imgListasYoutubeFm11 from "../../assets/LISTAS-YOUTUBE-FM-1.jpg";
import imgListasYoutubeEe1 from "../../assets/LISTAS-YOUTUBE-EE.jpg";
import imgListasYoutubeAvap1 from "../../assets/LISTAS-YOUTUBE-AVAP.jpg";
import imgListasYoutubeAqn1 from "../../assets/LISTAS-YOUTUBE-AQN.jpg";
import imgFondo1 from "../../assets/fondo.png";
import imgGabrielProfile from "../../assets/GabrielRivero.jpg";

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onGoogleLogin?: () => void;
}

const channelImages = [
  imgListasYoutubeFm11,
  imgListasYoutubeAqn1,
  imgListasYoutubeNdn1,
  imgListasYoutubePyf1,
  imgListasYoutubeSfl1,
  imgListasYoutubeLn1,
  imgListasYoutubeAvap1,
  imgListasYoutubeadm1,
  imgListasYoutubeEe1,
  imgListasYoutubeXm1,
];

function Fondo({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute h-[461.97px] w-[441.423px] ${className}`}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 441.423 461.97">
        <g>
          <path d={svgPaths.p8405600} fill="#38D1C4" />
          <path d={svgPaths.p297b6500} fill="#F9D7F2" />
          <path d={svgPaths.p3204b600} fill="#F7C317" />
          <path d={svgPaths.p23029600} fill="#EA173E" />
        </g>
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <div className="relative shrink-0 size-[32px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 31.9999">
        <g>
          <g>
            <path clipRule="evenodd" d={svgPaths.p751b200} fill="#4285F4" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2e961f80} fill="#34A853" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p7010900} fill="#FBBC05" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3d5c1800} fill="#EA4335" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function ImageCarousel() {
  const [offset, setOffset] = useState(0);

  // Duplicar imágenes para loop infinito
  const allImages = [...channelImages, ...channelImages, ...channelImages];

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        // Ancho de cada imagen + gap (168.691 + 28 aproximadamente = 197px)
        const itemWidth = 197;
        const newOffset = prev - 1;

        // Resetear cuando llegue al final del primer set
        if (Math.abs(newOffset) >= itemWidth * channelImages.length) {
          return 0;
        }

        return newOffset;
      });
    }, 30); // Velocidad medianamente lenta (30ms por frame)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-[40px] left-0 w-full overflow-hidden h-[95px]">
      <div
        className="flex gap-[28px] transition-none"
        style={{
          transform: `translateX(${offset}px)`,
          width: 'max-content'
        }}
      >
        {allImages.map((img, idx) => (
          <div
            key={idx}
            className="h-[94.889px] w-[168.691px] rounded-[20px] shrink-0 overflow-hidden"
          >
            <img
              alt=""
              className="size-full object-cover"
              src={img}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Login({ onLogin, onGoogleLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email y contraseña requeridos');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onLogin(email, password);

    if (!result.success) {
      setError(result.error || 'Credenciales inválidas');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white relative w-screen h-screen overflow-hidden">
      {/* Fondo con opacidad */}
      <div className="absolute h-full left-0 opacity-[0.45] top-0 w-full">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-full left-0 max-w-none top-0 w-full object-cover" src={imgFondo1} />
        </div>
      </div>

      {/* Fondos decorativos */}
      <Fondo className="right-0 top-0" />
      <Fondo className="left-[-90px] bottom-0" />

      {/* Card de login centrada */}
      <div className="absolute bg-white left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[499px] shadow-[0_2px_10px_rgba(0,0,0,0.2)] border border-[rgba(0,0,0,0.22)]">
        {/* Header */}
        <div className="bg-white flex items-center gap-[16px] pl-[40px] pr-[32px] py-[16px] border-b border-[rgba(0,0,0,0.22)]">
          <div className="size-[32px] rounded-full bg-[#EA173E] flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <p className="font-sans text-[#3c4043] text-[18px] tracking-[0.002px]">
            Iniciar sesión en Luzu ERP
          </p>
        </div>

        {/* Body */}
        <div className="bg-white flex flex-col gap-[32px] items-center pb-[48px] pt-[32px] px-[40px]">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[24px] w-full">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-[8px]">
              <label className="font-sans text-[#3c4043] text-[14px]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border border-[#DADCE0] rounded-md font-sans text-[14px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="font-sans text-[#3c4043] text-[14px]">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#DADCE0] rounded-md font-sans text-[14px] focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a73e8] text-white py-3 rounded-md font-sans font-medium text-[14px] hover:bg-[#1557b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-px bg-[#DADCE0]" />
            <span className="text-[#5f6368] text-[12px]">o</span>
            <div className="flex-1 h-px bg-[#DADCE0]" />
          </div>

          {/* Google OAuth */}
          <button
            onClick={() => onGoogleLogin?.()}
            className="w-full flex items-center justify-center gap-3 border border-[#DADCE0] py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            <span className="font-sans text-[#3c4043] text-[14px]">Continuar con Google</span>
          </button>

          {/* Footer */}
          <div className="flex items-center justify-between w-full pt-4">
            <div className="flex gap-[8px] items-center px-0 py-[4px]">
              <p className="font-sans text-[#202124] text-[12px] tracking-[0.024px]">
                Español
              </p>
            </div>
            <div className="flex gap-[12px] items-start">
              <div className="flex items-center justify-end p-[4px]">
                <p className="font-sans text-[#80868b] text-[12px] tracking-[0.024px]">
                  Ayuda
                </p>
              </div>
              <div className="flex items-center justify-end p-[4px]">
                <p className="font-sans text-[#80868b] text-[12px] tracking-[0.024px]">
                  Privacidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel de imágenes */}
      <ImageCarousel />
    </div>
  );
}
