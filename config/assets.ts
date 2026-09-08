const r2PublicBase = "https://images.constructcarnival.com";

export const archiveAssetBase =
  process.env.NEXT_PUBLIC_ARCHIVE_IMAGE_URL || `${r2PublicBase}/archive`;

export const galleryAssetBase =
  process.env.NEXT_PUBLIC_GALLERY_ASSET_URL || `${r2PublicBase}/gallery`;

export const rulebookAssetBase =
  process.env.NEXT_PUBLIC_RULEBOOK_ASSET_URL || `${r2PublicBase}/Rulebook_CC`;


export const mediaAssetBase =
  process.env.NEXT_PUBLIC_MEDIA_ASSET_URL || `${r2PublicBase}/Media`;
export const archiveAsset = (fileName: string) =>
  `${archiveAssetBase}/${fileName}`;

export const galleryAsset = (fileName: string) =>
  `${galleryAssetBase}/${fileName}`;

export const rulebookAsset = (fileName: string) =>
  `${rulebookAssetBase}/${fileName}`;

export const mediaAsset = (fileName: string) =>
  `${mediaAssetBase}/${fileName}`;
