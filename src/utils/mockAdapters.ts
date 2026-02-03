// src/utils/mockAdapters.ts
// Utilidades para convertir mocks legacy al nuevo formato

import type { EditableContent } from '../types/editable.types';
import type { 
  PlatformCard, 
  PlatformCardItem,
  HeroContent,
  HeroSectionData,
  ClientLogo,
  EditableCollectionData 
} from '../types/landing.types';

// ============================================
// ADAPTERS: Legacy → Nuevo Sistema
// ============================================

/**
 * Convierte HeroContent legacy a HeroSectionData
 */
export function adaptHeroContent(legacy: HeroContent, section = 'hero'): HeroSectionData {
  return {
    title: {
      id: `${section}-title`,
      type: 'text',
      value: legacy.title,
      section,
      styles: {
        fontSize: '4xl',
        fontWeight: 'bold',
      },
    },
    description: legacy.description ? {
      id: `${section}-description`,
      type: 'text',
      value: legacy.description,
      section,
    } : undefined,
    ctaButton: {
      url: legacy.ctaUrl || '#',
      text: legacy.ctaText || 'Comenzar',
      target: '_self',
    },
    backgroundImage: {
      id: `${section}-bg`,
      type: 'image',
      value: '/images/hero-bg.jpg',
      section,
    },
  };
}

/**
 * Convierte array de PlatformCard legacy a EditableCollectionData<PlatformCardItem>
 */
export function adaptPlatformCards(
  legacy: PlatformCard[],
  section = 'platform'
): EditableCollectionData<PlatformCardItem> {
  return {
    id: `${section}-cards`,
    section,
    items: legacy.map((card, index) => ({
      id: card.id || `card-${index}`,
      order: index,
      title: card.title,
      caption: card.caption,
      description: card.description,
      imageUrl: card.imageUrl,
      video: {
        type: 'url',
        src: card.videoUrl,
        poster: card.imageUrl,
      },
      hoverVideo: {
        type: 'url',
        src: card.videoUrl,
      },
      ctaLink: {
        url: '#',
        text: 'Ver más',
        target: '_blank',
      },
    })),
  };
}

/**
 * Convierte array de ClientLogo a EditableCollectionData
 */
export function adaptClientLogos(
  legacy: ClientLogo[],
  section = 'clients'
): EditableCollectionData<ClientLogo> {
  return {
    id: `${section}-logos`,
    section,
    items: legacy.map((client, index) => ({
      ...client,
      id: client.id || `client-${index}`,
      order: client.order ?? index,
    })),
  };
}

/**
 * Crea EditableContent desde string simple
 */
export function createEditableText(
  value: string,
  id: string,
  section: string,
  styles?: EditableContent['styles']
): EditableContent {
  return {
    id,
    type: 'text',
    value,
    section,
    styles,
  };
}

/**
 * Crea EditableContent de tipo imagen
 */
export function createEditableImage(
  value: string,
  id: string,
  section: string
): EditableContent {
  return {
    id,
    type: 'image',
    value,
    section,
  };
}

// ============================================
// REVERSE ADAPTERS: Nuevo Sistema → Legacy
// ============================================

/**
 * Extrae valor simple de EditableContent
 */
export function extractValue(editable?: EditableContent): string {
  return editable?.value || '';
}

/**
 * Convierte HeroSectionData a HeroContent legacy
 */
export function revertHeroData(data: HeroSectionData): HeroContent {
  return {
    title: data.title.value,
    description: data.description?.value,
    ctaText: data.ctaButton.text,
    ctaUrl: data.ctaButton.url,
  };
}

/**
 * Convierte EditableCollectionData<PlatformCardItem> a PlatformCard[] legacy
 */
export function revertPlatformCards(
  data: EditableCollectionData<PlatformCardItem>
): PlatformCard[] {
  return data.items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    caption: item.caption,
    imageUrl: item.imageUrl,
    videoUrl: item.video.src,
    disabled: false,
  }));
}

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Valida si un objeto es EditableContent válido
 */
export function isValidEditableContent(obj: any): obj is EditableContent {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.value === 'string' &&
    typeof obj.section === 'string'
  );
}

/**
 * Valida si un objeto es EditableCollectionData válido
 */
export function isValidCollection(obj: any): boolean {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.section === 'string' &&
    Array.isArray(obj.items)
  );
}

// ============================================
// EJEMPLO DE USO
// ============================================

/*
// Migrar mocks existentes:
const legacyHero: HeroContent = {
  title: 'Análisis Financiero',
  description: 'Potencia tus decisiones',
  ctaText: 'Comenzar',
  ctaUrl: '/comenzar',
};

const newHero = adaptHeroContent(legacyHero);

// Usar en componente:
<HeroSection sectionData={newHero} onSave={handleSave} />

// Revertir para API legacy:
const apiPayload = revertHeroData(newHero);
*/