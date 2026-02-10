import React from 'react';

import { MainPageFooter } from './MainPageFooter';
import { MainPageHero } from './MainPageHero';

export const MainPage: React.FC = () => (
    <div className="flex flex-col w-full h-full">
        <MainPageHero />
        <MainPageFooter />
    </div>
);
