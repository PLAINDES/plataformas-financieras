import { MainPageHero } from "./MainPageHero";
import { MainPageFooter } from "./MainPageFooter";
import Chatbot from "./Chatbot";
type FinancePageTemplateProps = {
  brandName: string;
  brandHref: string;
  heroTitle: string;
  onOpenForm: () => void;
};

export const FinancePageTemplate: React.FC<FinancePageTemplateProps> = ({
  brandName,
  brandHref,
  heroTitle,
  onOpenForm,
}) => (
  <div className="flex flex-col w-full h-full">
    <MainPageHero
      title={heroTitle}
      buttonText={brandName}
      onOpenForm={onOpenForm}
    />
    <MainPageFooter brandName={brandName} brandHref={brandHref} />

    <Chatbot geminiApiKey="" />
  </div>
);
