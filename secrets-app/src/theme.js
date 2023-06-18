import { ipfsCids } from './ipfsCids';

const colorTheme = {
  default: {
    color1: '#FF0080',
    color2: '#7928CA',
    text: '#ffffff',
    textHighlight: '#FF0080',
    button: '#7928CA',
    fallbackPfpIpfsCid: ipfsCids.walletOtpPfp,
  },
  apecoinDao: {
    color1: '#0035EB',
    color2: '#23BDFF',
    text: '#ffffff',
    textHighlight: '#2556FF',
    button: '#0035EB',
    fallbackPfpIpfsCid: ipfsCids.apecoin,
  },
};

export const getThemeData = (theme = 'default') => colorTheme[theme];
