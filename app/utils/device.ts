export = Device;

module Device {
  export function isMobile(): boolean {
    return (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
       .test(navigator.userAgent.toLowerCase()));
  }
}