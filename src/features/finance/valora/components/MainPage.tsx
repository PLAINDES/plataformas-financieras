import React from 'react';

import { MainPageFooter } from './MainPageFooter';
import { MainPageHero } from './MainPageHero';

type MainPageProps = {
    onOpenForm: () => void;
};

export const MainPage: React.FC<MainPageProps> = ({ onOpenForm }) => (
    <div className="flex flex-col w-full h-full">
        <MainPageHero onOpenForm={onOpenForm} />
        <MainPageFooter />
    </div>
);
