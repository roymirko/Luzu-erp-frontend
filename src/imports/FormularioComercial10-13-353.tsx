import svgPaths from "./svg-fwymm7vmaf";
import clsx from "clsx";
import imgProfileImage from "../assets/Miguel Uccello.jpeg";
import imgUnsplashFyl8SMc2J2Q from "../assets/luzu_tv_cover.jpeg";
import imgListasYoutubeadm1 from "../assets/LISTAS-YOUTUBEADM.jpg";
import imgListasYoutubeXm1 from "../assets/LISTAS-YOUTUBE-XM.jpg";
import imgListasYoutubeSfl1 from "../assets/LISTAS-YOUTUBE-SFL.jpg";
import imgListasYoutubePyf1 from "../assets/LISTAS-YOUTUBE-PYF.jpg";
import imgListasYoutubeNdn1 from "../assets/LISTAS-YOUTUBE-NDN.jpg";
import imgListasYoutubeLn1 from "../assets/LISTAS-YOUTUBE-LN.jpg";
import imgListasYoutubeFm11 from "../assets/LISTAS-YOUTUBE-FM-1.jpg";
import imgListasYoutubeEe1 from "../assets/LISTAS-YOUTUBE-EE.jpg";
import imgListasYoutubeAvap1 from "../assets/LISTAS-YOUTUBE-AVAP.jpg";
import imgListasYoutubeAqn1 from "../assets/LISTAS-YOUTUBE-AQN.jpg";
import imgFondo1 from "../assets/fondo.png";
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="content-stretch flex items-center justify-end p-[4px] relative shrink-0">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#80868b] text-[12px] text-nowrap tracking-[0.024px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}

function Helper() {
  return (
    <div className="h-0 relative shrink-0 w-[419px]">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 419 1">
          <line id="Line 2" stroke="var(--stroke-0, #DADCE0)" x2="419" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}
type FondoProps = {
  additionalClassNames?: string;
};

function Fondo({ additionalClassNames = "" }: FondoProps) {
  return (
    <div className={clsx("absolute h-[461.97px] w-[441.423px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 441.423 461.97">
        <g id="FONDO">
          <path d={svgPaths.p8405600} fill="var(--fill-0, #38D1C4)" id="Vector 1" />
          <path d={svgPaths.p297b6500} fill="var(--fill-0, #F9D7F2)" id="Vector 2" />
          <path d={svgPaths.p3204b600} fill="var(--fill-0, #F7C317)" id="Vector 3" />
          <path d={svgPaths.p23029600} fill="var(--fill-0, #EA173E)" id="Vector 4" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col font-['Roboto:Regular',sans-serif] font-normal gap-[8px] items-center relative shrink-0 text-[#202124]" data-name="Heading">
      <p className="leading-[32px] relative shrink-0 text-[24px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Choose an Account
      </p>
      <p className="leading-[normal] relative shrink-0 text-[16px] text-center tracking-[0.0018px] w-[420px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        to continue to “My App”
      </p>
    </div>
  );
}

function ProfileImage() {
  return (
    <div className="absolute bg-white inset-0 overflow-clip" data-name="Profile Image">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgProfileImage} />
    </div>
  );
}

function User() {
  return (
    <div className="absolute bg-white left-0 overflow-clip rounded-[64px] size-[32px] top-0" data-name="_user">
      <ProfileImage />
      <div className="absolute inset-[0_0_-49.7%_0]" data-name="unsplash:Fyl8sMC2j2Q">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[79.38%] left-[-9.46%] max-w-none top-[-4.37%] w-[118.84%]" src={imgUnsplashFyl8SMc2J2Q} />
        </div>
      </div>
    </div>
  );
}

function UserImage() {
  return (
    <div className="bg-white overflow-clip relative rounded-[96px] shrink-0 size-[32px]" data-name="User Image">
      <User />
    </div>
  );
}

function Details() {
  return (
    <div className="content-stretch flex flex-col gap-px items-start leading-[normal] relative shrink-0 text-[#3c4043] text-nowrap" data-name="Details">
      <p className="font-['Roboto:Medium',sans-serif] font-medium relative shrink-0 text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Miguel Uccello
      </p>
      <p className="font-['Roboto:Light',sans-serif] font-light relative shrink-0 text-[12px] tracking-[0.024px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        muccello@gmail.com
      </p>
    </div>
  );
}

function Profile() {
  return (
    <div className="content-stretch flex gap-[14px] items-center relative shrink-0" data-name="Profile">
      <UserImage />
      <Details />
    </div>
  );
}

function UserAccount() {
  return (
    <div className="bg-[#e8f0fe] content-stretch flex flex-col gap-[12px] items-start pb-0 pt-[12px] px-[40px] relative shrink-0" data-name="User Account">
      <Profile />
      <Helper />
    </div>
  );
}

function AccountCircle() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="account_circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="account_circle">
          <mask height="24" id="mask0_13_366" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="24" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="24" id="Bounding box" width="24" />
          </mask>
          <g mask="url(#mask0_13_366)">
            <path d={svgPaths.p3a7f8cc0} fill="var(--fill-0, #757575)" id="account_circle_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Details1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Details">
      <p className="font-['Roboto:Medium',sans-serif] font-medium leading-[normal] relative shrink-0 text-[#3c4043] text-[14px] text-nowrap tracking-[0.028px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Use another account
      </p>
    </div>
  );
}

function Profile1() {
  return (
    <div className="content-stretch flex gap-[14px] items-center relative shrink-0" data-name="Profile">
      <AccountCircle />
      <Details1 />
    </div>
  );
}

function AnotherAccount() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pb-0 pt-[12px] px-[40px] relative shrink-0" data-name="Another Account">
      <Profile1 />
      <Helper />
    </div>
  );
}

function AccountsContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Accounts Container">
      <UserAccount />
      <AnotherAccount />
    </div>
  );
}

function MainBody() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-center relative shrink-0" data-name="Main Body">
      <Heading />
      <AccountsContainer />
    </div>
  );
}

function ArrowDropDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow_drop_down">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="arrow_drop_down">
          <mask height="16" id="mask0_13_378" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="16" x="0" y="0">
            <rect fill="var(--fill-0, black)" height="16" id="Bounding box" width="16" />
          </mask>
          <g mask="url(#mask0_13_378)">
            <g id="arrow_drop_down_2">
              <path d={svgPaths.p3f5b3680} fill="var(--fill-0, #202124)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

function Language() {
  return (
    <div className="content-stretch flex gap-[8px] items-center px-0 py-[4px] relative shrink-0" data-name="Language">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#202124] text-[12px] text-nowrap tracking-[0.024px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        English
      </p>
      <ArrowDropDown />
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0" data-name="Links">
      <Text text="Help" />
      <Text text="Privacy" />
      <Text text="Terms" />
    </div>
  );
}

function Footer() {
  return (
    <div className="content-stretch flex items-center justify-between px-[32px] py-0 relative shrink-0 w-[484px]" data-name="Footer">
      <Language />
      <Links />
    </div>
  );
}

function Body() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[112px] items-center left-0 pb-[48px] pt-[32px] px-0 top-[64px]" data-name="Body">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.22)] border-solid inset-[-1px] pointer-events-none" />
      <MainBody />
      <Footer />
    </div>
  );
}

function GoogleIcon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Google Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 31.9999">
        <g id="Google Icon">
          <g id="Vector">
            <path clipRule="evenodd" d={svgPaths.p751b200} fill="#4285F4" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p2e961f80} fill="#34A853" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p7010900} fill="#FBBC05" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3d5c1800} fill="var(--fill-0, #EA4335)" fillRule="evenodd" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="App Header">
      <GoogleIcon />
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#3c4043] text-[18px] text-nowrap tracking-[0.002px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Sign in with Google
      </p>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-start left-0 pl-[40px] pr-[32px] py-[16px] top-[-1px] w-[499px]" data-name="Header">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.22)] border-solid inset-[-1px] pointer-events-none" />
      <AppHeader />
    </div>
  );
}

function Account() {
  return (
    <div className="absolute bg-white h-[484px] left-[calc(50%-0.5px)] top-[calc(50%-28px)] translate-x-[-50%] translate-y-[-50%] w-[499px]" data-name="Account">
      <Body />
      <Header />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[-379px] top-[739px]">
      <div className="absolute h-[94.889px] left-[996.47px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBEADM 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeadm1} />
      </div>
      <div className="absolute h-[94.83px] left-[1389.41px] rounded-[20px] top-[739.06px] w-[168.586px]" data-name="LISTAS-YOUTUBE-XM 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeXm1} />
      </div>
      <div className="absolute h-[94.889px] left-[406.89px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-SFL 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeSfl1} />
      </div>
      <div className="absolute h-[94.83px] left-[210.58px] rounded-[20px] top-[739px] w-[168.586px]" data-name="LISTAS-YOUTUBE-PYF 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubePyf1} />
      </div>
      <div className="absolute h-[94.889px] left-[14.05px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-NDN 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeNdn1} />
      </div>
      <div className="absolute h-[94.889px] left-[603.42px] rounded-[20px] top-[739px] w-[168.692px]" data-name="LISTAS-YOUTUBE-LN 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeLn1} />
      </div>
      <div className="absolute h-[94.889px] left-[-379px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-FM-1 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeFm11} />
      </div>
      <div className="absolute h-[94.889px] left-[1192.99px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-EE 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeEe1} />
      </div>
      <div className="absolute h-[94.889px] left-[799.94px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-AVAP 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeAvap1} />
      </div>
      <div className="absolute h-[94.889px] left-[-182.47px] rounded-[20px] top-[739px] w-[168.691px]" data-name="LISTAS-YOUTUBE-AQN 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[20px] size-full" src={imgListasYoutubeAqn1} />
      </div>
    </div>
  );
}

export default function FormularioComercial() {
  return (
    <div className="bg-white relative size-full" data-name="Formulario comercial 1.0">
      <div className="absolute h-[900px] left-0 opacity-[0.45] top-0 w-[1440px]" data-name="fondo 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[132.38%] left-0 max-w-none top-[-0.02%] w-full" src={imgFondo1} />
        </div>
      </div>
      <Fondo additionalClassNames="left-[1088px] top-0" />
      <Fondo additionalClassNames="left-[-90px] top-[499px]" />
      <Account />
      <Group />
    </div>
  );
}