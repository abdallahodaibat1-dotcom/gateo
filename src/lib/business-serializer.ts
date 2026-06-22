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
    Subcategory,
    Country,
    User,
    Service,
    Product,
    Post,
    BusinessTheme,
    BusinessPage,
    BusinessFieldValue,
    Review,
    Booking,
    MarketplaceListing,
    ...rest
  } = business;

  return {
    ...rest,
    category: Category ?? business.category,
    subcategory: Subcategory ?? business.subcategory,
    country: Country ?? business.country,
    user: User ?? business.user,
    services: Service ?? business.services,
    products: (Product ?? business.products)?.map((product: any) => ({
      ...product,
      images: parseJson(product.images),
    })),
    posts: Post ?? business.posts,
    theme: BusinessTheme
      ? { ...BusinessTheme, sections: parseJson(BusinessTheme.sections) }
      : business.theme,
    pages: BusinessPage ?? business.pages,
    fieldValues: BusinessFieldValue ?? business.fieldValues,
    reviews: Review ?? business.reviews,
    bookings: Booking ?? business.bookings,
    listings: MarketplaceListing ?? business.listings,
    // Prisma/MySQL may return JSON fields as strings
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
