import svgPaths from "./svg-63eg2ep2i2";
import clsx from "clsx";
import imgLoguito1 from "figma:asset/7eccc02503092207dcbdd57feb9cf1708d960720.png";
import imgContainer from "figma:asset/e74125f0989485bc995eeda26eccebf3f1ad61ab.png";
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("absolute size-[20px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        {children}
      </svg>
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
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#4a5565] text-[14px] text-nowrap tracking-[-0.1504px]">{text}</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex h-[69px] items-center justify-center relative shrink-0 w-full">
      <div className="h-[20.128px] relative shrink-0 w-[31px]" data-name="loguito 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgLoguito1} />
      </div>
    </div>
  );
}

function IconDefault() {
  return (
    <Wrapper additionalClassNames="left-[10px] top-[10px]">
      <g id="Icon/Default">
        <path d={svgPaths.p275d2400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        <path d={svgPaths.p21a7e80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      </g>
    </Wrapper>
  );
}

function Inicio() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Inicio">
      <IconDefault />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[30%_28.33%_32.5%_30%]">
      <div className="absolute inset-[-4.64%_-4.17%_-4.64%_-4.18%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0583 16.3917">
          <g id="Group 1171275168">
            <path d={svgPaths.p30277380} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
            <path d={svgPaths.p127be700} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.39167" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Comercial() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Comercial">
      <Group />
    </div>
  );
}

function Icon() {
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

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[10px] size-[20px] top-[10px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Implementacion() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Implementación">
      <Container />
    </div>
  );
}

function Icon1() {
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

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[10px] size-[20px] top-[10px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function DirDeProgramacion() {
  return (
    <div className="overflow-clip relative shrink-0 size-[40px]" data-name="Dir. de Programación">
      <Container1 />
    </div>
  );
}

function List() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[55px]" data-name="List">
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
    <div className="bg-white h-[900px] relative shrink-0 w-[56px]" data-name="Sidebar">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0px_1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-0 pr-px py-0 relative size-full">
        <List />
      </div>
    </div>
  );
}

function Icon2() {
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

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[36px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-0 pt-[8px] px-[8px] relative rounded-[inherit] size-full">
        <Icon2 />
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <Wrapper additionalClassNames="left-[8px] top-[8px]">
      <g id="Icon">
        <path d={svgPaths.p31962400} id="Vector" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        <path d={svgPaths.p1f3d9f80} id="Vector_2" stroke="var(--stroke-0, #0A0A0A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
      </g>
    </Wrapper>
  );
}

function Text() {
  return <div className="absolute bg-[#fb2c36] border border-[#d1d5dc] border-solid left-[24px] rounded-[3.35544e+07px] size-[8px] top-[4px]" data-name="Text" />;
}

function Button1() {
  return (
    <div className="absolute left-[175px] rounded-[3.35544e+07px] size-[36px] top-[2px]" data-name="Button">
      <Icon3 />
      <Text />
    </div>
  );
}

function ImageUserAvatar() {
  return <div className="h-[36px] shrink-0 w-full" data-name="Image (User avatar)" />;
}

function Container2() {
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

function Container3() {
  return (
    <div className="absolute left-[223px] size-[40px] top-0" data-name="Container">
      <Container2 />
      <Text1 />
    </div>
  );
}

function Container4() {
  return (
    <Wrapper1 additionalClassNames="h-[40px] w-[263px]">
      <Button1 />
      <Container3 />
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
          <Button />
          <Container4 />
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

function Container5() {
  return (
    <div className="h-[61px] relative shrink-0 w-[1384px]" data-name="Container">
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
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#99a1af] text-[14px] text-nowrap tracking-[-0.1504px]">/</p>
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
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#101828] text-[14px] text-nowrap top-0 tracking-[-0.1504px]">Nuevo formulario</p>
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
    <div className="h-[52px] relative shrink-0 w-full" data-name="Main Content">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-0 pl-[40px] pr-[52px] pt-[16px] relative size-full">
          <NumberedList />
        </div>
      </div>
    </div>
  );
}

function MainContent1() {
  return <div className="basis-0 grow min-h-px min-w-px shrink-0 w-[1384px]" data-name="Main Content" />;
}

function Container6() {
  return (
    <div className="basis-0 grow h-[900px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Container5 />
        <MainContent />
        <MainContent1 />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex h-[900px] items-start left-0 top-0 w-[1440px]" data-name="App">
      <Sidebar />
      <Container6 />
    </div>
  );
}

export default function FormularioComercial() {
  return (
    <div className="bg-white relative size-full" data-name="Formulario comercial 1.0">
      <App />
    </div>
  );
}