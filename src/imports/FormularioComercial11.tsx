import svgPaths from "./svg-n4626rep82";
import clsx from "clsx";
import imgLogoLuzu20251 from "../assets/logo-luzu-2025 1.png";
import imgContainer from "../assets/Container.png";
type Stats5Props = {
  additionalClassNames?: string;
};

function Stats5({ children, additionalClassNames = "" }: React.PropsWithChildren<Stats5Props>) {
  return (
    <div className={clsx("absolute bg-white h-[90px] rounded-[16px] top-[1103px] w-[160px]", additionalClassNames)}>
      <div className="content-stretch flex items-start overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-nowrap", additionalClassNames)}>
      <p className="leading-[20px]">{children}</p>
    </div>
  );
}
type MainContent3Props = {
  additionalClassNames?: string;
};

function MainContent3({ children, additionalClassNames = "" }: React.PropsWithChildren<MainContent3Props>) {
  return (
    <div className={clsx("relative shrink-0 w-full", additionalClassNames)}>
      <div className="flex flex-col items-center justify-center overflow-clip rounded-[inherit] size-full">{children}</div>
    </div>
  );
}

function Container8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[20px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return <Wrapper2 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</Wrapper2>;
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("size-[20px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        {children}
      </svg>
    </div>
  );
}
type Icon6Props = {
  additionalClassNames?: string;
};

function Icon6({ children, additionalClassNames = "" }: React.PropsWithChildren<Icon6Props>) {
  return (
    <Wrapper additionalClassNames={additionalClassNames}>
      <g id="Icon">{children}</g>
    </Wrapper>
  );
}
type StatTextProps = {
  text: string;
  text1: string;
  text2: string;
};

function StatText({ text, text1, text2 }: StatTextProps) {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[2px] pt-0 px-0 relative shrink-0 text-[#374151] text-nowrap">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[24px] opacity-80 relative shrink-0 text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
      <p className="font-['Roboto:SemiBold',sans-serif] font-semibold leading-[40px] relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text1}
      </p>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[16px] opacity-40 relative shrink-0 text-[12px] text-right" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text2}
      </p>
    </div>
  );
}
type IconButtonProps = {
  additionalClassNames?: string;
};

function IconButton({ additionalClassNames = "" }: IconButtonProps) {
  return (
    <div className={clsx("absolute bg-[#0070ff] content-stretch flex items-center justify-center p-[6px] rounded-[8px] size-[32px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border border-[rgba(0,112,255,0.07)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <UserInterfacePlus />
    </div>
  );
}

function UserInterfacePlus() {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="User Interface / Plus">
          <path d={svgPaths.p77ba800} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type InputText2Props = {
  text: string;
  additionalClassNames?: string;
};

function InputText2({ text, additionalClassNames = "" }: InputText2Props) {
  return (
    <div className={clsx("bg-white content-stretch flex gap-[5.375px] h-[32px] items-center px-[16.125px] py-[13.438px] relative rounded-[5.375px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[#d1d5db] border-[0.672px] border-solid inset-0 pointer-events-none rounded-[5.375px]" />
      <UserInterfaceMagnifier />
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow h-[16.125px] leading-[16.125px] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#8b8b8d] text-[12px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}

function UserInterfaceMagnifier() {
  return (
    <div className="relative shrink-0 size-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="User Interface / Magnifier">
          <path d={svgPaths.p2ce67680} fill="var(--fill-0, #8B8B8D)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type InputText1Props = {
  text: string;
};

function InputText1({ text }: InputText1Props) {
  return (
    <div className="bg-white content-stretch flex gap-[4.833px] h-[32px] items-center px-[9.667px] py-0 relative rounded-[4.833px] shrink-0 w-[300px] z-[1]">
      <div aria-hidden="true" className="absolute border-[#d1d5db] border-[0.604px] border-solid inset-0 pointer-events-none rounded-[4.833px]" />
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow leading-[14.5px] min-h-px min-w-px relative shrink-0 text-[#374151] text-[12px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
      <CaretDown />
    </div>
  );
}

function CaretDown() {
  return (
    <div className="relative shrink-0 size-[7.25px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.25 7.25">
        <g id="CaretDown">
          <path d={svgPaths.p2a1c300} fill="var(--fill-0, #343330)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type InputTextProps = {
  text: string;
  additionalClassNames?: string;
};

function InputText({ text, additionalClassNames = "" }: InputTextProps) {
  return (
    <div className={clsx("bg-white content-stretch flex h-[32px] items-center px-[16.125px] py-[13.438px] relative rounded-[5.375px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[#d1d5db] border-[0.672px] border-solid inset-0 pointer-events-none rounded-[5.375px]" />
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow h-[16.125px] leading-[16.125px] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}
type Text3Props = {
  text: string;
  additionalClassNames?: string;
};

function Text3({ text, additionalClassNames = "" }: Text3Props) {
  return (
    <div className={clsx("content-stretch flex items-center justify-between relative size-full", additionalClassNames)}>
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow leading-[13.438px] min-h-px min-w-px relative shrink-0 text-[#374151] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}
type TopTextProps = {
  text: string;
};

function TopText({ text }: TopTextProps) {
  return (
    <div className="h-[24px] relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <Text3 text={text} additionalClassNames="px-[2.688px] py-[5.375px]" />
      </div>
    </div>
  );
}
type LinkTextProps = {
  text: string;
  additionalClassNames?: string;
};

function LinkText({ text, additionalClassNames = "" }: LinkTextProps) {
  return (
    <div className={clsx("absolute content-stretch flex h-[17px] items-start left-0 top-px", additionalClassNames)}>
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}
type TextTextProps = {
  text: string;
  additionalClassNames?: string;
};

function TextText({ text, additionalClassNames = "" }: TextTextProps) {
  return (
    <Wrapper2 additionalClassNames={clsx("h-[24px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[-1px] not-italic text-[#0a0a0a] text-[16px] text-nowrap top-0 tracking-[-0.3125px]">{text}</p>
    </Wrapper2>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
      <div className="h-[69px] relative shrink-0 w-[140px]" data-name="logo-luzu-2025 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[101.61%] left-0 max-w-none top-[-1.61%] w-full" src={imgLogoLuzu20251} />
        </div>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <Icon6 additionalClassNames="relative shrink-0">
      <path d={svgPaths.p275d2400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      <path d={svgPaths.p21a7e80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </Icon6>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[40px] items-center left-0 pl-[12px] pr-0 py-0 rounded-[10px] top-0 w-[239px]" data-name="Button">
      <Icon />
      <TextText text="Inicio" additionalClassNames="w-[80.984px]" />
    </div>
  );
}

function Inicio() {
  return (
    <div className="h-[40px] relative rounded-[10px] shrink-0 w-[239px]" data-name="Inicio">
      <Button />
    </div>
  );
}

function Icon1() {
  return (
    <Icon6 additionalClassNames="relative shrink-0">
      <path d={svgPaths.pe6b10c0} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
      <path d={svgPaths.p4c21d00} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
    </Icon6>
  );
}

function Button1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[40px] items-center left-0 pl-[12px] pr-0 py-0 rounded-[10px] top-0 w-[239px]" data-name="Button">
      <Icon1 />
      <TextText text="Comercial" additionalClassNames="w-[80.984px]" />
    </div>
  );
}

function Container() {
  return <div className="absolute left-[12px] size-[20px] top-[10px]" data-name="Container" />;
}

function Comercial() {
  return (
    <div className="bg-[#f3f5ff] h-[40px] overflow-clip relative rounded-[10px] shrink-0 w-[239px]" data-name="Comercial">
      <Button1 />
      <Container />
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.32%_8.32%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-4.17%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0618 18.0622">
            <path d={svgPaths.p2900a900} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <Container8>
      <Icon2 />
    </Container8>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[40px] items-center left-0 pl-[12px] pr-0 py-0 rounded-[10px] top-0 w-[239px]" data-name="Button">
      <Container1 />
      <TextText text="Implementación" additionalClassNames="w-[80.984px]" />
    </div>
  );
}

function Implementacion() {
  return (
    <div className="h-[40px] overflow-clip relative rounded-[10px] shrink-0 w-[239px]" data-name="Implementación">
      <Button2 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%_29.17%_70.83%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-16.7%_-8.35%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.725 5.55833">
            <path d={svgPaths.p1e8dd6f0} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[29.17%_8.33%_8.33%_8.33%]" data-name="Vector">
        <div className="absolute inset-[-5.57%_-4.17%_-5.57%_-4.18%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0583 13.8917">
            <path d={svgPaths.pf413b80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <Container8>
      <Icon3 />
    </Container8>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[40px] items-center left-0 pl-[12px] pr-0 py-0 rounded-[10px] top-0 w-[239px]" data-name="Button">
      <Container2 />
      <TextText text="Dir. de Programación" additionalClassNames="w-[118px]" />
    </div>
  );
}

function DirDeProgramacion() {
  return (
    <div className="h-[40px] overflow-clip relative rounded-[10px] shrink-0 w-[239px]" data-name="Dir. de Programación">
      <Button3 />
    </div>
  );
}

function List() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[255px]" data-name="List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[10px] items-start pb-0 pt-[10px] px-[8px] relative size-full">
        <Frame />
        <Inicio />
        <Comercial />
        <Implementacion />
        <DirDeProgramacion />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="bg-white h-[900px] relative shrink-0 w-[256px]" data-name="Sidebar">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-0 pr-px py-0 relative size-full">
        <List />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 16.6667">
            <path d={svgPaths.pf3beb80} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_62.5%_12.5%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-5.56%_-0.83px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.66667 16.6667">
            <path d="M0.833333 0.833333V15.8333" id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[37.5%_33.33%_37.5%_54.17%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-33.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.16667 6.66667">
            <path d={svgPaths.p1b3f8780} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[8px] px-[8px] relative rounded-[inherit] size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <Icon6 additionalClassNames="absolute left-[8px] top-[8px]">
      <path d={svgPaths.p31962400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      <path d={svgPaths.p1f3d9f80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
    </Icon6>
  );
}

function Text() {
  return <div className="absolute bg-[#fb2c36] border border-[#d1d5dc] border-solid left-[24px] rounded-[3.35544e+07px] size-[8px] top-[4px]" data-name="Text" />;
}

function Button5() {
  return (
    <div className="absolute left-[175px] rounded-[3.35544e+07px] size-[36px] top-[2px]" data-name="Button">
      <Icon5 />
      <Text />
    </div>
  );
}

function ImageUserAvatar() {
  return <div className="h-[36px] shrink-0 w-full" data-name="Image (User avatar)" />;
}

function Container3() {
  return (
    <div className="absolute left-0 rounded-[3.35544e+07px] size-[40px] top-0" data-name="Container">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[3.35544e+07px] size-full" src={imgContainer} />
      <div className="content-stretch flex flex-col items-start overflow-clip p-[2px] relative rounded-[inherit] size-full">
        <ImageUserAvatar />
      </div>
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[3.35544e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Text1() {
  return <div className="absolute bg-[#00c950] border-2 border-solid border-white left-[28px] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container4() {
  return (
    <div className="absolute left-[223px] size-[40px] top-0" data-name="Container">
      <Container3 />
      <Text1 />
    </div>
  );
}

function Container5() {
  return (
    <Wrapper1 additionalClassNames="h-[40px] w-[263px]">
      <Button5 />
      <Container4 />
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[normal] left-[163px] text-[#2b2b2b] text-[16px] text-nowrap text-right top-[14px] translate-x-[-100%]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <span>{`Hola, `}</span>
        <span className="font-['Roboto:Bold',sans-serif] font-bold" style={{ fontVariationSettings: "'wdth' 100" }}>
          Miguel
        </span>
      </p>
    </Wrapper1>
  );
}

function Navigation() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Navigation">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[16px] pr-0 py-0 relative size-full">
          <Button4 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="bg-white h-[61px] relative shrink-0 w-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#99a1af] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-px pl-0 pr-[20px] pt-0 relative size-full">
          <Navigation />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[61px] relative shrink-0 w-[1184px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Header />
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <Wrapper1 additionalClassNames="h-[20px] w-[38.25px]">
      <LinkText text="Inicio" additionalClassNames="w-[38.25px]" />
    </Wrapper1>
  );
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[17px] items-start left-0 top-px w-[4.125px]" data-name="Text">
      <p className="font-['Roboto:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#99a1af] text-[14px] text-nowrap tracking-[-0.1504px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        /
      </p>
    </div>
  );
}

function ListItem1() {
  return (
    <Wrapper1 additionalClassNames="h-[20px] w-[4.125px]">
      <Text2 />
    </Wrapper1>
  );
}

function ListItem2() {
  return (
    <Wrapper1 additionalClassNames="h-[20px] w-[73.719px]">
      <LinkText text="Comercial" additionalClassNames="w-[73.719px]" />
    </Wrapper1>
  );
}

function ListItem3() {
  return (
    <Wrapper1 additionalClassNames="h-[20px] w-[96.25px]">
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[20px] left-0 text-[#101828] text-[14px] text-nowrap top-0 tracking-[-0.1504px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Nuevo formulario
      </p>
    </Wrapper1>
  );
}

function NumberedList() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Numbered List">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center pl-0 pr-[30px] py-0 relative size-full">
          <ListItem />
          <ListItem1 />
          <ListItem2 />
          <ListItem1 />
          <ListItem3 />
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <MainContent3 additionalClassNames="h-[40px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center pl-[40px] pr-[52px] py-[10px] relative size-full">
        <NumberedList />
      </div>
    </MainContent3>
  );
}

function MainContent1() {
  return (
    <MainContent3 additionalClassNames="h-[50px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center justify-center px-[40px] py-[10px] relative size-full">
        <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[28px] relative shrink-0 text-[#101828] text-[20px] w-[620px]" style={{ fontVariationSettings: "'wdth' 100" }}>{`Carga de datos `}</p>
      </div>
    </MainContent3>
  );
}

function TextInputWeb() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[328px]" data-name="Text input - web">
      <TopText text="Marca*" />
      <InputText text="Type here" additionalClassNames="w-[300px]" />
    </div>
  );
}

function TextInputWeb1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[602px] top-[328px]" data-name="Text input - web">
      <TopText text="Nombre de Campaña" />
      <InputText text="Type here" additionalClassNames="w-[300px]" />
    </div>
  );
}

function TextInputWeb2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[20px]" data-name="Text input - web">
      <TopText text="Orden de Publicidad*" />
      <InputText text="Type here" additionalClassNames="w-[300px]" />
    </div>
  );
}

function TextInputWeb3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[602px] top-[20px]" data-name="Text input - web">
      <TopText text="Total de Venta*" />
      <InputText text="Type here" additionalClassNames="w-[300px]" />
    </div>
  );
}

function Top() {
  return (
    <div className="h-[24px] relative shrink-0 w-full z-[2]" data-name="Top">
      <div className="flex flex-row items-center size-full">
        <Text3 text="Unidad de Negocio*" additionalClassNames="px-[2.417px] py-[4.833px]" />
      </div>
    </div>
  );
}

function SelectWeb() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-[282px] top-[97px]" data-name="Select - web">
      <Top />
      <InputText1 text="Seleccionar" />
    </div>
  );
}

function Top1() {
  return (
    <div className="h-[24px] relative shrink-0 w-full z-[2]" data-name="Top">
      <div className="flex flex-row items-center size-full">
        <Text3 text="Acuerdo de Pago" additionalClassNames="px-[2.417px] py-[4.833px]" />
      </div>
    </div>
  );
}

function SelectWeb1() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-[282px] top-[484px]" data-name="Select - web">
      <Top1 />
      <InputText1 text="Seleccionar" />
    </div>
  );
}

function Top2() {
  return (
    <div className="h-[24px] relative shrink-0 w-full z-[2]" data-name="Top">
      <div className="flex flex-row items-center size-full">
        <Text3 text="Proyecto*" additionalClassNames="px-[2.417px] py-[4.833px]" />
      </div>
    </div>
  );
}

function SelectWeb2() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-[282px] top-[174px]" data-name="Select - web">
      <Top2 />
      <InputText1 text="Seleccionar" />
    </div>
  );
}

function Top3() {
  return (
    <div className="h-[24px] relative shrink-0 w-full z-[2]" data-name="Top">
      <div className="flex flex-row items-center size-full">
        <Text3 text="Categoría de Negocio*" additionalClassNames="px-[2.417px] py-[4.833px]" />
      </div>
    </div>
  );
}

function SelectWeb3() {
  return (
    <div className="absolute content-stretch flex flex-col isolate items-start left-[602px] top-[97px]" data-name="Select - web">
      <Top3 />
      <InputText1 text="Seleccionar" />
    </div>
  );
}

function TextSearchWeb() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[602px] top-[174px]" data-name="Text search - web">
      <TopText text="Razón Social*" />
      <InputText2 text="Buscar" additionalClassNames="w-[300px]" />
    </div>
  );
}

function TextSearchWeb1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[602px] top-[251px]" data-name="Text search - web">
      <TopText text="Empresa/Agencia*" />
      <InputText2 text="Buscar" additionalClassNames="w-[300px]" />
    </div>
  );
}

function TextInputWeb4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[502px] top-[575px]" data-name="Text input - web">
      <TopText text="Monto" />
      <InputText text="$0" additionalClassNames="w-[150px]" />
    </div>
  );
}

function TextInputWeb5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[729px]" data-name="Text input - web">
      <TopText text="Implementación" />
      <InputText text="Type here" additionalClassNames="w-[195px]" />
    </div>
  );
}

function TextInputWeb6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[494px] top-[729px]" data-name="Text input - web">
      <TopText text="Talentos" />
      <InputText text="Type here" additionalClassNames="w-[195px]" />
    </div>
  );
}

function TextInputWeb7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[707px] top-[729px]" data-name="Text input - web">
      <TopText text="Técnica" />
      <InputText text="Type here" additionalClassNames="w-[195px]" />
    </div>
  );
}

function TextInputWeb8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[672px] top-[575px]" data-name="Text input - web">
      <TopText text="NC Programa" />
      <InputText text="$0" additionalClassNames="w-[145px]" />
    </div>
  );
}

function TextInputWeb9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[827px] top-[575px]" data-name="Text input - web">
      <TopText text="%" />
      <InputText text="0" additionalClassNames="w-[75px]" />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[672px] top-[575px]">
      <TextInputWeb8 />
      <TextInputWeb9 />
    </div>
  );
}

function TextInputWeb10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[600px] top-[652px]" data-name="Text input - web">
      <TopText text="FEE Programa" />
      <InputText text="Type here" additionalClassNames="w-[145px]" />
    </div>
  );
}

function TextInputWeb11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[755px] top-[652px]" data-name="Text input - web">
      <TopText text="%" />
      <InputText text="0" additionalClassNames="w-[75px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[600px] top-[652px]">
      <TextInputWeb10 />
      <TextInputWeb11 />
    </div>
  );
}

function TextSearchWeb2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[575px]" data-name="Text search - web">
      <TopText text="Programa" />
      <InputText2 text="Buscar" additionalClassNames="w-[200px]" />
    </div>
  );
}

function TextSearchWeb3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[652px]" data-name="Text search - web">
      <TopText text="Proveedor FEE" />
      <InputText2 text="Buscar" additionalClassNames="w-[300px]" />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[282px] top-[575px]">
      <TextInputWeb4 />
      <TextInputWeb5 />
      <TextInputWeb6 />
      <TextInputWeb7 />
      <Group />
      <Group1 />
      <TextSearchWeb2 />
      <TextSearchWeb3 />
    </div>
  );
}

function TextSearchWeb4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[251px]" data-name="Text search - web">
      <TopText text="Categoría*" />
      <InputText2 text="Buscar" additionalClassNames="w-[300px]" />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bg-[#0070ff] content-stretch flex gap-[8px] items-center justify-center left-[820px] px-[16px] py-[14px] rounded-[8px] top-[1233px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#0070ff] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Wrapper3 additionalClassNames="text-white">Guardar</Wrapper3>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute content-stretch flex gap-[8px] items-center justify-center left-[732px] px-[16px] py-[14px] rounded-[8px] top-[1233px]" data-name="Button">
      <Wrapper3 additionalClassNames="text-[#0070ff]">Cancelar</Wrapper3>
    </div>
  );
}

function Circle() {
  return (
    <Wrapper additionalClassNames="relative shrink-0">
      <g id="Circle">
        <path d={svgPaths.p327902f0} fill="var(--fill-0, #374151)" id="Vector" />
      </g>
    </Wrapper>
  );
}

function Toggle() {
  return (
    <div className="absolute bg-white content-stretch flex items-center left-[328px] pl-[12px] pr-0 py-0 rounded-[9999px] top-[877px]" data-name="Toggle">
      <div aria-hidden="true" className="absolute border-[#374151] border-[0.833px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Circle />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[282px] top-[877px]">
      <Toggle />
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[13.438px] left-[282px] text-[#374151] text-[14px] text-nowrap top-[880px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Canje
      </p>
      <p className="absolute font-['Roboto:Regular',sans-serif] font-normal leading-[13.438px] left-[370px] text-[#374151] text-[14px] text-nowrap top-[880px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Factura
      </p>
    </div>
  );
}

function Top4() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Top">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[4px] py-[8px] relative size-full">
          <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[#374151] text-[14px]" style={{ fontVariationSettings: "'wdth' 100" }}>
            Observaciones
          </p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white content-stretch flex items-center px-[16px] py-[12px] relative rounded-[8px] shrink-0 w-[620px]" data-name="input">
      <div aria-hidden="true" className="absolute border border-[#d1d5db] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="basis-0 font-['Roboto:Regular',sans-serif] font-normal grow h-[48px] leading-[16px] min-h-px min-w-px overflow-ellipsis overflow-hidden relative shrink-0 text-[#d1d5db] text-[12px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Type here
      </p>
    </div>
  );
}

function TextareaLongWebDefault() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[282px] top-[918px]" data-name="Textarea - long - web - Default">
      <Top4 />
      <Input />
    </div>
  );
}

function StatContent() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0" data-name="stat-content">
      <StatText text="Total de venta" text1="$50.000.000" text2="100%" />
    </div>
  );
}

function Stat() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[90px] items-center justify-center p-[32px] relative shrink-0 w-[160px]" data-name="Stat">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none" />
      <StatContent />
    </div>
  );
}

function Stats() {
  return (
    <Stats5 additionalClassNames="left-[172px]">
      <Stat />
    </Stats5>
  );
}

function StatContent1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0" data-name="stat-content">
      <StatText text="Total FEE Facturado" text1="$500.000" text2="1%" />
    </div>
  );
}

function Stat1() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[90px] items-center justify-center p-[32px] relative shrink-0 w-[160px]" data-name="Stat">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none" />
      <StatContent1 />
    </div>
  );
}

function Stats1() {
  return (
    <Stats5 additionalClassNames="left-[512px]">
      <Stat1 />
    </Stats5>
  );
}

function StatContent2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0" data-name="stat-content">
      <StatText text="Total Nota de Crédito" text1="$5.000.000" text2="10%" />
    </div>
  );
}

function Stat2() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[90px] items-center justify-center p-[32px] relative shrink-0 w-[160px]" data-name="Stat">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none" />
      <StatContent2 />
    </div>
  );
}

function Stats2() {
  return (
    <Stats5 additionalClassNames="left-[342px]">
      <Stat2 />
    </Stats5>
  );
}

function StatContent3() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0" data-name="stat-content">
      <StatText text="Tota gasto de venta" text1="$2.000.000" text2="2%" />
    </div>
  );
}

function Stat3() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[90px] items-center justify-center p-[32px] relative shrink-0 w-[160px]" data-name="Stat">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none" />
      <StatContent3 />
    </div>
  );
}

function Stats3() {
  return (
    <Stats5 additionalClassNames="left-[682px]">
      <Stat3 />
    </Stats5>
  );
}

function StatContent4() {
  return (
    <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0" data-name="stat-content">
      <StatText text="Utilidad de Proyecto" text1="$42.500.000" text2="82%" />
    </div>
  );
}

function Stat4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[90px] items-center justify-center p-[32px] relative shrink-0 w-[160px]" data-name="Stat">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none" />
      <StatContent4 />
    </div>
  );
}

function Stats4() {
  return (
    <Stats5 additionalClassNames="left-[852px]">
      <Stat4 />
    </Stats5>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[172px] top-[1103px]">
      <Stats />
      <Stats1 />
      <Stats2 />
      <Stats3 />
      <Stats4 />
    </div>
  );
}

function MainContent2() {
  return (
    <Wrapper1 additionalClassNames="h-[748px] w-full">
      <div className="absolute bg-[#e6ebff] border-2 border-[#abbcff] border-solid h-[302px] left-1/2 opacity-50 rounded-[10px] top-[554px] translate-x-[-50%] w-[660px]" />
      <TextInputWeb />
      <TextInputWeb1 />
      <TextInputWeb2 />
      <TextInputWeb3 />
      <SelectWeb />
      <SelectWeb1 />
      <SelectWeb2 />
      <SelectWeb3 />
      <TextSearchWeb />
      <TextSearchWeb1 />
      <Group2 />
      <TextSearchWeb4 />
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[28px] left-[282px] text-[#101828] text-[20px] top-[425px] w-[620px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Carga de importes
      </p>
      <Button6 />
      <Button7 />
      <IconButton additionalClassNames="left-[870px] top-[805px]" />
      <Group3 />
      <TextareaLongWebDefault />
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[28px] left-[279px] text-[#101828] text-[20px] top-[1055px] w-[620px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Resumen
      </p>
      <Group4 />
      <IconButton additionalClassNames="left-[912px] top-[198px]" />
    </Wrapper1>
  );
}

function Container7() {
  return (
    <div className="basis-0 bg-white grow h-[1491px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Container6 />
        <MainContent />
        <MainContent1 />
        <MainContent2 />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex h-[900px] items-start left-0 top-0 w-[1440px]" data-name="App">
      <Sidebar />
      <Container7 />
    </div>
  );
}

export default function FormularioComercial() {
  return (
    <div className="bg-white relative size-full" data-name="Formulario comercial 1.1">
      <App />
    </div>
  );
}