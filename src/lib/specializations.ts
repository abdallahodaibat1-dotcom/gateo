import {
  Stethoscope,
  Scale,
  Wrench,
  HardHat,
  Palette,
  Hammer,
  GraduationCap,
  Banknote,
  Tractor,
  Truck,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

export interface SpecializationGroup {
  key: string;
  label: string;
  icon: string;
  categorySlugs: string[];
}

export const specializationGroups: SpecializationGroup[] = [
  {
    key: 'medical',
    label: 'الطبية والصحية',
    icon: 'Stethoscope',
    categorySlugs: ['lg-health', 'medical-services'],
  },
  {
    key: 'legal',
    label: 'القانونية',
    icon: 'Scale',
    categorySlugs: ['legal-services'],
  },
  {
    key: 'technical',
    label: 'التقنية',
    icon: 'Wrench',
    categorySlugs: ['technical-services'],
  },
  {
    key: 'engineering',
    label: 'الهندسية',
    icon: 'HardHat',
    categorySlugs: ['engineering-services'],
  },
  {
    key: 'creative',
    label: 'الإبداعية',
    icon: 'Palette',
    categorySlugs: ['creative-services'],
  },
  {
    key: 'craft',
    label: 'الحرفية',
    icon: 'Hammer',
    categorySlugs: ['craft-services'],
  },
  {
    key: 'educational',
    label: 'التعليمية',
    icon: 'GraduationCap',
    categorySlugs: ['lg-education', 'educational-services'],
  },
  {
    key: 'financial',
    label: 'المالية',
    icon: 'Banknote',
    categorySlugs: ['financial-services'],
  },
  {
    key: 'agricultural',
    label: 'الزراعية',
    icon: 'Tractor',
    categorySlugs: ['agricultural-services'],
  },
  {
    key: 'logistic',
    label: 'اللوجستية',
    icon: 'Truck',
    categorySlugs: ['logistic-services'],
  },
];

export const specializationGroupKeys = specializationGroups.map((g) => g.key);

export function getSpecializationGroup(key: string): SpecializationGroup | undefined {
  return specializationGroups.find((g) => g.key === key);
}

export function isValidSpecializationGroup(key: string): boolean {
  return specializationGroupKeys.includes(key);
}

export const specializationIconMap: Record<string, LucideIcon> = {
  Stethoscope,
  Scale,
  Wrench,
  HardHat,
  Palette,
  Hammer,
  GraduationCap,
  Banknote,
  Tractor,
  Truck,
};

export function getSpecializationIcon(name: string): LucideIcon {
  return specializationIconMap[name] || Briefcase;
}
