import clsx from "clsx";

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex items-center px-[24px] py-[12px] relative size-full">{children}</div>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("h-[48px] relative shrink-0 w-full", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Wrapper1>{children}</Wrapper1>
    </div>
  );
}
type TableHeaderTextProps = {
  text: string;
};

function TableHeaderText({ text }: TableHeaderTextProps) {
  return (
    <div className="content-stretch flex items-center relative shrink-0">
      <p className="font-bold leading-[18px] relative shrink-0 text-[#667085] text-[14px] text-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        {text}
      </p>
    </div>
  );
}
type TableCellTextProps = {
  text: string;
};

function TableCellText({ text }: TableCellTextProps) {
  return (
    <Wrapper>
      <p className="font-normal leading-[20px] not-italic relative shrink-0 text-[#1d1d1d] text-[14px] text-nowrap">{text}</p>
    </Wrapper>
  );
}

function TableHeader() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Table header">
      <p className="font-bold leading-[18px] not-italic relative shrink-0 text-[#667085] text-[14px] text-nowrap">Mes de servicio</p>
    </div>
  );
}

function TableHeaderCell() {
  return (
    <div className="bg-[#fcfcfd] h-[48px] relative rounded-tl-[10px] shrink-0 w-full" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none rounded-tl-[10px]" />
      <Wrapper1>
        <TableHeader />
      </Wrapper1>
    </div>
  );
}

function Column() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="10 - 2025" />
      ))}
    </div>
  );
}

function TableHeaderCell1() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Fecha" />
    </Wrapper>
  );
}

function TextAndSupportingText() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Text and supporting text">
      <p className="font-medium leading-[20px] not-italic relative shrink-0 text-[#1d1d1d] text-[14px] text-nowrap">03/07/2025</p>
    </div>
  );
}

function TableCell() {
  return (
    <Wrapper additionalClassNames="bg-white">
      <TextAndSupportingText />
    </Wrapper>
  );
}

function Column1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Column">
      <TableHeaderCell1 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCell key={i} />
      ))}
    </div>
  );
}

function TableHeaderCell2() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Responsable" />
    </Wrapper>
  );
}

function Column2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell2 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="Gabriela Rivero" />
      ))}
    </div>
  );
}

function TableHeaderCell3() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Unidad de negocio" />
    </Wrapper>
  );
}

function Column3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell3 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="Media" />
      ))}
    </div>
  );
}

function TableHeaderCell4() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Categoría de negocio" />
    </Wrapper>
  );
}

function Column4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell4 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="Media" />
      ))}
    </div>
  );
}

function TableHeaderCell5() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Proyecto" />
    </Wrapper>
  );
}

function Column5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[149px]" data-name="Column">
      <TableHeaderCell5 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="No aplica" />
      ))}
    </div>
  );
}

function TableHeaderCell6() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[179px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Razón social" />
    </div>
  );
}

function TableCell1() {
  return (
    <div className="content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0" data-name="Table cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <p className="font-normal leading-[20px] not-italic relative shrink-0 text-[#1d1d1d] text-[14px] text-nowrap">OMG Argentina SRL</p>
    </div>
  );
}

function Column6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell6 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCell1 key={i} />
      ))}
    </div>
  );
}

function TableHeaderCell7() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Orden de Publicidad" />
    </Wrapper>
  );
}

function Column7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell7 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="202509-0133 VER001" />
      ))}
    </div>
  );
}

function TableHeaderCell8() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Categoría" />
    </Wrapper>
  );
}

function Column8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell8 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="Belleza e Higiene" />
      ))}
    </div>
  );
}

function TableHeaderCell9() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Empresa/Agencia" />
    </Wrapper>
  );
}

function TableCell2() {
  return (
    <Wrapper>
      <p className="font-normal leading-[20px] not-italic relative shrink-0 text-[#667085] text-[14px] text-nowrap">OMD</p>
    </Wrapper>
  );
}

function Column9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell9 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCell2 key={i} />
      ))}
    </div>
  );
}

function TableHeaderCell10() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Marca" />
    </Wrapper>
  );
}

function Column10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell10 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="Lysoform" />
      ))}
    </div>
  );
}

function TableHeaderCell11() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Nombre de campaña" />
    </div>
  );
}

function TableCell3() {
  return (
    <Wrapper>
      <p className="font-normal leading-[20px] not-italic relative shrink-0 text-[#667085] text-[14px] text-nowrap"> </p>
    </Wrapper>
  );
}

function Column11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell11 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCell3 key={i} />
      ))}
    </div>
  );
}

function TableHeaderCell12() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Acuerdo de pago" />
    </Wrapper>
  );
}

function Column12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell12 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="45 días" />
      ))}
    </div>
  );
}

function TableHeaderCell13() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[110px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Programa" />
    </div>
  );
}

function Column13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell13 />
      <TableCellText text="NDN" />
      <TableCellText text="AQN" />
      <TableCellText text="FM LUZU" />
    </div>
  );
}

function TableHeaderCell14() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[173px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Monto" />
    </div>
  );
}

function Column14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell14 />
      {[...Array(2).keys()].map((_, i) => (
        <TableCellText text="$22.500.000" />
      ))}
      <TableCellText text="$5.000.000" />
    </div>
  );
}

function TableHeaderCell15() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[152px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="NC PGM" />
    </div>
  );
}

function Column15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell15 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$0" />
      ))}
    </div>
  );
}

function TableHeaderCell16() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[146px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="FEE PGM" />
    </div>
  );
}

function Column16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell16 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$0" />
      ))}
    </div>
  );
}

function TableHeaderCell17() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Proveedor FEE" />
    </div>
  );
}

function Column17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell17 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$0" />
      ))}
    </div>
  );
}

function TableHeaderCell18() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[131px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeaderText text="Implementación" />
    </div>
  );
}

function Column18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell18 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$2.000.000" />
      ))}
    </div>
  );
}

function TableHeaderCell19() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Talentos" />
    </Wrapper>
  );
}

function Column19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[131px]" data-name="Column">
      <TableHeaderCell19 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$0" />
      ))}
    </div>
  );
}

function TableHeaderCell20() {
  return (
    <Wrapper additionalClassNames="bg-[#fcfcfd]">
      <TableHeaderText text="Técnica" />
    </Wrapper>
  );
}

function Column20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[131px]" data-name="Column">
      <TableHeaderCell20 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="$0" />
      ))}
    </div>
  );
}

function TableHeader1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Table header">
      <p className="font-medium leading-[18px] not-italic relative shrink-0 text-[#667085] text-[12px] text-nowrap">%</p>
    </div>
  );
}

function TableHeaderCell21() {
  return (
    <div className="bg-[#fcfcfd] content-stretch flex h-[48px] items-center px-[24px] py-[12px] relative shrink-0 w-[68px]" data-name="Table header cell">
      <div aria-hidden="true" className="absolute border-[#eaecf0] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <TableHeader1 />
    </div>
  );
}

function Column21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Column">
      <TableHeaderCell21 />
      {[...Array(3).keys()].map((_, i) => (
        <TableCellText text="5%" />
      ))}
    </div>
  );
}

export default function Content() {
  return (
    <div className="bg-white content-stretch flex items-start relative size-full" data-name="Content">
      <Column />
      <Column1 />
      <Column2 />
      <Column3 />
      <Column4 />
      <Column5 />
      <Column6 />
      <Column7 />
      <Column8 />
      <Column9 />
      <Column10 />
      <Column11 />
      <Column12 />
      <Column13 />
      <Column14 />
      <Column15 />
      <Column16 />
      <Column17 />
      <Column18 />
      <Column19 />
      <Column20 />
      <Column21 />
    </div>
  );
}