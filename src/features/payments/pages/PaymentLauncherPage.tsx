import { useEffect, type FC } from "react";
import { useSearchParams } from "react-router-dom";

const HEADER_CROP_PX = 88;

export const PaymentLauncherPage: FC = () => {
  const [searchParams] = useSearchParams();
  const checkoutUrl = searchParams.get("checkout") || "";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!checkoutUrl) {
    return <div className="min-h-dvh bg-white" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">
      <iframe
        title="Pasarela de pago"
        src={checkoutUrl}
        className="absolute left-0 w-full border-0"
        style={{
          top: `-${HEADER_CROP_PX}px`,
          height: `calc(100dvh + ${HEADER_CROP_PX}px)`,
        }}
      />
    </div>
  );
};
