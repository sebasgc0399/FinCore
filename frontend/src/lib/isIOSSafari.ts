export const isIOSSafari = (): boolean => {
  if (typeof navigator === "undefined") {
    return false
  }

  const userAgent = navigator.userAgent
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
  const isIpadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
  const isSafari =
    /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent)

  return (isIOSDevice || isIpadOS) && isSafari
}
