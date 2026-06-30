import { useState, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";

export function useKapitalSession() {
    const [prewarmedSessionId, setPrewarmedSessionId] = useState<string | null>(
        null
    );

    // Keep-alive interval for the prewarmed Excel session
    useEffect(() => {
        let intervalId: number;
        let attempts = 0;
        const MAX_ATTEMPTS = 10;

        if (prewarmedSessionId) {
            intervalId = window.setInterval(async () => {
                attempts++;
                if (attempts > MAX_ATTEMPTS) {
                    clearInterval(intervalId);
                    console.log(
                        "Se dejó expirar la sesión de Excel para ahorrar recursos."
                    );
                    return;
                }

                try {
                    await MainService.keepAliveSession(prewarmedSessionId);
                    console.log(
                        `Sesión Excel refrescada (intento ${attempts}/${MAX_ATTEMPTS})`
                    );
                } catch (e) {
                    console.warn("Fallo el keep-alive, la sesión podría morir.", e);
                }
            }, 240000);
        }

        return () => {
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [prewarmedSessionId]);

    // Pre-warm session on mount
    const prewarmSession = async () => {
        try {
            const data = await MainService.prewarmSession();
            if (data && data.session_id) {
                setPrewarmedSessionId(data.session_id);
            }
        } catch (e) {
            console.error("Fallo pre-warm. Se creará la sesión al dar clic.", e);
        }
    };

    return {
        prewarmedSessionId,
        setPrewarmedSessionId,
        prewarmSession,
    };
}
