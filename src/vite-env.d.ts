declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_BUS_SERVICE_KEY: string;
  readonly VITE_STATION_ID: string;
  readonly VITE_STATION_NAME: string;
}
 
interface ImportMeta {
  readonly env: ImportMetaEnv;
}