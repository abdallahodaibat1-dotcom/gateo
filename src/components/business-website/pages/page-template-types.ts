import { TemplateBusiness, TemplateProduct } from '@/components/business-website/template-types';

export interface PageTemplateProps {
  business: TemplateBusiness;
  page: {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    sections?: any;
    pageTemplate?: string;
  };
}

export interface ShopTemplateProps {
  business: TemplateBusiness;
  page: PageTemplateProps['page'];
  products: TemplateProduct[];
}

export type { TemplateBusiness, TemplateProduct };
