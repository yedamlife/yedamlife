export const CONTACT_PHONE = "1660-0959";

const DEV_TEL_TARGET = "010-9162-2508";
export const CONTACT_TEL_HREF =
  process.env.NODE_ENV === "development"
    ? `tel:${DEV_TEL_TARGET}`
    : `tel:${CONTACT_PHONE}`;
