import { getDesignById, getDesignsByWebsiteType } from './src/lib/business-design-library.js';
console.log('intro-beauty-salon-1 exists:', !!getDesignById('intro-beauty-salon-1'));
const introDesigns = getDesignsByWebsiteType('INTRO');
console.log('INTRO designs count:', introDesigns.length);
console.log('Beauty-related designs:', introDesigns.filter(d => d.categoryTags.some(t => t.includes('تجميل') || t.includes('صالون') || t.includes('سبا'))).map(d => ({ id: d.designId, nameAr: d.nameAr })));
