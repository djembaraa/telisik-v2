declare module "jsvectormap" {
  const jsVectorMap: any;
  export default jsVectorMap;
}

declare global {
  interface Window {
    jsVectorMap?: any;
  }
}

export {};
