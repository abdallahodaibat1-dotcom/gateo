/**
 * Normalize a raw Prisma business object into the camelCase shape that the
 * UI components expect. Prisma returns relation fields with PascalCase model
 * names (e.g. Category, Subcategory) and stores JSON fields as strings in
 * MySQL, so this helper maps relations and parses JSON strings.
 */
export function serializeBusiness(business: any): any {
  if (!business) return business;

  const {
    Category,
    BusinessSubcategory,
    Country,
    User,
    Service,
    Product,
    Post,
    BusinessTheme,
    BusinessPage,
    BusinessAsset,
    BusinessFieldValue,
    Review,
    Booking,
    MarketplaceListing,
    ...rest
  } = business;

  const subcategories = (BusinessSubcategory ?? business.businessSubcategories ?? [])
    .filter((item: any) => item.subcategoryId && item.Subcategory)
    .map((item: any) => item.Subcategory)
    .filter(Boolean);

  const customSubcategories = (BusinessSubcategory ?? business.businessSubcategories ?? [])
    .filter((item: any) => item.customName)
    .map((item: any) => item.customName)
    .filter(Boolean);

  return {
    ...rest,
    category: Category ?? business.category,
    subcategories,
    customSubcategories,
    subcategory: subcategories[0] ?? business.subcategory ?? null,
    customSubcategory: customSubcategories[0] ?? business.customSubcategory ?? null,
    country: Country ?? business.country,
    user: User ?? business.user,
    services: Service ?? business.services,
    products: (Product ?? business.products)?.map((product: any) => ({
      ...product,
      images: parseJson(product.images),
    })),
    posts: (Post ?? business.posts)?.map((post: any) => ({
      ...post,
      _count: {
        likes: post._count?.Like || 0,
        comments: post._count?.Comment || 0,
        views: post.views || 0,
        shares: post.shares || 0,
      },
    })),
    theme: BusinessTheme
      ? { ...BusinessTheme, sections: parseJson(BusinessTheme.sections) }
      : business.theme,
    pages: BusinessPage ?? business.pages,
    assets: BusinessAsset ?? business.assets ?? [],
    fieldValues: BusinessFieldValue ?? business.fieldValues,
    reviews: Review ?? business.reviews,
    bookings: Booking ?? business.bookings,
    listings: MarketplaceListing ?? business.listings,
    images: parseJson(business.images),
    workingHours: parseJson(business.workingHours),
    specializations: parseJson(business.specializations),
    workExperience: parseJson(business.workExperience),
    documents: parseJson(business.documents),
    familyInfo: parseJson(business.familyInfo),
  };
}

function parseJson(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
