// src/app/valora/components/NavBar.tsx

import React, { useMemo } from 'react';
import { FinanceNavbar } from '@/features/finance/components/FinanceNavbar';
import type { NavTab } from '@/features/finance/components/FinanceNavbar';
import { UserMenu } from '@/shared/components/common/UserMenu';
import type { User } from '@/shared/types/user.types';

interface NavBarProps {
  user: User;
  onLogout: () => void;
  onToggleForm: () => void;
  isFormOpen: boolean;
  hasResults: boolean;
  logoHref: string;
  logoSrc: string;
  logoAlt: string;
  projectsHref: string;
  selected: 'estados' | 'resultados' | 'analisis' | 'metodologia' | '';
  onNavigate: (view: 'estados' | 'resultados' | 'analisis' | 'metodologia') => void;
  onOpenReport: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  user,
  onLogout,
  onToggleForm,
  isFormOpen,
  hasResults,
  logoHref,
  logoSrc,
  logoAlt,
  projectsHref,
  selected,
  onNavigate,
  onOpenReport
}) => {

  const tabs: NavTab[] = useMemo(() => {
    if (!hasResults) return [];

    return [
      {
        id: 'estados',
        label: 'Estados Financieros',
        icon: <span className={selected === 'estados' ? 'text-blue-600' : 'text-gray-400'}>
        <svg 
 width="22" height="22" viewBox="0 0 896.000000 1152.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,1152.000000) scale(0.100000,-0.100000)"
fill="currentColor" stroke="currentColor">
<path d="M1062 10401 c-40 -8 -96 -52 -119 -94 -16 -30 -17 -283 -18 -4329 l0
-4297 30 -42 c17 -23 46 -50 65 -60 34 -18 145 -19 3480 -19 l3445 0 40 23
c26 14 48 37 63 67 l22 44 0 3542 c0 2319 -3 3552 -10 3569 -5 14 -139 159
-297 323 -159 163 -310 320 -338 348 -27 28 -151 157 -275 285 -445 463 -594
611 -635 630 -39 18 -129 19 -2730 17 -1479 0 -2705 -3 -2723 -7z m4860 -339
l347 -2 4 -472 c4 -533 6 -547 78 -696 76 -157 229 -281 404 -327 49 -12 137
-15 505 -15 245 0 451 -4 458 -8 10 -7 12 -678 10 -3323 l-3 -3314 -3227 -3
-3228 -2 0 4079 c0 2715 3 4080 10 4083 10 3 4011 3 4642 0z m844 -402 c70
-74 250 -261 399 -415 150 -154 287 -297 305 -317 l32 -38 -309 0 c-341 0
-375 5 -451 60 -23 16 -53 47 -67 69 -49 74 -55 119 -55 464 0 194 4 317 9
315 6 -1 67 -64 137 -138z"/>

<path d="M2120 8424 c-66 -29 -100 -81 -100 -156 0 -81 51 -144 135 -167 51
-14 2928 -15 3025 -1 59 8 69 13 106 54 47 51 61 104 44 164 -13 47 -26 63
-74 96 l-39 26 -1531 0 c-1341 -1 -1535 -3 -1566 -16z"/>
<path d="M3165 7671 c-83 -38 -105 -89 -105 -245 l0 -115 -42 -10 c-349 -83
-585 -275 -705 -573 -53 -130 -71 -379 -38 -523 19 -86 62 -201 87 -237 10
-14 18 -30 18 -36 0 -20 168 -187 229 -227 68 -44 191 -105 214 -105 7 0 17
-4 22 -9 6 -4 56 -21 113 -36 l102 -28 0 -594 c0 -379 -4 -593 -10 -593 -22 0
-148 53 -192 81 -26 17 -71 56 -100 88 -86 92 -123 179 -158 362 -29 154 -220
201 -323 80 -32 -39 -41 -84 -33 -164 35 -313 225 -582 507 -715 70 -34 155
-62 252 -84 l57 -13 0 -110 c0 -128 9 -167 47 -208 58 -60 131 -73 210 -38 69
32 90 81 98 231 l7 126 87 18 c180 37 332 117 462 246 148 147 233 321 259
531 23 187 -8 405 -76 541 -79 158 -218 295 -386 378 -57 29 -252 96 -305 105
-27 4 -44 13 -47 23 -9 36 -6 1122 4 1122 5 0 34 -9 65 -21 197 -74 325 -227
361 -435 22 -125 42 -157 117 -189 52 -22 96 -19 155 11 43 21 56 34 78 81 27
53 27 56 15 133 -37 244 -176 473 -371 612 -98 70 -220 126 -325 151 l-95 22
0 101 c0 160 -28 226 -112 264 -54 24 -92 25 -143 1z m-105 -1251 c0 -286 -4
-520 -8 -520 -19 0 -121 39 -180 69 -156 79 -239 209 -257 401 -14 155 40 295
160 416 79 79 198 146 273 153 9 1 12 -109 12 -519z m440 -1006 c189 -68 307
-178 356 -331 29 -89 26 -295 -5 -383 -40 -115 -117 -213 -227 -287 -55 -37
-188 -88 -204 -78 -11 7 -14 1087 -3 1098 8 9 2 11 83 -19z"/>
<path d="M5060 6577 c-77 -40 -110 -137 -75 -220 18 -44 66 -84 108 -92 18 -3
429 -4 914 -3 877 3 882 3 910 24 52 39 73 81 73 148 0 80 -27 123 -94 151
-30 13 -165 15 -914 15 l-879 0 -43 -23z"/>
<path d="M5047 5705 c-104 -71 -100 -231 8 -292 l40 -23 879 0 c871 0 880 0
923 21 54 26 84 68 91 124 9 88 -17 144 -85 179 -29 14 -115 16 -925 16 l-893
0 -38 -25z"/>
<path d="M5091 4525 c-24 -7 -54 -24 -68 -37 -79 -73 -67 -213 24 -269 l38
-24 896 0 895 0 41 27 c48 32 73 80 73 142 0 73 -31 123 -93 152 l-52 24 -855
-1 c-691 0 -863 -3 -899 -14z"/>
<path d="M2160 3168 c-137 -70 -114 -276 35 -318 29 -8 690 -10 2361 -8 l2320
3 41 27 c50 33 73 80 73 151 0 60 -23 104 -73 141 l-28 21 -2342 3 -2343 2
-44 -22z"/>
</g>
</svg>
</span>
,
        isInHeader: true,
      },
      {
        id: 'resultados',
        label: 'Resultados',
        icon: <span className={selected === 'estados' ? 'text-blue-600' : 'text-gray-400'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>,
        

      },
      {
        id: 'analisis',
        label: 'Análisis',
        icon:               <span className={selected === 'metodologia' ? 'text-blue-600' : 'text-gray-400'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </span>
      },
      {
        id: 'metodologia',
        label: 'Metodología',
        icon:   <span className={selected === 'metodologia' ? 'text-blue-600' : 'text-gray-600'}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
                      <path d="M22 10v6"/>
                      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
                    </svg>
                  </span>,
        isInHeader: true
      }
    ];
  }, [hasResults]);

  return (
    <FinanceNavbar
      logo={{ src: logoSrc, alt: logoAlt, href: logoHref }}
      tabs={tabs}
      selectedTabId={selected}
      onNavigate={(id) => onNavigate(id as any)}
      isFormOpen={isFormOpen}
      onToggleForm={onToggleForm}
      actions={
        <>
          {hasResults && (
            <button
              onClick={onOpenReport}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Reportes
            </button>
          )}

          <UserMenu user={user} onLogout={onLogout}>
            <a
              href={projectsHref}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Mis proyectos
            </a>
          </UserMenu>
        </>
      }
    />
  );
};
