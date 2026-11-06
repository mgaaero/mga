declare module '@edugis-org/webmapx' {
  export const WebMapX: {
    mount: (target: string, options: any) => Promise<void>;
    enableConfigEditTool?: (target: string) => Promise<void>;
  };
  export const WebmapxBaseTool: any;
  export const registerTool: any;
}
