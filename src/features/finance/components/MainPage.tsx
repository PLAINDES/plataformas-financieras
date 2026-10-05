import { MainPageHero } from "./MainPageHero";
import { MainPageFooter } from "./MainPageFooter";

type FinancePageTemplateProps = {
    brandName: string;
    brandHref: string;
    heroTitle: string;
    btnText: string;
    onOpenForm: () => void;
    logoSrc?: string;
};

export const FinancePageTemplate: React.FC<FinancePageTemplateProps> = ({
    brandName,
    brandHref,
    heroTitle,
    btnText,
    onOpenForm,
    logoSrc,
}) => (
    <div className="flex flex-col w-full h-full">
        <MainPageHero
            title={heroTitle}
            buttonText={btnText}
            onOpenForm={onOpenForm}
        />
        <MainPageFooter brandName={brandName} brandHref={brandHref} logoSrc={logoSrc} />
        {/*<Chatbot geminiApiKey="" />*/}
    </div>
);
