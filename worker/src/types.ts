export interface Env {
  GOOGLE_DRIVE_FOLDER_ID: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  EMAILJS_SERVICE_ID: string;
  EMAILJS_TEMPLATE_ID: string;
  EMAILJS_PUBLIC_KEY: string;
  EMAILJS_PRIVATE_KEY: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
}

export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  createdDate: string;
}
