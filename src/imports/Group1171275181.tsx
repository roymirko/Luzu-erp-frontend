import clsx from "clsx";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("absolute flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] left-1/2 text-[#2f2f2f] text-[14px] text-center translate-x-[-50%] translate-y-[-50%]", additionalClassNames)}>
      <p className="leading-[28px]">{children}</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-white h-[32px] left-[10px] rounded-[3px] shadow-[0.5px_0.5px_1px_0px_rgba(0,0,0,0.15)] top-[5px] w-[80px]">
      <Wrapper additionalClassNames="h-[21px] top-[calc(50%+0.5px)] w-[62px]">Programa</Wrapper>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute h-[32px] left-[100px] rounded-[3px] top-[5px] w-[143px]">
      <Wrapper additionalClassNames="text-nowrap top-1/2">Orden de Publicidad</Wrapper>
    </div>
  );
}

export default function Group() {
  return (
    <div className="bg-[#e3e3e3] relative rounded-[6px] size-full">
      <Frame />
      <Frame1 />
    </div>
  );
}