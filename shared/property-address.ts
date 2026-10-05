export const addressVisibilities = ["area", "exact"] as const;

export type AddressVisibility = (typeof addressVisibilities)[number];
export type PropertyAddress = {
  street?: string;
  street_number?: string;
  address_visibility?: AddressVisibility;
};

export function publicAddress(
  property: PropertyAddress,
  policy: Pick<PropertyAddress, "address_visibility"> = property,
  allowed = true,
) {
  const street = property.street?.trim();
  const streetNumber = property.street_number?.trim();
  if (
    !allowed ||
    property.address_visibility !== "exact" ||
    policy.address_visibility !== "exact" ||
    !street ||
    !streetNumber
  )
    return {};
  return {
    street,
    street_number: streetNumber,
    address_visibility: "exact" as const,
  };
}

export function addressLabel(property: PropertyAddress) {
  const address = publicAddress(property);
  return address.street && address.street_number
    ? `${address.street} ${address.street_number}`
    : "";
}
