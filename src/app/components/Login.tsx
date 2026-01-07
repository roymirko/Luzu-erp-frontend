import { useState, useEffect } from 'react';
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
  onLogin: (email?: string) => void;
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
          <GoogleIcon />
          <p className="font-sans text-[#3c4043] text-[18px] tracking-[0.002px]">
            Sign in with Google
          </p>
        </div>

        {/* Body */}
        <div className="bg-white flex flex-col gap-[112px] items-center pb-[48px] pt-[32px] px-0">
          {/* Main content */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            {/* Heading */}
            <div className="flex flex-col gap-[8px] items-center font-sans text-[#202124]">
              <p className="text-[24px] leading-[32px]">
                Choose an Account
              </p>
              <p className="text-[16px] leading-normal text-center tracking-[0.0018px] w-[420px]">
                to continue to "My App"
              </p>
            </div>

            {/* User Account */}
            <div className="w-full">
              <div
                className="bg-[#e8f0fe] flex flex-col gap-[12px] pb-0 pt-[12px] px-[40px] cursor-pointer hover:bg-[#d3e3fd] transition-colors"
                onClick={() => onLogin('gaby@luzutv.com.ar')}
              >
                <div className="flex gap-[14px] items-center">
                  <div className="bg-white overflow-clip rounded-full size-[32px] shrink-0">
                    <img
                      alt="Gabriela Rivero"
                      className="size-full object-cover"
                      src={imgGabrielProfile}
                    />
                  </div>
                  <div className="flex flex-col gap-px text-[#3c4043]">
                    <p className="font-sans font-medium text-[14px]">
                      Gabriela Rivero
                    </p>
                    <p className="font-sans font-light text-[12px] tracking-[0.024px]">
                      gaby@luzutv.com.ar
                    </p>
                  </div>
                </div>
                <div className="h-0 w-full border-t border-[#DADCE0]" />
              </div>

              {/* Use another account - Trigger Google Auth */}
              <div
                className="flex flex-col gap-[12px] pb-0 pt-[12px] px-[40px] cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onGoogleLogin?.()}
              >
                <div className="flex gap-[14px] items-center">
                  <div className="relative shrink-0 size-[24px]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <g>
                        <mask height="24" id="mask0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
                          <rect fill="#D9D9D9" height="24" width="24" />
                        </mask>
                        <g mask="url(#mask0)">
                          <path d={svgPaths.p3a7f8cc0} fill="#757575" />
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans font-medium text-[#3c4043] text-[14px] tracking-[0.028px]">
                      Use another account
                    </p>
                  </div>
                </div>
                <div className="h-0 w-full border-t border-[#DADCE0]" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-[32px] w-[484px]">
            <div className="flex gap-[8px] items-center px-0 py-[4px]">
              <p className="font-sans text-[#202124] text-[12px] tracking-[0.024px]">
                English
              </p>
              <div className="relative size-[16px]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <g>
                    <mask height="16" id="mask1" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
                      <rect fill="black" height="16" width="16" />
                    </mask>
                    <g mask="url(#mask1)">
                      <g>
                        <path d={svgPaths.p3f5b3680} fill="#202124" />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
            <div className="flex gap-[12px] items-start">
              <div className="flex items-center justify-end p-[4px]">
                <p className="font-sans text-[#80868b] text-[12px] tracking-[0.024px]">
                  Help
                </p>
              </div>
              <div className="flex items-center justify-end p-[4px]">
                <p className="font-sans text-[#80868b] text-[12px] tracking-[0.024px]">
                  Privacy
                </p>
              </div>
              <div className="flex items-center justify-end p-[4px]">
                <p className="font-sans text-[#80868b] text-[12px] tracking-[0.024px]">
                  Terms
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
