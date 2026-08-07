const r2PublicBase = "https://images.constructcarnival.com";

export const archiveAssetBase =
  process.env.NEXT_PUBLIC_ARCHIVE_IMAGE_URL || `${r2PublicBase}/archive`;

export const galleryAssetBase =
  process.env.NEXT_PUBLIC_GALLERY_ASSET_URL || `${r2PublicBase}/gallery`;

export const archiveAsset = (fileName: string) =>
  `${archiveAssetBase}/${fileName}`;

export const galleryAsset = (fileName: string) =>
  `${galleryAssetBase}/${fileName}`;
